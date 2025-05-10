import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { AuthContext, AuthContextType } from '../../contexts/AuthContext'; // Adjust path
import { JobPost, JobApplication } from '../../types/job'; // Updated import

// Placeholder for Application data type - REMOVE THIS
// interface JobApplication { ... }

// Mock API call to fetch job details by ID
const fetchJobDetailsAPI = async (
  jobId: string,
  token: string
): Promise<JobPost | null> => {
  console.log(
    `Fetching job details for ID: ${jobId}, token: ${token ? 'present' : 'absent'}`
  );
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 700));
  // Replace with actual API call: fetch(`/api/jobs/${jobId}`, { headers: { Authorization... } })
  // Mock data - find a job from a mock list or return a specific one
  const mockJobs: JobPost[] = [
    {
      id: 'job1',
      title: 'Senior Software Engineer',
      status: 'open',
      applicationCount: 15,
    },
    {
      id: 'job2',
      title: 'Lead Product Manager',
      status: 'closed',
      applicationCount: 35,
    },
  ];
  const job = mockJobs.find((j) => j.id === jobId);
  return job || null;
};

// Mock API call to fetch applications for a job
const fetchJobApplicationsAPI = async (
  jobId: string,
  token: string
): Promise<JobApplication[]> => {
  console.log(
    `Fetching applications for job ID: ${jobId}, token: ${token ? 'present' : 'absent'}`
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Replace with actual API call: fetch(`/api/jobs/${jobId}/applications`, { headers: { Authorization... } })
  // Mock data
  if (jobId === 'job1') {
    return [
      {
        id: 'app1',
        jobId: jobId,
        applicantName: 'Alice Wonderland',
        applicantEmail: 'alice@example.com',
        applicationDate: '2023-10-01',
        status: 'Pending',
        resumeUrl: '#',
      },
      {
        id: 'app2',
        jobId: jobId,
        applicantName: 'Bob The Builder',
        applicantEmail: 'bob@example.com',
        applicationDate: '2023-10-03',
        status: 'Viewed',
        resumeUrl: '#',
      },
    ];
  }
  return [];
};

// Mock API call to update application status and feedback
const updateApplicationAPI = async (
  applicationId: string,
  status: JobApplication['status'],
  feedback: string | undefined,
  token: string
) => {
  console.log(
    `Updating application ${applicationId}: Status - ${status}, Feedback - ${feedback}, token: ${token ? 'present' : 'absent'}`
  );
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Replace with actual API call: fetch(`/api/applications/${applicationId}`, { method: 'PATCH', body: JSON.stringify({ status, feedback }), headers: { Authorization... } })
  return { success: true, applicationId, status, feedback };
};

const JobPostDetailDashboardView: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext) as AuthContextType;
  // Assume employerId is part of user object in AuthContext or fetched separately
  // For this mock, we will assume the current user is the publisher if the job exists.
  // In a real app, job details should include employerId to verify ownership.
  const currentEmployerId = authContext?.id;
  const token = authContext?.token;

  const [job, setJob] = useState<JobPost | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for managing feedback and status update for each application
  const [feedbackValues, setFeedbackValues] = useState<{
    [appId: string]: string;
  }>({});
  const [statusValues, setStatusValues] = useState<{
    [appId: string]: JobApplication['status'];
  }>({});
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !token) {
      setError('Job ID or authentication token is missing.');
      setLoadingJob(false);
      return;
    }
    setLoadingJob(true);
    fetchJobDetailsAPI(jobId, token)
      .then((data) => {
        if (data) {
          setJob(data);
          // TODO: Add check here: if (data.employerId !== currentEmployerId) { setError("Access Denied"); return; }
          setLoadingApps(true);
          return fetchJobApplicationsAPI(jobId, token);
        }
        throw new Error('Job not found.');
      })
      .then((appsData) => {
        setApplications(appsData);
        // Initialize status and feedback states from fetched applications
        const initialFeedback: { [key: string]: string } = {};
        const initialStatus: { [key: string]: JobApplication['status'] } = {};
        appsData.forEach((app) => {
          initialFeedback[app.id] = app.feedback || '';
          initialStatus[app.id] = app.status;
        });
        setFeedbackValues(initialFeedback);
        setStatusValues(initialStatus);
      })
      .catch((err) => {
        console.error('Error fetching job details or applications:', err);
        setError(err.message || 'Failed to load job data.');
      })
      .finally(() => {
        setLoadingJob(false);
        setLoadingApps(false);
      });
  }, [jobId, token, currentEmployerId]);

  const handleStatusChange = (
    appId: string,
    newStatus: JobApplication['status']
  ) => {
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
      await updateApplicationAPI(
        appId,
        statusValues[appId],
        feedbackValues[appId],
        token
      );
      // Update local state to reflect changes immediately (optimistic update can be done here too)
      setApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === appId
            ? {
                ...app,
                status: statusValues[appId],
                feedback: feedbackValues[appId],
              }
            : app
        )
      );
      alert('Application updated successfully!'); // Replace with Snackbar
    } catch (err) {
      console.error('Failed to update application:', err);
      alert('Failed to update application. Please try again.'); // Replace with Snackbar
    }
    setUpdatingAppId(null);
  };

  if (loadingJob) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading job details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
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

  // TODO: Add a real check to ensure current user is the publisher.
  // const isPublisher = job.employerId === currentEmployerId;
  const isPublisher = true; // Placeholder for publisher check

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
          Details will go here (e.g., description, location etc. fetched from
          job data)
        </Typography>
        {/* TODO: Display more job details from the 'job' object */}
      </Paper>

      {isPublisher && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Applications Received ({applications.length})
          </Typography>
          {loadingApps && (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={24} />
              <Typography sx={{ ml: 1 }}>Loading applications...</Typography>
            </Box>
          )}
          {!loadingApps && applications.length === 0 && (
            <Typography>No applications received for this job yet.</Typography>
          )}
          {!loadingApps && applications.length > 0 && (
            <List disablePadding>
              {applications.map((app, index) => (
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
                        primary={`${app.applicantName} (${app.applicantEmail})`}
                        secondary={`Applied on: ${new Date(app.applicationDate).toLocaleDateString()} - Current Status: ${statusValues[app.id]}`}
                      />
                      {app.resumeUrl && (
                        <Button
                          size="small"
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Resume
                        </Button>
                      )}
                    </Box>
                    {app.coverLetter && (
                      <Typography
                        variant="body2"
                        sx={{ my: 1, pl: 0, fontStyle: 'italic' }}
                      >
                        {app.coverLetter}
                      </Typography>
                    )}

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
                          value={statusValues[app.id] || 'Pending'}
                          label="Status"
                          onChange={(e) =>
                            handleStatusChange(
                              app.id,
                              e.target.value as JobApplication['status']
                            )
                          }
                          disabled={updatingAppId === app.id}
                        >
                          {[
                            'Pending',
                            'Viewed',
                            'Interviewing',
                            'Offered',
                            'Accepted',
                            'Rejected',
                          ].map((s) => (
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
                  {index < applications.length - 1 && (
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
