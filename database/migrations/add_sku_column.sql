-- Migration: Add SKU column to products table
-- Run this SQL in Supabase SQL Editor

-- Add sku column (mã hàng hóa)
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);

-- Create unique index on sku (allow null values)
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique ON products(sku) WHERE sku IS NOT NULL;

-- Comment
COMMENT ON COLUMN products.sku IS 'Mã hàng hóa (từ KiotViet hoặc hệ thống khác)';
