
import { Search, User, Globe, LogOut, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const showBackButton = location.pathname !== '/';

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-geo-accent/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="hover:bg-geo-accent/10 text-geo-accent"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <Globe className="h-8 w-8 text-geo-accent animate-spin-slow" />
              <div className="absolute inset-0 bg-geo-accent/20 rounded-full blur-md animate-pulse-glow"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-geo-accent to-white bg-clip-text text-transparent">
                GeoLearn
              </span>
              <span className="text-xs text-muted-foreground -mt-1">by NawanSpatial</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-sm font-medium hover:text-geo-accent transition-colors">
            Home
          </Link>
          {user && (
            <>
              <Link to="/learn" className="text-sm font-medium hover:text-geo-accent transition-colors">
                Continue Learning
              </Link>
              <Link to="/my-progress" className="text-sm font-medium hover:text-geo-accent transition-colors">
                My Progress
              </Link>
              <Link to="/community" className="text-sm font-medium hover:text-geo-accent transition-colors">
                Community
              </Link>
              <Link to="/quiz" className="text-sm font-medium hover:text-geo-accent transition-colors">
                Quiz
              </Link>
              {profile?.role === 'admin' && (
                <Link to="/admin" className="text-sm font-medium hover:text-geo-accent transition-colors">
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Search and User */}
        <div className="flex items-center space-x-4">
          {user && (
            <div className="relative hidden sm:flex">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-10 w-64 bg-geo-dark/50 border-geo-accent/30 focus:border-geo-accent"
              />
            </div>
          )}
          
          {user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 border-2 border-geo-accent/30">
                    <AvatarImage src={profile.avatar_url} alt="User" />
                    <AvatarFallback className="bg-geo-accent/20 text-geo-accent">
                      {profile.full_name?.substring(0, 2).toUpperCase() || profile.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {profile.role === 'admin' && (
                    <Badge className="absolute -top-2 -right-2 bg-geo-highlight text-black text-xs px-1">
                      <Shield className="h-2 w-2" />
                    </Badge>
                  )}
                  <Badge className={`absolute -bottom-2 -right-2 ${getTierColor(profile.tier_level)} text-white text-xs px-1`}>
                    {profile.tier_level[0].toUpperCase()}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-geo-dark border-geo-accent/30" align="end">
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')}
                  className="hover:bg-geo-accent/10"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile ({profile.tier_level})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="hover:bg-geo-accent/10">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
