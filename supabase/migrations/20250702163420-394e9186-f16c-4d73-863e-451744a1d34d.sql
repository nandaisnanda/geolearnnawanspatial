
-- Add parent_id column to course_discussions table to support threaded discussions
ALTER TABLE public.course_discussions 
ADD COLUMN parent_id uuid REFERENCES public.course_discussions(id) ON DELETE CASCADE;
