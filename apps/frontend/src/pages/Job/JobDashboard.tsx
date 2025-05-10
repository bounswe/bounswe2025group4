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
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext'; // Adjust path and ensure AuthContextType is exported

// Placeholder for actual job data type - align with your backend/API response
export interface JobPost {
  id: string;
  title: string;
  status: 'open' | 'closed' | 'draft'; // Example statuses
  applicationCount: number;
  // Add other relevant properties: companyName, location, datePosted, etc.
}

// Placeholder for API service to fetch employer's jobs
// In a real app, this would be in a services/api.ts file and use TanStack Query
const fetchEmployerJobs = async (
  employerId: string,
  token: string
): Promise<JobPost[]> => {
  console.log(
    `Fetching jobs for employer: ${employerId} using token: ${token ? 'present' : 'absent'}`
  );
  // Simulate API call - Replace with actual fetch
  // const response = await fetch(`/api/employers/${employerId}/jobs`, {
  //   headers: { 'Authorization': `Bearer ${token}` },
  // });
  // if (!response.ok) {
  //   throw new Error('Failed to fetch jobs');
  // }
  // return response.json();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
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
    {
      id: 'job3',
      title: 'Junior UX Designer',
      status: 'open',
      applicationCount: 5,
    },
  ];
};

const JobDashboardPage: React.FC = () => {
  const authContext = useContext(AuthContext) as AuthContextType; // Added type assertion for simplicity
  const employerId = authContext?.id; // Assuming id is the employer's ID
  const token = authContext?.token;

  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employerId && token) {
      setLoading(true);
      setError(null);
      fetchEmployerJobs(employerId, token)
        .then((data) => {
          setJobs(data);
        })
        .catch((err) => {
          console.error('Error fetching employer jobs:', err);
          setError(err.message || 'Failed to load jobs. Please try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
    } else if (!employerId) {
      setError('Employer ID not found. Cannot fetch jobs.');
      setLoading(false);
    }
  }, [employerId, token]);

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
          <Typography>{error}</Typography>
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
                <ListItem
                  component={Link}
                  to={`/dashboard/jobs/${job.id}`} // Link to specific job detail page
                  sx={{ p: 2, '&:hover': { backgroundColor: 'action.hover' } }} // Removed 'button', added hover style
                >
                  <ListItemText
                    primary={job.title}
                    secondary={`Status: ${job.status} - Applications: ${job.applicationCount}`}
                  />
                </ListItem>
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
