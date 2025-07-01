
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Tutorials = () => {
  const navigate = useNavigate();

  const tutorials = [
    {
      title: "GIS Fundamentals - Complete Beginner Guide",
      description: "Learn the basics of Geographic Information Systems from scratch",
      duration: "45 min",
      level: "Beginner",
      thumbnail: "🗺️"
    },
    {
      title: "ArcGIS Pro - First Steps",
      description: "Getting started with Esri's flagship GIS software",
      duration: "30 min",
      level: "Beginner",
      thumbnail: "🔧"
    },
    {
      title: "Python for GIS - Introduction",
      description: "Automate your GIS workflows with Python programming",
      duration: "60 min",
      level: "Intermediate",
      thumbnail: "🐍"
    },
    {
      title: "Remote Sensing Basics",
      description: "Understanding satellite imagery and remote sensing concepts",
      duration: "50 min",
      level: "Intermediate",
      thumbnail: "🛰️"
    },
    {
      title: "Spatial Analysis Techniques",
      description: "Advanced spatial analysis methods and applications",
      duration: "75 min",
      level: "Advanced",
      thumbnail: "📊"
    },
    {
      title: "Web GIS Development",
      description: "Building interactive web maps and applications",
      duration: "90 min",
      level: "Advanced",
      thumbnail: "🌐"
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'text-green-500 border-green-500/30';
      case 'Intermediate': return 'text-yellow-500 border-yellow-500/30';
      case 'Advanced': return 'text-red-500 border-red-500/30';
      default: return 'text-geo-accent border-geo-accent/30';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            Tutorials
          </h1>
          <p className="text-muted-foreground">
            Step-by-step video tutorials to accelerate your GIS learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial, index) => (
            <Card key={index} className="glass-effect glow-border hover:scale-105 transition-transform">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-geo-accent/20 to-geo-highlight/20 flex items-center justify-center text-6xl">
                  {tutorial.thumbnail}
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{tutorial.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {tutorial.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {tutorial.duration}
                    </div>
                    <div className={`flex items-center gap-2 text-sm border px-2 py-1 rounded ${getLevelColor(tutorial.level)}`}>
                      <User className="h-4 w-4" />
                      {tutorial.level}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => navigate('/community')}
                    className="w-full bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch Tutorial
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-effect glow-border mt-8">
          <CardHeader>
            <CardTitle>Tutorial Series</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-semibold mb-2">Beginner Series</h3>
                <p className="text-sm text-muted-foreground">
                  Start your GIS journey with our comprehensive beginner tutorials
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-semibold mb-2">Quick Tips</h3>
                <p className="text-sm text-muted-foreground">
                  Short, focused tutorials on specific GIS techniques and tools
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="font-semibold mb-2">Advanced Projects</h3>
                <p className="text-sm text-muted-foreground">
                  Complex real-world projects for experienced GIS professionals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Tutorials;
