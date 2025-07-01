
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Users, BookOpen, Globe, Send } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Careers = () => {
  const [application, setApplication] = useState({
    name: '',
    email: '',
    phone: '',
    expertise: '',
    experience: '',
    motivation: '',
    resume: null
  });

  const openPositions = [
    {
      title: "Senior GIS Instructor",
      location: "Remote / Global",
      type: "Full-time",
      salary: "$60,000 - $80,000",
      experience: "5+ years",
      description: "Lead comprehensive GIS courses covering ArcGIS, QGIS, and spatial analysis techniques.",
      requirements: [
        "Master's degree in Geography, GIS, or related field",
        "5+ years of professional GIS experience",
        "Previous teaching or training experience",
        "Excellent communication skills",
        "Experience with ArcGIS Pro, QGIS, and Python"
      ]
    },
    {
      title: "Remote Sensing Specialist",
      location: "Remote / Global",
      type: "Part-time",
      salary: "$40,000 - $55,000",
      experience: "3+ years",
      description: "Develop and deliver courses on satellite imagery analysis and remote sensing applications.",
      requirements: [
        "Bachelor's degree in Remote Sensing, Environmental Science, or related field",
        "3+ years of remote sensing experience",
        "Proficiency with ENVI, ERDAS, or Google Earth Engine",
        "Strong analytical and problem-solving skills",
        "Experience with machine learning applications in remote sensing"
      ]
    },
    {
      title: "Python for GIS Developer/Instructor",
      location: "Remote / Global",
      type: "Contract",
      salary: "$50 - $75/hour",
      experience: "4+ years",
      description: "Create hands-on Python programming courses focused on GIS automation and analysis.",
      requirements: [
        "Strong Python programming skills",
        "Experience with ArcPy, GeoPandas, and other geospatial libraries",
        "Background in GIS analysis and automation",
        "Previous teaching or mentoring experience",
        "Portfolio of Python GIS projects"
      ]
    }
  ];

  const benefits = [
    {
      icon: <Globe className="h-6 w-6 text-geo-accent" />,
      title: "Global Impact",
      description: "Teach students from around the world and shape the future of GIS education"
    },
    {
      icon: <Clock className="h-6 w-6 text-geo-highlight" />,
      title: "Flexible Schedule",
      description: "Work remotely with flexible hours that fit your lifestyle"
    },
    {
      icon: <Users className="h-6 w-6 text-purple-500" />,
      title: "Collaborative Environment",
      description: "Join a team of passionate educators and industry experts"
    },
    {
      icon: <BookOpen className="h-6 w-6 text-green-500" />,
      title: "Continuous Learning",
      description: "Access to latest GIS technologies and professional development opportunities"
    }
  ];

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Application submitted:', application);
    // Handle application submission
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            Join Our Teaching Team
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Shape the future of GIS education by joining our global team of expert instructors. 
            We're looking for passionate professionals to create and deliver world-class courses.
          </p>
        </div>

        {/* Why Join Us */}
        <Card className="glass-effect glow-border mb-8">
          <CardHeader>
            <CardTitle className="text-center">Why Teach with GeoLearn?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Open Positions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <Card key={index} className="glass-effect glow-border">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{position.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {position.location}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {position.type}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {position.salary}
                        </Badge>
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black">
                      Apply Now
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{position.description}</p>
                  <div>
                    <h4 className="font-semibold mb-2">Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {position.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-geo-accent rounded-full mt-2 flex-shrink-0"></div>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <Card className="glass-effect glow-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-geo-accent" />
              Apply to Join Our Team
            </CardTitle>
            <p className="text-muted-foreground">
              Tell us about yourself and your expertise in GIS education
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApplicationSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <Input
                    value={application.name}
                    onChange={(e) => setApplication({...application, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <Input
                    type="email"
                    value={application.email}
                    onChange={(e) => setApplication({...application, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    value={application.phone}
                    onChange={(e) => setApplication({...application, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Area of Expertise *</label>
                  <Input
                    placeholder="e.g., Remote Sensing, Python Programming, ArcGIS"
                    value={application.expertise}
                    onChange={(e) => setApplication({...application, expertise: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Professional Experience *</label>
                <Textarea
                  rows={4}
                  placeholder="Describe your professional background and relevant experience..."
                  value={application.experience}
                  onChange={(e) => setApplication({...application, experience: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Why do you want to teach with GeoLearn? *</label>
                <Textarea
                  rows={4}
                  placeholder="Tell us about your passion for teaching and how you'd contribute to our mission..."
                  value={application.motivation}
                  onChange={(e) => setApplication({...application, motivation: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Resume/CV *</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Please upload your resume in PDF, DOC, or DOCX format
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Careers;
