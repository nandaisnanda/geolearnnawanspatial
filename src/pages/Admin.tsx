import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, Users, BookOpen, BarChart3, Settings, Plus, Edit, Trash2, Video, FileText, AlertTriangle } from 'lucide-react';
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
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [showNewLesson, setShowNewLesson] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  
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

  // Fetch courses
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

  // Fetch lessons for selected course
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

  // Fetch users
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

  // Create course mutation
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

  // Create lesson mutation
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

  // Delete course mutation
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

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // First delete the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) throw profileError;

      // Then delete from auth.users (requires admin service role key)
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
  };

  // Show loading while checking auth
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

  // Redirect if not admin
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

      // Update the appropriate form field
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

  const handleCreateCourse = () => {
    if (!newCourse.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a course title.",
        variant: "destructive",
      });
      return;
    }
    createCourseMutation.mutate(newCourse);
  };

  const handleCreateLesson = () => {
    if (!newLesson.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a lesson title.",
        variant: "destructive",
      });
      return;
    }
    createLessonMutation.mutate(newLesson);
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
          <p className="text-muted-foreground">Welcome back, {profile?.full_name || profile?.username}! Manage your courses and content.</p>
        </div>

        {/* Stats Cards */}
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
              <BarChart3 className="h-4 w-4 text-geo-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-geo-accent">{stats.activeCourses}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect glow-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <Users className="h-4 w-4 text-geo-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-geo-accent">{stats.totalStudents}</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Management */}
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
                      onClick={handleCreateCourse}
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

          {/* Lesson Management */}
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
                          onClick={handleCreateLesson}
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
