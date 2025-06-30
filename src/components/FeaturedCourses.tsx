
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const FeaturedCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

    try {
      // Auto-enroll user in the course
      const { error } = await supabase.rpc('auto_enroll_user', { 
        course_id: course.id 
      });

      if (error) {
        console.error('Enrollment error:', error);
        toast({
          title: "Enrollment Failed",
          description: "There was an error enrolling in the course. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Enrolled Successfully!",
        description: `Welcome to ${course.title}! Start learning now.`,
      });
      
      navigate('/learn');
    } catch (error) {
      console.error('Enrollment error:', error);
      toast({
        title: "Enrollment Failed",
        description: "There was an error enrolling in the course. Please try again.",
        variant: "destructive",
      });
    }
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
          {courses.map((course) => (
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

                <Button 
                  onClick={() => handleEnroll(course)}
                  className="w-full font-semibold transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                >
                  Enroll Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
