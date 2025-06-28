
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, FileText, Download, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

const Learn = () => {
  const { user } = useAuth();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isVideoMode, setIsVideoMode] = useState(true);

  const lessons = [
    {
      id: 1,
      title: "Introduction to ArcGIS Pro",
      duration: "15:30",
      type: "video",
      completed: true,
      pdfUrl: "/sample-lesson-1.pdf",
      videoUrl: "/sample-video-1.mp4"
    },
    {
      id: 2,
      title: "Working with Coordinate Systems",
      duration: "22:45",
      type: "video",
      completed: true,
      pdfUrl: "/sample-lesson-2.pdf",
      videoUrl: "/sample-video-2.mp4"
    },
    {
      id: 3,
      title: "Spatial Analysis Fundamentals",
      duration: "18:20",
      type: "video",
      completed: false,
      pdfUrl: "/sample-lesson-3.pdf",
      videoUrl: "/sample-video-3.mp4"
    },
    {
      id: 4,
      title: "Advanced Cartographic Techniques",
      duration: "25:10",
      type: "video",
      completed: false,
      pdfUrl: "/sample-lesson-4.pdf",
      videoUrl: "/sample-video-4.mp4"
    }
  ];

  const courseProgress = (lessons.filter(l => l.completed).length / lessons.length) * 100;

  const downloadPDF = (pdfUrl: string, title: string) => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl p-6">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
                ArcGIS Pro Masterclass
              </h1>
              <p className="text-muted-foreground">Advanced GIS techniques for professional analysts</p>
            </div>
            <Badge className="bg-geo-accent/20 text-geo-accent">
              {Math.round(courseProgress)}% Complete
            </Badge>
          </div>
          
          <Progress value={courseProgress} className="h-2 mb-4" />
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Lesson {currentLesson + 1} of {lessons.length}</span>
            <span>•</span>
            <span>{lessons[currentLesson].duration}</span>
            <span>•</span>
            <span>Dr. Sarah Chen</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video/PDF Viewer */}
            <Card className="glass-effect glow-border overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-geo-accent/20 to-geo-highlight/20 relative">
                {isVideoMode ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Button
                        size="lg"
                        className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/20 rounded-full p-8"
                      >
                        <Play className="h-12 w-12" />
                      </Button>
                      <div className="text-white text-lg font-semibold">
                        {lessons[currentLesson].title}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-white/95 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <FileText className="h-16 w-16 text-geo-accent mx-auto" />
                      <div className="text-geo-accent text-lg font-semibold">
                        PDF Viewer
                      </div>
                      <p className="text-muted-foreground max-w-md">
                        Interactive PDF content for {lessons[currentLesson].title}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Controls */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={isVideoMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsVideoMode(true)}
                        className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Video
                      </Button>
                      <Button
                        variant={!isVideoMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsVideoMode(false)}
                        className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => downloadPDF(lessons[currentLesson].pdfUrl, lessons[currentLesson].title)}
                        className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Lesson Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
                disabled={currentLesson === 0}
                className="border-geo-accent/30 text-geo-accent hover:bg-geo-accent/10"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Lesson
              </Button>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">{lessons[currentLesson].title}</h3>
                <p className="text-muted-foreground">Lesson {currentLesson + 1} of {lessons.length}</p>
              </div>
              
              <Button
                onClick={() => setCurrentLesson(Math.min(lessons.length - 1, currentLesson + 1))}
                disabled={currentLesson === lessons.length - 1}
                className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
              >
                Next Lesson
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Course Progress */}
            <Card className="glass-effect glow-border">
              <CardHeader>
                <CardTitle className="text-lg">Course Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-geo-accent mb-2">
                      {Math.round(courseProgress)}%
                    </div>
                    <Progress value={courseProgress} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    {lessons.filter(l => l.completed).length} of {lessons.length} lessons completed
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card className="glass-effect glow-border">
              <CardHeader>
                <CardTitle className="text-lg">Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      onClick={() => setCurrentLesson(index)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        index === currentLesson
                          ? 'bg-geo-accent/20 border-geo-accent/50'
                          : 'bg-muted/20 border-muted/30 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{lesson.title}</h4>
                        {lesson.completed && (
                          <Badge className="bg-green-500/20 text-green-500 text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{lesson.duration}</span>
                        <div className="flex items-center space-x-2">
                          <Play className="h-3 w-3" />
                          <FileText className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Downloads */}
            <Card className="glass-effect glow-border">
              <CardHeader>
                <CardTitle className="text-lg">Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPDF(lessons[currentLesson].pdfUrl, lessons[currentLesson].title)}
                    className="w-full border-geo-accent/30 text-geo-accent hover:bg-geo-accent/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Current PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-geo-highlight/30 text-geo-highlight hover:bg-geo-highlight/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    All Materials
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
