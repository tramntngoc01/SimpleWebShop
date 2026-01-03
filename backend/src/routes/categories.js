import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Simple in-memory cache
let categoriesCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 300 * 1000; // 5 minutes for categories (changes rarely)

// Lấy tất cả danh mục
router.get('/', async (req, res) => {
  try {
    // Check cache
    if (categoriesCache && Date.now() - cacheTimestamp < CACHE_TTL) {
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', 'public, max-age=300');
      return res.json(categoriesCache);
    }

    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, description, image_url')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    // Update cache
    categoriesCache = categories;
    cacheTimestamp = Date.now();

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=300');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh mục' });
  }
});

// Lấy danh mục theo ID
router.get('/:id', async (req, res) => {
  try {
    // Check from cache first
    if (categoriesCache) {
      const cached = categoriesCache.find(c => c.id === req.params.id);
      if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=300');
        return res.json(cached);
      }
    }

    const { data: category, error } = await supabase
      .from('categories')
      .select('id, name, description, image_url')
      .eq('id', req.params.id)
      .single();

    if (error || !category) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    }

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=300');
    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Export cache invalidation for admin operations
export const invalidateCategoriesCache = () => {
  categoriesCache = null;
  cacheTimestamp = 0;
};

export default router;
