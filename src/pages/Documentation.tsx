
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, Video, Download } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Documentation = () => {
  const docSections = [
    {
      title: "Getting Started",
      icon: <BookOpen className="h-6 w-6 text-geo-accent" />,
      items: [
        "Creating Your First Account",
        "Navigating the Platform",
        "Understanding Course Structure",
        "Setting Learning Goals"
      ]
    },
    {
      title: "Course Materials",
      icon: <FileText className="h-6 w-6 text-geo-highlight" />,
      items: [
        "Video Lessons Guide",
        "PDF Resources Usage",
        "Quiz System Overview",
        "Progress Tracking"
      ]
    },
    {
      title: "Technical Guides",
      icon: <Video className="h-6 w-6 text-green-500" />,
      items: [
        "GIS Software Installation",
        "Python Environment Setup",
        "Data Download Instructions",
        "Troubleshooting Common Issues"
      ]
    },
    {
      title: "Advanced Features",
      icon: <Download className="h-6 w-6 text-purple-500" />,
      items: [
        "Community Discussions",
        "Achievement System",
        "Certificate Generation",
        "Career Pathways"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            Documentation
          </h1>
          <p className="text-muted-foreground">
            Complete guides and resources to help you make the most of GeoLearn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docSections.map((section, index) => (
            <Card key={index} className="glass-effect glow-border hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {section.icon}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center gap-2 text-muted-foreground hover:text-geo-accent transition-colors cursor-pointer">
                      <div className="w-2 h-2 bg-geo-accent rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-effect glow-border mt-8">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <h3>Welcome to GeoLearn!</h3>
            <p>Follow these simple steps to begin your GIS learning journey:</p>
            <ol>
              <li><strong>Create Your Account:</strong> Sign up with your email and verify your account</li>
              <li><strong>Browse Courses:</strong> Explore our comprehensive course catalog</li>
              <li><strong>Enroll in Courses:</strong> Click "Enroll Now" on courses that interest you</li>
              <li><strong>Start Learning:</strong> Access video lessons, PDFs, and interactive content</li>
              <li><strong>Track Progress:</strong> Monitor your advancement in the My Progress section</li>
              <li><strong>Join Discussions:</strong> Engage with fellow learners in course discussions</li>
              <li><strong>Take Quizzes:</strong> Test your knowledge with integrated assessments</li>
              <li><strong>Earn Achievements:</strong> Unlock badges as you complete milestones</li>
            </ol>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Documentation;
