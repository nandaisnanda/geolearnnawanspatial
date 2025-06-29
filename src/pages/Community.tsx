
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Heart, Reply, Send, Users, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';

const Community = () => {
  const { profile } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'Sarah Chen',
      avatar: 'SC',
      message: 'Just finished the ArcGIS Pro course! The satellite imagery analysis module was incredible. Anyone else working on similar projects?',
      time: '2 hours ago',
      likes: 12,
      replies: 3,
      tag: 'ArcGIS Pro'
    },
    {
      id: 2,
      user: 'Mike Rodriguez',
      avatar: 'MR',
      message: 'Looking for study partners for the Python geospatial analysis course. Would love to collaborate on some projects!',
      time: '4 hours ago',
      likes: 8,
      replies: 5,
      tag: 'Python'
    },
    {
      id: 3,
      user: 'Emma Thompson',
      avatar: 'ET',
      message: 'Has anyone worked with NDVI calculations in their climate monitoring projects? I could use some tips on processing large datasets.',
      time: '1 day ago',
      likes: 15,
      replies: 7,
      tag: 'Climate'
    }
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: profile?.username || 'Anonymous',
        avatar: profile?.username?.substring(0, 2).toUpperCase() || 'AN',
        message: newMessage,
        time: 'Just now',
        likes: 0,
        replies: 0,
        tag: 'General'
      };
      setMessages([message, ...messages]);
      setNewMessage('');
    }
  };

  const communityStats = [
    { label: 'Active Members', value: '2,847', icon: <Users className="h-6 w-6 text-geo-accent" /> },
    { label: 'Discussions', value: '1,234', icon: <MessageSquare className="h-6 w-6 text-geo-highlight" /> },
    { label: 'This Week', value: '156', icon: <TrendingUp className="h-6 w-6 text-green-500" /> }
  ];

  const topicTags = ['ArcGIS Pro', 'Python', 'Climate', 'Remote Sensing', 'Cartography', 'Data Analysis'];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            Community
          </h1>
          <p className="text-muted-foreground">Connect, learn, and share with fellow GIS professionals</p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {communityStats.map((stat, index) => (
            <Card key={index} className="glass-effect glow-border">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-geo-accent mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* New Message */}
            <Card className="glass-effect glow-border">
              <CardHeader>
                <CardTitle className="text-xl">Start a Discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts, ask questions, or help others..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-geo-dark/50 border-geo-accent/30 focus:border-geo-accent min-h-[100px]"
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {topicTags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="border-geo-accent/30 text-geo-accent cursor-pointer hover:bg-geo-accent/10">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <div className="space-y-4">
              {messages.map((message) => (
                <Card key={message.id} className="glass-effect glow-border hover:shadow-lg hover:shadow-geo-accent/10 transition-all">
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <Avatar className="h-12 w-12 border-2 border-geo-accent/30">
                        <AvatarFallback className="bg-geo-accent/20 text-geo-accent font-semibold">
                          {message.avatar}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-geo-accent">{message.user}</h4>
                            <Badge variant="outline" className="border-geo-highlight/30 text-geo-highlight">
                              #{message.tag}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">{message.time}</span>
                        </div>
                        
                        <p className="text-foreground leading-relaxed">{message.message}</p>
                        
                        <div className="flex items-center space-x-6 pt-2">
                          <button className="flex items-center space-x-2 text-muted-foreground hover:text-geo-highlight transition-colors">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm">{message.likes}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-muted-foreground hover:text-geo-accent transition-colors">
                            <Reply className="h-4 w-4" />
                            <span className="text-sm">{message.replies} replies</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Popular Topics */}
            <Card className="glass-effect glow-border">
              <CardHeader>
                <CardTitle className="text-lg">Popular Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topicTags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="border-geo-accent/30 text-geo-accent hover:bg-geo-accent/10 cursor-pointer w-full justify-start"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Online Users */}
            <Card className="glass-effect glow-border">
              <CardHeader>
                <CardTitle className="text-lg">Online Now</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Alex Kumar', 'Lisa Wang', 'David Brown', 'Maria Garcia'].map((name, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <Avatar className="h-8 w-8 border border-geo-accent/30">
                        <AvatarFallback className="bg-geo-accent/20 text-geo-accent text-xs">
                          {name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
