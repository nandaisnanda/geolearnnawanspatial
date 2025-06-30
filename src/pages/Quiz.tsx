
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseQuiz from '@/components/CourseQuiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Quiz = () => {
  const { user } = useAuth();

  // Fetch user's enrolled courses
  const { data: enrolledCourses = [], isLoading } = useQuery({
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
            difficulty_level
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-geo-primary via-background to-geo-secondary">
        <Header />
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
              Course Quizzes
            </h1>
            <p className="text-muted-foreground">Please login to access course quizzes.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-geo-primary via-background to-geo-secondary">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
            Course Quizzes
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Test your knowledge and track your progress with our interactive quizzes.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading your courses...</p>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-8">
            <Card className="glass-effect glow-border max-w-md mx-auto">
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  You haven't enrolled in any courses yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Enroll in courses from the homepage to access quizzes.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {enrolledCourses.map((enrollment) => (
              <div key={enrollment.id} className="space-y-4">
                <Card className="glass-effect glow-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-geo-highlight">
                        {enrollment.courses.title}
                      </CardTitle>
                      <Badge variant="outline" className="border-geo-accent/30 text-geo-accent">
                        {enrollment.courses.difficulty_level}
                      </Badge>
                    </div>
                    {enrollment.courses.description && (
                      <p className="text-muted-foreground text-sm">
                        {enrollment.courses.description}
                      </p>
                    )}
                  </CardHeader>
                </Card>
                
                <CourseQuiz courseId={enrollment.courses.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Quiz;
