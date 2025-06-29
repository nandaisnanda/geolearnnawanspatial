
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="glass-effect glow-border max-w-md w-full">
          <CardContent className="p-12 text-center">
            <div className="text-8xl mb-6">🌍</div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
            <p className="text-muted-foreground mb-8">
              Oops! The page you're looking for seems to be lost in space. Let's get you back on track.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex items-center gap-2 border-geo-accent/30 text-geo-accent hover:bg-geo-accent/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
