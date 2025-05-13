import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import { JobPost } from '../../types/job';
import { useGetJobById } from '../../services/jobs.service';
import {
  useGetApplicationsByJobId,
  useUpdateApplicationStatus,
} from '../../services/applications.service';
import ApplicationsGrid from '../../components/jobdashboard/ApplicationsGrid';
import { ApplicationStatusUpdate } from '../../schemas/job';

const JobDetailDashboard: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: jobData,
    isLoading: isLoadingJob,
    error: jobError,
  } = useGetJobById(jobId as string);
  const authContext = useContext(AuthContext) as AuthContextType;
  const currentEmployerId = authContext?.id;
  const token = authContext?.token;

  const [job, setJob] = useState<JobPost | null>(null);
  const [error_, setError_] = useState<string | null>(
    jobError ? jobError.message : null
  );

  // Fetch applications using React Query
  const {
    data: applicationsData,
    isLoading: isLoadingApps,
    error: appsError,
    refetch: refetchApplications,
  } = useGetApplicationsByJobId(jobId as string);

  const updateStatusMutation = useUpdateApplicationStatus();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (jobData) {
      setJob(jobData);
      setError_(null);
    }
    if (jobError) {
      setError_(jobError.message);
    }
    if (!currentEmployerId || !token) {
      setError_('Employer ID or authentication token is missing.');
      return;
    }
  }, [token, currentEmployerId, jobData, jobError]);

  const handleUpdateStatus = async (
    applicationId: string,
    data: ApplicationStatusUpdate
  ) => {
    if (!token) {
      setSnackbar({
        open: true,
        message: 'Authentication error.',
        severity: 'error',
      });
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        applicationId,
        status: data.status,
        feedback: data.feedback,
      });

      // Refetch applications instead of reloading
      await refetchApplications();

      setSnackbar({
        open: true,
        message: 'Application status updated successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Failed to update application:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update application. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleBackToJobs = () => {
    navigate('/dashboard/jobs');
  };

  if (isLoadingJob) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading job details...</Typography>
      </Container>
    );
  }

  if (jobError) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{jobError.message}</Alert>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography variant="h5">Job not found.</Typography>
      </Container>
    );
  }
  const isPublisher = job.employerId.toString() === currentEmployerId;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {job.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Status: {job.status}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Description: {job.description || 'Not available'}
          <br />
          Location: {job.location || 'Not available'}
          <br />
          Salary Range:{' '}
          {job.minSalary && job.maxSalary
            ? `$${job.minSalary} - $${job.maxSalary}`
            : job.minSalary
              ? `$${job.minSalary}`
              : job.maxSalary
                ? `$${job.maxSalary}`
                : 'Not specified'}
        </Typography>
      </Paper>

      {isPublisher ? (
        <Paper elevation={2} sx={{ p: 3 }}>
          {appsError && (
            <Alert severity="error">
              Failed to load applications: {appsError.message}
            </Alert>
          )}
          {error_ && <Alert severity="error">{error_}</Alert>}

          <ApplicationsGrid
            jobId={jobId as string}
            jobTitle={job.title}
            applications={applicationsData || []}
            isLoading={isLoadingApps}
            onUpdateStatus={handleUpdateStatus}
            onBackToJobs={handleBackToJobs}
          />
        </Paper>
      ) : (
        <Alert severity="warning">
          You are not the publisher of this job post. Application management is
          disabled.
        </Alert>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default JobDetailDashboard;
