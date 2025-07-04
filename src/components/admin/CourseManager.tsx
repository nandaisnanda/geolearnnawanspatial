
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, Upload, Video, FileText, Image, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { uploadFile, generateFileName } from '@/utils/fileUpload';

interface Course {
  id: string;
  title: string;
  description: string | null;
  difficulty_level: string | null;
  is_published: boolean | null;
  coming_soon: boolean | null;
  thumbnail_url: string | null;
  video_url: string | null;
  pdf_url: string | null;
  thumbnail_file_path: string | null;
  video_file_path: string | null;
  pdf_file_path: string | null;
  created_at: string | null;
}

const CourseManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty_level: 'beginner',
    video_url: '',
    pdf_url: '',
    thumbnail_url: '',
    video_file_path: '',
    pdf_file_path: '',
    thumbnail_file_path: '',
    is_published: false,
    coming_soon: false
  });

  const [uploadingFiles, setUploadingFiles] = useState({
    video: false,
    pdf: false,
    thumbnail: false
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    video: null as File | null,
    pdf: null as File | null,
    thumbnail: null as File | null
  });

  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Fetch courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          difficulty_level,
          is_published,
          coming_soon,
          thumbnail_url,
          video_url,
          pdf_url,
          thumbnail_file_path,
          video_file_path,
          pdf_file_path,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Course[];
    }
  });

  // Create/Update course mutation
  const saveCoursesMutation = useMutation({
    mutationFn: async (courseData: typeof formData & { id?: string }) => {
      let finalCourseData = { ...courseData };

      // Upload files if they exist
      if (uploadedFiles.video) {
        setUploadingFiles(prev => ({ ...prev, video: true }));
        const fileName = generateFileName(uploadedFiles.video.name);
        const videoUrl = await uploadFile(uploadedFiles.video, 'course-materials', `videos/${fileName}`);
        finalCourseData.video_file_path = `videos/${fileName}`;
        finalCourseData.video_url = videoUrl;
      }

      if (uploadedFiles.pdf) {
        setUploadingFiles(prev => ({ ...prev, pdf: true }));
        const fileName = generateFileName(uploadedFiles.pdf.name);
        const pdfUrl = await uploadFile(uploadedFiles.pdf, 'course-materials', `pdfs/${fileName}`);
        finalCourseData.pdf_file_path = `pdfs/${fileName}`;
        finalCourseData.pdf_url = pdfUrl;
      }

      if (uploadedFiles.thumbnail) {
        setUploadingFiles(prev => ({ ...prev, thumbnail: true }));
        const fileName = generateFileName(uploadedFiles.thumbnail.name);
        const thumbnailUrl = await uploadFile(uploadedFiles.thumbnail, 'course-materials', `thumbnails/${fileName}`);
        finalCourseData.thumbnail_file_path = `thumbnails/${fileName}`;
        finalCourseData.thumbnail_url = thumbnailUrl;
      }

      setUploadingFiles({ video: false, pdf: false, thumbnail: false });

      if (finalCourseData.id) {
        const { data, error } = await supabase
          .from('courses')
          .update(finalCourseData)
          .eq('id', finalCourseData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('courses')
          .insert(finalCourseData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      resetForm();
      toast({
        title: editingCourse ? "Course Updated!" : "Course Created!",
        description: editingCourse ? "Course has been updated successfully." : "New course has been created successfully.",
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
      toast({
        title: "Course Deleted!",
        description: "Course has been deleted successfully.",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty_level: 'beginner',
      video_url: '',
      pdf_url: '',
      thumbnail_url: '',
      video_file_path: '',
      pdf_file_path: '',
      thumbnail_file_path: '',
      is_published: false,
      coming_soon: false
    });
    setUploadedFiles({ video: null, pdf: null, thumbnail: null });
    setEditingCourse(null);
    setShowForm(false);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || '',
      difficulty_level: course.difficulty_level || 'beginner',
      video_url: course.video_url || '',
      pdf_url: course.pdf_url || '',
      thumbnail_url: course.thumbnail_url || '',
      video_file_path: course.video_file_path || '',
      pdf_file_path: course.pdf_file_path || '',
      thumbnail_file_path: course.thumbnail_file_path || '',
      is_published: course.is_published || false,
      coming_soon: course.coming_soon || false
    });
    setUploadedFiles({ video: null, pdf: null, thumbnail: null });
    setShowForm(true);
  };

  const handleFileUpload = (type: 'video' | 'pdf' | 'thumbnail', file: File) => {
    const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for others
    
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${type === 'video' ? '100MB' : '10MB'}`,
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = {
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      pdf: ['application/pdf'],
      thumbnail: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    };

    if (!allowedTypes[type].includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: `Please upload a valid ${type} file`,
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles(prev => ({ ...prev, [type]: file }));
    toast({
      title: "File Ready",
      description: `${file.name} is ready for upload`,
    });
  };

  const removeFile = (type: 'video' | 'pdf' | 'thumbnail') => {
    setUploadedFiles(prev => ({ ...prev, [type]: null }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a course title.",
        variant: "destructive",
      });
      return;
    }

    const courseData = {
      ...formData,
      ...(editingCourse && { id: editingCourse.id })
    };

    saveCoursesMutation.mutate(courseData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-geo-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-effect glow-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-geo-accent">Course Management</CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="space-y-4">
            <Input
              placeholder="Course Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Course Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-24"
            />
            <Select
              value={formData.difficulty_level}
              onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>

            {/* File Upload Fields */}
            <div className="space-y-6">
              {/* Video Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Video</label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  {uploadedFiles.video ? (
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-geo-accent" />
                        <span className="text-sm">{uploadedFiles.video.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile('video')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <Button
                        variant="outline"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploadingFiles.video}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingFiles.video ? 'Uploading...' : 'Upload Video'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">MP4, WebM or OGG (Max 100MB)</p>
                    </div>
                  )}
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('video', e.target.files[0])}
                />
                <Input
                  placeholder="Or enter video URL"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                />
              </div>

              {/* PDF Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Course PDF</label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  {uploadedFiles.pdf ? (
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-geo-accent" />
                        <span className="text-sm">{uploadedFiles.pdf.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile('pdf')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <Button
                        variant="outline"
                        onClick={() => pdfInputRef.current?.click()}
                        disabled={uploadingFiles.pdf}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingFiles.pdf ? 'Uploading...' : 'Upload PDF'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">PDF files only (Max 10MB)</p>
                    </div>
                  )}
                </div>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('pdf', e.target.files[0])}
                />
                <Input
                  placeholder="Or enter PDF URL"
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                />
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Thumbnail</label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  {uploadedFiles.thumbnail ? (
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4 text-geo-accent" />
                        <span className="text-sm">{uploadedFiles.thumbnail.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile('thumbnail')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <Button
                        variant="outline"
                        onClick={() => thumbnailInputRef.current?.click()}
                        disabled={uploadingFiles.thumbnail}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingFiles.thumbnail ? 'Uploading...' : 'Upload Image'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG or WebP (Max 10MB)</p>
                    </div>
                  )}
                </div>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('thumbnail', e.target.files[0])}
                />
                <Input
                  placeholder="Or enter thumbnail URL"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published || formData.coming_soon}
                  onChange={(e) => {
                    if (formData.coming_soon && !e.target.checked) {
                      // If coming soon is checked, prevent unchecking published
                      return;
                    }
                    setFormData({ ...formData, is_published: e.target.checked });
                  }}
                  disabled={formData.coming_soon}
                  className="rounded"
                />
                <label htmlFor="is_published" className="text-sm">
                  Publish Course {formData.coming_soon && "(Auto-enabled for Coming Soon)"}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="coming_soon"
                  checked={formData.coming_soon}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      coming_soon: e.target.checked,
                      is_published: e.target.checked || formData.is_published
                    });
                  }}
                  className="rounded"
                />
                <label htmlFor="coming_soon" className="text-sm">Coming Soon</label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={saveCoursesMutation.isPending}
                className="bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black"
              >
                {saveCoursesMutation.isPending ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Courses List */}
      <div className="grid gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="glass-effect glow-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${course.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                    {course.coming_soon && (
                      <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">
                        Coming Soon
                      </span>
                    )}
                    <span className="px-2 py-1 rounded bg-geo-accent/20 text-geo-accent text-xs capitalize">
                      {course.difficulty_level}
                    </span>
                  </div>
                  {course.description && (
                    <p className="text-muted-foreground text-sm mb-2">{course.description}</p>
                  )}
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {(course.video_url || course.video_file_path) && <span>📹 Video</span>}
                    {(course.pdf_url || course.pdf_file_path) && <span>📄 PDF</span>}
                    {(course.thumbnail_url || course.thumbnail_file_path) && <span>🖼️ Thumbnail</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(course)}
                    className="text-geo-accent hover:text-geo-highlight"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Course</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this course? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteCourseMutation.mutate(course.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {courses.length === 0 && (
          <Card className="glass-effect glow-border">
            <CardContent className="text-center py-8">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No courses yet. Create your first course!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourseManager;
