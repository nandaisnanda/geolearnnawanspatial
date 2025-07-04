import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users, BookOpen } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  thumbnail_url?: string;
  thumbnail_file_path?: string;
  coming_soon?: boolean;
}

interface CourseCardProps {
  course: Course;
  type: 'enrolled' | 'available' | 'coming-soon';
  progress?: number;
  onEnroll?: (course: Course) => void;
  onContinueLearning?: () => void;
  isEnrolling?: boolean;
}

const CourseCard = ({ 
  course, 
  type, 
  progress = 0,
  onEnroll, 
  onContinueLearning,
  isEnrolling = false 
}: CourseCardProps) => {
  return (
    <Card className="glass-effect glow-border hover:shadow-2xl hover:shadow-geo-accent/20 transition-all duration-500 group overflow-hidden">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-geo-accent/20 to-geo-highlight/20 flex items-center justify-center text-6xl relative overflow-hidden">
          {course.thumbnail_url || course.thumbnail_file_path ? (
            <img 
              src={course.thumbnail_url || `https://bnagwpdxehzqfkfrozeh.supabase.co/storage/v1/object/public/course-materials/${course.thumbnail_file_path}`}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>🗺️</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          {type === 'coming-soon' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">Coming Soon</span>
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Badge className="bg-geo-highlight/90 text-black font-semibold">
              {course.difficulty_level}
            </Badge>
          </div>
          <div className="absolute bottom-4 left-4">
            {type === 'enrolled' && (
              <Badge className="bg-green-500/90 text-white">
                <BookOpen className="h-3 w-3 mr-1" />
                Enrolled
              </Badge>
            )}
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

        {type === 'enrolled' && progress > 0 && (
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

        {type === 'enrolled' && (
          <Button 
            onClick={onContinueLearning}
            className="w-full font-semibold transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
          >
            Continue Learning
          </Button>
        )}

        {type === 'available' && (
          <Button 
            onClick={() => onEnroll?.(course)}
            disabled={isEnrolling}
            className="w-full font-semibold transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
          >
            {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
          </Button>
        )}

        {type === 'coming-soon' && (
          <Button 
            disabled
            className="w-full font-semibold bg-muted text-muted-foreground cursor-not-allowed"
          >
            Coming Soon
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;