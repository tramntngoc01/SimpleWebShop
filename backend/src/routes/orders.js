import express from 'express';
import { supabase } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Tạo mã đơn hàng
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DH${year}${month}${day}${random}`;
};

// Lấy danh sách đơn hàng của user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data: orders, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy đơn hàng' });
  }
});

// Lấy chi tiết đơn hàng
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    // Lấy chi tiết sản phẩm trong đơn
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    res.json({ ...order, items });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Tạo đơn hàng mới từ giỏ hàng
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { shippingName, shippingPhone, shippingAddress, note } = req.body;

    // Lấy giỏ hàng
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        products (
          id,
          name,
          price,
          sale_price,
          stock_quantity
        )
      `)
      .eq('user_id', req.user.id);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Giỏ hàng trống' });
    }

    // Kiểm tra tồn kho và tính tổng tiền
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      if (item.quantity > item.products.stock_quantity) {
        return res.status(400).json({ 
          error: `Sản phẩm "${item.products.name}" không đủ số lượng trong kho` 
        });
      }

      const price = item.products.sale_price || item.products.price;
      const subtotal = price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        product_id: item.products.id,
        product_name: item.products.name,
        product_price: price,
        quantity: item.quantity,
        subtotal
      });
    }

    // Tạo đơn hàng
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        order_number: generateOrderNumber(),
        total_amount: totalAmount,
        shipping_name: shippingName,
        shipping_phone: shippingPhone,
        shipping_address: shippingAddress,
        note,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Thêm chi tiết đơn hàng
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems.map(item => ({ ...item, order_id: order.id })));

    if (itemsError) throw itemsError;

    // Cập nhật tồn kho
    for (const item of cartItems) {
      await supabase
        .from('products')
        .update({ 
          stock_quantity: item.products.stock_quantity - item.quantity 
        })
        .eq('id', item.products.id);
    }

    // Xóa giỏ hàng
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id);

    res.status(201).json({ 
      message: 'Đặt hàng thành công', 
      order 
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi đặt hàng' });
  }
});

// Hủy đơn hàng (chỉ khi pending)
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Chỉ có thể hủy đơn hàng đang chờ xử lý' });
    }

    // Lấy chi tiết đơn hàng để hoàn lại tồn kho
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', order.id);

    // Hoàn lại tồn kho
    for (const item of orderItems) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (product) {
        await supabase
          .from('products')
          .update({ stock_quantity: product.stock_quantity + item.quantity })
          .eq('id', item.product_id);
      }
    }

    // Cập nhật trạng thái đơn hàng
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Đã hủy đơn hàng' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi hủy đơn hàng' });
  }
});

export default router;
