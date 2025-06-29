
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, Users, BookOpen, BarChart3, Settings, Plus, Edit, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';

const Admin = () => {
  const { profile, isLoading } = useAuth();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Mock data for demonstration
  const [courses, setCourses] = useState([
    { id: 1, title: 'Introduction to Geography', students: 150, status: 'published' },
    { id: 2, title: 'Advanced Cartography', students: 85, status: 'draft' },
    { id: 3, title: 'GIS Fundamentals', students: 200, status: 'published' },
  ]);

  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', tier: 'intermediate' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', tier: 'advanced' },
    { id: 3, name: 'Admin User', email: 'anandagunawan@gmail.com', role: 'admin', tier: 'expert' },
  ]);

  const stats = {
    totalUsers: users.length,
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.status === 'published').length,
    totalStudents: courses.reduce((sum, course) => sum + course.students, 0),
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "Upload Complete",
            description: `${file.name} has been uploaded successfully.`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDeleteCourse = (courseId: number) => {
    setCourses(courses.filter(c => c.id !== courseId));
    toast({
      title: "Course Deleted",
      description: "The course has been removed successfully.",
    });
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Management */}
          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-geo-accent" />
                Course Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Create New Course
              </Button>
              
              <div className="space-y-2">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-geo-dark/30 border border-geo-accent/20">
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">{course.students} students</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteCourse(course.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Upload */}
          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-geo-accent" />
                Content Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
                  Upload Course Materials
                </label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3"
                  className="bg-geo-dark/50 border-geo-accent/30 focus:border-geo-accent"
                />
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
              
              <div className="space-y-2">
                <Input
                  placeholder="Content Title"
                  className="bg-geo-dark/50 border-geo-accent/30 focus:border-geo-accent"
                />
                <Textarea
                  placeholder="Content Description"
                  className="bg-geo-dark/50 border-geo-accent/30 focus:border-geo-accent"
                />
                <Button className="w-full bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold">
                  Save Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="glass-effect glow-border mt-8">
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
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{user.tier}</Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
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
