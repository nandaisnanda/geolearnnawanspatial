
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X, Upload, Image } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string | null;
  featured: boolean | null;
  published: boolean | null;
  created_at: string | null;
  profiles?: {
    username: string | null;
    full_name: string | null;
  } | null;
}

const BlogManager = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showAddPost, setShowAddPost] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'general',
    featured: false,
    published: true
  });

  // Fetch blog posts
  const { data: posts = [] } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles (username, full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BlogPost[];
    }
  });

  // Create/Update post mutation
  const postMutation = useMutation({
    mutationFn: async (post: any) => {
      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            ...post,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            ...post,
            author_id: profile?.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      setShowAddPost(false);
      setEditingPost(null);
      setPostForm({
        title: '',
        content: '',
        excerpt: '',
        category: 'general',
        featured: false,
        published: true
      });
      toast({
        title: "Success",
        description: `Blog post ${editingPost ? 'updated' : 'created'} successfully!`,
      });
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully!",
      });
    }
  });

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    postMutation.mutate(postForm);
  };

  const startEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      category: post.category || 'general',
      featured: post.featured || false,
      published: post.published || true
    });
    setShowAddPost(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('course-materials')
        .upload(`blog-images/${fileName}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(`blog-images/${fileName}`);

      // Insert image markdown into content at cursor position
      const imageMarkdown = `![Image](${publicUrl})`;
      setPostForm(prev => ({
        ...prev,
        content: prev.content + '\n\n' + imageMarkdown
      }));

      toast({
        title: "Image Uploaded",
        description: "Image has been added to your post content",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const categories = [
    'general',
    'Industry Trends',
    'Programming',
    'Remote Sensing',
    'Web Development',
    'Career',
    'Open Source'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Management</h2>
        <Button
          onClick={() => setShowAddPost(true)}
          className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Blog Post
        </Button>
      </div>

      {/* Blog Post Form */}
      {showAddPost && (
        <Card className="glass-effect glow-border">
          <CardHeader>
            <CardTitle>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div>
                <Label htmlFor="post-title">Title</Label>
                <Input
                  id="post-title"
                  value={postForm.title}
                  onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="post-excerpt">Excerpt</Label>
                <Textarea
                  id="post-excerpt"
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief summary of the post..."
                />
              </div>

              <div>
                <Label htmlFor="post-category">Category</Label>
                <Select value={postForm.category} onValueChange={(value) => setPostForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="post-content">Content</Label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Image className="h-4 w-4 mr-2" />
                      )}
                      Add Image
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="post-content"
                  value={postForm.content}
                  onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-96"
                  placeholder="Write your blog post content here... You can use Markdown formatting."
                  required
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={postForm.featured}
                    onCheckedChange={(checked) => setPostForm(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">Featured Post</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={postForm.published}
                    onCheckedChange={(checked) => setPostForm(prev => ({ ...prev, published: checked }))}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={postMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingPost ? 'Update' : 'Create'} Post
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddPost(false);
                    setEditingPost(null);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="glass-effect glow-border">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    {post.featured && <Badge variant="secondary">Featured</Badge>}
                    <Badge variant={post.published ? "default" : "outline"}>
                      {post.published ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant="outline">{post.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {post.excerpt || post.content.substring(0, 150) + '...'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    By: {post.profiles?.full_name || post.profiles?.username || 'Unknown'} • 
                    Created: {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditPost(post)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deletePostMutation.mutate(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && (
          <Card className="glass-effect glow-border">
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">No Blog Posts Yet</h3>
              <p className="text-muted-foreground">Create your first blog post to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BlogManager;
