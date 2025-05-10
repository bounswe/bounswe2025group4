import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import { JobPost } from '../../types/job';
import { ApplicationStatus } from '../../types/application';
import { useGetJobById } from '../../services/jobs.service';
import { useGetApplicationsByJobId } from '../../services/applications.service';

const JobPostDetailDashboardView: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>();
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

  // States for managing feedback and status update for each application
  const [feedbackValues, setFeedbackValues] = useState<{
    [appId: string]: string;
  }>({});
  const [statusValues, setStatusValues] = useState<{
    [appId: string]: ApplicationStatus;
  }>({});
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);

  // Fetch applications using React Query
  const {
    data: applicationsData,
    isLoading: isLoadingApps,
    error: appsError,
  } = useGetApplicationsByJobId(jobId as string);

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

  // Initialize feedback and status values when applications data is loaded
  useEffect(() => {
    if (applicationsData) {
      const initialFeedback: { [appId: string]: string } = {};
      const initialStatus: { [appId: string]: ApplicationStatus } = {};
      applicationsData.forEach((app) => {
        initialFeedback[app.id] = app.feedback || '';
        initialStatus[app.id] = app.status || 'PENDING';
      });
      setFeedbackValues(initialFeedback);
      setStatusValues(initialStatus);
    }
  }, [applicationsData]);

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    setStatusValues((prev) => ({ ...prev, [appId]: newStatus }));
  };

  const handleFeedbackChange = (appId: string, text: string) => {
    setFeedbackValues((prev) => ({ ...prev, [appId]: text }));
  };

  const handleSubmitUpdate = async (appId: string) => {
    if (!token) {
      alert('Authentication error.');
      return;
    }
    setUpdatingAppId(appId);
    try {
      console.log(
        'Update logic to be implemented with React Query mutation hook.'
      );
      alert('Application update placeholder - implement with mutation hook!');
    } catch (err) {
      console.error('Failed to update application:', err);
      alert('Failed to update application. Please try again.');
    }
    setUpdatingAppId(null);
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
      <Button component={Link} to="/dashboard/jobs" sx={{ mb: 2 }}>
        &larr; Back to Dashboard
      </Button>
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

      {isPublisher && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Applications Received ({applicationsData?.length || 0})
          </Typography>
          {isLoadingApps && (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={24} />
              <Typography sx={{ ml: 1 }}>Loading applications...</Typography>
            </Box>
          )}
          {appsError && (
            <Alert severity="error">
              Failed to load applications: {appsError.message}
            </Alert>
          )}
          {error_ && <Alert severity="error">{error_}</Alert>}
          {!isLoadingApps &&
            !appsError &&
            applicationsData &&
            applicationsData.length === 0 && (
              <Typography>
                No applications received for this job yet.
              </Typography>
            )}
          {!isLoadingApps &&
            !appsError &&
            applicationsData &&
            applicationsData.length > 0 && (
              <List disablePadding>
                {applicationsData.map((app, index) => (
                  <React.Fragment key={app.id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{ flexDirection: 'column', py: 2 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                      >
                        <ListItemText
                          primary={`${app.applicantName}`}
                          secondary={`Applied on: ${new Date(app.submissionDate).toLocaleDateString()} - Current Status: ${statusValues[app.id] || app.status}`}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mt: 2,
                          width: '100%',
                        }}
                      >
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel id={`status-label-${app.id}`}>
                            Status
                          </InputLabel>
                          <Select
                            labelId={`status-label-${app.id}`}
                            value={
                              statusValues[app.id] || app.status || 'PENDING'
                            }
                            label="Status"
                            onChange={(e) =>
                              handleStatusChange(
                                app.id,
                                e.target.value as ApplicationStatus
                              )
                            }
                            disabled={updatingAppId === app.id}
                          >
                            {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                              <MenuItem key={s} value={s}>
                                {s}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Feedback (Optional)"
                          variant="outlined"
                          size="small"
                          fullWidth
                          multiline
                          value={feedbackValues[app.id] || ''}
                          onChange={(e) =>
                            handleFeedbackChange(app.id, e.target.value)
                          }
                          disabled={updatingAppId === app.id}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleSubmitUpdate(app.id)}
                          disabled={updatingAppId === app.id}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          {updatingAppId === app.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            'Update App'
                          )}
                        </Button>
                      </Box>
                    </ListItem>
                    {index < applicationsData.length - 1 && (
                      <Divider component="li" />
                    )}
                  </React.Fragment>
                ))}
              </List>
            )}
        </Paper>
      )}
      {!isPublisher && (
        <Alert severity="warning">
          You are not the publisher of this job post. Application management is
          disabled.
        </Alert>
      )}
    </Container>
  );
};

export default JobPostDetailDashboardView;
