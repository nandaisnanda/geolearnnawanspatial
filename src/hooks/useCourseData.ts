import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCourseData = () => {
  const { user } = useAuth();

  // Fetch courses from Supabase
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          difficulty_level,
          is_published,
          coming_soon,
          thumbnail_url,
          video_url,
          pdf_url,
          thumbnail_file_path,
          video_file_path,
          pdf_file_path,
          created_at
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch user enrollments
  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_enrollments')
        .select('course_id, progress')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const isEnrolled = (courseId: string) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  const getProgress = (courseId: string) => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    return enrollment?.progress || 0;
  };

  // Separate courses by type
  const enrolledCourses = courses.filter(course => isEnrolled(course.id) && !course.coming_soon);
  const availableCourses = courses.filter(course => !isEnrolled(course.id) && !course.coming_soon);
  const comingSoonCourses = courses.filter(course => course.coming_soon);

  return {
    courses,
    enrollments,
    isLoading,
    isEnrolled,
    getProgress,
    enrolledCourses,
    availableCourses,
    comingSoonCourses
  };
};