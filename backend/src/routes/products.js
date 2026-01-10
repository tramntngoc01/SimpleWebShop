import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

const getCacheKey = (req) => {
  return `products:${req.originalUrl}`;
};

const setCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const getCache = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return cached.data;
};

// Lấy tất cả sản phẩm (có phân trang và lọc)
router.get('/', async (req, res) => {
  try {
    // Check cache first
    const cacheKey = getCacheKey(req);
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      return res.json(cachedData);
    }

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

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Optimize: Select only needed columns instead of *
    let query = supabase
      .from('products')
      .select('id, name, price, sale_price, image_url, stock_quantity, unit, category_id, categories(name)', { count: 'exact' })
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
    query = query.range(offset, offset + limitNum - 1);

    const { data: products, error, count } = await query;

    if (error) throw error;

    const responseData = {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum)
      }
    };

    // Cache the response
    setCache(cacheKey, responseData);
    
    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.json(responseData);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy sản phẩm' });
  }
});

// Lấy sản phẩm theo ID
router.get('/:id', async (req, res) => {
  try {
    const cacheKey = `product:${req.params.id}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', 'public, max-age=60');
      return res.json(cachedData);
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, description, price, sale_price, image_url, stock_quantity, unit, category_id, categories(name)')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .single();

    if (error || !product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    setCache(cacheKey, product);
    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60');
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Lấy sản phẩm theo danh mục
router.get('/category/:categoryId', async (req, res) => {
  try {
    const cacheKey = getCacheKey(req);
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', 'public, max-age=60');
      return res.json(cachedData);
    }

    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const { data: products, error, count } = await supabase
      .from('products')
      .select('id, name, price, sale_price, image_url, stock_quantity, unit, category_id, categories(name)', { count: 'exact' })
      .eq('category_id', req.params.categoryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const responseData = {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };

    setCache(cacheKey, responseData);
    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60');
    res.json(responseData);
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Lấy sản phẩm nổi bật (giảm giá)
router.get('/featured/sale', async (req, res) => {
  try {
    const cacheKey = 'products:featured:sale';
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', 'public, max-age=60');
      return res.json(cachedData);
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, sale_price, image_url, stock_quantity, unit, category_id, categories(name)')
      .eq('is_active', true)
      .not('sale_price', 'is', null)
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) throw error;

    setCache(cacheKey, products);
    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60');
    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Lấy sản phẩm mới nhất
router.get('/featured/new', async (req, res) => {
  try {
    const cacheKey = 'products:featured:new';
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', 'public, max-age=60');
      return res.json(cachedData);
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, sale_price, image_url, stock_quantity, unit, category_id, categories(name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) throw error;

    setCache(cacheKey, products);
    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60');
    res.json(products);
  } catch (error) {
    console.error('Get new products error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Lấy sản phẩm bán chạy (dựa trên số lượng order)
router.get('/featured/bestseller', async (req, res) => {
  try {
    const cacheKey = 'products:featured:bestseller';
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', 'public, max-age=300');
      return res.json(cachedData);
    }

    // Lấy sản phẩm được order nhiều nhất
    const { data: bestSellerIds, error: orderError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .order('quantity', { ascending: false });

    if (orderError) throw orderError;

    // Tính tổng số lượng bán cho mỗi sản phẩm
    const productSales = {};
    bestSellerIds?.forEach(item => {
      if (item.product_id) {
        productSales[item.product_id] = (productSales[item.product_id] || 0) + item.quantity;
      }
    });

    // Sắp xếp theo số lượng bán
    const sortedProductIds = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id]) => id);

    if (sortedProductIds.length === 0) {
      // Nếu chưa có order, trả về sản phẩm mới nhất
      const { data: newProducts, error } = await supabase
        .from('products')
        .select('id, name, price, sale_price, image_url, stock_quantity, unit, category_id, categories(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setCache(cacheKey, newProducts);
      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', 'public, max-age=300');
      return res.json(newProducts);
    }

    // Lấy thông tin sản phẩm
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, sale_price, image_url, stock_quantity, unit, category_id, categories(name)')
      .eq('is_active', true)
      .in('id', sortedProductIds);

    if (error) throw error;

    // Sắp xếp lại theo thứ tự bán chạy
    const sortedProducts = sortedProductIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean);

    setCache(cacheKey, sortedProducts);
    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=300');
    res.json(sortedProducts);
  } catch (error) {
    console.error('Get bestseller products error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

export default router;
