
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.user_enrollments;
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.user_enrollments;
DROP POLICY IF EXISTS "Users can insert their own enrollments" ON public.user_enrollments;
DROP POLICY IF EXISTS "Users can update their own enrollments" ON public.user_enrollments;

-- Create community posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  topic_tag TEXT,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create community replies table
CREATE TABLE IF NOT EXISTS public.community_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create community likes table
CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- Recreate user enrollment policies
CREATE POLICY "Users can view their own enrollments" ON public.user_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own enrollments" ON public.user_enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own enrollments" ON public.user_enrollments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all enrollments" ON public.user_enrollments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for community posts
CREATE POLICY "Anyone can view community posts" ON public.community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for community replies
CREATE POLICY "Anyone can view replies" ON public.community_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create replies" ON public.community_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own replies" ON public.community_replies FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own replies" ON public.community_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for community likes
CREATE POLICY "Anyone can view likes" ON public.community_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their own likes" ON public.community_likes FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Function to automatically enroll user in course when they access it
CREATE OR REPLACE FUNCTION public.auto_enroll_user(course_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_enrollments (user_id, course_id)
  VALUES (auth.uid(), course_id)
  ON CONFLICT (user_id, course_id) DO NOTHING;
END;
$$;

-- Function to update community post counters
CREATE OR REPLACE FUNCTION public.update_post_counters()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_TABLE_NAME = 'community_replies' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.community_posts 
      SET replies_count = replies_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.community_posts 
      SET replies_count = replies_count - 1 
      WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'community_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.community_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.community_posts 
      SET likes_count = likes_count - 1 
      WHERE id = OLD.post_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_replies_count ON public.community_replies;
DROP TRIGGER IF EXISTS update_likes_count ON public.community_likes;

-- Create triggers for updating counters
CREATE TRIGGER update_replies_count
  AFTER INSERT OR DELETE ON public.community_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_post_counters();

CREATE TRIGGER update_likes_count
  AFTER INSERT OR DELETE ON public.community_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_counters();
