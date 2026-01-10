import express from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Cấu hình multer cho upload file
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)'));
    }
  }
});

// Cấu hình multer cho upload hình ảnh
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh'));
    }
  }
});

// Upload hình ảnh sản phẩm
router.post('/upload/image', authMiddleware, adminMiddleware, imageUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn file hình ảnh' });
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Lấy public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    res.json({ 
      message: 'Upload thành công',
      url: urlData.publicUrl 
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi upload hình ảnh: ' + error.message });
  }
});

// ==================== QUẢN LÝ USERS ====================

// Lấy danh sách users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('id, email, full_name, phone, address, role, is_active, created_at', { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Cập nhật user
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { fullName, phone, address, role, isActive } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone,
        address,
        role,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select('id, email, full_name, phone, address, role, is_active')
      .single();

    if (error) throw error;

    res.json({ message: 'Cập nhật thành công', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Reset password user
router.put('/users/:id/reset-password', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await supabase
      .from('users')
      .update({ password: hashedPassword, updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    res.json({ message: 'Đã reset mật khẩu' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// ==================== QUẢN LÝ DANH MỤC ====================

// Thêm danh mục
router.post('/categories', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    const { data: category, error } = await supabase
      .from('categories')
      .insert({ name, description, image_url: imageUrl })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Thêm danh mục thành công', category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Cập nhật danh mục
router.put('/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, imageUrl, isActive } = req.body;

    const { data: category, error } = await supabase
      .from('categories')
      .update({ name, description, image_url: imageUrl, is_active: isActive })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Cập nhật thành công', category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Xóa danh mục
router.delete('/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Kiểm tra danh mục có tồn tại không
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', categoryId)
      .single();

    if (checkError || !existingCategory) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    }

    // Kiểm tra xem danh mục có sản phẩm không
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (countError) {
      console.error('Count products error:', countError);
    }

    if (count && count > 0) {
      return res.status(400).json({ 
        error: `Không thể xóa danh mục "${existingCategory.name}" vì có ${count} sản phẩm đang sử dụng. Hãy chuyển sản phẩm sang danh mục khác trước.` 
      });
    }

    // Thực hiện xóa
    const { data: deletedData, error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .select();

    if (deleteError) {
      console.error('Delete category error:', deleteError);
      throw deleteError;
    }

    // Verify đã xóa thành công
    if (!deletedData || deletedData.length === 0) {
      console.error('Delete returned no data - category may not have been deleted');
      return res.status(500).json({ error: 'Không thể xóa danh mục. Vui lòng thử lại.' });
    }

    console.log(`Category deleted successfully: ${existingCategory.name} (${categoryId})`);
    res.json({ message: `Đã xóa danh mục "${existingCategory.name}"`, deleted: deletedData[0] });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi xóa danh mục: ' + error.message });
  }
});

// ==================== QUẢN LÝ SẢN PHẨM ====================

// Lấy tất cả sản phẩm (kể cả inactive)
router.get('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('products')
      .select('*, categories(name)', { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    const { data: products, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Thêm sản phẩm
router.post('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, salePrice, imageUrl, categoryId, stockQuantity, unit } = req.body;

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price,
        sale_price: salePrice || null,
        image_url: imageUrl,
        category_id: categoryId,
        stock_quantity: stockQuantity || 0,
        unit: unit || 'cái'
      })
      .select('*, categories(name)')
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Thêm sản phẩm thành công', product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Cập nhật sản phẩm
router.put('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, salePrice, imageUrl, categoryId, stockQuantity, unit, isActive } = req.body;

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price,
        sale_price: salePrice || null,
        image_url: imageUrl,
        category_id: categoryId,
        stock_quantity: stockQuantity,
        unit,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select('*, categories(name)')
      .single();

    if (error) throw error;

    res.json({ message: 'Cập nhật thành công', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Xóa sản phẩm
router.delete('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Import sản phẩm từ Excel
router.post('/products/import', authMiddleware, adminMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn file Excel' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ error: 'File Excel trống' });
    }

    // Lấy danh sách category để map tên -> id
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name');

    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat.id;
    });

    const products = [];
    const errors = [];
    const newCategories = new Set(); // Danh sách category mới cần tạo

    // Detect format: KiotViet hoặc Template cũ
    const isKiotVietFormat = data[0] && ('Tên hàng' in data[0] || 'Giá bán' in data[0]);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // +2 vì header là hàng 1

      let sku, name, description, price, salePrice, categoryName, stockQuantity, unit, imageUrl;

      if (isKiotVietFormat) {
        // Format từ KiotViet
        sku = row['Mã hàng'] ? String(row['Mã hàng']).trim() : null;
        name = row['Tên hàng'];
        description = row['Mô tả'] || null;
        price = row['Giá bán'];
        salePrice = row['Giá vốn'] && row['Giá vốn'] < row['Giá bán'] ? null : null; // Không dùng giá vốn làm giá khuyến mãi
        categoryName = row['Nhóm hàng(3 Cấp)']?.toLowerCase();
        stockQuantity = row['Tồn kho'];
        unit = row['ĐVT'] || 'cái';
        imageUrl = row['Hình ảnh (url1,url2...)'] || null;
        
        // Nếu có nhiều URL ảnh, chỉ lấy cái đầu tiên
        if (imageUrl && imageUrl.includes(',')) {
          imageUrl = imageUrl.split(',')[0].trim();
        }
      } else {
        // Format template cũ
        sku = row['Mã hàng'] ? String(row['Mã hàng']).trim() : null;
        name = row['Tên sản phẩm'];
        description = row['Mô tả'] || null;
        price = row['Giá'];
        salePrice = row['Giá khuyến mãi'] || null;
        categoryName = row['Danh mục']?.toLowerCase();
        stockQuantity = row['Số lượng'];
        unit = row['Đơn vị'] || 'cái';
        imageUrl = row['Link ảnh'] || null;
      }

      // Validate required fields
      if (!name || !price) {
        errors.push(`Hàng ${rowNum}: Thiếu tên sản phẩm hoặc giá`);
        continue;
      }

      // Kiểm tra category - nếu chưa có thì thêm vào danh sách cần tạo
      let categoryId = categoryName ? categoryMap[categoryName] : null;
      if (categoryName && !categoryId) {
        newCategories.add(categoryName);
      }

      products.push({
        sku,
        name: name.trim(),
        description,
        price: parseFloat(price),
        sale_price: salePrice ? parseFloat(salePrice) : null,
        image_url: imageUrl,
        category_name: categoryName, // Lưu tạm để map sau khi tạo category
        stock_quantity: parseInt(stockQuantity) || 0,
        unit: unit || 'cái'
      });
    }

    // Tạo các category mới nếu có
    if (newCategories.size > 0) {
      const categoriesToInsert = Array.from(newCategories).map(name => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Viết hoa chữ cái đầu
        description: `Danh mục ${name}`,
        is_active: true
      }));

      const { data: insertedCategories, error: catError } = await supabase
        .from('categories')
        .insert(categoriesToInsert)
        .select();

      if (!catError && insertedCategories) {
        insertedCategories.forEach(cat => {
          categoryMap[cat.name.toLowerCase()] = cat.id;
        });
      }
    }

    // Map category_id cho tất cả sản phẩm
    products.forEach(p => {
      p.category_id = p.category_name ? categoryMap[p.category_name] : null;
      delete p.category_name; // Xóa trường tạm
    });

    if (products.length === 0) {
      return res.status(400).json({ error: 'Không có sản phẩm hợp lệ để import', details: errors });
    }

    // Lấy danh sách sản phẩm hiện có để kiểm tra trùng theo SKU
    const productSkus = products.filter(p => p.sku).map(p => p.sku);
    let existingProducts = [];
    
    if (productSkus.length > 0) {
      const { data } = await supabase
        .from('products')
        .select('id, sku, name, price, image_url')
        .in('sku', productSkus);
      existingProducts = data || [];
    }

    const existingMap = {};
    existingProducts.forEach(p => {
      if (p.sku) {
        existingMap[p.sku] = p;
      }
    });

    const toInsert = [];
    const toUpdate = [];

    for (const product of products) {
      // Check dựa trên SKU (mã hàng)
      const existing = product.sku ? existingMap[product.sku] : null;
      
      if (existing) {
        // Sản phẩm đã tồn tại - kiểm tra cần update không
        const needUpdate = 
          existing.price !== product.price || 
          existing.image_url !== product.image_url ||
          existing.name !== product.name;
        
        if (needUpdate) {
          toUpdate.push({
            id: existing.id,
            name: product.name,
            price: product.price,
            sale_price: product.sale_price,
            image_url: product.image_url,
            stock_quantity: product.stock_quantity,
            description: product.description,
            category_id: product.category_id,
            unit: product.unit,
            updated_at: new Date().toISOString()
          });
        }
      } else {
        // Sản phẩm mới - insert
        toInsert.push(product);
      }
    }

    let insertedCount = 0;
    let updatedCount = 0;

    // Insert sản phẩm mới
    if (toInsert.length > 0) {
      const { data: insertedProducts, error: insertError } = await supabase
        .from('products')
        .insert(toInsert)
        .select();
      
      if (insertError) throw insertError;
      insertedCount = insertedProducts?.length || 0;
    }

    // Update sản phẩm đã có
    for (const product of toUpdate) {
      const { id, ...updateData } = product;
      const { error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);
      
      if (updateError) {
        errors.push(`Lỗi cập nhật sản phẩm ID ${id}: ${updateError.message}`);
      } else {
        updatedCount++;
      }
    }

    res.json({
      message: `Đã import ${insertedCount} sản phẩm mới, cập nhật ${updatedCount} sản phẩm`,
      inserted: insertedCount,
      updated: updatedCount,
      skipped: products.length - insertedCount - updatedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Import products error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi import sản phẩm' });
  }
});

// Tải template Excel
router.get('/products/import-template', authMiddleware, adminMiddleware, (req, res) => {
  const template = [
    {
      'Tên sản phẩm': 'Mì tôm Hảo Hảo',
      'Mô tả': 'Mì ăn liền vị tôm chua cay',
      'Giá': 5000,
      'Giá khuyến mãi': 4500,
      'Danh mục': 'Thực phẩm khô',
      'Số lượng': 100,
      'Đơn vị': 'gói',
      'Link ảnh': 'https://example.com/image.jpg'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename=template_san_pham.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

// ==================== QUẢN LÝ ĐƠN HÀNG ====================

// Lấy tất cả đơn hàng
router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select('*, users(email, full_name)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,shipping_name.ilike.%${search}%,shipping_phone.ilike.%${search}%`);
    }

    const { data: orders, error, count } = await query
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
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Lấy chi tiết đơn hàng
router.get('/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, users(email, full_name, phone)')
      .eq('id', req.params.id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

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

// Cập nhật trạng thái đơn hàng
router.put('/orders/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    // Nếu hủy đơn, hoàn lại tồn kho
    if (status === 'cancelled') {
      const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', req.params.id)
        .single();

      if (order && order.status !== 'cancelled') {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', req.params.id);

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
      }
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Cập nhật trạng thái thành công', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// ==================== THỐNG KÊ ====================

router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Đếm tổng users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    // Đếm tổng sản phẩm
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Đếm tổng đơn hàng
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Đếm đơn hàng pending
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Tổng doanh thu từ đơn delivered
    const { data: revenue } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'delivered');

    const totalRevenue = revenue?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

export default router;
