
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, MapPin, Clock, DollarSign, Users, Send, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface JobVacancy {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  job_type: string;
  salary_range: string;
  experience_level: string;
  created_at: string;
}

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
    expertise: '',
    resume_url: ''
  });

  // Fetch job vacancies
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['job-vacancies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_vacancies')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as JobVacancy[];
    }
  });

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (appData: typeof applicationData & { job_id: string }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .insert(appData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Send notification emails
      await fetch('/api/send-application-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicantName: appData.applicant_name,
          jobTitle: jobs.find(j => j.id === selectedJob)?.title || 'Unknown Position',
          applicantEmail: appData.applicant_email
        })
      });
      
      return data;
    },
    onSuccess: () => {
      setApplicationData({
        applicant_name: '',
        applicant_email: '',
        phone: '',
        experience: '',
        motivation: '',
        expertise: '',
        resume_url: ''
      });
      setShowApplicationForm(false);
      setSelectedJob('');
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We'll review your application and get back to you soon.",
      });
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

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath);

      setApplicationData(prev => ({ ...prev, resume_url: data.publicUrl }));
      
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApply = (jobId: string) => {
    setSelectedJob(jobId);
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = () => {
    if (!applicationData.applicant_name.trim() || !applicationData.applicant_email.trim() || 
        !applicationData.experience.trim() || !applicationData.motivation.trim() || 
        !applicationData.expertise.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    submitApplicationMutation.mutate({ ...applicationData, job_id: selectedJob });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-geo-primary via-background to-geo-secondary">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
            Join Our Team
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Be part of our mission to revolutionize geospatial education. We're looking for passionate individuals who want to make a difference in the world of spatial technology and learning.
          </p>
        </div>

        {/* Company Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-effect glow-border text-center">
            <CardContent className="p-6">
              <Users className="h-12 w-12 text-geo-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Collaborative Culture</h3>
              <p className="text-muted-foreground">Work with a diverse team of experts who share your passion for innovation and learning.</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect glow-border text-center">
            <CardContent className="p-6">
              <Briefcase className="h-12 w-12 text-geo-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Growth Opportunities</h3>
              <p className="text-muted-foreground">Advance your career with continuous learning opportunities and professional development.</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect glow-border text-center">
            <CardContent className="p-6">
              <DollarSign className="h-12 w-12 text-geo-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Competitive Benefits</h3>
              <p className="text-muted-foreground">Enjoy competitive compensation, flexible work arrangements, and comprehensive benefits.</p>
            </CardContent>
          </Card>
        </div>

        {/* Job Listings */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-geo-accent to-geo-highlight bg-clip-text text-transparent">
            Open Positions
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-geo-accent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="glass-effect glow-border">
                  <CardHeader>
                    <CardTitle className="text-xl text-geo-accent">{job.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.job_type}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {job.experience_level}
                      </Badge>
                      {job.salary_range && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.salary_range}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{job.description}</p>
                    
                    {job.requirements && job.requirements.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Requirements:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <Button
                      onClick={() => handleApply(job.id)}
                      className="w-full bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              {jobs.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Open Positions</h3>
                  <p className="text-muted-foreground">
                    We don't have any open positions at the moment, but we're always looking for talented individuals. 
                    Feel free to reach out to us directly!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="glass-effect glow-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-xl text-geo-accent">Apply for Position</CardTitle>
                <p className="text-muted-foreground">
                  {jobs.find(j => j.id === selectedJob)?.title}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Full Name *"
                    value={applicationData.applicant_name}
                    onChange={(e) => setApplicationData({ ...applicationData, applicant_name: e.target.value })}
                  />
                  <Input
                    type="email"
                    placeholder="Email Address *"
                    value={applicationData.applicant_email}
                    onChange={(e) => setApplicationData({ ...applicationData, applicant_email: e.target.value })}
                  />
                </div>
                
                <Input
                  placeholder="Phone Number"
                  value={applicationData.phone}
                  onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                />
                
                <Textarea
                  placeholder="Tell us about your relevant experience *"
                  value={applicationData.experience}
                  onChange={(e) => setApplicationData({ ...applicationData, experience: e.target.value })}
                  className="min-h-24"
                />
                
                <Textarea
                  placeholder="Why do you want to work with us? *"
                  value={applicationData.motivation}
                  onChange={(e) => setApplicationData({ ...applicationData, motivation: e.target.value })}
                  className="min-h-24"
                />
                
                <Textarea
                  placeholder="What specific skills and expertise do you bring? *"
                  value={applicationData.expertise}
                  onChange={(e) => setApplicationData({ ...applicationData, expertise: e.target.value })}
                  className="min-h-24"
                />
                
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Resume</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {applicationData.resume_url && (
                    <p className="text-xs text-green-500 mt-1">✓ Resume uploaded</p>
                  )}
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSubmitApplication}
                    disabled={submitApplicationMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitApplicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowApplicationForm(false);
                      setSelectedJob('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Careers;
