
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileVideo, FileText, Trash2, Edit, Users, BookOpen, BarChart3, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

const Admin = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [courses, setCourses] = useState([
    { id: 1, title: 'ArcGIS Pro Masterclass', lessons: 16, students: 2156, status: 'active' },
    { id: 2, title: 'Python for Geospatial Analysis', lessons: 14, students: 1847, status: 'active' },
    { id: 3, title: 'Climate Change Monitoring', lessons: 10, students: 956, status: 'draft' }
  ]);

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: ''
  });

  const [uploadData, setUploadData] = useState({
    courseId: '',
    lessonTitle: '',
    lessonDescription: '',
    videoFile: null as File | null,
    pdfFile: null as File | null
  });

  // Redirect if not admin
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileUpload = (type: 'video' | 'pdf', file: File) => {
    setUploadData(prev => ({
      ...prev,
      [`${type}File`]: file
    }));
    
    toast({
      title: `${type.toUpperCase()} Selected`,
      description: `${file.name} ready for upload`,
    });
  };

  const handleUploadLesson = () => {
    if (!uploadData.courseId || !uploadData.lessonTitle || !uploadData.videoFile || !uploadData.pdfFile) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields and select both video and PDF files",
        variant: "destructive",
      });
      return;
    }

    simulateUpload();
    
    setTimeout(() => {
      // Store lesson data in localStorage
      const existingLessons = JSON.parse(localStorage.getItem('geolearn_lessons') || '[]');
      const newLesson = {
        id: Date.now(),
        courseId: uploadData.courseId,
        title: uploadData.lessonTitle,
        description: uploadData.lessonDescription,
        videoUrl: URL.createObjectURL(uploadData.videoFile),
        pdfUrl: URL.createObjectURL(uploadData.pdfFile),
        createdAt: new Date().toISOString()
      };
      
      existingLessons.push(newLesson);
      localStorage.setItem('geolearn_lessons', JSON.stringify(existingLessons));
      
      toast({
        title: "Lesson Uploaded Successfully",
        description: `${uploadData.lessonTitle} has been added to the course`,
      });

      // Reset form
      setUploadData({
        courseId: '',
        lessonTitle: '',
        lessonDescription: '',
        videoFile: null,
        pdfFile: null
      });
      setUploadProgress(0);
    }, 2000);
  };

  const handleCreateCourse = () => {
    if (!newCourse.title || !newCourse.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in course title and description",
        variant: "destructive",
      });
      return;
    }

    const course = {
      id: courses.length + 1,
      title: newCourse.title,
      lessons: 0,
      students: 0,
      status: 'draft' as const
    };

    setCourses([...courses, course]);
    setNewCourse({ title: '', description: '', instructor: '', duration: '' });

    toast({
      title: "Course Created",
      description: `${newCourse.title} has been created successfully`,
    });
  };

  const removeFile = (type: 'video' | 'pdf') => {
    setUploadData(prev => ({
      ...prev,
      [`${type}File`]: null
    }));
  };

  const stats = [
    { label: 'Total Courses', value: '12', icon: <BookOpen className="h-8 w-8 text-geo-accent" /> },
    { label: 'Active Students', value: '4,959', icon: <Users className="h-8 w-8 text-geo-highlight" /> },
    { label: 'Total Lessons', value: '156', icon: <FileVideo className="h-8 w-8 text-blue-500" /> },
    { label: 'Completion Rate', value: '89%', icon: <BarChart3 className="h-8 w-8 text-green-500" /> }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {profile?.username}! Manage your courses and content.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-effect glow-border">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-geo-accent mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-geo-dark/50">
            <TabsTrigger value="upload" className="data-[state=active]:bg-geo-accent/20">Upload Content</TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-geo-accent/20">Manage Courses</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-geo-accent/20">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="glass-effect glow-border">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Upload className="h-6 w-6 text-geo-accent" />
                  Upload New Lesson
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="courseSelect">Select Course</Label>
                      <select
                        id="courseSelect"
                        value={uploadData.courseId}
                        onChange={(e) => setUploadData(prev => ({ ...prev, courseId: e.target.value }))}
                        className="w-full mt-1 p-2 bg-geo-dark/50 border border-geo-accent/30 rounded-md focus:border-geo-accent"
                      >
                        <option value="">Choose a course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="lessonTitle">Lesson Title</Label>
                      <Input
                        id="lessonTitle"
                        value={uploadData.lessonTitle}
                        onChange={(e) => setUploadData(prev => ({ ...prev, lessonTitle: e.target.value }))}
                        className="bg-geo-dark/50 border-geo-accent/30 focus:border-geo-accent"
                        placeholder="Enter lesson title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="lessonDescription">Lesson Description</Label>
                      <Textarea
                        id="lessonDescription"
                        value={uploadData.lessonDescription}
                        onChange={(e) => setUploadData(prev => ({ ...prev, lessonDescription: e.target.value }))}
                        className="bg-geo-dark/50 border-geo-accent/30 focus:border-geo-accent"
                        placeholder="Enter lesson description"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Video File</Label>
                      <div className="border-2 border-dashed border-geo-accent/30 rounded-lg p-6 text-center hover:border-geo-accent/50 transition-colors">
                        {uploadData.videoFile ? (
                          <div className="space-y-2">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                            <p className="text-sm font-medium text-green-500">{uploadData.videoFile.name}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFile('video')}
                              className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <>
                            <FileVideo className="h-12 w-12 text-geo-accent mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground mb-2">Drop video file here or click to browse</p>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload('video', e.target.files[0])}
                              className="hidden"
                              id="video-upload"
                            />
                            <Button
                              variant="outline"
                              onClick={() => document.getElementById('video-upload')?.click()}
                              className="border-geo-accent/30 text-geo-accent hover:bg-geo-accent/10"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Select Video
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label>PDF File</Label>
                      <div className="border-2 border-dashed border-geo-highlight/30 rounded-lg p-6 text-center hover:border-geo-highlight/50 transition-colors">
                        {uploadData.pdfFile ? (
                          <div className="space-y-2">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                            <p className="text-sm font-medium text-green-500">{uploadData.pdfFile.name}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFile('pdf')}
                              className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <>
                            <FileText className="h-12 w-12 text-geo-highlight mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground mb-2">Drop PDF file here or click to browse</p>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload('pdf', e.target.files[0])}
                              className="hidden"
                              id="pdf-upload"
                            />
                            <Button
                              variant="outline"
                              onClick={() => document.getElementById('pdf-upload')?.click()}
                              className="border-geo-highlight/30 text-geo-highlight hover:bg-geo-highlight/10"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Select PDF
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
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
                
                <Button
                  onClick={handleUploadLesson}
                  disabled={isUploading}
                  className="w-full bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold py-4 text-lg"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Lesson'}
                </Button>
                
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400">
                    💡 <strong>Pro Tip:</strong> For production file uploads and Google authentication, connect to Supabase for secure storage and advanced features!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Course */}
              <Card className="glass-effect glow-border">
                <CardHeader>
                  <CardTitle className="text-xl">Create New Course</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="courseTitle">Course Title</Label>
                    <Input
                      id="courseTitle"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-geo-dark/50 border-geo-accent/30 focus:border-geo-accent"
                      placeholder="Enter course title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="courseDescription">Description</Label>
                    <Textarea
                      id="courseDescription"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-geo-dark/50 border-geo-accent/30 focus:border-geo-accent"
                      placeholder="Enter course description"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="courseInstructor">Instructor</Label>
                    <Input
                      id="courseInstructor"
                      value={newCourse.instructor}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, instructor: e.target.value }))}
                      className="bg-geo-dark/50 border-geo-accent/30 focus:border-geo-accent"
                      placeholder="Enter instructor name"
                    />
                  </div>
                  
                  <Button
                    onClick={handleCreateCourse}
                    className="w-full bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
                  >
                    Create Course
                  </Button>
                </CardContent>
              </Card>

              {/* Course List */}
              <Card className="glass-effect glow-border">
                <CardHeader>
                  <CardTitle className="text-xl">Existing Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="p-4 bg-geo-dark/30 rounded-lg border border-geo-accent/20">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{course.title}</h3>
                          <Badge variant={course.status === 'active' ? 'default' : 'outline'}>
                            {course.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                          <span>{course.lessons} lessons</span>
                          <span>{course.students} students</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-geo-accent/30 text-geo-accent hover:bg-geo-accent/10">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-effect glow-border">
                <CardHeader>
                  <CardTitle className="text-xl">Course Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="p-4 bg-geo-dark/30 rounded-lg">
                        <h3 className="font-semibold mb-2">{course.title}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Students: </span>
                            <span className="text-geo-accent font-semibold">{course.students}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Completion: </span>
                            <span className="text-geo-highlight font-semibold">
                              {Math.floor(Math.random() * 30 + 70)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect glow-border">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-geo-accent/10 rounded-lg">
                      <p className="font-semibold">New enrollment</p>
                      <p className="text-sm text-muted-foreground">5 new students joined ArcGIS Pro course</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <div className="p-4 bg-geo-highlight/10 rounded-lg">
                      <p className="font-semibold">Course completed</p>
                      <p className="text-sm text-muted-foreground">Student completed Python course</p>
                      <p className="text-xs text-muted-foreground">4 hours ago</p>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-lg">
                      <p className="font-semibold">High rating received</p>
                      <p className="text-sm text-muted-foreground">Climate course received 5-star rating</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
