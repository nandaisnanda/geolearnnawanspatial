
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface LeaderboardEntry {
  id: string;
  total_score: number;
  quizzes_completed: number;
  average_score: number;
  last_updated: string;
  profiles: {
    username: string;
    full_name: string;
  };
}

const QuizLeaderboard = () => {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['quiz-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_leaderboard')
        .select(`
          *,
          profiles (username, full_name)
        `)
        .order('total_score', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as LeaderboardEntry[];
    }
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-6 w-6 text-geo-accent" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-geo-accent">
            <Trophy className="h-5 w-5" />
            Quiz Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-geo-accent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect glow-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-geo-accent">
          <Trophy className="h-5 w-5" />
          Quiz Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No quiz results yet. Be the first to take a quiz!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  index < 3 ? 'bg-gradient-to-r from-geo-accent/10 to-geo-highlight/10 border border-geo-accent/20' : 'bg-geo-dark/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  {getRankIcon(index)}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {entry.profiles?.full_name || entry.profiles?.username || 'Anonymous'}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Quizzes: {entry.quizzes_completed}</span>
                    <span>Avg: {entry.average_score.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-geo-accent">
                    {entry.total_score}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Score</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizLeaderboard;
