-- Phase 1: Database Corrections & Optimization

-- Add missing foreign key constraints and indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_coming_soon ON public.courses(coming_soon);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON public.quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_enrollments_user_id ON public.user_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_enrollments_course_id ON public.user_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_topic_tag ON public.community_posts(topic_tag);
CREATE INDEX IF NOT EXISTS idx_community_replies_post_id ON public.community_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_post_id ON public.community_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_user_id ON public.community_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_enrollments_user_course ON public.user_enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_user_post ON public.community_votes(user_id, post_id);

-- Create course completion tracking
ALTER TABLE public.user_enrollments 
ADD COLUMN IF NOT EXISTS quiz_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create notification system table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    points INTEGER DEFAULT 0,
    criteria JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    achievement_id UUID NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Add indexes for achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

-- Enable RLS on achievements tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for achievements
CREATE POLICY "Anyone can view achievements" 
ON public.achievements 
FOR SELECT 
USING (true);

CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add points to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Create function to update user points and achievements
CREATE OR REPLACE FUNCTION public.award_achievement(
    p_user_id UUID,
    p_achievement_id UUID,
    p_points INTEGER DEFAULT 0
) RETURNS VOID AS $$
BEGIN
    -- Insert achievement if not already earned
    INSERT INTO public.user_achievements (user_id, achievement_id)
    VALUES (p_user_id, p_achievement_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    -- Update user points
    UPDATE public.profiles 
    SET points = points + p_points 
    WHERE id = p_user_id;
    
    -- Create notification
    INSERT INTO public.notifications (user_id, title, message, type, data)
    SELECT p_user_id, 
           'Achievement Unlocked!', 
           'You earned: ' || a.name, 
           'achievement',
           jsonb_build_object('achievement_id', p_achievement_id, 'points', p_points)
    FROM public.achievements a 
    WHERE a.id = p_achievement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check and award quiz completion achievements
CREATE OR REPLACE FUNCTION public.check_quiz_achievements(p_user_id UUID, p_quiz_result_id UUID) 
RETURNS VOID AS $$
DECLARE
    quiz_percentage NUMERIC;
    quiz_count INTEGER;
BEGIN
    -- Get the quiz percentage
    SELECT percentage INTO quiz_percentage 
    FROM public.quiz_results 
    WHERE id = p_quiz_result_id;
    
    -- Count total quizzes completed by user
    SELECT COUNT(*) INTO quiz_count 
    FROM public.quiz_results 
    WHERE user_id = p_user_id;
    
    -- Award achievements based on performance
    IF quiz_percentage >= 90 THEN
        -- Perfect score achievement
        PERFORM public.award_achievement(p_user_id, 
            (SELECT id FROM public.achievements WHERE name = 'Quiz Master' LIMIT 1), 
            50);
    ELSIF quiz_percentage >= 80 THEN
        -- Good score achievement  
        PERFORM public.award_achievement(p_user_id,
            (SELECT id FROM public.achievements WHERE name = 'Quiz Expert' LIMIT 1),
            25);
    END IF;
    
    -- Milestone achievements
    IF quiz_count = 1 THEN
        PERFORM public.award_achievement(p_user_id,
            (SELECT id FROM public.achievements WHERE name = 'First Quiz' LIMIT 1),
            10);
    ELSIF quiz_count = 5 THEN
        PERFORM public.award_achievement(p_user_id,
            (SELECT id FROM public.achievements WHERE name = 'Quiz Enthusiast' LIMIT 1),
            25);
    ELSIF quiz_count = 10 THEN
        PERFORM public.award_achievement(p_user_id,
            (SELECT id FROM public.achievements WHERE name = 'Quiz Champion' LIMIT 1),
            50);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, points, criteria) VALUES
('First Quiz', 'Complete your first quiz', '🎯', 10, '{"type": "quiz_count", "value": 1}'),
('Quiz Expert', 'Score 80% or higher on a quiz', '⭐', 25, '{"type": "quiz_score", "value": 80}'),
('Quiz Master', 'Score 90% or higher on a quiz', '🏆', 50, '{"type": "quiz_score", "value": 90}'),
('Quiz Enthusiast', 'Complete 5 quizzes', '📚', 25, '{"type": "quiz_count", "value": 5}'),
('Quiz Champion', 'Complete 10 quizzes', '👑', 50, '{"type": "quiz_count", "value": 10}'),
('First Course', 'Complete your first course', '🎓', 20, '{"type": "course_completion", "value": 1}'),
('Learning Streak', 'Complete 3 courses', '🔥', 75, '{"type": "course_completion", "value": 3}'),
('Knowledge Seeker', 'Complete 5 courses', '🧠', 100, '{"type": "course_completion", "value": 5}')
ON CONFLICT DO NOTHING;

-- Create trigger to automatically check achievements after quiz completion
CREATE OR REPLACE FUNCTION public.trigger_check_quiz_achievements()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.check_quiz_achievements(NEW.user_id, NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS quiz_achievement_trigger ON public.quiz_results;
CREATE TRIGGER quiz_achievement_trigger
    AFTER INSERT ON public.quiz_results
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_check_quiz_achievements();

-- Update the leaderboard function to include achievements
DROP FUNCTION IF EXISTS public.update_leaderboard_score(UUID, INTEGER, NUMERIC);
CREATE OR REPLACE FUNCTION public.update_leaderboard_score(p_user_id UUID, p_score INTEGER, p_percentage NUMERIC)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.quiz_leaderboard (user_id, total_score, quizzes_completed, average_score)
    VALUES (p_user_id, p_score, 1, p_percentage)
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_score = quiz_leaderboard.total_score + p_score,
        quizzes_completed = quiz_leaderboard.quizzes_completed + 1,
        average_score = (quiz_leaderboard.total_score + p_score) / (quiz_leaderboard.quizzes_completed + 1),
        last_updated = NOW();
        
    -- Award points for quiz completion
    UPDATE public.profiles 
    SET points = points + (p_percentage / 10)::INTEGER 
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;