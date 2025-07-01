
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, BookOpen, Clock, Star, TrendingUp, PlayCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';

const MyProgress = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  // Fetch enrolled courses with progress
  const { data: enrolledCourses = [] } = useQuery({
    queryKey: ['user-progress', user?.id],
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
            difficulty_level
          )
        `)
        .eq('user_id', user.id);
      
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

  const achievements = [
    { 
      title: "First Course Complete", 
      icon: <Trophy className="h-6 w-6 text-yellow-500" />, 
      earned: completedCourses >= 1 
    },
    { 
      title: "Dedicated Learner", 
      icon: <Star className="h-6 w-6 text-blue-500" />, 
      earned: totalHours >= 10 
    },
    { 
      title: "GIS Expert", 
      icon: <TrendingUp className="h-6 w-6 text-green-500" />, 
      earned: completedCourses >= 3 
    },
    { 
      title: "Knowledge Seeker", 
      icon: <BookOpen className="h-6 w-6 text-purple-500" />, 
      earned: completedLessons >= 20 
    }
  ];

  const stats = [
    { label: "Courses Enrolled", value: enrolledCourses.length.toString(), icon: <BookOpen className="h-8 w-8 text-geo-accent" /> },
    { label: "Hours Learned", value: totalHours.toString(), icon: <Clock className="h-8 w-8 text-geo-highlight" /> },
    { label: "Achievements", value: achievements.filter(a => a.earned).length.toString(), icon: <Trophy className="h-8 w-8 text-yellow-500" /> },
    { label: "Lessons Done", value: completedLessons.toString(), icon: <Star className="h-8 w-8 text-green-500" /> }
  ];

  const handleContinueLearning = (course: any) => {
    navigate('/learn');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            My Progress
          </h1>
          <p className="text-muted-foreground">Welcome back, {profile?.username}! Here's your learning journey.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-effect glow-border">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-geo-accent mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Progress */}
          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle className="text-2xl">Course Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((enrollment) => (
                  <div key={enrollment.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">{enrollment.courses.title}</h3>
                      <Badge variant="outline" className="border-geo-accent/30 text-geo-accent">
                        {Math.round(enrollment.progress)}%
                      </Badge>
                    </div>
                    <Progress value={enrollment.progress} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {enrollment.courses.difficulty_level} level
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleContinueLearning(enrollment.courses)}
                        className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No courses enrolled yet.</p>
                  <Button
                    onClick={() => navigate('/')}
                    className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                  >
                    Browse Courses
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle className="text-2xl">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border transition-all ${
                      achievement.earned 
                        ? 'bg-geo-accent/10 border-geo-accent/30 shadow-lg shadow-geo-accent/20' 
                        : 'bg-muted/20 border-muted/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {achievement.icon}
                      <div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.earned ? 'Earned' : 'Not earned yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glass-effect glow-border mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {enrolledCourses.slice(0, 3).map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center space-x-4 p-4 bg-geo-accent/10 rounded-lg">
                    <BookOpen className="h-8 w-8 text-geo-accent" />
                    <div>
                      <p className="font-semibold">Enrolled in: {enrollment.courses.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No activity yet. Start learning to see your progress!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyProgress;
