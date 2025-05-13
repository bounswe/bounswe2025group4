import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Typography, Alert, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import { JobPost } from '../../types/job';
import {
  useGetJobByEmployer,
  useCreateJob,
  useUpdateJob,
} from '../../services/jobs.service';
import JobGrid from '../../components/jobdashboard/JobGrid';
import JobFormDialog from '../../components/jobdashboard/JobFormDialog';
import { JobFormValues } from '../../schemas/job';

const JobDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext) as AuthContextType;
  const employerId = authContext?.id;
  const token = authContext?.token;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

  const { data: jobs, isLoading } = useGetJobByEmployer(employerId ?? '');
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();


  if (!token) {
    return (
      <Container>
        <Alert severity="error">
          Authentication token not found. Please log in.
        </Alert>
      </Container>
    );
  }

  if (!employerId) {
    return (
      <Container>
        <Alert severity="error">
          Employer ID not found. Cannot fetch jobs.
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Job Dashboard...</Typography>
      </Container>
    );
  }

  const handleCreateNew = async () => {
    setSelectedJob(null);
    navigate('/dashboard/jobs/create');
  };

  const handleEdit = (job: JobPost) => {
    setSelectedJob(job);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedJob(null);
  };

  const handleFormSubmit = async (data: JobFormValues) => {
    try {
      if (selectedJob) {
        await updateJobMutation.mutateAsync({
          id: selectedJob.id.toString(),
          data: {
            ...selectedJob,
            title: data.title,
            description: data.description,
            location: data.location,
            remote: data.isRemote,
            minSalary: data.minSalary,
            maxSalary: data.maxSalary,
            ethicalTags: data.ethicalTags,
            employerId: parseInt(employerId),
          } as JobPost,
        });
      } else {
        await createJobMutation.mutateAsync({
          id: 0, // Will be assigned by backend
          employerId: parseInt(employerId),
          title: data.title,
          description: data.description,
          location: data.location,
          company: data.company,
          remote: data.isRemote,
          ethicalTags: data.ethicalTags,
          minSalary: data.minSalary,
          maxSalary: data.maxSalary,
        } as JobPost);
      }
      setIsFormOpen(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  const handleApplicationsView = (jobId: string) => {
    navigate(`/dashboard/jobs/${jobId}`);
  };

  // Get company name from existing jobs if available
  const companyName = jobs?.[0]?.company || 'My Company';

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Manage Job Listings</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create Job
        </Button>
      </Box>
    
      <JobGrid
        jobs={jobs || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onApplicationsView={handleApplicationsView}
      />

      <JobFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={selectedJob || undefined}
        isLoading={createJobMutation.isPending || updateJobMutation.isPending}
        companies={[{ id: employerId, name: companyName }]}
      />
    </Container>
  );
};

export default JobDashboardPage;
