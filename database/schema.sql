-- =============================================
-- TẠP HÓA ĐƠN GIẢN - DATABASE SCHEMA
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS TABLE (Người dùng)
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. CATEGORIES TABLE (Danh mục sản phẩm)
-- =============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. PRODUCTS TABLE (Sản phẩm)
-- =============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    sale_price DECIMAL(12, 2),
    image_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    stock_quantity INTEGER DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'cái',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. ORDERS TABLE (Đơn hàng)
-- =============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled')),
    total_amount DECIMAL(12, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_name VARCHAR(255) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. ORDER_ITEMS TABLE (Chi tiết đơn hàng)
-- =============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(12, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL
);

-- =============================================
-- 6. CART TABLE (Giỏ hàng)
-- =============================================
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_cart_user ON cart_items(user_id);

-- =============================================
-- SAMPLE DATA (Dữ liệu mẫu)
-- =============================================

-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
('Thực phẩm khô', 'Mì, gạo, bún, phở các loại', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'),
('Đồ uống', 'Nước ngọt, nước suối, sữa các loại', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400'),
('Bánh kẹo', 'Bánh, kẹo, snack các loại', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400'),
('Gia vị', 'Muối, đường, bột ngọt, nước mắm', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'),
('Đồ dùng gia đình', 'Xà phòng, nước rửa chén, giấy vệ sinh', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400'),
('Rau củ quả', 'Rau xanh, củ quả tươi mỗi ngày', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400');

-- Insert sample products
INSERT INTO products (name, description, price, sale_price, image_url, category_id, stock_quantity, unit) 
SELECT 
    'Mì Hảo Hảo tôm chua cay',
    'Mì ăn liền Hảo Hảo vị tôm chua cay thơm ngon',
    5000,
    4500,
    'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400',
    id,
    100,
    'gói'
FROM categories WHERE name = 'Thực phẩm khô';

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, unit) 
SELECT 
    'Gạo ST25 5kg',
    'Gạo ST25 thơm ngon, dẻo mềm',
    120000,
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    id,
    50,
    'bao'
FROM categories WHERE name = 'Thực phẩm khô';

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, unit) 
SELECT 
    'Coca Cola 330ml',
    'Nước ngọt Coca Cola lon 330ml',
    10000,
    'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
    id,
    200,
    'lon'
FROM categories WHERE name = 'Đồ uống';

INSERT INTO products (name, description, price, sale_price, image_url, category_id, stock_quantity, unit) 
SELECT 
    'Sữa Vinamilk 1L',
    'Sữa tươi Vinamilk có đường 1 lít',
    32000,
    28000,
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
    id,
    80,
    'hộp'
FROM categories WHERE name = 'Đồ uống';

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, unit) 
SELECT 
    'Bánh Oreo 137g',
    'Bánh quy Oreo nhân kem vani',
    25000,
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    id,
    60,
    'gói'
FROM categories WHERE name = 'Bánh kẹo';

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, unit) 
SELECT 
    'Snack Oishi 80g',
    'Snack bắp Oishi vị phô mai',
    12000,
    'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400',
    id,
    100,
    'gói'
FROM categories WHERE name = 'Bánh kẹo';

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, unit) 
SELECT 
    'Nước mắm Nam Ngư 500ml',
    'Nước mắm Nam Ngư đậm đà',
    28000,
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
    id,
    40,
    'chai'
FROM categories WHERE name = 'Gia vị';

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, unit) 
SELECT 
    'Dầu ăn Neptune 1L',
    'Dầu ăn Neptune 1 lít',
    45000,
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    id,
    35,
    'chai'
FROM categories WHERE name = 'Gia vị';

INSERT INTO products (name, description, price, sale_price, image_url, category_id, stock_quantity, unit) 
SELECT 
    'Nước rửa chén Sunlight 750ml',
    'Nước rửa chén Sunlight chanh',
    35000,
    30000,
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400',
    id,
    45,
    'chai'
FROM categories WHERE name = 'Đồ dùng gia đình';

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, unit) 
SELECT 
    'Giấy vệ sinh Pulppy 12 cuộn',
    'Giấy vệ sinh Pulppy cao cấp 12 cuộn',
    65000,
    'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400',
    id,
    30,
    'lốc'
FROM categories WHERE name = 'Đồ dùng gia đình';

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, unit) 
SELECT 
    'Rau cải ngọt 500g',
    'Rau cải ngọt tươi xanh',
    15000,
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
    id,
    25,
    'bó'
FROM categories WHERE name = 'Rau củ quả';

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, unit) 
SELECT 
    'Cà chua 1kg',
    'Cà chua đỏ tươi ngon',
    25000,
    'https://images.unsplash.com/photo-1546470427-227c7369a9b9?w=400',
    id,
    40,
    'kg'
FROM categories WHERE name = 'Rau củ quả';

-- Create admin user (password: admin123)
INSERT INTO users (email, password, full_name, phone, role) VALUES
('admin@taphoa.com', '$2a$10$pLbsQ16OSUdNrOcawUSAfeX0YsH14LPb89tWaDSfaNDqvi2CdXODm', 'Admin', '0123456789', 'admin');

-- Create sample customer (password: 123456)
INSERT INTO users (email, password, full_name, phone, address, role) VALUES
('khach@gmail.com', '$2a$10$mvVuPkUXgxSC9iPuDOTaeuO/hTMc.CSkcHFgZvNGPLLu9AsM1ox5O', 'Nguyễn Văn A', '0987654321', '123 Đường ABC, Quận 1, TP.HCM', 'customer');
