
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Briefcase, MapPin, Clock, DollarSign } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface JobVacancy {
  id: string;
  title: string;
  description: string;
  location: string | null;
  job_type: string | null;
  experience_level: string | null;
  salary_range: string | null;
  requirements: string[] | null;
  is_published: boolean | null;
  created_at: string | null;
}

const JobManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingJob, setEditingJob] = useState<JobVacancy | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'full-time',
    experience_level: 'entry',
    salary_range: '',
    is_published: true
  });

  // Fetch jobs
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_vacancies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as JobVacancy[];
    }
  });

  // Create/Update job mutation
  const saveJobMutation = useMutation({
    mutationFn: async (jobData: typeof formData & { requirements: string[]; id?: string }) => {
      if (jobData.id) {
        const { data, error } = await supabase
          .from('job_vacancies')
          .update(jobData)
          .eq('id', jobData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('job_vacancies')
          .insert(jobData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      resetForm();
      toast({
        title: editingJob ? "Job Updated!" : "Job Created!",
        description: editingJob ? "Job vacancy has been updated successfully." : "New job vacancy has been created successfully.",
      });
    }
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('job_vacancies')
        .delete()
        .eq('id', jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast({
        title: "Job Deleted!",
        description: "Job vacancy has been deleted successfully.",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      job_type: 'full-time',
      experience_level: 'entry',
      salary_range: '',
      is_published: true
    });
    setRequirements(['']);
    setEditingJob(null);
    setShowForm(false);
  };

  const handleEdit = (job: JobVacancy) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location || '',
      job_type: job.job_type || 'full-time',
      experience_level: job.experience_level || 'entry',
      salary_range: job.salary_range || '',
      is_published: job.is_published || true
    });
    setRequirements(job.requirements || ['']);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a job title.",
        variant: "destructive",
      });
      return;
    }

    const filteredRequirements = requirements.filter(req => req.trim() !== '');
    const jobData = {
      ...formData,
      requirements: filteredRequirements,
      ...(editingJob && { id: editingJob.id })
    };

    saveJobMutation.mutate(jobData);
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-geo-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-effect glow-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-geo-accent flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              Job Vacancy Management
            </CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Input
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <Textarea
              placeholder="Job Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-32"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={formData.job_type}
                onValueChange={(value) => setFormData({ ...formData, job_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.experience_level}
                onValueChange={(value) => setFormData({ ...formData, experience_level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Salary Range (e.g., $50k - $70k)"
                value={formData.salary_range}
                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
              />
            </div>

            {/* Requirements Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Requirements</label>
              {requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Requirement ${index + 1}`}
                    value={requirement}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                  />
                  {requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeRequirement(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addRequirement}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_published" className="text-sm">Publish Job</label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={saveJobMutation.isPending}
                className="bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black"
              >
                {saveJobMutation.isPending ? 'Saving...' : (editingJob ? 'Update Job' : 'Create Job')}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Jobs List */}
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="glass-effect glow-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${job.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {job.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    )}
                    {job.job_type && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.job_type}
                      </div>
                    )}
                    {job.salary_range && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary_range}
                      </div>
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {job.description}
                  </p>

                  {job.requirements && job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <span key={index} className="px-2 py-1 bg-geo-accent/10 text-geo-accent text-xs rounded">
                          {req}
                        </span>
                      ))}
                      {job.requirements.length > 3 && (
                        <span className="px-2 py-1 bg-geo-accent/10 text-geo-accent text-xs rounded">
                          +{job.requirements.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(job)}
                    className="text-geo-accent hover:text-geo-highlight"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this job vacancy? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteJobMutation.mutate(job.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {jobs.length === 0 && (
          <Card className="glass-effect glow-border">
            <CardContent className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No job vacancies yet. Create your first job posting!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobManager;
