
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, FileText, Download, Clock, User, Star, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lesson {
  id: number;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  pdfUrl: string;
  createdAt: string;
}

const Learn = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    // Load lessons from localStorage
    const storedLessons = JSON.parse(localStorage.getItem('geolearn_lessons') || '[]');
    setLessons(storedLessons);
    
    // Add some default lessons if none exist
    if (storedLessons.length === 0) {
      const defaultLessons = [
        {
          id: 1,
          courseId: '1',
          title: 'Introduction to GIS Fundamentals',
          description: 'Learn the basics of Geographic Information Systems and spatial data analysis.',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          pdfUrl: '#',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          courseId: '1',
          title: 'Working with Satellite Imagery',
          description: 'Understanding how to process and analyze satellite imagery for various applications.',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          pdfUrl: '#',
          createdAt: new Date().toISOString()
        }
      ];
      setLessons(defaultLessons);
      localStorage.setItem('geolearn_lessons', JSON.stringify(defaultLessons));
    }
  }, []);

  const handleDownload = (url: string, filename: string) => {
    if (url === '#') {
      toast({
        title: "Download Demo",
        description: "This is a demo - connect to Supabase for real file downloads!",
      });
      return;
    }
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: `${filename} is being downloaded`,
    });
  };

  const handleVideoTimeUpdate = (currentTime: number, duration: number) => {
    const progress = (currentTime / duration) * 100;
    setVideoProgress(progress);
  };

  if (selectedLesson) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedLesson(null)}
              className="hover:bg-geo-accent/10 text-geo-accent"
            >
              ← Back to Lessons
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              <Card className="glass-effect glow-border">
                <CardContent className="p-0">
                  <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                    <video
                      className="w-full h-full"
                      controls
                      onTimeUpdate={(e) => {
                        const video = e.target as HTMLVideoElement;
                        handleVideoTimeUpdate(video.currentTime, video.duration);
                      }}
                    >
                      <source src={selectedLesson.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-2">{selectedLesson.title}</h1>
                    <p className="text-muted-foreground mb-4">{selectedLesson.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Instructor: Prof. GeoSpatial
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Duration: 45min
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress */}
              <Card className="glass-effect glow-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Lesson Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(videoProgress)}%</span>
                  </div>
                  <Progress value={videoProgress} className="w-full" />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* PDF Resource */}
              <Card className="glass-effect glow-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-geo-highlight" />
                    Course Materials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-geo-highlight/10 border border-geo-highlight/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Lesson Notes.pdf</span>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Comprehensive notes and exercises for this lesson
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(selectedLesson.pdfUrl, `${selectedLesson.title}.pdf`)}
                      className="w-full bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Map */}
              <Card className="glass-effect glow-border">
                <CardHeader>
                  <CardTitle className="text-lg">Interactive GIS Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gradient-to-br from-blue-900 to-green-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-30">
                      <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div
                            key={i}
                            className="border border-white/10"
                            style={{
                              backgroundColor: `hsl(${Math.random() * 60 + 200}, 70%, ${Math.random() * 30 + 20}%)`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="relative z-10 text-center">
                      <div className="text-white/80 text-sm mb-2">Interactive Map Viewer</div>
                      <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                        Launch Map Tool
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Rating */}
              <Card className="glass-effect glow-border">
                <CardHeader>
                  <CardTitle className="text-lg">Rate This Lesson</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-6 w-6 text-yellow-500 fill-current cursor-pointer hover:scale-110 transition-transform"
                      />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                  >
                    Submit Rating
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            Continue Learning
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}! Pick up where you left off.
          </p>
        </div>

        {lessons.length === 0 ? (
          <Card className="glass-effect glow-border max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-6">📚</div>
              <h3 className="text-xl font-semibold mb-4">No Lessons Available Yet</h3>
              <p className="text-muted-foreground mb-6">
                The admin hasn't uploaded any lessons yet. Check back soon or contact your instructor.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="glass-effect glow-border hover:scale-105 transition-transform cursor-pointer">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-geo-accent/20 to-geo-highlight/20 flex items-center justify-center">
                    <PlayCircle className="h-16 w-16 text-white/80" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {lesson.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        45min
                      </div>
                      <Button
                        onClick={() => setSelectedLesson(lesson)}
                        size="sm"
                        className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                      >
                        Start Learning
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;
