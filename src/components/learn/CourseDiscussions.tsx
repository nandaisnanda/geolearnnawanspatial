
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface Discussion {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
  } | null;
}

interface CourseDiscussionsProps {
  courseId: string;
}

const CourseDiscussions: React.FC<CourseDiscussionsProps> = ({ courseId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newDiscussion, setNewDiscussion] = useState('');

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
      
      // Combine discussions with profiles
      const discussionsWithProfiles = discussionsData.map(discussion => ({
        ...discussion,
        profiles: profilesData.find(profile => profile.id === discussion.user_id) || null
      }));
      
      return discussionsWithProfiles;
    },
    enabled: !!courseId
  });

  // Add discussion mutation
  const addDiscussionMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from('course_discussions')
        .insert({
          course_id: courseId,
          user_id: user?.id,
          content
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions', courseId] });
      setNewDiscussion('');
      toast({
        title: "Discussion Added!",
        description: "Your comment has been posted.",
      });
    },
    onError: (error) => {
      console.error('Error adding discussion:', error);
      toast({
        title: "Error",
        description: "Failed to add discussion. Please try again.",
        variant: "destructive",
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
    addDiscussionMutation.mutate(newDiscussion);
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
            <div key={discussion.id} className="p-4 bg-geo-dark/30 border border-geo-accent/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-geo-highlight">
                  {discussion.profiles?.full_name || discussion.profiles?.username || 'Anonymous'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(discussion.created_at)}
                </span>
              </div>
              <p className="text-muted-foreground">{discussion.content}</p>
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
