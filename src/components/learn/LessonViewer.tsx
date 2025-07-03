
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, FileText, Download, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface LessonViewerProps {
  lesson: Lesson;
  onBack: () => void;
}

const LessonViewer: React.FC<LessonViewerProps> = ({ lesson, onBack }) => {
  const { toast } = useToast();
  const [videoProgress, setVideoProgress] = useState(0);

  const handleDownload = (url: string, filename: string) => {
    if (!url || url === '#' || !url.trim()) {
      toast({
        title: "Download Demo",
        description: "This is a demo - connect to Supabase for real file downloads!",
      });
      return;
    }
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: `${filename} is being downloaded`,
    });
  };

  const handleVideoTimeUpdate = (currentTime: number, duration: number) => {
    if (duration > 0) {
      const progress = (currentTime / duration) * 100;
      setVideoProgress(progress);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="hover:bg-geo-accent/10 text-geo-accent"
        >
          ← Back to Course
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card className="glass-effect glow-border">
            <CardContent className="p-0">
              <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                {lesson.video_url && lesson.video_url !== '#' && lesson.video_url.trim() ? (
                  <video
                    className="w-full h-full"
                    controls
                    onTimeUpdate={(e) => {
                      const video = e.target as HTMLVideoElement;
                      if (video.duration) {
                        handleVideoTimeUpdate(video.currentTime, video.duration);
                      }
                    }}
                  >
                    <source src={lesson.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <PlayCircle className="h-16 w-16 text-white/80" />
                    <p className="ml-4">No video available for this lesson</p>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
                <p className="text-muted-foreground mb-4">{lesson.description}</p>
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
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-geo-highlight" />
                Course Materials
              </h3>
              <div className="p-4 bg-geo-highlight/10 border border-geo-highlight/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Lesson Notes.pdf</span>
                  <Badge variant="outline">PDF</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Comprehensive notes and exercises for this lesson
                </p>
                {lesson.pdf_url && lesson.pdf_url !== '#' && lesson.pdf_url.trim() ? (
                  <Button
                    size="sm"
                    onClick={() => handleDownload(lesson.pdf_url, `${lesson.title}.pdf`)}
                    className="w-full bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF Not Available
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
