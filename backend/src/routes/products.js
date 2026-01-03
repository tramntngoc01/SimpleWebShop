import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Lấy tất cả sản phẩm (có phân trang và lọc)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      minPrice, 
      maxPrice,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*, categories(name)', { count: 'exact' })
      .eq('is_active', true);

    // Lọc theo danh mục
    if (category) {
      query = query.eq('category_id', category);
    }

    // Tìm kiếm theo tên
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Lọc theo giá
    if (minPrice) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice) {
      query = query.lte('price', maxPrice);
    }

    // Sắp xếp
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Phân trang
    query = query.range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) throw error;

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy sản phẩm' });
  }
});

// Lấy sản phẩm theo ID
router.get('/:id', async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .single();

    if (error || !product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Lấy sản phẩm theo danh mục
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const { data: products, error, count } = await supabase
      .from('products')
      .select('*, categories(name)', { count: 'exact' })
      .eq('category_id', req.params.categoryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Lấy sản phẩm nổi bật (giảm giá)
router.get('/featured/sale', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('is_active', true)
      .not('sale_price', 'is', null)
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) throw error;

    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

export default router;
