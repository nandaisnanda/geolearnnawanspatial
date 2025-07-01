
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const FeaturedCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch courses from Supabase
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
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

  const isEnrolled = (courseId: string) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  const getProgress = (courseId: string) => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    return enrollment?.progress || 0;
  };

  if (isLoading) {
    return (
      <section className="py-16 px-6 bg-geo-dark/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
              Featured Courses
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Loading courses...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 bg-geo-dark/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
            Featured Courses
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our most popular and highly-rated courses taught by industry experts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {courses.map((course) => {
            const enrolled = isEnrolled(course.id);
            const progress = getProgress(course.id);
            
            return (
              <Card key={course.id} className="glass-effect glow-border hover:shadow-2xl hover:shadow-geo-accent/20 transition-all duration-500 group overflow-hidden">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-geo-accent/20 to-geo-highlight/20 flex items-center justify-center text-6xl relative overflow-hidden">
                    🗺️
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-geo-highlight/90 text-black font-semibold">
                        {course.difficulty_level}
                      </Badge>
                    </div>
                    {enrolled && (
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-green-500/90 text-white">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Enrolled
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <CardTitle className="text-xl group-hover:text-geo-accent transition-colors">
                    {course.title}
                  </CardTitle>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {course.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-yellow-400">
                      <Star className="h-4 w-4 mr-1 fill-current" />
                      <span className="font-medium">4.8</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      156
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      8 weeks
                    </div>
                  </div>

                  {enrolled && progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-geo-accent to-geo-highlight h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={enrolled ? handleContinueLearning : () => handleEnroll(course)}
                    disabled={enrollMutation.isPending}
                    className="w-full font-semibold transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                  >
                    {enrollMutation.isPending ? 'Enrolling...' : 
                     enrolled ? 'Continue Learning' : 'Enroll Now'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
