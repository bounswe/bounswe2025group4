import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Snackbar,
} from '@mui/material';
import { JobPost } from '../../types/job';
import { useGetJobById } from '../../services/jobs.service';
import {
  useGetApplicationsByUserId,
  useSubmitApplication,
} from '../../services/applications.service';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import { Application } from '../../types/application';
import { useCurrentUser } from '../../services/user.service';

const JobDetail: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userApplication, setUserApplication] = useState<Application | null>(
    null
  );

  const authContext = useContext(AuthContext) as AuthContextType;
  const userId = authContext?.id;
  const { data: currentUser } = useCurrentUser();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const submitApplicationMutation = useSubmitApplication();

  if (!jobId) {
    setError('Job ID is missing.');
    setLoading(false);
    window.location.href = '/jobs';
  }

  const { data: jobData } = useGetJobById(jobId as string);
  const { data: userApplications, refetch: refetchUserApplications } =
    useGetApplicationsByUserId(userId);

  useEffect(() => {
    if (jobData) {
      setJob(jobData);
      setLoading(false);
      setError(null);
    }
  }, [jobData]);

  useEffect(() => {
    if (userApplications && jobId) {
      const application = userApplications.find(
        (app) => app.jobPostingId.toString() === jobId
      );
      if (application) {
        setUserApplication(application);
      }
    }
  }, [userApplications, jobId]);

  const handleApplyClick = async () => {
    if (!jobId || !userId || !currentUser) {
      setError('Job ID, user ID, or current user is missing.');
      setLoading(false);
      window.location.href = '/jobs';
      return;
    }

    try {
      await submitApplicationMutation.mutateAsync({
        jobSeekerId: parseInt(userId),
        jobPostingId: parseInt(jobId),
      });
      setSnackbar({
        open: true,
        message: `Application for ${job?.title} submitted successfully!`,
        severity: 'success',
      });
      // Refetch user applications to show the new status
      refetchUserApplications();
    } catch (error) {
      console.error('Failed to submit application:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit application. Please try again.',
        severity: 'error',
      });
    }
  };

  if (loading) {
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
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">Job details not available.</Alert>
      </Container>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {job.title}
        </Typography>
        <Typography
          variant="h6"
          component="h2"
          color="text.secondary"
          gutterBottom
        >
          {job.company} - {job.location}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Posted on: {new Date(job.postedDate).toLocaleDateString()}
        </Typography>

        {userApplication && (
          <Box sx={{ my: 2 }}>
            <Alert
              severity={
                getStatusColor(userApplication.status) as
                  | 'success'
                  | 'error'
                  | 'warning'
                  | 'info'
              }
              sx={{ mb: 2 }}
            >
              <Typography variant="subtitle1">
                Your application status:{' '}
                <strong>{userApplication.status}</strong>
              </Typography>
              <Typography variant="body2">
                Applied on:{' '}
                {new Date(userApplication.submissionDate).toLocaleDateString()}
              </Typography>
              {userApplication.feedback && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Feedback:</strong> {userApplication.feedback}
                </Typography>
              )}
            </Alert>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" component="h3" gutterBottom>
            Job Description
          </Typography>
          <Typography variant="body1" component="p">
            {job.description}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" component="h3" gutterBottom>
            Details
          </Typography>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body1">
                <strong>Remote:</strong> {job.remote ? 'Yes' : 'No'}
              </Typography>
            </Grid>
            {job.minSalary !== undefined && job.maxSalary !== undefined && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body1">
                  <strong>Salary:</strong>{' '}
                  {`${job.minSalary} - ${job.maxSalary}`}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {job.ethicalTags && job.ethicalTags.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ my: 2 }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Ethical Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {job.ethicalTags.split(',').map((policy) => (
                  <Chip
                    key={policy}
                    label={policy.replace('_', ' ')}
                    size="small"
                    variant="outlined"
                    color="success"
                  />
                ))}
              </Box>
            </Box>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          {userApplication ? (
            <Alert severity="info" sx={{ width: '100%', textAlign: 'center' }}>
              You have already applied to this job.
            </Alert>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleApplyClick}
              disabled={submitApplicationMutation.isPending}
            >
              {submitApplicationMutation.isPending
                ? 'Applying...'
                : 'Apply for this Job'}
            </Button>
          )}
        </Box>
      </Paper>

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

export default JobDetail;
