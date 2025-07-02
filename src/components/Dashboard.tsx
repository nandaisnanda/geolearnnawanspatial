
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Layers, Play, Trophy, Clock, BookOpen, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch enrolled courses with progress
  const { data: enrolledCourses = [] } = useQuery({
    queryKey: ['enrolled-courses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            difficulty_level,
            video_url,
            pdf_url
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch user lesson progress
  const { data: lessonProgress = [] } = useQuery({
    queryKey: ['lesson-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Calculate achievements
  const completedCourses = enrolledCourses.filter(course => course.progress >= 100).length;
  const totalHours = Math.floor(enrolledCourses.reduce((acc, course) => acc + (course.progress * 0.5), 0));
  const completedLessons = lessonProgress.filter(progress => progress.completed).length;
  const averageProgress = enrolledCourses.length > 0 
    ? enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length 
    : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleContinueLearning = (course: any) => {
    navigate('/learn');
  };

  if (!user) {
    return (
      <section className="py-16 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-accent to-white bg-clip-text text-transparent">
            Learning Dashboard
          </h2>
          <p className="text-muted-foreground mb-6">Please login to view your learning progress.</p>
          <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black">
            Login to Continue
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-accent to-white bg-clip-text text-transparent">
            Your Learning Dashboard
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Track your progress across our comprehensive GIS and Remote Sensing curriculum
          </p>
        </div>

        {/* Overall Progress */}
        <div className="mb-12 glass-effect rounded-xl p-8 glow-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-geo-accent mb-2">{enrolledCourses.length}</div>
              <div className="text-sm text-muted-foreground">Enrolled Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-geo-highlight mb-2">{Math.round(averageProgress)}%</div>
              <div className="text-sm text-muted-foreground">Average Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-geo-accent mb-2">{totalHours}</div>
              <div className="text-sm text-muted-foreground">Hours Learned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-2">{completedCourses}</div>
              <div className="text-sm text-muted-foreground">Completed Courses</div>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((enrollment) => (
              <Card key={enrollment.id} className="glass-effect glow-border hover:shadow-xl hover:shadow-geo-accent/10 transition-all duration-300 group cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">🗺️</div>
                    <Badge className={getDifficultyColor(enrollment.courses.difficulty_level)}>
                      {enrollment.courses.difficulty_level}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-geo-accent transition-colors">
                    {enrollment.courses.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{enrollment.courses.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-geo-accent">{Math.round(enrollment.progress)}%</span>
                  </div>
                  
                  <Progress 
                    value={enrollment.progress} 
                    className="h-2"
                  />
                  
                  {/* Course Resources */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                    <div className="flex items-center space-x-3">
                      {enrollment.courses.video_url && (
                        <div className="flex items-center">
                          <Play className="h-3 w-3 mr-1 text-geo-accent" />
                          <span>Video</span>
                        </div>
                      )}
                      {enrollment.courses.pdf_url && (
                        <div className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1 text-geo-highlight" />
                          <span>PDF</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>In Progress</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => handleContinueLearning(enrollment.courses)}
                      className="w-full bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-effect glow-border max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-6">📚</div>
              <h3 className="text-xl font-semibold mb-4">No Courses Enrolled Yet</h3>
              <p className="text-muted-foreground mb-6">
                Browse our featured courses and start your learning journey today!
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
              >
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
