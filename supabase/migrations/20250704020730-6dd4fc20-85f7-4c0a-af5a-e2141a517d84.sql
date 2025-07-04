
-- Phase 1: Database & Storage Setup

-- Add missing columns to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS coming_soon BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS video_file_path TEXT,
ADD COLUMN IF NOT EXISTS pdf_file_path TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_file_path TEXT;

-- Add missing columns to lessons table  
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS video_file_path TEXT,
ADD COLUMN IF NOT EXISTS pdf_file_path TEXT;

-- Create missing storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('job-attachments', 'job-attachments', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for job attachments
CREATE POLICY "Anyone can view job attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'job-attachments');

CREATE POLICY "Anyone can upload job attachments" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'job-attachments');

-- Create storage policies for blog images
CREATE POLICY "Anyone can view blog images" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'blog-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update blog images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'blog-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete blog images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'blog-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create index for better performance on coming soon courses
CREATE INDEX IF NOT EXISTS idx_courses_coming_soon ON courses(coming_soon) WHERE coming_soon = true;

-- Update existing courses to have proper default values
UPDATE courses SET coming_soon = false WHERE coming_soon IS NULL;
