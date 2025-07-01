import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Reply, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Discussion {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  course_id: string;
  parent_id?: string | null;
  profiles: {
    id: string;
    username: string;
    full_name: string;
  } | null;
  replies?: Discussion[];
}

interface CourseDiscussionsProps {
  courseId: string;
}

const CourseDiscussions: React.FC<CourseDiscussionsProps> = ({ courseId }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newDiscussion, setNewDiscussion] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Fetch discussions for selected course
  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('course_discussions')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });
      
      if (discussionsError) throw discussionsError;
      
      // Fetch profiles for discussions
      const userIds = [...new Set(discussionsData.map(d => d.user_id).filter(Boolean))];
      
      if (userIds.length === 0) return [];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Combine discussions with profiles and organize replies
      const discussionsWithProfiles = discussionsData.map(discussion => ({
        ...discussion,
        profiles: profilesData.find(profile => profile.id === discussion.user_id) || null,
        replies: []
      }));
      
      // Organize replies under parent comments
      const topLevelDiscussions = discussionsWithProfiles.filter(d => !d.parent_id);
      const replies = discussionsWithProfiles.filter(d => d.parent_id);
      
      topLevelDiscussions.forEach(discussion => {
        discussion.replies = replies.filter(reply => reply.parent_id === discussion.id);
      });
      
      return topLevelDiscussions;
    },
    enabled: !!courseId
  });

  // Add discussion mutation
  const addDiscussionMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      const { error } = await supabase
        .from('course_discussions')
        .insert({
          course_id: courseId,
          user_id: user?.id,
          content,
          parent_id: parentId || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions', courseId] });
      setNewDiscussion('');
      setReplyContent('');
      setReplyingTo(null);
      toast({
        title: "Comment Posted!",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: (error) => {
      console.error('Error adding discussion:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Edit discussion mutation
  const editDiscussionMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from('course_discussions')
        .update({ content })
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions', courseId] });
      setEditingId(null);
      setEditContent('');
      toast({
        title: "Comment Updated!",
        description: "Your comment has been updated successfully.",
      });
    }
  });

  // Delete discussion mutation
  const deleteDiscussionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('course_discussions')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions', courseId] });
      toast({
        title: "Comment Deleted",
        description: "Your comment has been deleted successfully.",
      });
    }
  });

  const handleAddDiscussion = () => {
    if (!newDiscussion.trim()) {
      toast({
        title: "Content Required",
        description: "Please add some content to your discussion.",
        variant: "destructive",
      });
      return;
    }
    addDiscussionMutation.mutate({ content: newDiscussion });
  };

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please add some content to your reply.",
        variant: "destructive",
      });
      return;
    }
    addDiscussionMutation.mutate({ content: replyContent, parentId });
  };

  const handleEdit = (discussion: Discussion) => {
    setEditingId(discussion.id);
    setEditContent(discussion.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please add some content to your comment.",
        variant: "destructive",
      });
      return;
    }
    editDiscussionMutation.mutate({ id: editingId!, content: editContent });
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

  const canModifyComment = (discussion: Discussion) => {
    return user?.id === discussion.user_id || profile?.role === 'admin';
  };

  const renderDiscussion = (discussion: Discussion, isReply = false) => (
    <div key={discussion.id} className={`p-4 bg-geo-dark/30 border border-geo-accent/20 rounded-lg ${isReply ? 'ml-8 mt-2' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-geo-highlight">
            {discussion.profiles?.full_name || discussion.profiles?.username || 'Anonymous'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(discussion.created_at)}
          </span>
        </div>
        
        {canModifyComment(discussion) && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEdit(discussion)}
              className="text-geo-accent hover:text-geo-highlight"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this comment? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteDiscussionMutation.mutate(discussion.id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      
      {editingId === discussion.id ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSaveEdit}
              className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setEditContent('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mb-2">{discussion.content}</p>
          {!isReply && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setReplyingTo(replyingTo === discussion.id ? null : discussion.id)}
              className="text-geo-accent hover:text-geo-highlight"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
        </>
      )}
      
      {replyingTo === discussion.id && (
        <div className="mt-4 space-y-2">
          <Textarea
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleReply(discussion.id)}
              disabled={addDiscussionMutation.isPending}
              className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
            >
              <Send className="h-3 w-3 mr-1" />
              {addDiscussionMutation.isPending ? 'Posting...' : 'Reply'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setReplyingTo(null);
                setReplyContent('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <CardTitle className="text-geo-accent flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Course Discussions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Discussion */}
        <div className="space-y-4">
          <Textarea
            placeholder="Share your thoughts or ask questions about this course..."
            value={newDiscussion}
            onChange={(e) => setNewDiscussion(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleAddDiscussion}
            disabled={addDiscussionMutation.isPending}
            className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
          >
            <Send className="h-4 w-4 mr-2" />
            {addDiscussionMutation.isPending ? 'Posting...' : 'Post Discussion'}
          </Button>
        </div>

        {/* Discussions List */}
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <div key={discussion.id}>
              {renderDiscussion(discussion)}
              {discussion.replies && discussion.replies.map(reply => renderDiscussion(reply, true))}
            </div>
          ))}
          
          {discussions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No discussions yet. Be the first to start a conversation!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseDiscussions;
