
-- Add tables for enhanced community features (replies, voting, etc.)
CREATE TABLE public.community_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  vote_type text CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Add voting columns to community posts
ALTER TABLE public.community_posts 
ADD COLUMN upvotes_count integer DEFAULT 0,
ADD COLUMN downvotes_count integer DEFAULT 0;

-- Create job vacancies table
CREATE TABLE public.job_vacancies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  requirements text[],
  location text,
  job_type text DEFAULT 'full-time',
  salary_range text,
  experience_level text,
  is_published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create job applications table
CREATE TABLE public.job_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES public.job_vacancies(id) ON DELETE CASCADE,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  phone text,
  experience text NOT NULL,
  motivation text NOT NULL,
  expertise text NOT NULL,
  resume_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  applied_at timestamp with time zone DEFAULT now()
);

-- Create leaderboard/quiz scores table
CREATE TABLE public.quiz_leaderboard (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_score integer DEFAULT 0,
  quizzes_completed integer DEFAULT 0,
  average_score numeric DEFAULT 0,
  last_updated timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Create blog posts table for admin management
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  author_id uuid REFERENCES public.profiles(id),
  category text DEFAULT 'general',
  featured boolean DEFAULT false,
  published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for community votes
CREATE POLICY "Users can vote on posts" ON public.community_votes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view votes" ON public.community_votes
  FOR SELECT USING (true);

-- RLS policies for job vacancies
CREATE POLICY "Anyone can view published job vacancies" ON public.job_vacancies
  FOR SELECT USING (is_published = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage job vacancies" ON public.job_vacancies
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS policies for job applications
CREATE POLICY "Users can submit applications" ON public.job_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all applications" ON public.job_applications
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS policies for leaderboard
CREATE POLICY "Anyone can view leaderboard" ON public.quiz_leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Users can update own scores" ON public.quiz_leaderboard
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for blog posts
CREATE POLICY "Anyone can view published blogs" ON public.blog_posts
  FOR SELECT USING (published = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Update community posts trigger for vote counting
CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'upvote' THEN
      UPDATE public.community_posts 
      SET upvotes_count = upvotes_count + 1 
      WHERE id = NEW.post_id;
    ELSE
      UPDATE public.community_posts 
      SET downvotes_count = downvotes_count + 1 
      WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'upvote' THEN
      UPDATE public.community_posts 
      SET upvotes_count = upvotes_count - 1 
      WHERE id = OLD.post_id;
    ELSE
      UPDATE public.community_posts 
      SET downvotes_count = downvotes_count - 1 
      WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote type changes
    IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN
      UPDATE public.community_posts 
      SET upvotes_count = upvotes_count - 1, downvotes_count = downvotes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN
      UPDATE public.community_posts 
      SET upvotes_count = upvotes_count + 1, downvotes_count = downvotes_count - 1 
      WHERE id = NEW.post_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for vote counting
CREATE TRIGGER update_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.community_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();

-- Function to update leaderboard after quiz completion
CREATE OR REPLACE FUNCTION public.update_leaderboard_score(
  p_user_id uuid,
  p_score integer,
  p_percentage numeric
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.quiz_leaderboard (user_id, total_score, quizzes_completed, average_score)
  VALUES (p_user_id, p_score, 1, p_percentage)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_score = quiz_leaderboard.total_score + p_score,
    quizzes_completed = quiz_leaderboard.quizzes_completed + 1,
    average_score = (quiz_leaderboard.total_score + p_score) / (quiz_leaderboard.quizzes_completed + 1),
    last_updated = now();
END;
$$;
