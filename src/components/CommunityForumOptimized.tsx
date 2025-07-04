import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, ThumbsUp, ThumbsDown, Plus, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface CommunityPost {
  id: string;
  title: string | null;
  content: string;
  topic_tag: string | null;
  created_at: string | null;
  user_id: string | null;
  upvotes_count: number | null;
  downvotes_count: number | null;
  replies_count: number | null;
  likes_count: number | null;
  profiles?: {
    username: string | null;
    full_name: string | null;
  };
}

interface CommunityReply {
  id: string;
  content: string;
  created_at: string | null;
  user_id: string | null;
  profiles?: {
    username: string | null;
    full_name: string | null;
  };
}

interface Vote {
  id: string;
  vote_type: string;
  user_id: string | null;
  post_id: string | null;
}

const POSTS_PER_PAGE = 10;
const REPLIES_PER_PAGE = 5;

const CommunityForumOptimized = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [repliesPage, setRepliesPage] = useState<{ [postId: string]: number }>({});
  
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    topic_tag: ''
  });
  
  const [newReply, setNewReply] = useState('');

  // Fetch posts with pagination and filtering
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['community-posts', currentPage, searchTerm, selectedTopic, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          profiles(username, full_name)
        `, { count: 'exact' });

      // Apply filters
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }
      
      if (selectedTopic !== 'all') {
        query = query.eq('topic_tag', selectedTopic);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'most_liked':
          query = query.order('likes_count', { ascending: false });
          break;
        case 'most_replies':
          query = query.order('replies_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      
      return { posts: data as any[], totalCount: count || 0 };
    },
    staleTime: 30000, // 30 seconds
  });

  // Fetch replies for selected post
  const { data: replies, isLoading: repliesLoading } = useQuery({
    queryKey: ['community-replies', selectedPost, repliesPage[selectedPost!] || 1],
    queryFn: async () => {
      if (!selectedPost) return [];
      
      const page = repliesPage[selectedPost] || 1;
      const from = (page - 1) * REPLIES_PER_PAGE;
      const to = from + REPLIES_PER_PAGE - 1;
      
      const { data, error } = await supabase
        .from('community_replies')
        .select(`
          *,
          profiles(username, full_name)
        `)
        .eq('post_id', selectedPost)
        .order('created_at', { ascending: true })
        .range(from, to);
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!selectedPost,
    staleTime: 30000,
  });

  // Fetch user votes for posts
  const { data: userVotes } = useQuery({
    queryKey: ['user-votes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('community_votes')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as Vote[];
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  // Real-time subscriptions
  useEffect(() => {
    const postsChannel = supabase
      .channel('community-posts-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'community_posts'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      })
      .subscribe();

    const repliesChannel = supabase
      .channel('community-replies-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'community_replies'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['community-replies'] });
      })
      .subscribe();

    const votesChannel = supabase
      .channel('community-votes-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'community_votes'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['user-votes'] });
        queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(repliesChannel);
      supabase.removeChannel(votesChannel);
    };
  }, [queryClient]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: typeof newPost) => {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          ...postData,
          user_id: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      setNewPost({ title: '', content: '', topic_tag: '' });
      setShowCreatePost(false);
      toast({
        title: "Post Created!",
        description: "Your post has been published successfully.",
      });
    }
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('community_replies')
        .insert({
          content,
          post_id: selectedPost,
          user_id: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-replies'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      setNewReply('');
      toast({
        title: "Reply Added!",
        description: "Your reply has been posted successfully.",
      });
    }
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }: { postId: string; voteType: 'upvote' | 'downvote' }) => {
      const existingVote = userVotes?.find(v => v.post_id === postId);
      
      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote
          const { error } = await supabase
            .from('community_votes')
            .delete()
            .eq('id', existingVote.id);
          if (error) throw error;
        } else {
          // Update vote
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
            user_id: user?.id,
            vote_type: voteType
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-votes'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    }
  });

  const handleVote = (postId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to vote on posts.",
        variant: "destructive",
      });
      return;
    }
    voteMutation.mutate({ postId, voteType });
  };

  const getUserVote = (postId: string) => {
    return userVotes?.find(v => v.post_id === postId);
  };

  const totalPages = Math.ceil((postsData?.totalCount || 0) / POSTS_PER_PAGE);

  const topicTags = ['General', 'GIS', 'Remote Sensing', 'Cartography', 'Programming', 'Career', 'Tools', 'Help'];

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-geo-accent">Community Discussion</h2>
          <Button
            onClick={() => setShowCreatePost(true)}
            className="bg-geo-accent text-black hover:bg-geo-accent/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {topicTags.map((tag) => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="most_liked">Most Liked</SelectItem>
              <SelectItem value="most_replies">Most Replies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Create Post Form */}
      {showCreatePost && (
        <Card className="glass-effect glow-border">
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={newPost.topic_tag}
              onValueChange={(value) => setNewPost({ ...newPost, topic_tag: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {topicTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Post title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            
            <Textarea
              placeholder="What would you like to discuss?"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="min-h-24"
            />
            
            <div className="flex gap-2">
              <Button
                onClick={() => createPostMutation.mutate(newPost)}
                disabled={createPostMutation.isPending || !newPost.title || !newPost.content}
                className="bg-geo-accent text-black hover:bg-geo-accent/90"
              >
                {createPostMutation.isPending ? 'Publishing...' : 'Publish Post'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreatePost(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {postsLoading ? (
          // Skeleton loading
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="glass-effect">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : postsData?.posts.length === 0 ? (
          <Card className="glass-effect">
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No posts found. Be the first to start a discussion!</p>
            </CardContent>
          </Card>
        ) : (
          postsData?.posts.map((post) => {
            const userVote = getUserVote(post.id);
            const isExpanded = selectedPost === post.id;
            
            return (
              <Card key={post.id} className="glass-effect hover:glow-border transition-all">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Post Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.topic_tag && (
                            <Badge variant="secondary" className="text-xs">
                              {post.topic_tag}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            by {post.profiles?.username || post.profiles?.full_name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.created_at!).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {post.title && (
                          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                        )}
                        
                        <p className="text-muted-foreground">{post.content}</p>
                      </div>
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant={userVote?.vote_type === 'upvote' ? 'default' : 'ghost'}
                          onClick={() => handleVote(post.id, 'upvote')}
                          className={userVote?.vote_type === 'upvote' ? 'bg-geo-accent text-black' : ''}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span className="ml-1">{post.upvotes_count || 0}</span>
                        </Button>
                        
                        <Button
                          size="sm"
                          variant={userVote?.vote_type === 'downvote' ? 'destructive' : 'ghost'}
                          onClick={() => handleVote(post.id, 'downvote')}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span className="ml-1">{post.downvotes_count || 0}</span>
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedPost(isExpanded ? null : post.id)}
                        className="flex items-center gap-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.replies_count || 0} replies</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Replies Section */}
                    {isExpanded && (
                      <div className="mt-6 space-y-4 border-t pt-4">
                        {/* Reply Form */}
                        {user && (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Write a reply..."
                              value={newReply}
                              onChange={(e) => setNewReply(e.target.value)}
                              className="min-h-16"
                            />
                            <Button
                              size="sm"
                              onClick={() => createReplyMutation.mutate(newReply)}
                              disabled={createReplyMutation.isPending || !newReply.trim()}
                              className="bg-geo-accent text-black hover:bg-geo-accent/90"
                            >
                              {createReplyMutation.isPending ? 'Posting...' : 'Post Reply'}
                            </Button>
                          </div>
                        )}

                        {/* Replies List */}
                        {repliesLoading ? (
                          <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="flex gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-2 flex-1">
                                  <Skeleton className="h-3 w-24" />
                                  <Skeleton className="h-12 w-full" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {replies?.map((reply) => (
                              <div key={reply.id} className="flex gap-3 p-3 bg-muted/20 rounded-lg">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {(reply.profiles?.username || reply.profiles?.full_name || 'A')[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">
                                      {reply.profiles?.username || reply.profiles?.full_name || 'Anonymous'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(reply.created_at!).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (page > totalPages) return null;
              
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? 'bg-geo-accent text-black' : ''}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommunityForumOptimized;