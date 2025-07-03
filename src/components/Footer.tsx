
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Globe, Instagram, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-geo-dark text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
              GeoLearn
            </h3>
            <p className="text-gray-300">
              Empowering the next generation of geospatial professionals through innovative education and hands-on learning experiences.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/nawanspatial" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-geo-accent transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-geo-accent transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-geo-accent transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-geo-highlight">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-300 hover:text-geo-accent transition-colors">
                Home
              </Link>
              <Link to="/learn" className="block text-gray-300 hover:text-geo-accent transition-colors">
                Courses
              </Link>
              <Link to="/community" className="block text-gray-300 hover:text-geo-accent transition-colors">
                Community
              </Link>
              <Link to="/careers" className="block text-gray-300 hover:text-geo-accent transition-colors">
                Careers
              </Link>
              <Link to="/blog" className="block text-gray-300 hover:text-geo-accent transition-colors">
                Blog
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-geo-highlight">Resources</h4>
            <div className="space-y-2">
              <Link to="/tutorials" className="block text-gray-300 hover:text-geo-accent transition-colors">
                Tutorials
              </Link>
              <Link to="/documentation" className="block text-gray-300 hover:text-geo-accent transition-colors">
                Documentation
              </Link>
              <Link to="/help-center" className="block text-gray-300 hover:text-geo-accent transition-colors">
                Help Center
              </Link>
              <Link to="/quiz" className="block text-gray-300 hover:text-geo-accent transition-colors">
                Quiz
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-geo-highlight">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-geo-accent" />
                <span className="text-gray-300">nawanspatial@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-geo-accent" />
                <span className="text-gray-300">+62 81938244434</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-geo-accent" />
                <span className="text-gray-300">Yogyakarta, Indonesia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm">
              © 2025 GeoLearn. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-gray-300 hover:text-geo-accent text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-gray-300 hover:text-geo-accent text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-gray-300 hover:text-geo-accent text-sm transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
