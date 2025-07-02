
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, DollarSign, Users, Upload, FileText } from 'lucide-react';

const Careers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cv_file: null as File | null
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
      return data;
    }
  });

  // Submit application mutation
  const submitApplication = useMutation({
    mutationFn: async (application: any) => {
      let cv_url = null;
      
      // Upload CV if provided
      if (applicationData.cv_file) {
        const fileExt = applicationData.cv_file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('course-materials')
          .upload(`cvs/${fileName}`, applicationData.cv_file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('course-materials')
          .getPublicUrl(`cvs/${fileName}`);
        
        cv_url = publicUrl;
      }

      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: selectedJob,
          applicant_name: applicationData.full_name,
          applicant_email: applicationData.email,
          phone: applicationData.phone,
          resume_url: cv_url,
          experience: 'Not specified',
          motivation: 'Application submitted via career form',
          expertise: 'To be evaluated'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Thank you for your application. We'll review it and get back to you soon.",
      });
      setApplicationData({
        full_name: '',
        email: '',
        phone: '',
        cv_file: null
      });
      setSelectedJob(null);
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    },
    onError: (error) => {
      console.error('Application error:', error);
      toast({
        title: "Application Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setApplicationData(prev => ({ ...prev, cv_file: file }));
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !applicationData.full_name || !applicationData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    submitApplication.mutate(applicationData);
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'entry': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'mid': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'senior': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-geo-primary via-background to-geo-secondary">
      <Header />
      
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-geo-highlight to-geo-accent bg-clip-text text-transparent">
            Join Our Team
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Shape the future of geospatial technology and education with our innovative team
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading positions...</p>
          </div>
        ) : jobs.length === 0 ? (
          <Card className="glass-effect glow-border max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-6">💼</div>
              <h3 className="text-xl font-semibold mb-4">No Open Positions</h3>
              <p className="text-muted-foreground">
                We don't have any open positions at the moment, but we're always looking for talented individuals!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Job Listings */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
              {jobs.map((job) => (
                <Card key={job.id} className="glass-effect glow-border hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl text-geo-highlight">{job.title}</CardTitle>
                      <Badge className={getDifficultyColor(job.experience_level)}>
                        {job.experience_level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {job.job_type}
                      </div>
                      {job.salary_range && (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {job.salary_range}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{job.description}</p>
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Requirements:</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Button
                      onClick={() => setSelectedJob(job.id)}
                      className="w-full bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Application Form */}
            {selectedJob && (
              <Card className="glass-effect glow-border sticky top-8">
                <CardHeader>
                  <CardTitle className="text-xl text-geo-accent">Apply for Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitApplication} className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        type="text"
                        placeholder="Enter your full name"
                        value={applicationData.full_name}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, full_name: e.target.value }))}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={applicationData.email}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={applicationData.phone}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cv">CV/Resume (PDF)</Label>
                      <div className="mt-1">
                        <Input
                          id="cv"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-geo-accent/10 file:text-geo-accent hover:file:bg-geo-accent/20"
                        />
                        {applicationData.cv_file && (
                          <div className="flex items-center mt-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4 mr-2" />
                            {applicationData.cv_file.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitApplication.isPending}
                      className="w-full bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
                    >
                      {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Careers;
