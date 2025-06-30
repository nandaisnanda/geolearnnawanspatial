
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Award, Target } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-geo-primary via-background to-geo-secondary">
      <Header />
      
      <div className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
            About GeoLearn
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Empowering the next generation of geospatial professionals through innovative education and hands-on learning experiences.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* About Us */}
          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-geo-accent">
                <Target className="h-6 w-6 mr-3" />
                About Us
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p className="mb-4">
                GeoLearn, a proud product of <strong className="text-geo-highlight">NawanSpatial</strong>, is dedicated to fostering knowledge and passion in the dynamic fields of Geographic Information Systems (GIS) and Remote Sensing.
              </p>
              <p className="mb-4">
                We believe in empowering individuals with the skills and understanding necessary to navigate and interpret our world through geospatial technology. Our mission is to make learning about GIS and remote sensing accessible, engaging, and impactful for everyone.
              </p>
              <p>
                Through our comprehensive courses, interactive learning materials, and supportive community, we're building the foundation for tomorrow's geospatial leaders.
              </p>
            </CardContent>
          </Card>

          {/* Careers */}
          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-geo-accent">
                <Users className="h-6 w-6 mr-3" />
                Careers
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p className="mb-4">
                Are you passionate about sharing your expertise in GIS and Remote Sensing? GeoLearn is currently seeking enthusiastic and knowledgeable tutors to join our growing team.
              </p>
              <p className="mb-4">
                If you have a strong understanding of geospatial concepts and the ability to inspire others, we encourage you to apply. Help us shape the next generation of geospatial professionals!
              </p>
              <Badge className="bg-geo-highlight/20 text-geo-highlight border-geo-highlight/30">
                Now Hiring: GIS Instructors
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Contact & Policies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact */}
          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-geo-accent">
                <MapPin className="h-6 w-6 mr-3" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p className="mb-6">We're happy to connect with you!</p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-3 border-geo-accent/30 text-geo-accent">
                    WhatsApp
                  </Badge>
                  <a 
                    href="https://wa.me/6281299796500" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-geo-highlight hover:text-geo-accent transition-colors"
                  >
                    wa.me/6281299796500
                  </a>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-3 border-geo-accent/30 text-geo-accent">
                    Email
                  </Badge>
                  <a 
                    href="mailto:nawanspatial@gmail.com"
                    className="text-geo-highlight hover:text-geo-accent transition-colors"
                  >
                    nawanspatial@gmail.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policies */}
          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-geo-accent">
                <Award className="h-6 w-6 mr-3" />
                Our Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <div>
                <h4 className="font-semibold text-geo-highlight mb-2">Privacy Policy</h4>
                <p className="text-sm">
                  At GeoLearn, we are committed to protecting your privacy. We do not share your information with third parties without your explicit consent.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-geo-highlight mb-2">Terms of Service</h4>
                <p className="text-sm">
                  By using GeoLearn, you agree to comply with our terms of service. We encourage you to review them to understand your rights and responsibilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
