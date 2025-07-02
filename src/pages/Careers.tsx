
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Clock, DollarSign, Users, Briefcase, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Careers = () => {
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    applicant_name: '',
    applicant_email: '',
    phone: '',
    experience: '',
    motivation: '',
    expertise: ''
  });

  // Fetch job vacancies
  const { data: jobVacancies = [], isLoading } = useQuery({
    queryKey: ['job-vacancies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_vacancies')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (application: typeof applicationData & { job_id: string }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .insert(application)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Thank you for your application. We'll review it and get back to you soon.",
      });
      setApplicationData({
        applicant_name: '',
        applicant_email: '',
        phone: '',
        experience: '',
        motivation: '',
        expertise: ''
      });
      setShowApplicationForm(false);
      setSelectedJob('');
    },
    onError: (error) => {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleApplyNow = (jobId: string) => {
    setSelectedJob(jobId);
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = () => {
    if (!applicationData.applicant_name || !applicationData.applicant_email || !applicationData.experience || !applicationData.motivation || !applicationData.expertise) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    submitApplicationMutation.mutate({
      ...applicationData,
      job_id: selectedJob
    });
  };

  const getJobTypeColor = (type: string) => {
    const colors = {
      'full-time': 'bg-green-500/10 text-green-500 border-green-500/30',
      'part-time': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      'contract': 'bg-orange-500/10 text-orange-500 border-orange-500/30',
      'remote': 'bg-purple-500/10 text-purple-500 border-purple-500/30'
    };
    return colors[type as keyof typeof colors] || 'bg-geo-accent/10 text-geo-accent border-geo-accent/30';
  };

  const getExperienceColor = (level: string) => {
    const colors = {
      'entry-level': 'bg-teal-500/10 text-teal-500 border-teal-500/30',
      'mid-level': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
      'senior-level': 'bg-red-500/10 text-red-500 border-red-500/30'
    };
    return colors[level as keyof typeof colors] || 'bg-geo-accent/10 text-geo-accent border-geo-accent/30';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-geo-accent"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
            Career Opportunities
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join our team and help shape the future of GIS education. We're looking for passionate individuals to grow with us.
          </p>
        </div>

        {/* Job Application Form */}
        {showApplicationForm && (
          <Card className="glass-effect glow-border mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-geo-accent">Job Application Form</CardTitle>
              <p className="text-muted-foreground">Please fill out all required fields to submit your application.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <Input
                    placeholder="Enter your full name"
                    value={applicationData.applicant_name}
                    onChange={(e) => setApplicationData({ ...applicationData, applicant_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={applicationData.applicant_email}
                    onChange={(e) => setApplicationData({ ...applicationData, applicant_email: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  placeholder="Enter your phone number"
                  value={applicationData.phone}
                  onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Work Experience *</label>
                <Textarea
                  placeholder="Describe your relevant work experience..."
                  value={applicationData.experience}
                  onChange={(e) => setApplicationData({ ...applicationData, experience: e.target.value })}
                  className="min-h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Motivation *</label>
                <Textarea
                  placeholder="Why do you want to work with us? What motivates you?"
                  value={applicationData.motivation}
                  onChange={(e) => setApplicationData({ ...applicationData, motivation: e.target.value })}
                  className="min-h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Technical Expertise *</label>
                <Textarea
                  placeholder="Describe your technical skills and expertise relevant to this position..."
                  value={applicationData.expertise}
                  onChange={(e) => setApplicationData({ ...applicationData, expertise: e.target.value })}
                  className="min-h-24"
                />
              </div>

              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApplicationForm(false);
                    setSelectedJob('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitApplication}
                  disabled={submitApplicationMutation.isPending}
                  className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitApplicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Vacancies */}
        <div className="space-y-6">
          {jobVacancies.map((job) => (
            <Card key={job.id} className="glass-effect glow-border hover:scale-105 transition-transform">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-geo-accent mb-2">{job.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={getJobTypeColor(job.job_type)}>
                        <Briefcase className="h-3 w-3 mr-1" />
                        {job.job_type}
                      </Badge>
                      <Badge className={getExperienceColor(job.experience_level)}>
                        <Users className="h-3 w-3 mr-1" />
                        {job.experience_level}
                      </Badge>
                      {job.location && (
                        <Badge variant="outline">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </Badge>
                      )}
                      {job.salary_range && (
                        <Badge variant="outline">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {job.salary_range}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleApplyNow(job.id)}
                    className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
                  >
                    Apply Now
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Job Description</h4>
                    <p className="text-muted-foreground">{job.description}</p>
                  </div>
                  
                  {job.requirements && job.requirements.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Requirements</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {job.requirements.map((requirement, index) => (
                          <li key={index}>{requirement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    Posted on {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {jobVacancies.length === 0 && (
            <Card className="glass-effect glow-border">
              <CardContent className="text-center py-12">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Open Positions</h3>
                <p className="text-muted-foreground">
                  We don't have any open positions at the moment, but we're always looking for talented individuals. 
                  Check back soon or reach out to us directly.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Careers;
