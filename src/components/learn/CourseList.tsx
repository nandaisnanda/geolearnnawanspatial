
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, Clock, ChevronRight } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  video_url?: string;
  pdf_url?: string;
}

interface Enrollment {
  id: string;
  progress: number;
  courses: Course;
}

interface CourseListProps {
  enrolledCourses: Enrollment[];
  coursesLoading: boolean;
  onSelectCourse: (course: Course) => void;
  profile: any;
}

const CourseList: React.FC<CourseListProps> = ({ 
  enrolledCourses, 
  coursesLoading, 
  onSelectCourse, 
  profile 
}) => {
  if (coursesLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading your courses...</p>
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <Card className="glass-effect glow-border max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-6">📚</div>
          <h3 className="text-xl font-semibold mb-4">No Courses Enrolled Yet</h3>
          <p className="text-muted-foreground mb-6">
            Browse our featured courses and start your learning journey today!
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
          >
            Browse Courses
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
          My Learning
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {profile?.username}! Continue your learning journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map((enrollment) => (
          <Card key={enrollment.id} className="glass-effect glow-border hover:scale-105 transition-transform cursor-pointer">
            <CardContent className="p-0">
              <div className="aspect-video bg-gradient-to-br from-geo-accent/20 to-geo-highlight/20 flex items-center justify-center">
                <PlayCircle className="h-16 w-16 text-white/80" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">{enrollment.courses.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {enrollment.courses.description}
                </p>
                
                {enrollment.progress > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(enrollment.progress)}%</span>
                    </div>
                    <Progress value={enrollment.progress} className="w-full" />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {enrollment.courses.difficulty_level}
                  </div>
                  <Button
                    onClick={() => onSelectCourse(enrollment.courses)}
                    size="sm"
                    className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                  >
                    Continue Learning
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
