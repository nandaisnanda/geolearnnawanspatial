
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { PlayCircle, FileText, Download, Clock, User, Star, ChevronRight, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import CourseQuiz from '@/components/CourseQuiz';

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

interface Discussion {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
  } | null;
}

const Learn = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [videoProgress, setVideoProgress] = useState(0);

  // Fetch enrolled courses
  const { data: enrolledCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['enrolled-courses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            difficulty_level,
            video_url,
            pdf_url
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch lessons for selected course
  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', selectedCourse?.id],
    queryFn: async () => {
      if (!selectedCourse?.id) return [];
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', selectedCourse.id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCourse?.id
  });

  // Fetch discussions for selected course
  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions', selectedCourse?.id],
    queryFn: async () => {
      if (!selectedCourse?.id) return [];
      
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('course_discussions')
        .select('*')
        .eq('course_id', selectedCourse.id)
        .order('created_at', { ascending: false });
      
      if (discussionsError) throw discussionsError;
      
      // Fetch profiles for discussions
      const userIds = [...new Set(discussionsData.map(d => d.user_id).filter(Boolean))];
      
      if (userIds.length === 0) return [];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Combine discussions with profiles
      const discussionsWithProfiles = discussionsData.map(discussion => ({
        ...discussion,
        profiles: profilesData.find(profile => profile.id === discussion.user_id) || null
      }));
      
      return discussionsWithProfiles;
    },
    enabled: !!selectedCourse?.id
  });

  // Add discussion mutation
  const addDiscussionMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from('course_discussions')
        .insert({
          course_id: selectedCourse?.id,
          user_id: user?.id,
          content
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions', selectedCourse?.id] });
      setNewDiscussion('');
      toast({
        title: "Discussion Added!",
        description: "Your comment has been posted.",
      });
    },
    onError: (error) => {
      console.error('Error adding discussion:', error);
      toast({
        title: "Error",
        description: "Failed to add discussion. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDownload = (url: string, filename: string) => {
    if (!url || url === '#') {
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

  const handleAddDiscussion = () => {
    if (!newDiscussion.trim()) {
      toast({
        title: "Content Required",
        description: "Please add some content to your discussion.",
        variant: "destructive",
      });
      return;
    }
    addDiscussionMutation.mutate(newDiscussion);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // If viewing a specific lesson
  if (selectedLesson) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedLesson(null)}
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
                    {selectedLesson.video_url ? (
                      <video
                        className="w-full h-full"
                        controls
                        onTimeUpdate={(e) => {
                          const video = e.target as HTMLVideoElement;
                          handleVideoTimeUpdate(video.currentTime, video.duration);
                        }}
                      >
                        <source src={selectedLesson.video_url} type="video/mp4" />
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
              {selectedLesson.pdf_url && (
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
                        onClick={() => handleDownload(selectedLesson.pdf_url, `${selectedLesson.title}.pdf`)}
                        className="w-full bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If viewing a specific course
  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedCourse(null)}
              className="hover:bg-geo-accent/10 text-geo-accent"
            >
              ← Back to Courses
            </Button>
          </div>

          <div className="space-y-8">
            {/* Course Header */}
            <Card className="glass-effect glow-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-geo-highlight">
                    {selectedCourse.title}
                  </CardTitle>
                  <Badge variant="outline" className="border-geo-accent/30 text-geo-accent">
                    {selectedCourse.difficulty_level}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{selectedCourse.description}</p>
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
                        onClick={() => setSelectedLesson(lesson)}
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
            <CourseQuiz courseId={selectedCourse.id} />

            {/* Discussions */}
            <Card className="glass-effect glow-border">
              <CardHeader>
                <CardTitle className="text-geo-accent flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Course Discussions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Discussion */}
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts or ask questions about this course..."
                    value={newDiscussion}
                    onChange={(e) => setNewDiscussion(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleAddDiscussion}
                    disabled={addDiscussionMutation.isPending}
                    className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {addDiscussionMutation.isPending ? 'Posting...' : 'Post Discussion'}
                  </Button>
                </div>

                {/* Discussions List */}
                <div className="space-y-4">
                  {discussions.map((discussion) => (
                    <div key={discussion.id} className="p-4 bg-geo-dark/30 border border-geo-accent/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-geo-highlight">
                          {discussion.profiles?.full_name || discussion.profiles?.username || 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(discussion.created_at)}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{discussion.content}</p>
                    </div>
                  ))}
                  
                  {discussions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No discussions yet. Be the first to start a conversation!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Main courses list view
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            My Learning
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.username}! Continue your learning journey.
          </p>
        </div>

        {coursesLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading your courses...</p>
          </div>
        ) : enrolledCourses.length === 0 ? (
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
        ) : (
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
                        onClick={() => setSelectedCourse(enrollment.courses)}
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
        )}
      </div>
    </div>
  );
};

export default Learn;
