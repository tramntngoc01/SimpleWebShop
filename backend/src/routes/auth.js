import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Seed demo users (chỉ dùng để test)
router.post('/seed-demo', async (req, res) => {
  try {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const customerPassword = await bcrypt.hash('123456', 10);

    // Delete existing demo users first
    await supabase.from('users').delete().eq('email', 'admin@taphoa.com');
    await supabase.from('users').delete().eq('email', 'khach@gmail.com');

    // Create admin
    const { error: adminError } = await supabase.from('users').insert({
      email: 'admin@taphoa.com',
      password: adminPassword,
      full_name: 'Admin',
      phone: '0123456789',
      role: 'admin',
      is_active: true
    });

    if (adminError) {
      console.error('Admin create error:', adminError);
    }

    // Create customer
    const { error: customerError } = await supabase.from('users').insert({
      email: 'khach@gmail.com',
      password: customerPassword,
      full_name: 'Nguyễn Văn A',
      phone: '0987654321',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      role: 'customer',
      is_active: true
    });

    if (customerError) {
      console.error('Customer create error:', customerError);
    }

    // Verify users were created
    const { data: users } = await supabase
      .from('users')
      .select('email, role, is_active');

    res.json({ message: 'Demo users created successfully', users });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed demo users', details: error.message });
  }
});

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone, address } = req.body;

    // Kiểm tra email đã tồn tại
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        full_name: fullName,
        phone,
        address,
        role: 'customer'
      })
      .select('id, email, full_name, phone, address, role')
      .single();

    if (error) throw error;

    // Tạo token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Đăng ký thành công',
      user,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi đăng ký' });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Loại bỏ password trước khi trả về
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Đăng nhập thành công',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi đăng nhập' });
  }
});

// Lấy thông tin user hiện tại
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, address, role, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// Cập nhật thông tin user
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone,
        address,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select('id, email, full_name, phone, address, role')
      .single();

    if (error) throw error;

    res.json({ message: 'Cập nhật thành công', user });
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi cập nhật' });
  }
});

// Đổi mật khẩu
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Lấy user hiện tại
    const { data: user } = await supabase
      .from('users')
      .select('password')
      .eq('id', req.user.id)
      .single();

    // Kiểm tra mật khẩu cũ
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
    }

    // Hash và cập nhật mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await supabase
      .from('users')
      .update({ password: hashedPassword, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi đổi mật khẩu' });
  }
});

export default router;
