
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Globe, Map, BookOpen, Users, Trophy, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Demo = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Map className="h-8 w-8 text-geo-accent" />,
      title: "Interactive GIS Maps",
      description: "Explore satellite imagery and geographic data with our advanced mapping tools"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-geo-highlight" />,
      title: "Comprehensive Courses",
      description: "Learn from industry experts with structured video lessons and PDF materials"
    },
    {
      icon: <Users className="h-8 w-8 text-geo-accent" />,
      title: "Community Learning",
      description: "Connect with fellow learners and share insights in our discussion forums"
    },
    {
      icon: <Trophy className="h-8 w-8 text-geo-highlight" />,
      title: "Track Progress",
      description: "Monitor your learning journey with detailed progress analytics"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 data-grid opacity-30"></div>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-96 h-96 rounded-full earth-gradient animate-spin-slow shadow-2xl shadow-geo-accent/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-geo-accent/30 animate-spin-slow" style={{ animationDuration: '30s' }}></div>
            <div className="absolute inset-4 rounded-full border border-geo-accent/20 animate-spin-slow" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>
          </div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-geo-accent to-geo-highlight bg-clip-text text-transparent">
            GeoLearn Demo
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the future of GIS and Remote Sensing education
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold px-8 py-6 text-lg"
            >
              Start Learning Now
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-geo-accent/50 text-geo-accent hover:bg-geo-accent/10 px-8 py-6 text-lg group"
            >
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo-video" className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
              See GeoLearn in Action
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Watch how our platform transforms the way you learn GIS and Remote Sensing
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="glass-effect glow-border overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-geo-accent/20 to-geo-highlight/20 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/20 rounded-full p-8"
                  >
                    <Play className="h-12 w-12" />
                  </Button>
                </div>
                <Globe className="h-32 w-32 text-white/20 animate-pulse" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-geo-dark/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
              Platform Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-effect glow-border hover:shadow-2xl hover:shadow-geo-accent/20 transition-all duration-500 text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
            Ready to Start Your Journey?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of professionals advancing their GIS and Remote Sensing skills
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold px-8 py-6 text-lg"
            >
              Get Started Free
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-geo-accent/50 text-geo-accent hover:bg-geo-accent/10 px-8 py-6 text-lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Brochure
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Demo;
