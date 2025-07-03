
-- Add storage bucket for course materials (videos, PDFs, thumbnails)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-materials', 'course-materials', true);

-- Add storage bucket for job attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('job-attachments', 'job-attachments', true);

-- Add storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true);

-- Create storage policies for course materials
CREATE POLICY "Anyone can view course materials" ON storage.objects
FOR SELECT USING (bucket_id = 'course-materials');

CREATE POLICY "Admins can upload course materials" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-materials' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update course materials" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-materials' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete course materials" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-materials' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

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

-- Add coming_soon field to courses table
ALTER TABLE courses ADD COLUMN coming_soon BOOLEAN DEFAULT FALSE;

-- Update courses table to support file uploads instead of URLs
ALTER TABLE courses 
ADD COLUMN video_file_path TEXT,
ADD COLUMN pdf_file_path TEXT,
ADD COLUMN thumbnail_file_path TEXT;

-- Update lessons table to support file uploads
ALTER TABLE lessons
ADD COLUMN video_file_path TEXT,
ADD COLUMN pdf_file_path TEXT;

-- Add RLS policy for users to change their own password (handled by Supabase Auth)
-- No additional table changes needed for password management

-- Ensure quiz_questions table can handle up to 20 questions per quiz
-- Current structure already supports this through order_index

-- Create index for better performance on coming soon courses
CREATE INDEX idx_courses_coming_soon ON courses(coming_soon) WHERE coming_soon = true;
