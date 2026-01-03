import express from 'express';
import { supabase } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Lấy giỏ hàng của user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        products (
          id,
          name,
          price,
          sale_price,
          image_url,
          stock_quantity,
          unit
        )
      `)
      .eq('user_id', req.user.id);

    if (error) throw error;

    // Tính tổng tiền
    const total = cartItems.reduce((sum, item) => {
      const price = item.products.sale_price || item.products.price;
      return sum + (price * item.quantity);
    }, 0);

    res.json({ items: cartItems, total });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy giỏ hàng' });
  }
});

// Thêm sản phẩm vào giỏ hàng
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Kiểm tra sản phẩm có tồn tại
    const { data: product } = await supabase
      .from('products')
      .select('id, stock_quantity')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    // Kiểm tra xem đã có trong giỏ hàng chưa
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', req.user.id)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Cập nhật số lượng
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > product.stock_quantity) {
        return res.status(400).json({ error: 'Số lượng vượt quá tồn kho' });
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);

      if (error) throw error;
    } else {
      // Thêm mới
      if (quantity > product.stock_quantity) {
        return res.status(400).json({ error: 'Số lượng vượt quá tồn kho' });
      }

      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: req.user.id,
          product_id: productId,
          quantity
        });

      if (error) throw error;
    }

    res.json({ message: 'Đã thêm vào giỏ hàng' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi thêm vào giỏ hàng' });
  }
});

// Cập nhật số lượng sản phẩm trong giỏ
router.put('/update/:itemId', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Số lượng phải lớn hơn 0' });
    }

    // Lấy item và kiểm tra tồn kho
    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('product_id')
      .eq('id', req.params.itemId)
      .eq('user_id', req.user.id)
      .single();

    if (!cartItem) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm trong giỏ' });
    }

    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', cartItem.product_id)
      .single();

    if (quantity > product.stock_quantity) {
      return res.status(400).json({ error: 'Số lượng vượt quá tồn kho' });
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', req.params.itemId)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Đã cập nhật giỏ hàng' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi cập nhật giỏ hàng' });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/remove/:itemId', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', req.params.itemId)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Đã xóa khỏi giỏ hàng' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi xóa khỏi giỏ hàng' });
  }
});

// Xóa toàn bộ giỏ hàng
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Đã xóa toàn bộ giỏ hàng' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

export default router;
