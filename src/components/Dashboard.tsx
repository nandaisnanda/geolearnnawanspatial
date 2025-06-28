
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Layers, Play } from "lucide-react";

const courses = [
  {
    id: 1,
    title: "Introduction to GIS Fundamentals",
    description: "Master the basics of Geographic Information Systems",
    progress: 75,
    image: "🌍",
    duration: "4 weeks",
    difficulty: "Beginner",
    category: "Fundamentals"
  },
  {
    id: 2,
    title: "Remote Sensing Applications",
    description: "Analyze satellite imagery and aerial photography",
    progress: 45,
    image: "🛰️",
    duration: "6 weeks",
    difficulty: "Intermediate",
    category: "Remote Sensing"
  },
  {
    id: 3,
    title: "Spatial Analysis Techniques",
    description: "Advanced spatial analysis and modeling",
    progress: 20,
    image: "📊",
    duration: "8 weeks",
    difficulty: "Advanced",
    category: "Analysis"
  },
  {
    id: 4,
    title: "Web GIS Development",
    description: "Build interactive web mapping applications",
    progress: 90,
    image: "🌐",
    duration: "10 weeks",
    difficulty: "Advanced",
    category: "Development"
  },
  {
    id: 5,
    title: "QGIS Mastery",
    description: "Complete guide to QGIS software",
    progress: 60,
    image: "🗺️",
    duration: "5 weeks",
    difficulty: "Intermediate",
    category: "Software"
  },
  {
    id: 6,
    title: "Drone Mapping & Photogrammetry",
    description: "Create 3D models from aerial imagery",
    progress: 5,
    image: "🚁",
    duration: "7 weeks",
    difficulty: "Intermediate",
    category: "Photogrammetry"
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const Dashboard = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-geo-accent mb-2">6</div>
              <div className="text-sm text-muted-foreground">Enrolled Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-geo-highlight mb-2">49%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-geo-accent mb-2">127</div>
              <div className="text-sm text-muted-foreground">Hours Learned</div>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="glass-effect glow-border hover:shadow-xl hover:shadow-geo-accent/10 transition-all duration-300 group cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{course.image}</div>
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-geo-accent transition-colors">
                  {course.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{course.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-geo-accent">{course.progress}%</span>
                </div>
                
                <Progress 
                  value={course.progress} 
                  className="h-2"
                  style={{
                    background: 'rgba(100, 255, 218, 0.1)'
                  }}
                />
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Layers className="h-3 w-3 mr-1" />
                    {course.category}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center text-geo-accent text-sm font-medium group-hover:text-geo-highlight transition-colors">
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
