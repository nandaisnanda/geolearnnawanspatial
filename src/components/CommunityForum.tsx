
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, MessageCircle, Heart, ArrowUp, ArrowDown, Reply, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Post {
  id: string;
  title: string | null;
  content: string;
  topic_tag: string | null;
  likes_count: number;
  replies_count: number;
  upvotes_count: number;
  downvotes_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
  } | null;
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
  } | null;
}

const CommunityForum = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string>('');
  const [replyContent, setReplyContent] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    topic_tag: 'general'
  });

  // Fetch community posts with profiles
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles!community_posts_user_id_fkey (username, full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Post[];
    }
  });

  // Fetch replies for selected post
  const { data: replies = [] } = useQuery({
    queryKey: ['community-replies', selectedPost],
    queryFn: async () => {
      if (!selectedPost) return [];
      
      const { data, error } = await supabase
        .from('community_replies')
        .select(`
          *,
          profiles!community_replies_user_id_fkey (username, full_name)
        `)
        .eq('post_id', selectedPost)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Reply[];
    },
    enabled: !!selectedPost
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: typeof newPost) => {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          title: postData.title,
          content: postData.content,
          topic_tag: postData.topic_tag,
          user_id: profile?.id
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
    }
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { data, error } = await supabase
        .from('community_replies')
        .insert({
          post_id: postId,
          content: content,
          user_id: profile?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-replies', selectedPost] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      setReplyContent('');
      toast({
        title: "Reply Posted!",
        description: "Your reply has been added to the discussion.",
      });
    }
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }: { postId: string; voteType: 'upvote' | 'downvote' }) => {
      // First check if user already voted
      const { data: existingVote } = await supabase
        .from('community_votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', profile?.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking same button
          const { error } = await supabase
            .from('community_votes')
            .delete()
            .eq('id', existingVote.id);
          if (error) throw error;
        } else {
          // Update vote type
          const { error } = await supabase
            .from('community_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
          if (error) throw error;
        }
      } else {
        // Create new vote
        const { error } = await supabase
          .from('community_votes')
          .insert({
            post_id: postId,
            user_id: profile?.id,
            vote_type: voteType
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    }
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('community_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', profile?.id)
        .single();

      if (existingLike) {
        // Remove like
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('id', existingLike.id);
        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('community_likes')
          .insert({
            post_id: postId,
            user_id: profile?.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    }
  });

  const handleCreatePost = () => {
    if (!profile) {
      toast({
        title: "Login Required",
        description: "Please log in to create a post.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPost.content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter some content for your post.",
        variant: "destructive",
      });
      return;
    }
    
    createPostMutation.mutate(newPost);
  };

  const handleReply = (postId: string) => {
    if (!profile) {
      toast({
        title: "Login Required",
        description: "Please log in to reply.",
        variant: "destructive",
      });
      return;
    }
    
    if (!replyContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter a reply.",
        variant: "destructive",
      });
      return;
    }
    
    createReplyMutation.mutate({ postId, content: replyContent });
  };

  const handleVote = (postId: string, voteType: 'upvote' | 'downvote') => {
    if (!profile) {
      toast({
        title: "Login Required",
        description: "Please log in to vote.",
        variant: "destructive",
      });
      return;
    }
    
    voteMutation.mutate({ postId, voteType });
  };

  const handleLike = (postId: string) => {
    if (!profile) {
      toast({
        title: "Login Required",
        description: "Please log in to like posts.",
        variant: "destructive",
      });
      return;
    }
    
    likeMutation.mutate(postId);
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
      {/* Create New Post */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-geo-accent">Community Discussion</CardTitle>
            <Button
              onClick={() => setShowNewPost(!showNewPost)}
              className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </CardHeader>
        {showNewPost && (
          <CardContent className="space-y-4">
            <Input
              placeholder="Post Title (Optional)"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <Textarea
              placeholder="What's on your mind? Share your thoughts with the community..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="min-h-24"
            />
            <div className="flex items-center gap-4">
              <select 
                className="px-3 py-2 bg-background border border-border rounded-md"
                value={newPost.topic_tag}
                onChange={(e) => setNewPost({ ...newPost, topic_tag: e.target.value })}
              >
                <option value="general">General</option>
                <option value="help">Help & Support</option>
                <option value="discussion">Discussion</option>
                <option value="showcase">Showcase</option>
                <option value="question">Question</option>
              </select>
              <div className="flex gap-2 ml-auto">
                <Button
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                  className="bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black"
                >
                  {createPostMutation.isPending ? 'Posting...' : 'Share Post'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewPost(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="glass-effect glow-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Voting Section */}
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(post.id, 'upvote')}
                    className="p-1 h-8 w-8 hover:bg-green-500/20"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {(post.upvotes_count || 0) - (post.downvotes_count || 0)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(post.id, 'downvote')}
                    className="p-1 h-8 w-8 hover:bg-red-500/20"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* Post Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-geo-accent">
                      {post.profiles?.full_name || post.profiles?.username || 'Anonymous'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    {post.topic_tag && (
                      <Badge variant="outline" className="text-xs">
                        {post.topic_tag}
                      </Badge>
                    )}
                  </div>
                  
                  {post.title && (
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                  )}
                  
                  <p className="text-foreground">{post.content}</p>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2 hover:bg-red-500/20"
                    >
                      <Heart className="h-4 w-4" />
                      {post.likes_count || 0}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPost(selectedPost === post.id ? '' : post.id)}
                      className="flex items-center gap-2 hover:bg-blue-500/20"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {post.replies_count || 0} replies
                    </Button>
                  </div>

                  {/* Replies Section */}
                  {selectedPost === post.id && (
                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-geo-accent/30">
                      {/* Reply Form */}
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="flex-1 min-h-16"
                        />
                        <Button
                          onClick={() => handleReply(post.id)}
                          disabled={createReplyMutation.isPending}
                          className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Replies List */}
                      <div className="space-y-3">
                        {replies.map((reply) => (
                          <div key={reply.id} className="bg-geo-dark/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-geo-accent text-sm">
                                {reply.profiles?.full_name || reply.profiles?.username || 'Anonymous'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(reply.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && (
          <Card className="glass-effect glow-border">
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No posts yet. Start the conversation!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommunityForum;
