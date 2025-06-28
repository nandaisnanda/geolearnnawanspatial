
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartLearning = () => {
    if (user) {
      navigate('/learn');
    } else {
      navigate('/login');
    }
  };

  const handleWatchDemo = () => {
    navigate('/demo');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 data-grid opacity-30"></div>
      
      {/* Animated Earth */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Main Earth sphere */}
          <div className="w-96 h-96 rounded-full earth-gradient animate-spin-slow shadow-2xl shadow-geo-accent/20"></div>
          
          {/* Orbital rings */}
          <div className="absolute inset-0 rounded-full border-2 border-geo-accent/30 animate-spin-slow" style={{ animationDuration: '30s' }}></div>
          <div className="absolute inset-4 rounded-full border border-geo-accent/20 animate-spin-slow" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>
          
          {/* Data points */}
          <div className="absolute top-20 left-20 w-3 h-3 bg-geo-highlight rounded-full animate-pulse"></div>
          <div className="absolute bottom-24 right-16 w-2 h-2 bg-geo-accent rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-32 right-24 w-2 h-2 bg-geo-highlight rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-geo-accent to-geo-highlight bg-clip-text text-transparent">
          Master GIS & Remote Sensing
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Unlock the power of geospatial analysis with cutting-edge courses designed for the next generation of GIS professionals
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            onClick={handleStartLearning}
            className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            {user ? 'Continue Learning' : 'Start Learning'}
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleWatchDemo}
            className="border-geo-accent/50 text-geo-accent hover:bg-geo-accent/10 px-8 py-6 text-lg group"
          >
            <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Watch Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="glass-effect rounded-lg p-6 glow-border">
            <div className="text-3xl font-bold text-geo-accent">50+</div>
            <div className="text-sm text-muted-foreground">Expert Courses</div>
          </div>
          <div className="glass-effect rounded-lg p-6 glow-border">
            <div className="text-3xl font-bold text-geo-highlight">10K+</div>
            <div className="text-sm text-muted-foreground">Active Learners</div>
          </div>
          <div className="glass-effect rounded-lg p-6 glow-border">
            <div className="text-3xl font-bold text-geo-accent">95%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
