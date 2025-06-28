
import { Globe, MapPin, Layers, Map } from "lucide-react";

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

          {/* Courses */}
          <div>
            <h3 className="font-semibold text-white mb-4">Courses</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-geo-accent transition-colors">GIS Fundamentals</a></li>
              <li><a href="#" className="hover:text-geo-accent transition-colors">Remote Sensing</a></li>
              <li><a href="#" className="hover:text-geo-accent transition-colors">Spatial Analysis</a></li>
              <li><a href="#" className="hover:text-geo-accent transition-colors">Web GIS</a></li>
              <li><a href="#" className="hover:text-geo-accent transition-colors">Python for GIS</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-geo-accent transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-geo-accent transition-colors">Tutorials</a></li>
              <li><a href="#" className="hover:text-geo-accent transition-colors">Community Forum</a></li>
              <li><a href="#" className="hover:text-geo-accent transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-geo-accent transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-geo-accent transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-geo-accent transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-geo-accent transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-geo-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-geo-accent transition-colors">Terms of Service</a></li>
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
