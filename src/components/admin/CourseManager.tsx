
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, Upload, Video, FileText, Image } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Course {
  id: string;
  title: string;
  description: string | null;
  difficulty_level: string | null;
  is_published: boolean | null;
  thumbnail_url: string | null;
  video_url: string | null;
  pdf_url: string | null;
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
    is_published: false
  });

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
          thumbnail_url,
          video_url,
          pdf_url,
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
      if (courseData.id) {
        const { data, error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', courseData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('courses')
          .insert(courseData)
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
      is_published: false
    });
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
      is_published: course.is_published || false
    });
    setShowForm(true);
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

            {/* URL Input Fields */}
            <div className="grid grid-cols-1 gap-4">
              <Input
                placeholder="Video URL"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              />
              <Input
                placeholder="PDF URL"
                value={formData.pdf_url}
                onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
              />
              <Input
                placeholder="Thumbnail URL"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_published" className="text-sm">Publish Course</label>
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
                    <span className="px-2 py-1 rounded bg-geo-accent/20 text-geo-accent text-xs capitalize">
                      {course.difficulty_level}
                    </span>
                  </div>
                  {course.description && (
                    <p className="text-muted-foreground text-sm mb-2">{course.description}</p>
                  )}
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {course.video_url && <span>📹 Video</span>}
                    {course.pdf_url && <span>📄 PDF</span>}
                    {course.thumbnail_url && <span>🖼️ Thumbnail</span>}
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
