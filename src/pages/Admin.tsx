import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, Users, BookOpen, BarChart3, Settings, Plus, Edit, Trash2, Video, FileText, AlertTriangle, Briefcase, Mail } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Header from '@/components/Header';

const Admin = () => {
  const { profile, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Course management states
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [showNewLesson, setShowNewLesson] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  
  // Blog management states
  const [showNewBlog, setShowNewBlog] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<string>('');
  
  // Job management states
  const [showNewJob, setShowNewJob] = useState(false);
  
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    difficulty_level: 'beginner',
    video_url: '',
    pdf_url: ''
  });

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    video_url: '',
    pdf_url: '',
    order_index: 0
  });

  const [newBlog, setNewBlog] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'general',
    featured: false,
    published: false
  });

  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: [] as string[],
    location: '',
    job_type: 'full-time',
    salary_range: '',
    experience_level: 'mid-level'
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.role && profile.role === 'admin'
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['admin-lessons', selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', selectedCourse)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCourse
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.role && profile.role === 'admin'
  });

  // Fetch blog posts
  const { data: blogPosts = [] } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.role && profile.role === 'admin'
  });

  // Fetch job vacancies
  const { data: jobVacancies = [] } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_vacancies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.role && profile.role === 'admin'
  });

  // Fetch job applications
  const { data: jobApplications = [] } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_vacancies (title)
        `)
        .order('applied_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.role && profile.role === 'admin'
  });

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: typeof newCourse) => {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: courseData.title,
          description: courseData.description,
          difficulty_level: courseData.difficulty_level,
          video_url: courseData.video_url || null,
          pdf_url: courseData.pdf_url || null,
          is_published: true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setNewCourse({ title: '', description: '', difficulty_level: 'beginner', video_url: '', pdf_url: '' });
      setShowNewCourse(false);
      toast({
        title: "Course Created!",
        description: "Your course has been created successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    }
  });

  const createLessonMutation = useMutation({
    mutationFn: async (lessonData: typeof newLesson) => {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          course_id: selectedCourse,
          title: lessonData.title,
          description: lessonData.description,
          video_url: lessonData.video_url || null,
          pdf_url: lessonData.pdf_url || null,
          order_index: lessonData.order_index
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', selectedCourse] });
      setNewLesson({ title: '', description: '', video_url: '', pdf_url: '', order_index: 0 });
      setShowNewLesson(false);
      toast({
        title: "Lesson Created!",
        description: "Your lesson has been added to the course.",
      });
    },
    onError: (error) => {
      console.error('Error creating lesson:', error);
      toast({
        title: "Error",
        description: "Failed to create lesson. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Blog post mutations
  const createBlogMutation = useMutation({
    mutationFn: async (blogData: typeof newBlog) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title: blogData.title,
          excerpt: blogData.excerpt,
          content: blogData.content,
          category: blogData.category,
          featured: blogData.featured,
          published: blogData.published,
          author_id: profile?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      setNewBlog({ title: '', excerpt: '', content: '', category: 'general', featured: false, published: false });
      setShowNewBlog(false);
      toast({
        title: "Blog Post Created!",
        description: "Your blog post has been created successfully.",
      });
    }
  });

  // Job vacancy mutations
  const createJobMutation = useMutation({
    mutationFn: async (jobData: typeof newJob) => {
      const { data, error } = await supabase
        .from('job_vacancies')
        .insert({
          title: jobData.title,
          description: jobData.description,
          requirements: jobData.requirements,
          location: jobData.location,
          job_type: jobData.job_type,
          salary_range: jobData.salary_range,
          experience_level: jobData.experience_level,
          is_published: true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      setNewJob({ title: '', description: '', requirements: [], location: '', job_type: 'full-time', salary_range: '', experience_level: 'mid-level' });
      setShowNewJob(false);
      toast({
        title: "Job Vacancy Created!",
        description: "Your job vacancy has been posted successfully.",
      });
    }
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Course Deleted",
        description: "The course has been removed successfully.",
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) throw authError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "User Deleted",
        description: "The user account has been permanently deleted.",
      });
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete user account. This requires admin privileges.",
        variant: "destructive",
      });
    }
  });

  const stats = {
    totalUsers: users.length,
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.is_published).length,
    totalStudents: users.filter(u => u.role === 'user').length,
    totalBlogs: blogPosts.length,
    publishedBlogs: blogPosts.filter(b => b.published).length,
    totalJobs: jobVacancies.length,
    totalApplications: jobApplications.length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-geo-accent"></div>
          <div className="absolute inset-0 bg-geo-accent/20 rounded-full blur-md animate-pulse-glow"></div>
        </div>
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    console.log('Access denied - Profile:', profile);
    return <Navigate to="/" replace />;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'pdf') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath);

      const url = data.publicUrl;

      if (showNewCourse) {
        setNewCourse(prev => ({ ...prev, [`${type}_url`]: url }));
      } else if (showNewLesson) {
        setNewLesson(prev => ({ ...prev, [`${type}_url`]: url }));
      }

      setUploadProgress(100);
      toast({
        title: "Upload Complete",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {profile?.full_name || profile?.username}! Manage your platform content and users.</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect glow-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-geo-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-geo-accent">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect glow-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-geo-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-geo-accent">{stats.totalCourses}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect glow-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Blog Posts</CardTitle>
              <FileText className="h-4 w-4 text-geo-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-geo-accent">{stats.publishedBlogs}/{stats.totalBlogs}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect glow-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Job Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-geo-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-geo-accent">{stats.totalApplications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Management Section - keep existing code */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="glass-effect glow-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-geo-accent" />
                  Course Management
                </CardTitle>
                <Button
                  onClick={() => setShowNewCourse(!showNewCourse)}
                  className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Course
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* New Course Form */}
              {showNewCourse && (
                <div className="space-y-4 p-4 bg-geo-dark/30 border border-geo-accent/20 rounded-lg">
                  <Input
                    placeholder="Course Title"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Course Description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  />
                  <select 
                    className="w-full px-3 py-2 bg-background border border-border rounded-md"
                    value={newCourse.difficulty_level}
                    onChange={(e) => setNewCourse({ ...newCourse, difficulty_level: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Course Video</label>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 'video')}
                        className="mb-2"
                      />
                      {newCourse.video_url && (
                        <p className="text-xs text-green-500">✓ Video uploaded</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Course PDF</label>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload(e, 'pdf')}
                        className="mb-2"
                      />
                      {newCourse.pdf_url && (
                        <p className="text-xs text-green-500">✓ PDF uploaded</p>
                      )}
                    </div>
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => createCourseMutation.mutate(newCourse)}
                      disabled={createCourseMutation.isPending}
                      className="bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black"
                    >
                      {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewCourse(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Courses List */}
              <div className="space-y-2">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-geo-dark/30 border border-geo-accent/20">
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">{course.difficulty_level}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={course.is_published ? 'default' : 'secondary'}>
                        {course.is_published ? 'published' : 'draft'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCourse(selectedCourse === course.id ? '' : course.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteCourseMutation.mutate(course.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lesson Management - keep existing code structure */}
          <Card className="glass-effect glow-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-geo-accent" />
                  Lesson Management
                </CardTitle>
                {selectedCourse && (
                  <Button
                    onClick={() => setShowNewLesson(!showNewLesson)}
                    className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Lesson
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedCourse ? (
                <p className="text-muted-foreground text-center py-8">
                  Select a course to manage its lessons
                </p>
              ) : (
                <>
                  {/* New Lesson Form */}
                  {showNewLesson && (
                    <div className="space-y-4 p-4 bg-geo-dark/30 border border-geo-accent/20 rounded-lg">
                      <Input
                        placeholder="Lesson Title"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                      />
                      <Textarea
                        placeholder="Lesson Description"
                        value={newLesson.description}
                        onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="Order Index"
                        value={newLesson.order_index}
                        onChange={(e) => setNewLesson({ ...newLesson, order_index: parseInt(e.target.value) || 0 })}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Lesson Video</label>
                          <Input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleFileUpload(e, 'video')}
                            className="mb-2"
                          />
                          {newLesson.video_url && (
                            <p className="text-xs text-green-500">✓ Video uploaded</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Lesson PDF</label>
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload(e, 'pdf')}
                            className="mb-2"
                          />
                          {newLesson.pdf_url && (
                            <p className="text-xs text-green-500">✓ PDF uploaded</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => createLessonMutation.mutate(newLesson)}
                          disabled={createLessonMutation.isPending}
                          className="bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black"
                        >
                          {createLessonMutation.isPending ? 'Creating...' : 'Create Lesson'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowNewLesson(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Lessons List */}
                  <div className="space-y-2">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-geo-dark/30 border border-geo-accent/20">
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-sm text-muted-foreground">Order: {lesson.order_index}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.video_url && <Video className="h-4 w-4 text-geo-accent" />}
                          {lesson.pdf_url && <FileText className="h-4 w-4 text-geo-highlight" />}
                        </div>
                      </div>
                    ))}
                    
                    {lessons.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No lessons yet. Create your first lesson!
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Blog Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="glass-effect glow-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-geo-accent" />
                  Blog Management
                </CardTitle>
                <Button
                  onClick={() => setShowNewBlog(!showNewBlog)}
                  className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Blog Post
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* New Blog Form */}
              {showNewBlog && (
                <div className="space-y-4 p-4 bg-geo-dark/30 border border-geo-accent/20 rounded-lg">
                  <Input
                    placeholder="Blog Title"
                    value={newBlog.title}
                    onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                  />
                  <Input
                    placeholder="Blog Excerpt"
                    value={newBlog.excerpt}
                    onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                  />
                  <Textarea
                    placeholder="Blog Content"
                    value={newBlog.content}
                    onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                    className="min-h-32"
                  />
                  <div className="flex gap-4">
                    <select 
                      className="px-3 py-2 bg-background border border-border rounded-md"
                      value={newBlog.category}
                      onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                    >
                      <option value="general">General</option>
                      <option value="technology">Technology</option>
                      <option value="education">Education</option>
                      <option value="news">News</option>
                    </select>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newBlog.featured}
                        onChange={(e) => setNewBlog({ ...newBlog, featured: e.target.checked })}
                        className="rounded"
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newBlog.published}
                        onChange={(e) => setNewBlog({ ...newBlog, published: e.target.checked })}
                        className="rounded"
                      />
                      Published
                    </label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => createBlogMutation.mutate(newBlog)}
                      disabled={createBlogMutation.isPending}
                      className="bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black"
                    >
                      {createBlogMutation.isPending ? 'Creating...' : 'Create Blog Post'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewBlog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Blog Posts List */}
              <div className="space-y-2">
                {blogPosts.map((blog) => (
                  <div key={blog.id} className="flex items-center justify-between p-3 rounded-lg bg-geo-dark/30 border border-geo-accent/20">
                    <div>
                      <h4 className="font-medium">{blog.title}</h4>
                      <p className="text-sm text-muted-foreground">{blog.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {blog.featured && <Badge variant="secondary">Featured</Badge>}
                      <Badge variant={blog.published ? 'default' : 'outline'}>
                        {blog.published ? 'Published' : 'Draft'}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Job Management Section */}
          <Card className="glass-effect glow-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-geo-accent" />
                  Job Vacancies
                </CardTitle>
                <Button
                  onClick={() => setShowNewJob(!showNewJob)}
                  className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Job
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* New Job Form */}
              {showNewJob && (
                <div className="space-y-4 p-4 bg-geo-dark/30 border border-geo-accent/20 rounded-lg">
                  <Input
                    placeholder="Job Title"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Job Description"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  />
                  <Input
                    placeholder="Location"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  />
                  <Input
                    placeholder="Salary Range"
                    value={newJob.salary_range}
                    onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select 
                      className="px-3 py-2 bg-background border border-border rounded-md"
                      value={newJob.job_type}
                      onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                    </select>
                    <select 
                      className="px-3 py-2 bg-background border border-border rounded-md"
                      value={newJob.experience_level}
                      onChange={(e) => setNewJob({ ...newJob, experience_level: e.target.value })}
                    >
                      <option value="entry-level">Entry Level</option>
                      <option value="mid-level">Mid Level</option>
                      <option value="senior-level">Senior Level</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => createJobMutation.mutate(newJob)}
                      disabled={createJobMutation.isPending}
                      className="bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black"
                    >
                      {createJobMutation.isPending ? 'Creating...' : 'Create Job'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewJob(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Job Vacancies List */}
              <div className="space-y-2">
                {jobVacancies.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-geo-dark/30 border border-geo-accent/20">
                    <div>
                      <h4 className="font-medium">{job.title}</h4>
                      <p className="text-sm text-muted-foreground">{job.location} • {job.job_type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={job.is_published ? 'default' : 'secondary'}>
                        {job.is_published ? 'Active' : 'Draft'}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Applications Section */}
        <Card className="glass-effect glow-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-geo-accent" />
              Job Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-geo-accent/20">
                    <th className="text-left p-2">Applicant</th>
                    <th className="text-left p-2">Position</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Applied</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobApplications.map((application: any) => (
                    <tr key={application.id} className="border-b border-geo-accent/10">
                      <td className="p-2">{application.applicant_name}</td>
                      <td className="p-2">{application.job_vacancies?.title}</td>
                      <td className="p-2">{application.applicant_email}</td>
                      <td className="p-2">{new Date(application.applied_at).toLocaleDateString()}</td>
                      <td className="p-2">
                        <Badge variant={application.status === 'pending' ? 'secondary' : 'default'}>
                          {application.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* User Management with Delete Functionality */}
        <Card className="glass-effect glow-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-geo-accent" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-geo-accent/20">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">Tier</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-geo-accent/10">
                      <td className="p-2">{user.full_name || user.username}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{user.tier_level}</Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
                          {user.role !== 'admin' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Delete User Account
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently delete the account for{' '}
                                    <strong>{user.full_name || user.username}</strong>? This action cannot be undone and will remove all their data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteUserMutation.mutate(user.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete Account
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
