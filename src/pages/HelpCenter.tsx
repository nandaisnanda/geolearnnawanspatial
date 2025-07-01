
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, MessageCircle, Book, Settings, User, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqCategories = [
    {
      title: "Account & Profile",
      icon: <User className="h-6 w-6 text-geo-accent" />,
      faqs: [
        {
          question: "How do I reset my password?",
          answer: "Click on 'Forgot Password' on the login page and follow the email instructions."
        },
        {
          question: "Can I change my email address?",
          answer: "Yes, you can update your email in the Profile settings page."
        },
        {
          question: "How do I delete my account?",
          answer: "Contact our support team to request account deletion."
        }
      ]
    },
    {
      title: "Courses & Learning",
      icon: <Book className="h-6 w-6 text-geo-highlight" />,
      faqs: [
        {
          question: "How do I enroll in a course?",
          answer: "Browse courses on the home page and click 'Enroll Now' on any course."
        },
        {
          question: "Can I download course materials?",
          answer: "Yes, PDF materials can be downloaded for offline viewing."
        },
        {
          question: "How is my progress tracked?",
          answer: "Progress is automatically tracked as you complete lessons and quizzes."
        }
      ]
    },
    {
      title: "Technical Issues",
      icon: <Settings className="h-6 w-6 text-purple-500" />,
      faqs: [
        {
          question: "Videos won't load or play",
          answer: "Check your internet connection and try refreshing the page. Clear browser cache if issues persist."
        },
        {
          question: "I can't access my courses",
          answer: "Ensure you're logged in and check if your enrollment is still active."
        },
        {
          question: "The platform is running slowly",
          answer: "Try clearing your browser cache or using a different browser."
        }
      ]
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form submitted:', contactForm);
    // Reset form
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            Help Center
          </h1>
          <p className="text-muted-foreground">
            Find answers to common questions and get support
          </p>
        </div>

        {/* Search */}
        <Card className="glass-effect glow-border mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {faqCategories.map((category, index) => (
            <Card key={index} className="glass-effect glow-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {category.icon}
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => (
                    <div key={faqIndex} className="border-b border-geo-accent/20 pb-3 last:border-b-0">
                      <h4 className="font-medium mb-2 text-sm">{faq.question}</h4>
                      <p className="text-xs text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-geo-accent" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-effect glow-border">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-geo-accent/10 rounded-lg">
                <h3 className="font-semibold mb-2">Getting Started Guide</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  New to GeoLearn? Start here for a complete overview.
                </p>
                <Button size="sm" variant="outline">
                  Read Guide
                </Button>
              </div>
              
              <div className="p-4 bg-geo-highlight/10 rounded-lg">
                <h3 className="font-semibold mb-2">Video Tutorials</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Watch step-by-step tutorials for common tasks.
                </p>
                <Button size="sm" variant="outline">
                  Watch Videos
                </Button>
              </div>
              
              <div className="p-4 bg-purple-500/10 rounded-lg">
                <h3 className="font-semibold mb-2">Community Forum</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Connect with other learners and get help.
                </p>
                <Button size="sm" variant="outline">
                  Join Discussion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HelpCenter;
