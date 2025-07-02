import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import QuizManager from '@/components/admin/QuizManager';
import { Plus, Edit, Trash2, Save, Upload, FileText, Video, Users, BookOpen, MessageSquare, Trophy } from 'lucide-react';

const Admin = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    difficulty_level: 'beginner',
    video_url: '',
    pdf_url: '',
    is_published: false
  });

  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'general',
    featured: false,
    published: false
  });

  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'full-time',
    experience_level: 'mid',
    salary_range: '',
    requirements: [''],
    is_published: true
  });

  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('courses');

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
    }
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
    }
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
    }
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
    }
  });

  // Course mutations
  const courseMutation = useMutation({
    mutationFn: async (course: any) => {
      if (editingItem?.type === 'course') {
        const { error } = await supabase
          .from('courses')
          .update(course)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('courses')
          .insert(course);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setCourseForm({
        title: '',
        description: '',
        difficulty_level: 'beginner',
        video_url: '',
        pdf_url: '',
        is_published: false
      });
      setEditingItem(null);
      toast({
        title: "Success",
        description: `Course ${editingItem ? 'updated' : 'created'} successfully!`,
      });
    }
  });

  // Blog mutations
  const blogMutation = useMutation({
    mutationFn: async (blog: any) => {
      if (editingItem?.type === 'blog') {
        const { error } = await supabase
          .from('blog_posts')
          .update(blog)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            ...blog,
            author_id: profile?.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      setBlogForm({
        title: '',
        content: '',
        excerpt: '',
        category: 'general',
        featured: false,
        published: false
      });
      setEditingItem(null);
      toast({
        title: "Success",
        description: `Blog post ${editingItem ? 'updated' : 'created'} successfully!`,
      });
    }
  });

  // Job mutations
  const jobMutation = useMutation({
    mutationFn: async (job: any) => {
      if (editingItem?.type === 'job') {
        const { error } = await supabase
          .from('job_vacancies')
          .update(job)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('job_vacancies')
          .insert(job);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      setJobForm({
        title: '',
        description: '',
        location: '',
        job_type: 'full-time',
        experience_level: 'mid',
        salary_range: '',
        requirements: [''],
        is_published: true
      });
      setEditingItem(null);
      toast({
        title: "Success",
        description: `Job vacancy ${editingItem ? 'updated' : 'created'} successfully!`,
      });
    }
  });

  const handleSubmitCourse = (e: React.FormEvent) => {
    e.preventDefault();
    courseMutation.mutate(courseForm);
  };

  const handleSubmitBlog = (e: React.FormEvent) => {
    e.preventDefault();
    blogMutation.mutate(blogForm);
  };

  const handleSubmitJob = (e: React.FormEvent) => {
    e.preventDefault();
    jobMutation.mutate(jobForm);
  };

  const startEdit = (item: any, type: string) => {
    setEditingItem({ ...item, type });
    if (type === 'course') {
      setCourseForm({
        title: item.title,
        description: item.description || '',
        difficulty_level: item.difficulty_level,
        video_url: item.video_url || '',
        pdf_url: item.pdf_url || '',
        is_published: item.is_published
      });
    } else if (type === 'blog') {
      setBlogForm({
        title: item.title,
        content: item.content,
        excerpt: item.excerpt || '',
        category: item.category || 'general',
        featured: item.featured || false,
        published: item.published || false
      });
    } else if (type === 'job') {
      setJobForm({
        title: item.title,
        description: item.description,
        location: item.location || '',
        job_type: item.job_type || 'full-time',
        experience_level: item.experience_level || 'mid',
        salary_range: item.salary_range || '',
        requirements: item.requirements || [''],
        is_published: item.is_published
      });
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage courses, blog posts, job vacancies, and quizzes</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            {/* Course Form */}
            <Card className="glass-effect glow-border">
              <CardHeader>
                <CardTitle>{editingItem?.type === 'course' ? 'Edit Course' : 'Create New Course'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitCourse} className="space-y-4">
                  <div>
                    <Label htmlFor="course-title">Title</Label>
                    <Input
                      id="course-title"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="course-description">Description</Label>
                    <Textarea
                      id="course-description"
                      value={courseForm.description}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select value={courseForm.difficulty_level} onValueChange={(value) => setCourseForm(prev => ({ ...prev, difficulty_level: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="video-url">Video URL</Label>
                    <Input
                      id="video-url"
                      type="url"
                      value={courseForm.video_url}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, video_url: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pdf-url">PDF URL</Label>
                    <Input
                      id="pdf-url"
                      type="url"
                      value={courseForm.pdf_url}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, pdf_url: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-published"
                      checked={courseForm.is_published}
                      onCheckedChange={(checked) => setCourseForm(prev => ({ ...prev, is_published: checked }))}
                    />
                    <Label htmlFor="is-published">Published</Label>
                  </div>

                  <Button type="submit" disabled={courseMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingItem?.type === 'course' ? 'Update' : 'Create'} Course
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Courses List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="glass-effect glow-border">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(course, 'course')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant={course.is_published ? "default" : "secondary"}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge variant="outline">
                        {course.difficulty_level}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {course.video_url && (
                        <Badge variant="outline" className="text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          Video
                        </Badge>
                      )}
                      {course.pdf_url && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          PDF
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <QuizManager />
          </TabsContent>

          <TabsContent value="blogs" className="space-y-6">
            {/* Blog Form */}
            <Card className="glass-effect glow-border">
              <CardHeader>
                <CardTitle>{editingItem?.type === 'blog' ? 'Edit Blog Post' : 'Create New Blog Post'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitBlog} className="space-y-4">
                  <div>
                    <Label htmlFor="blog-title">Title</Label>
                    <Input
                      id="blog-title"
                      value={blogForm.title}
                      onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="blog-excerpt">Excerpt</Label>
                    <Textarea
                      id="blog-excerpt"
                      value={blogForm.excerpt}
                      onChange={(e) => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Brief description of the blog post"
                    />
                  </div>

                  <div>
                    <Label htmlFor="blog-content">Content</Label>
                    <Textarea
                      id="blog-content"
                      value={blogForm.content}
                      onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                      className="min-h-[200px]"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="blog-category">Category</Label>
                    <Select value={blogForm.category} onValueChange={(value) => setBlogForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="blog-featured"
                        checked={blogForm.featured}
                        onCheckedChange={(checked) => setBlogForm(prev => ({ ...prev, featured: checked }))}
                      />
                      <Label htmlFor="blog-featured">Featured</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="blog-published"
                        checked={blogForm.published}
                        onCheckedChange={(checked) => setBlogForm(prev => ({ ...prev, published: checked }))}
                      />
                      <Label htmlFor="blog-published">Published</Label>
                    </div>
                  </div>

                  <Button type="submit" disabled={blogMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingItem?.type === 'blog' ? 'Update' : 'Create'} Blog Post
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Blog Posts List */}
            <div className="space-y-4">
              {blogPosts.map((post) => (
                <Card key={post.id} className="glass-effect glow-border">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{post.excerpt}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(post, 'blog')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge variant="outline">
                        {post.category}
                      </Badge>
                      {post.featured && (
                        <Badge variant="outline" className="text-yellow-400">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            {/* Job Form */}
            <Card className="glass-effect glow-border">
              <CardHeader>
                <CardTitle>{editingItem?.type === 'job' ? 'Edit Job Vacancy' : 'Create New Job Vacancy'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitJob} className="space-y-4">
                  <div>
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input
                      id="job-title"
                      value={jobForm.title}
                      onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="job-description">Description</Label>
                    <Textarea
                      id="job-description"
                      value={jobForm.description}
                      onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-[150px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="job-location">Location</Label>
                      <Input
                        id="job-location"
                        value={jobForm.location}
                        onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="job-salary">Salary Range</Label>
                      <Input
                        id="job-salary"
                        value={jobForm.salary_range}
                        onChange={(e) => setJobForm(prev => ({ ...prev, salary_range: e.target.value }))}
                        placeholder="e.g., $50,000 - $70,000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="job-type">Job Type</Label>
                      <Select value={jobForm.job_type} onValueChange={(value) => setJobForm(prev => ({ ...prev, job_type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="experience-level">Experience Level</Label>
                      <Select value={jobForm.experience_level} onValueChange={(value) => setJobForm(prev => ({ ...prev, experience_level: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry</SelectItem>
                          <SelectItem value="mid">Mid</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Requirements</Label>
                    {jobForm.requirements.map((req, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Input
                          value={req}
                          onChange={(e) => {
                            const newReqs = [...jobForm.requirements];
                            newReqs[index] = e.target.value;
                            setJobForm(prev => ({ ...prev, requirements: newReqs }));
                          }}
                          placeholder={`Requirement ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newReqs = jobForm.requirements.filter((_, i) => i !== index);
                            setJobForm(prev => ({ ...prev, requirements: newReqs }));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setJobForm(prev => ({ ...prev, requirements: [...prev.requirements, ''] }))}
                      className="mt-2"
                    >
                      Add Requirement
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="job-published"
                      checked={jobForm.is_published}
                      onCheckedChange={(checked) => setJobForm(prev => ({ ...prev, is_published: checked }))}
                    />
                    <Label htmlFor="job-published">Published</Label>
                  </div>

                  <Button type="submit" disabled={jobMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingItem?.type === 'job' ? 'Update' : 'Create'} Job Vacancy
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Job Vacancies List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobVacancies.map((job) => (
                <Card key={job.id} className="glass-effect glow-border">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(job, 'job')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant={job.is_published ? "default" : "secondary"}>
                        {job.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <div className="flex gap-2">
                        <Badge variant="outline">{job.job_type}</Badge>
                        <Badge variant="outline">{job.experience_level}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card className="glass-effect glow-border">
              <CardHeader>
                <CardTitle>Job Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobApplications.map((application) => (
                    <Card key={application.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{application.applicant_name}</h4>
                            <p className="text-sm text-muted-foreground">{application.applicant_email}</p>
                            <p className="text-sm">Position: {application.job_vacancies?.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Applied: {new Date(application.applied_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={
                              application.status === 'pending' ? 'secondary' :
                              application.status === 'approved' ? 'default' : 'destructive'
                            }>
                              {application.status}
                            </Badge>
                            {application.resume_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(application.resume_url, '_blank')}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                View CV
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
