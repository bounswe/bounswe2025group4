import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Alert,
  Snackbar,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import JobGrid from '../../components/dashboard/JobGrid';
import JobFormDialog from '../../components/dashboard/JobFormDialog';
import ApplicationsGrid from '../../components/dashboard/ApplicationsGrid';
import { jobsService, useGetJobs } from '../../services/jobs.service';
import { JobFormValues, ApplicationStatusUpdate } from '../../schemas/job';
import { Job } from '../../types/job';
import { JobApplication } from '../../components/dashboard/ApplicationsGrid';
import { useAuth } from '../../hooks/useAuth';

// Mock data for companies - would typically come from an API
const COMPANIES = [
  { id: 'company1', name: 'Ethical Tech Co.' },
  { id: 'company2', name: 'Green Solutions Inc.' },
  { id: 'company3', name: 'Fair Work Technologies' },
];

// Mock function to get applications - would be replaced with actual API call
const getApplicationsForJob = async (
  jobId: string
): Promise<JobApplication[]> => {
  console.log(`Fetching applications for job ${jobId}`);
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock data
  return [
    {
      id: 'app1',
      applicantName: 'Jane Smith',
      applicantEmail: 'jane.smith@example.com',
      resume: 'https://example.com/resumes/jane-smith.pdf',
      coverLetter:
        "I am excited to apply for this position because of your company's commitment to ethical technology practices. My background in sustainable web development aligns perfectly with your mission.",
      status: 'Pending',
      appliedDate: '2023-04-15T10:30:00Z',
    },
    {
      id: 'app2',
      applicantName: 'John Doe',
      applicantEmail: 'john.doe@example.com',
      resume: 'https://example.com/resumes/john-doe.pdf',
      coverLetter:
        "Having worked in similar roles for the past 5 years, I believe I have the exact skill set you are looking for. I am particularly impressed by your company's commitment to work-life balance.",
      status: 'Approved',
      appliedDate: '2023-04-10T14:45:00Z',
      feedback:
        'Great fit for our team. Looking forward to the interview process.',
    },
    {
      id: 'app3',
      applicantName: 'Alex Johnson',
      applicantEmail: 'alex.johnson@example.com',
      resume: 'https://example.com/resumes/alex-johnson.pdf',
      coverLetter:
        'I am applying for this position to contribute to your mission of creating sustainable technology solutions. My previous experience in eco-friendly tech startups has prepared me well.',
      status: 'Rejected',
      appliedDate: '2023-04-05T09:15:00Z',
      feedback:
        'Thank you for your application. While impressive, we are looking for candidates with more specific experience in our industry.',
    },
  ];
};

// Mock function to update application status - would be replaced with actual API call
const updateApplicationStatus = async (
  applicationId: string,
  data: ApplicationStatusUpdate
): Promise<void> => {
  console.log(
    `Updating application ${applicationId} with status: ${data.status}`
  );
  console.log('Feedback:', data.feedback);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // In a real app, this would make an API call
  return Promise.resolve();
};

const JobDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const [selectedJob, setSelectedJob] = useState<Job | undefined>(undefined);
  const [viewingApplications, setViewingApplications] = useState<string | null>(
    null
  );
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Get the employer's jobs
  const { data: jobsData, isLoading: isLoadingJobs } = useGetJobs({
    companyId: user?.id, // Filter by current user's ID if they're an employer
  });

  // Query for applications when viewing a specific job's applications
  const { data: applications = [], isLoading: isLoadingApplications } =
    useQuery({
      queryKey: ['applications', viewingApplications],
      queryFn: () => getApplicationsForJob(viewingApplications!),
      enabled: !!viewingApplications,
    });

  // Get the selected job's title for display in applications view
  const selectedJobTitle = viewingApplications
    ? jobsData?.jobs.find((job) => job.id === viewingApplications)?.title ||
      'Job'
    : '';

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: (jobData: JobFormValues) => jobsService.createJob(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setFormDialogOpen(false);
      setNotification({
        open: true,
        message: 'Job created successfully!',
        severity: 'success',
      });
    },
    onError: (error) => {
      setNotification({
        open: true,
        message: `Failed to create job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    },
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: JobFormValues }) =>
      jobsService.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setFormDialogOpen(false);
      setSelectedJob(undefined);
      setNotification({
        open: true,
        message: 'Job updated successfully!',
        severity: 'success',
      });
    },
    onError: (error) => {
      setNotification({
        open: true,
        message: `Failed to update job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    },
  });

  // Update application status mutation
  const updateApplicationStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApplicationStatusUpdate }) =>
      updateApplicationStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['applications', viewingApplications],
      });
      setNotification({
        open: true,
        message: 'Application status updated successfully!',
        severity: 'success',
      });
    },
    onError: (error) => {
      setNotification({
        open: true,
        message: `Failed to update application: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    },
  });

  // Check authentication on mount
  useEffect(() => {
    // This would be used in a real application with proper auth
    if (!isAuthenticated) {
      // Redirect to login page
      navigate('/login', { state: { from: '/dashboard/jobs' } });
    }
  }, [isAuthenticated, navigate]);

  const handleCreateJob = () => {
    setSelectedJob(undefined);
    setFormDialogOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setFormDialogOpen(true);
  };

  const handleViewApplications = (jobId: string) => {
    setViewingApplications(jobId);
  };

  const handleBackToJobs = () => {
    setViewingApplications(null);
  };

  const handleJobFormSubmit = (data: JobFormValues) => {
    if (selectedJob) {
      // Update existing job
      updateJobMutation.mutate({ id: selectedJob.id, data });
    } else {
      // Create new job
      createJobMutation.mutate(data);
    }
  };

  const handleUpdateApplicationStatus = (
    applicationId: string,
    data: ApplicationStatusUpdate
  ) => {
    updateApplicationStatusMutation.mutate({ id: applicationId, data });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Show loading indicator or error message
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">Please log in to access this page.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Employer Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your job listings and applicants
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {viewingApplications ? (
          <ApplicationsGrid
            jobId={viewingApplications}
            jobTitle={selectedJobTitle}
            applications={applications}
            isLoading={isLoadingApplications}
            onUpdateStatus={handleUpdateApplicationStatus}
            onBackToJobs={handleBackToJobs}
          />
        ) : (
          <JobGrid
            jobs={jobsData?.jobs || []}
            isLoading={isLoadingJobs}
            onEdit={handleEditJob}
            onCreateNew={handleCreateJob}
            onApplicationsView={handleViewApplications}
          />
        )}
      </Paper>

      <JobFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSubmit={handleJobFormSubmit}
        initialData={selectedJob}
        isLoading={createJobMutation.isPending || updateJobMutation.isPending}
        companies={COMPANIES}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={notification.severity}
          onClose={handleCloseNotification}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default JobDashboard;
