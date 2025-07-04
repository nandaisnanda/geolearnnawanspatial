import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  earned_at?: string;
}

const AchievementsDisplay = () => {
  const { user } = useAuth();

  // Fetch user achievements
  const { data: userAchievements = [] } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          earned_at,
          achievements!inner(id, name, description, icon, points)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data.map((ua: any) => ({
        id: ua.achievements.id,
        name: ua.achievements.name,
        description: ua.achievements.description,
        icon: ua.achievements.icon,
        points: ua.achievements.points,
        earned_at: ua.earned_at
      })) as Achievement[];
    },
    enabled: !!user,
  });

  // Fetch all achievements to show locked ones
  const { data: allAchievements = [] } = useQuery({
    queryKey: ['all-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: true });
      
      if (error) throw error;
      return data as Achievement[];
    },
  });

  const earnedAchievementIds = userAchievements.map(ua => ua.id);
  const lockedAchievements = allAchievements.filter(a => !earnedAchievementIds.includes(a.id));

  const totalPoints = userAchievements.reduce((sum, achievement) => sum + achievement.points, 0);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-geo-accent">
            <Trophy className="h-5 w-5" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-geo-accent">{userAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-geo-highlight">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{allAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earned Achievements */}
      {userAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-geo-accent">Earned Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userAchievements.map((achievement) => (
              <Card key={achievement.id} className="glass-effect border-geo-accent/20 bg-geo-accent/5">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div>
                      <h4 className="font-semibold text-geo-accent">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-geo-accent/20 text-geo-accent">
                        {achievement.points} pts
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(achievement.earned_at!).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Locked Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => (
              <Card key={achievement.id} className="glass-effect opacity-60">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-3xl grayscale">{achievement.icon}</div>
                    <div>
                      <h4 className="font-semibold text-muted-foreground">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">
                      {achievement.points} pts
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {userAchievements.length === 0 && (
        <Card className="glass-effect">
          <CardContent className="text-center py-12">
            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
            <p className="text-muted-foreground">
              Complete quizzes and courses to unlock your first achievement!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AchievementsDisplay;