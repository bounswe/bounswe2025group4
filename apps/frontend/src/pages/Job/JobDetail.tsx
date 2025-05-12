import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import ApplicationForm from './ApplicationForm';
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
} from '@mui/material';
import { JobPost } from '../../types/job';
import { useGetJobById } from '../../services/jobs.service';
import { useGetApplicationsByUserId } from '../../services/applications.service';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import { Application } from '../../types/application';

// Define a type for application data (can be moved to a shared types file)
interface ApplicationData {
  jobId: string;
  name: string;
  email: string;
  resume: File;
  coverLetter?: string;
}

const JobDetail: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [userApplication, setUserApplication] = useState<Application | null>(
    null
  );

  const authContext = useContext(AuthContext) as AuthContextType;
  const userId = authContext?.id;

  if (!jobId) {
    setError('Job ID is missing.');
    setLoading(false);
    window.location.href = '/jobs';
  }

  const { data: jobData } = useGetJobById(jobId as string);
  const { data: userApplications } = useGetApplicationsByUserId(userId);

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

  const handleApplyClick = () => {
    setShowApplicationForm(true);
  };

  const handleApplicationClose = () => {
    setShowApplicationForm(false);
  };

  const handleApplicationSubmit = (applicationData: ApplicationData) => {
    console.log('Submitting application:', applicationData);
    // Consider using MUI Snackbar for success messages
    alert(`Application for ${job?.title} submitted successfully!`);
    setShowApplicationForm(false);
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
      <Paper
        elevation={3}
        sx={{
          p: 3,
          opacity: showApplicationForm ? 0.3 : 1,
          transition: 'opacity 0.3s',
        }}
      >
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
        {/* <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Posted on: {new Date(job.postedDate).toLocaleDateString()}
        </Typography> */}

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
                {job.ethicalTags.map((policy) => (
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
            >
              Apply for this Job
            </Button>
          )}
        </Box>
      </Paper>

      {jobId && !userApplication && (
        <ApplicationForm
          jobId={jobId}
          open={showApplicationForm}
          onClose={handleApplicationClose}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </Container>
  );
};

export default JobDetail;
