
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle } from 'lucide-react';
import CourseQuiz from '@/components/CourseQuiz';
import CourseDiscussions from './CourseDiscussions';

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  video_url?: string;
  pdf_url?: string;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  pdf_url: string;
  order_index: number;
  created_at: string;
}

interface CourseViewerProps {
  course: Course;
  lessons: Lesson[];
  onBack: () => void;
  onSelectLesson: (lesson: Lesson) => void;
}

const CourseViewer: React.FC<CourseViewerProps> = ({ 
  course, 
  lessons, 
  onBack, 
  onSelectLesson 
}) => {
  return (
    <div className="space-y-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="hover:bg-geo-accent/10 text-geo-accent"
        >
          ← Back to Courses
        </Button>
      </div>

      {/* Course Header */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-geo-highlight">
              {course.title}
            </CardTitle>
            <Badge variant="outline" className="border-geo-accent/30 text-geo-accent">
              {course.difficulty_level}
            </Badge>
          </div>
          <p className="text-muted-foreground">{course.description}</p>
        </CardHeader>
      </Card>

      {/* Lessons */}
      {lessons.length > 0 && (
        <Card className="glass-effect glow-border">
          <CardHeader>
            <CardTitle className="text-geo-accent">Course Lessons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className="flex items-center justify-between p-4 bg-geo-dark/30 border border-geo-accent/20 rounded-lg hover:bg-geo-dark/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-geo-accent/20 rounded-full text-geo-accent font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{lesson.title}</h4>
                    <p className="text-sm text-muted-foreground">{lesson.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onSelectLesson(lesson)}
                  className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Watch
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quiz */}
      <CourseQuiz courseId={course.id} />

      {/* Discussions */}
      <CourseDiscussions courseId={course.id} />
    </div>
  );
};

export default CourseViewer;
