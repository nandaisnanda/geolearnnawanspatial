
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const featuredCourses = [
  {
    id: 1,
    title: "ArcGIS Pro Masterclass",
    instructor: "Dr. Sarah Chen",
    rating: 4.9,
    students: 2156,
    duration: "12 weeks",
    price: "$299",
    image: "🗺️",
    tags: ["Professional", "Certification"],
    description: "Complete hands-on training in ArcGIS Pro for professional GIS analysts",
    available: true
  },
  {
    id: 2,
    title: "Python for Geospatial Analysis",
    instructor: "Prof. Michael Rodriguez",
    rating: 4.8,
    students: 1847,
    duration: "8 weeks",
    price: "$199",
    image: "🐍",
    tags: ["Programming", "Automation"],
    description: "Learn to automate GIS workflows using Python and popular geospatial libraries",
    available: true
  },
  {
    id: 3,
    title: "Climate Change Monitoring",
    instructor: "Dr. Emma Thompson",
    rating: 4.9,
    students: 956,
    duration: "6 weeks",
    price: "$249",
    image: "🌡️",
    tags: ["Climate", "Remote Sensing"],
    description: "Use satellite data to analyze and monitor climate change patterns globally",
    available: false
  },
  {
    id: 4,
    title: "QGIS Advanced Techniques",
    instructor: "Prof. Ahmad Spatial",
    rating: 4.7,
    students: 0,
    duration: "10 weeks",
    price: "$179",
    image: "🌍",
    tags: ["Open Source", "Advanced"],
    description: "Master advanced QGIS techniques for complex spatial analysis",
    available: false
  }
];

const FeaturedCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEnroll = (course: any) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to enroll in courses",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!course.available) {
      toast({
        title: "Coming Soon!",
        description: `${course.title} will be available soon. Stay tuned!`,
      });
      return;
    }

    // Store enrollment in localStorage
    const enrollments = JSON.parse(localStorage.getItem(`geolearn_enrollments_${user.id}`) || '[]');
    const isEnrolled = enrollments.find((e: any) => e.courseId === course.id);
    
    if (isEnrolled) {
      toast({
        title: "Already Enrolled",
        description: "You are already enrolled in this course!",
      });
      navigate('/learn');
      return;
    }

    enrollments.push({
      courseId: course.id,
      courseTitle: course.title,
      enrolledAt: new Date().toISOString(),
      progress: 0
    });
    
    localStorage.setItem(`geolearn_enrollments_${user.id}`, JSON.stringify(enrollments));
    
    toast({
      title: "Enrolled Successfully!",
      description: `Welcome to ${course.title}! Start learning now.`,
    });
    
    navigate('/learn');
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {featuredCourses.map((course) => (
            <Card key={course.id} className="glass-effect glow-border hover:shadow-2xl hover:shadow-geo-accent/20 transition-all duration-500 group overflow-hidden">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-geo-accent/20 to-geo-highlight/20 flex items-center justify-center text-6xl relative overflow-hidden">
                  {course.image}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <Badge className={course.available ? "bg-geo-highlight/90 text-black font-semibold" : "bg-orange-500/90 text-white font-semibold"}>
                      {course.available ? course.price : "Coming Soon"}
                    </Badge>
                  </div>
                  {!course.available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge variant="outline" className="border-orange-500 text-orange-500 bg-black/80">
                        Coming Soon
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <CardHeader className="pb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {course.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-geo-accent/30 text-geo-accent">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <CardTitle className="text-xl group-hover:text-geo-accent transition-colors">
                  {course.title}
                </CardTitle>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {course.description}
                </p>
                
                <div className="text-sm text-geo-accent font-medium">
                  by {course.instructor}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-yellow-400">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {course.students.toLocaleString()}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </div>
                </div>

                <Button 
                  onClick={() => handleEnroll(course)}
                  className={`w-full font-semibold transform hover:scale-105 transition-all duration-300 ${
                    course.available 
                      ? "bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  }`}
                >
                  {course.available ? "Enroll Now" : "Notify Me"}
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
