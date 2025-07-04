import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Heart, 
  Reply,
  MoreVertical,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  replies?: Comment[];
}

interface LessonCommentsProps {
  lessonId: string;
  className?: string;
}

const LessonComments: React.FC<LessonCommentsProps> = ({ 
  lessonId, 
  className 
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Mock comments data - replace with real data from Supabase
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      content: 'Great explanation of the concepts! The video quality is excellent.',
      author: {
        id: '1',
        name: 'Sarah Johnson',
        avatar: undefined
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 5,
      replies: [
        {
          id: '2',
          content: 'I agree! This really helped me understand the topic better.',
          author: {
            id: '2',
            name: 'Mike Chen',
            avatar: undefined
          },
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          likes: 2
        }
      ]
    }
  ]);

  const handleSubmitComment = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to post comments",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: {
        id: user.id,
        name: profile?.full_name || profile?.username || 'Anonymous',
        avatar: profile?.avatar_url
      },
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    
    toast({
      title: "Comment Posted",
      description: "Your comment has been added successfully",
    });
  };

  const handleReply = (commentId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to reply to comments",
        variant: "destructive",
      });
      return;
    }

    if (!replyText.trim()) return;

    const reply: Comment = {
      id: Date.now().toString(),
      content: replyText,
      author: {
        id: user.id,
        name: profile?.full_name || profile?.username || 'Anonymous',
        avatar: profile?.avatar_url
      },
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      return comment;
    }));

    setReplyingTo(null);
    setReplyText('');
    
    toast({
      title: "Reply Posted",
      description: "Your reply has been added successfully",
    });
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ 
    comment, 
    isReply = false 
  }) => (
    <div className={`${isReply ? 'ml-12 mt-3' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>
            {comment.author.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          
          <p className="text-sm leading-relaxed">{comment.content}</p>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <ThumbsUp className="h-3 w-3 mr-1" />
              {comment.likes}
            </Button>
            
            {!isReply && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={() => setReplyingTo(comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>
          
          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleReply(comment.id)}
                  className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                >
                  Reply
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {comment.replies && comment.replies.map(reply => (
        <CommentItem key={reply.id} comment={reply} isReply />
      ))}
    </div>
  );

  return (
    <Card className={`glass-effect glow-border ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-geo-highlight" />
          Discussion
          <Badge variant="outline" className="ml-auto">
            {comments.length} comments
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add Comment */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder={user ? "Share your thoughts about this lesson..." : "Please login to post comments"}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!user}
                className="min-h-[80px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment}
              disabled={!user || !newComment.trim()}
              className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
            >
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-medium mb-2">No comments yet</h4>
              <p className="text-sm text-muted-foreground">
                Be the first to share your thoughts about this lesson!
              </p>
            </div>
          ) : (
            comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonComments;