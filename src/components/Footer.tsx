
import { Globe, MapPin, Layers, Map } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-geo-accent/20 bg-geo-dark/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Globe className="h-6 w-6 text-geo-accent" />
                <div className="absolute inset-0 bg-geo-accent/20 rounded-full blur-sm animate-pulse"></div>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-geo-accent to-white bg-clip-text text-transparent">
                GeoLearn
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Empowering the next generation of GIS professionals with cutting-edge education and hands-on experience.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/documentation" className="hover:text-geo-accent transition-colors">Documentation</Link></li>
              <li><Link to="/tutorials" className="hover:text-geo-accent transition-colors">Tutorials</Link></li>
              <li><Link to="/community" className="hover:text-geo-accent transition-colors">Community Forum</Link></li>
              <li><Link to="/help-center" className="hover:text-geo-accent transition-colors">Help Center</Link></li>
              <li><Link to="/blog" className="hover:text-geo-accent transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-semibold text-white mb-4">Learning</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-geo-accent transition-colors">Browse Courses</Link></li>
              <li><Link to="/learn" className="hover:text-geo-accent transition-colors">My Learning</Link></li>
              <li><Link to="/my-progress" className="hover:text-geo-accent transition-colors">My Progress</Link></li>
              <li><Link to="/quiz" className="hover:text-geo-accent transition-colors">Assessments</Link></li>
              <li><Link to="/demo" className="hover:text-geo-accent transition-colors">Platform Demo</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-geo-accent transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-geo-accent transition-colors">Join Our Teaching Team</Link></li>
              <li><Link to="/contact" className="hover:text-geo-accent transition-colors">Contact</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-geo-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-geo-accent transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-geo-accent/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 GeoLearn. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Global Learning Platform</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>Professional Certification</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Map className="h-4 w-4" />
              <span>Industry Standards</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
