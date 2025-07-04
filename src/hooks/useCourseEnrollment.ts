import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCourseEnrollment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('user_enrollments')
        .insert({
          user_id: user?.id,
          course_id: courseId,
          progress: 0
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-enrollments'] });
      toast({
        title: "Enrolled Successfully!",
        description: "You can now start learning. Redirecting to course...",
      });
      navigate('/learn');
    },
    onError: (error) => {
      console.error('Enrollment error:', error);
      toast({
        title: "Enrollment Failed",
        description: "There was an error enrolling in the course. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEnroll = async (course: any) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to enroll in courses",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    enrollMutation.mutate(course.id);
  };

  const handleContinueLearning = () => {
    navigate('/learn');
  };

  return {
    handleEnroll,
    handleContinueLearning,
    isEnrolling: enrollMutation.isPending
  };
};