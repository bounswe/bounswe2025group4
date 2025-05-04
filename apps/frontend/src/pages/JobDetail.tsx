// Page component for displaying job details and application form
import React from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Avatar,
  Link as MuiLink,
  Button,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useParams,
  Link as RouterLink,
  useLoaderData,
  ActionFunctionArgs,
  redirect,
  LoaderFunctionArgs,
} from 'react-router-dom';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { fetchJobById, submitApplication } from '../api/jobs';
import { Job, ApplicationData, JobFilters } from '../types/job';
import ApplyForm from '../components/jobs/ApplyForm';
// import useNotificationStore from '../stores/notificationStore'; // For showing success/error toasts
// import { useAuth } from '../contexts/AuthContext'; // To check if user is logged in

// --- React Router Loader ---
// Fetches job data before the component renders
export const jobDetailLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<{
  job: Job | null;
  queryKey: (string | JobFilters)[];
}> => {
  const jobId = params.id;
  if (!jobId) {
    throw new Response('Not Found', { status: 404 });
  }
  // We return the queryKey so the component can easily use it
  const queryKey = ['job', jobId];
  // Try to fetch, return null if not found (component will handle display)
  try {
    const job = await fetchJobById(jobId);
    return { job, queryKey };
  } catch (error) {
    console.error('Error loading job:', error);
    // Optionally check error type/status code
    // throw new Response("Not Found", { status: 404 }); // Or let component handle null
    return { job: null, queryKey };
  }
};

// --- React Router Action ---
// Handles form submission for job application
export const applyAction = async ({ request, params }: ActionFunctionArgs) => {
  const jobId = params.id;
  if (!jobId) {
    return { error: 'Job ID is missing' };
  }

  // TODO: Check if user is authenticated via AuthContext
  // const { isAuthenticated } = useAuth(); // Won't work directly in action
  // Need a way to access auth state here, maybe via loader data or a global state check?
  // if (!isAuthenticated) {
  //     // Redirect to login or return error
  //     // return redirect('/login?redirectTo=' + request.url);
  //     return { error: 'You must be logged in to apply.' };
  // }

  const formData = await request.formData();
  const applicationData: ApplicationData = {
    coverLetter: formData.get('coverLetter') as string,
    // Handle file upload if present
    resumeFile:
      formData.get('resumeFile') instanceof File
        ? (formData.get('resumeFile') as File)
        : undefined,
  };

  try {
    // If using FormData in API:
    // await submitApplication(jobId, formData);

    // If using JSON (ensure API handles file upload separately or via URL):
    await submitApplication(jobId, applicationData);

    // Invalidate relevant queries? Maybe user applications query?
    // queryClient.invalidateQueries(['userApplications']);

    // useNotificationStore.getState().addNotification('Application submitted successfully!', 'success');
    // Return success, the useFetcher in ApplyForm will see this
    return { success: true };
  } catch (error: any) {
    console.error('Application submission failed:', error);
    // useNotificationStore.getState().addNotification(`Error: ${error.message || 'Failed to submit application'}`, 'error');
    return { error: error.message || 'Failed to submit application' };
  }
};

// --- JobDetail Page Component ---
const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const initialData = useLoaderData() as Awaited<
    ReturnType<typeof jobDetailLoader>
  >;
  // const { user } = useAuth(); // Get user for conditional rendering

  // Use query, leveraging initial data from loader
  const {
    data: job,
    isLoading,
    isError,
    error,
  } = useQuery<Job | null>({
    queryKey: initialData.queryKey,
    queryFn: () => fetchJobById(jobId!), // queryFn only runs if data is missing/stale
    initialData: initialData.job,
    enabled: !!jobId, // Only run if jobId exists
    // staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading && !initialData.job) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading job details...</Typography>
      </Container>
    );
  }

  if (isError || !job) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading job details:{' '}
          {error instanceof Error
            ? error.message
            : 'Job not found or an error occurred.'}
        </Alert>
        <Button
          component={RouterLink}
          to="/jobs"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Job List
        </Button>
      </Container>
    );
  }

  const formatSalary = (min?: number, max?: number) => {
    if (min && max) return `$${min / 1000}k - $${max / 1000}k`;
    if (min) return `From $${min / 1000}k`;
    if (max) return `Up to $${max / 1000}k`;
    return 'Not specified';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        component={RouterLink}
        to="/jobs"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Back to Job List
      </Button>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
          <Avatar
            src={job.company.logoUrl}
            alt={job.company.name}
            sx={{ width: 60, height: 60, mr: 2 }}
          >
            <BusinessIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {job.title}
            </Typography>
            <MuiLink
              component={RouterLink}
              to={`/company/${job.company.slug}`}
              variant="h6"
              color="text.secondary"
              sx={{ textDecoration: 'none' }}
            >
              {job.company.name}
            </MuiLink>
          </Box>
          {/* Maybe add a save/bookmark button here? */}
        </Box>

        {/* Key Details */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
            color: 'text.secondary',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body1">{job.location}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body1">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </Typography>
          </Box>
          <Chip label={job.employmentType} size="small" />
          <Typography variant="caption">
            Posted: {new Date(job.postedDate).toLocaleDateString()}
          </Typography>
        </Box>

        {/* Ethical Policies */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Ethical Policies:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {job.ethicalPolicies.map((policy) => (
              <Chip
                key={policy}
                label={policy.replace('-', ' ')}
                size="small"
                variant="outlined"
                color="success"
              />
            ))}
            {job.ethicalPolicies.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No specific policies listed.
              </Typography>
            )}
          </Box>
        </Box>

        {/* Description */}
        <Typography variant="h6" gutterBottom>
          Job Description
        </Typography>
        {/* TODO: Consider using a markdown renderer if description is markdown */}
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 4 }}>
          {job.description}
        </Typography>

        {/* Apply Form - Conditionally render based on auth? */}
        {/* {user ? ( */}
        <ApplyForm jobId={job.id} />
        {/* ) : ( */}
        {/*    <Alert severity="info" sx={{ mt: 3 }}> */}
        {/*        <MuiLink component={RouterLink} to={"/login?redirectTo=" + window.location.pathname}>Log in</MuiLink> or <MuiLink component={RouterLink} to="/register">Register</MuiLink> to apply. */}
        {/*    </Alert> */}
        {/* )} */}
      </Paper>
    </Container>
  );
};

export default JobDetailPage;
