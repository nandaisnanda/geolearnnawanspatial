
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CourseCard from "@/components/course/CourseCard";
import { useCourseData } from "@/hooks/useCourseData";
import { useCourseEnrollment } from "@/hooks/useCourseEnrollment";

const FeaturedCourses = () => {
  const { user } = useAuth();
  const { 
    courses, 
    isLoading, 
    getProgress, 
    enrolledCourses, 
    availableCourses, 
    comingSoonCourses 
  } = useCourseData();
  
  const { 
    handleEnroll, 
    handleContinueLearning, 
    isEnrolling 
  } = useCourseEnrollment();

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

        {/* Continue Learning Section */}
        {user && enrolledCourses.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6 text-center">Continue Learning</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {enrolledCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  type="enrolled" 
                  progress={getProgress(course.id)}
                  onContinueLearning={handleContinueLearning}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Courses */}
        {availableCourses.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6 text-center">
              {user && enrolledCourses.length > 0 ? 'More Courses' : 'Available Courses'}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {availableCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  type="available" 
                  onEnroll={handleEnroll}
                  isEnrolling={isEnrolling}
                />
              ))}
            </div>
          </div>
        )}

        {/* Coming Soon Courses */}
        {comingSoonCourses.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6 text-center">Coming Soon</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {comingSoonCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  type="coming-soon" 
                />
              ))}
            </div>
          </div>
        )}

        {courses.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Courses Available</h3>
            <p className="text-muted-foreground">
              Check back soon for new courses and learning opportunities!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCourses;
