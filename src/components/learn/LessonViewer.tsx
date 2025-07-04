
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, User } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import PDFViewer from './PDFViewer';
import LessonComments from './LessonComments';

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  pdf_url: string;
  video_file_path?: string;
  pdf_file_path?: string;
  order_index: number;
  created_at: string;
}

interface LessonViewerProps {
  lesson: Lesson;
  onBack: () => void;
}

const LessonViewer: React.FC<LessonViewerProps> = ({ lesson, onBack }) => {
  const [videoProgress, setVideoProgress] = useState(0);

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress);
  };

  const videoSrc = lesson.video_url || 
    (lesson.video_file_path ? `https://bnagwpdxehzqfkfrozeh.supabase.co/storage/v1/object/public/course-materials/${lesson.video_file_path}` : '');
  
  const pdfSrc = lesson.pdf_url || 
    (lesson.pdf_file_path ? `https://bnagwpdxehzqfkfrozeh.supabase.co/storage/v1/object/public/course-materials/${lesson.pdf_file_path}` : '');

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

      {/* Course Header */}
      <div className="bg-gradient-to-r from-geo-dark/50 to-geo-dark/30 border border-geo-accent/20 rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
          {lesson.title}
        </h1>
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

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Video Section */}
        <div className="xl:col-span-2 space-y-6">
          {/* Video Player */}
          <VideoPlayer
            src={videoSrc}
            title={lesson.title}
            onProgress={handleVideoProgress}
            className="aspect-video"
          />

          {/* Progress Bar */}
          <div className="glass-effect glow-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Lesson Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(videoProgress)}%</span>
            </div>
            <Progress value={videoProgress} className="w-full" />
          </div>

          {/* Comments Section */}
          <LessonComments lessonId={lesson.id} />
        </div>

        {/* PDF Sidebar */}
        <div className="xl:col-span-1">
          <PDFViewer
            pdfUrl={pdfSrc}
            fileName={lesson.title}
            className="sticky top-6"
          />
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
