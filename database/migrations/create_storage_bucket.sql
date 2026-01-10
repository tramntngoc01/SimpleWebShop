-- Migration: Create storage bucket for images
-- Run this SQL in Supabase SQL Editor

-- Tạo bucket 'images' cho upload hình ảnh sản phẩm
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Cho phép public read access
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');

-- Cho phép authenticated users upload
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'images');

-- Cho phép authenticated users update
CREATE POLICY "Authenticated Update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'images');

-- Cho phép authenticated users delete
CREATE POLICY "Authenticated Delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'images');
