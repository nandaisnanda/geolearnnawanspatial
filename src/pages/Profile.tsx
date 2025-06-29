
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Calendar, Trophy, Target, BookOpen, ArrowLeft, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';

const Profile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
  });

  if (!user || !profile) {
    navigate('/login');
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTierDescription = (tier: string) => {
    switch (tier) {
      case 'beginner': return 'Just getting started with GIS concepts';
      case 'intermediate': return 'Understanding core GIS principles';
      case 'advanced': return 'Proficient in GIS analysis and applications';
      case 'expert': return 'Master of geospatial technologies';
      default: return 'Learning journey begins here';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="hover:bg-geo-accent/10 text-geo-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
              My Profile
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <Card className="glass-effect glow-border col-span-1">
              <CardHeader className="text-center">
                <div className="relative mx-auto">
                  <Avatar className="h-24 w-24 border-4 border-geo-accent/30">
                    <AvatarImage src={profile.avatar_url} alt="Profile" />
                    <AvatarFallback className="bg-geo-accent/20 text-geo-accent text-2xl">
                      {profile.full_name?.substring(0, 2).toUpperCase() || profile.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {profile.role === 'admin' && (
                    <Badge className="absolute -top-2 -right-2 bg-geo-highlight text-black">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{profile.full_name || profile.username}</CardTitle>
                <p className="text-muted-foreground">@{profile.username}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tier Level</span>
                  <Badge className={`${getTierColor(profile.tier_level)} text-white`}>
                    <Trophy className="h-3 w-3 mr-1" />
                    {profile.tier_level.charAt(0).toUpperCase() + profile.tier_level.slice(1)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getTierDescription(profile.tier_level)}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card className="glass-effect glow-border col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-geo-dark/50">
                    <TabsTrigger value="info" className="data-[state=active]:bg-geo-accent/20">Information</TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-geo-accent/20">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name
                        </label>
                        <p className="p-2 bg-geo-dark/30 rounded border border-geo-accent/20">
                          {profile.full_name || 'Not provided'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </label>
                        <p className="p-2 bg-geo-dark/30 rounded border border-geo-accent/20">
                          {profile.email}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Username
                        </label>
                        <p className="p-2 bg-geo-dark/30 rounded border border-geo-accent/20">
                          @{profile.username}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Learning Level
                        </label>
                        <Badge className={`${getTierColor(profile.tier_level)} text-white w-fit`}>
                          {profile.tier_level.charAt(0).toUpperCase() + profile.tier_level.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings">
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                          value={formData.full_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                          className="bg-geo-dark/50 border-geo-accent/30 focus:border-geo-accent"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Username</label>
                        <Input
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                          className="bg-geo-dark/50 border-geo-accent/30 focus:border-geo-accent"
                          placeholder="Enter your username"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
                      >
                        {isUpdating ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
