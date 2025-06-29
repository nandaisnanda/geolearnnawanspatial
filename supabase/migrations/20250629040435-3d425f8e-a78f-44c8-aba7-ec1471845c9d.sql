
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  tier_level TEXT DEFAULT 'beginner' CHECK (tier_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  pdf_url TEXT,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit INTEGER DEFAULT 300, -- in seconds
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- array of options
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz results table
CREATE TABLE public.quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  answers JSONB, -- store user's answers
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_taken INTEGER -- in seconds
);

-- Create user enrollments table
CREATE TABLE public.user_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress DECIMAL(5,2) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Courses policies
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Quizzes policies
CREATE POLICY "Users can view quizzes for published courses" ON public.quizzes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND is_published = true) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage quizzes" ON public.quizzes FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Quiz questions policies
CREATE POLICY "Users can view questions for accessible quizzes" ON public.quiz_questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q 
    JOIN public.courses c ON q.course_id = c.id 
    WHERE q.id = quiz_id AND (c.is_published = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);
CREATE POLICY "Admins can manage quiz questions" ON public.quiz_questions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Quiz results policies
CREATE POLICY "Users can view own results" ON public.quiz_results FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own results" ON public.quiz_results FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all results" ON public.quiz_results FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- User enrollments policies
CREATE POLICY "Users can view own enrollments" ON public.user_enrollments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can enroll themselves" ON public.user_enrollments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own enrollment progress" ON public.user_enrollments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all enrollments" ON public.user_enrollments FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create storage bucket for course materials
INSERT INTO storage.buckets (id, name, public) VALUES ('course-materials', 'course-materials', true);

-- Storage policies for course materials
CREATE POLICY "Anyone can view course materials" ON storage.objects FOR SELECT USING (bucket_id = 'course-materials');
CREATE POLICY "Admins can upload course materials" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'course-materials' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update course materials" ON storage.objects FOR UPDATE USING (
  bucket_id = 'course-materials' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete course materials" ON storage.objects FOR DELETE USING (
  bucket_id = 'course-materials' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    CASE 
      WHEN NEW.email = 'anandagunawan@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample admin user (will be created when they first login)
-- Insert some sample courses
INSERT INTO public.courses (title, description, difficulty_level, is_published) VALUES
('GIS Fundamentals', 'Learn the basics of Geographic Information Systems', 'beginner', true),
('Advanced Remote Sensing', 'Deep dive into satellite imagery analysis', 'advanced', true),
('Python for Geospatial', 'Programming for spatial analysis', 'intermediate', false);

-- Insert sample quiz
INSERT INTO public.quizzes (course_id, title, description, time_limit, passing_score)
SELECT id, 'GIS Fundamentals Quiz', 'Test your knowledge of GIS basics', 300, 70
FROM public.courses WHERE title = 'GIS Fundamentals';

-- Insert sample quiz questions
WITH quiz_id AS (
  SELECT q.id FROM public.quizzes q 
  JOIN public.courses c ON q.course_id = c.id 
  WHERE c.title = 'GIS Fundamentals'
)
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM quiz_id), 'What does GIS stand for?', '["Geographic Information System", "Global Information Service", "Geospatial Intelligence Software", "Geographic Interface System"]', 0, 'GIS stands for Geographic Information System, which is a framework for gathering, managing, and analyzing spatial and geographic data.', 1),
((SELECT id FROM quiz_id), 'Which coordinate system is commonly used for GPS?', '["UTM", "WGS84", "NAD83", "State Plane"]', 1, 'WGS84 (World Geodetic System 1984) is the standard coordinate system used by GPS satellites.', 2),
((SELECT id FROM quiz_id), 'What is remote sensing?', '["Collecting data from satellites only", "Acquiring information about objects without physical contact", "Using GPS for navigation", "Creating digital maps"]', 1, 'Remote sensing is the acquisition of information about an object or phenomenon without making physical contact with it.', 3);
