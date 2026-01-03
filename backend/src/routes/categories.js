import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Lấy tất cả danh mục
router.get('/', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh mục' });
  }
});

// Lấy danh mục theo ID
router.get('/:id', async (req, res) => {
  try {
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !category) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

export default router;
