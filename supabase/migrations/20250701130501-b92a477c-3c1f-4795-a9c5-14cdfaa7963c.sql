
-- First, let's make sure the admin user exists and has admin role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'nawanspatial@gmail.com';

-- If the user doesn't exist, we'll handle it in the auth trigger
-- Update the handle_new_user function to include the new admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    CASE 
      WHEN NEW.email IN ('anandagunawan@gmail.com', 'nawanspatial@gmail.com') THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$;

-- Create lessons table for course content
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  pdf_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course discussions table
CREATE TABLE IF NOT EXISTS public.course_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user lesson progress table
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS on new tables
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lessons (public read, admin write)
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for course discussions
CREATE POLICY "Users can view course discussions" ON public.course_discussions FOR SELECT USING (true);
CREATE POLICY "Users can create discussions" ON public.course_discussions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their discussions" ON public.course_discussions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their discussions" ON public.course_discussions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user lesson progress
CREATE POLICY "Users can view their lesson progress" ON public.user_lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their lesson progress" ON public.user_lesson_progress FOR ALL USING (auth.uid() = user_id);
