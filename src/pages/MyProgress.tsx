
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, BookOpen, Clock, Star, TrendingUp } from 'lucide-react';

const MyProgress = () => {
  const { user } = useAuth();

  const courseProgress = [
    { id: 1, title: "ArcGIS Pro Masterclass", progress: 75, completed: 12, total: 16, timeSpent: "24h" },
    { id: 2, title: "Python for Geospatial Analysis", progress: 45, completed: 6, total: 14, timeSpent: "18h" },
    { id: 3, title: "Climate Change Monitoring", progress: 90, completed: 9, total: 10, timeSpent: "15h" }
  ];

  const achievements = [
    { title: "First Course Complete", icon: <Trophy className="h-6 w-6 text-yellow-500" />, earned: true },
    { title: "Python Expert", icon: <Star className="h-6 w-6 text-blue-500" />, earned: true },
    { title: "GIS Master", icon: <TrendingUp className="h-6 w-6 text-green-500" />, earned: false },
    { title: "Community Helper", icon: <BookOpen className="h-6 w-6 text-purple-500" />, earned: false }
  ];

  const stats = [
    { label: "Courses Enrolled", value: "3", icon: <BookOpen className="h-8 w-8 text-geo-accent" /> },
    { label: "Hours Learned", value: "57", icon: <Clock className="h-8 w-8 text-geo-highlight" /> },
    { label: "Achievements", value: "2", icon: <Trophy className="h-8 w-8 text-yellow-500" /> },
    { label: "Avg. Score", value: "85%", icon: <Star className="h-8 w-8 text-green-500" /> }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            My Progress
          </h1>
          <p className="text-muted-foreground">Welcome back, {user?.username}! Here's your learning journey.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-effect glow-border">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-geo-accent mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Progress */}
          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle className="text-2xl">Course Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {courseProgress.map((course) => (
                <div key={course.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <Badge variant="outline" className="border-geo-accent/30 text-geo-accent">
                      {course.progress}%
                    </Badge>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{course.completed}/{course.total} lessons completed</span>
                    <span>{course.timeSpent} spent</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle className="text-2xl">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border transition-all ${
                      achievement.earned 
                        ? 'bg-geo-accent/10 border-geo-accent/30 shadow-lg shadow-geo-accent/20' 
                        : 'bg-muted/20 border-muted/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {achievement.icon}
                      <div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.earned ? 'Earned' : 'Not earned yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glass-effect glow-border mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-geo-accent/10 rounded-lg">
                <BookOpen className="h-8 w-8 text-geo-accent" />
                <div>
                  <p className="font-semibold">Completed: Introduction to Remote Sensing</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-geo-highlight/10 rounded-lg">
                <Star className="h-8 w-8 text-geo-highlight" />
                <div>
                  <p className="font-semibold">Quiz Score: 92% in Python Basics</p>
                  <p className="text-sm text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-green-500/10 rounded-lg">
                <Trophy className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-semibold">Achievement Unlocked: Python Expert</p>
                  <p className="text-sm text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyProgress;
