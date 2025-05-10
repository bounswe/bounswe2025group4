import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  CircularProgress,
  List,
  Divider,
} from '@mui/material';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext'; // Adjust path and ensure AuthContextType is exported
import { JobPost } from '../../types/job';
import { useGetJobByEmployer } from '../../services/jobs.service';
import JobDashboardItem from './JobDashboardItem'; // Import the new component

const JobDashboardPage: React.FC = () => {
  const authContext = useContext(AuthContext) as AuthContextType; // Added type assertion for simplicity
  const employerId = authContext?.id; // Assuming id is the employer's ID
  const token = authContext?.token;

  const { data, isLoading, error } = useGetJobByEmployer(employerId ?? '');
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(isLoading);
  const [error_, setError_] = useState<string | null>(
    error ? error.message : null
  );

  useEffect(() => {
    if (employerId && token && data) {
      setLoading(false);
      setJobs(data);
    } else if (!token) {
      setError_('Authentication token not found. Please log in.');
      setLoading(false);
    } else if (!employerId) {
      setError_('Employer ID not found. Cannot fetch jobs.');
      setLoading(false);
    }
  }, [employerId, token, data]);

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
        <Typography sx={{ ml: 2 }}>Loading Job Dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          My Job Posts
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/dashboard/jobs/create" // Ensure this route is defined for job creation
        >
          Create New Job Post
        </Button>
      </Box>

      {error && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: 'error.light',
            color: 'error.contrastText',
          }}
        >
          <Typography>{error_}</Typography>
        </Paper>
      )}

      {!error && jobs.length === 0 && !loading && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No job posts found.</Typography>
          <Typography>Click "Create New Job Post" to get started.</Typography>
        </Paper>
      )}

      {!error && jobs.length > 0 && (
        <Paper elevation={2} sx={{ p: 0 }}>
          {' '}
          {/* Removed padding from Paper to allow List to control it */}
          <List disablePadding>
            {jobs.map((job, index) => (
              <React.Fragment key={job.id}>
                <JobDashboardItem job={job} />
                {index < jobs.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default JobDashboardPage;
