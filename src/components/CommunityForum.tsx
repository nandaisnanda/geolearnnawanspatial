
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Send, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Post {
  id: string;
  title?: string;
  content: string;
  topic_tag?: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    full_name: string;
  };
}

const CommunityForum = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    topic_tag: 'general'
  });

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Post[];
    },
    enabled: !!user
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: typeof newPost) => {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          title: postData.title || null,
          content: postData.content,
          topic_tag: postData.topic_tag,
          user_id: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      setNewPost({ title: '', content: '', topic_tag: 'general' });
      setShowNewPost(false);
      toast({
        title: "Post Created!",
        description: "Your post has been shared with the community.",
      });
    },
    onError: (error) => {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('community_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user?.id)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user?.id);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('community_likes')
          .insert({
            post_id: postId,
            user_id: user?.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    }
  });

  const handleCreatePost = () => {
    if (!newPost.content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add some content to your post.",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate(newPost);
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

  const getTopicColor = (tag: string) => {
    const colors = {
      general: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      gis: 'bg-green-500/20 text-green-400 border-green-500/30',
      'remote-sensing': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      career: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      help: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[tag as keyof typeof colors] || colors.general;
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please login to view the community forum.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Post */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-geo-accent">Community Forum</CardTitle>
            <Button
              onClick={() => setShowNewPost(!showNewPost)}
              className="bg-geo-accent text-black hover:bg-geo-accent/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </CardHeader>
        
        {showNewPost && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Post title (optional)"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <select 
                className="px-3 py-2 bg-background border border-border rounded-md"
                value={newPost.topic_tag}
                onChange={(e) => setNewPost({ ...newPost, topic_tag: e.target.value })}
              >
                <option value="general">General</option>
                <option value="gis">GIS</option>
                <option value="remote-sensing">Remote Sensing</option>
                <option value="career">Career</option>
                <option value="help">Help</option>
              </select>
            </div>
            <Textarea
              placeholder="Share your thoughts with the community..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleCreatePost}
                disabled={createPostMutation.isPending}
                className="bg-geo-highlight text-black hover:bg-geo-highlight/90"
              >
                <Send className="h-4 w-4 mr-2" />
                {createPostMutation.isPending ? 'Posting...' : 'Post'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNewPost(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Posts List */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="glass-effect glow-border hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-geo-accent/20 text-geo-accent">
                      {post.profiles?.full_name?.[0] || post.profiles?.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-geo-highlight">
                        {post.profiles?.full_name || post.profiles?.username || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.created_at)}
                      </span>
                      {post.topic_tag && (
                        <Badge variant="outline" className={getTopicColor(post.topic_tag)}>
                          {post.topic_tag.replace('-', ' ')}
                        </Badge>
                      )}
                    </div>
                    
                    {post.title && (
                      <h3 className="font-semibold text-lg text-foreground">
                        {post.title}
                      </h3>
                    )}
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center gap-4 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likePostMutation.mutate(post.id)}
                        className="text-muted-foreground hover:text-geo-accent"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likes_count}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-geo-accent"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.replies_count}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No posts yet. Be the first to start a discussion!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityForum;
