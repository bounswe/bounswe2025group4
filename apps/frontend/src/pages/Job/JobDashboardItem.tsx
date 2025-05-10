import React from 'react';
import { Link } from 'react-router-dom';
import {
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import { JobPost } from '../../types/job';
import { useGetApplicationsByJobId } from '../../services/applications.service'; // Adjust path as needed

interface JobDashboardItemProps {
  job: JobPost;
}

const JobDashboardItem: React.FC<JobDashboardItemProps> = ({ job }) => {
  // Convert job.id to string for the hook
  const {
    data: applications,
    isLoading,
    error,
  } = useGetApplicationsByJobId(String(job.id));

  const applicationCount = applications?.length ?? 0;

  return (
    <ListItem
      component={Link}
      to={`/dashboard/jobs/${job.id}`} // Link to specific job detail page
      sx={{ p: 2, '&:hover': { backgroundColor: 'action.hover' } }}
    >
      <ListItemText
        primary={job.title}
        secondary={
          <Box
            component="span"
            sx={{ display: 'flex', flexDirection: 'column' }}
          >
            <Typography component="span" variant="body2">
              Applications:{' '}
              {isLoading ? (
                <CircularProgress size={14} />
              ) : error ? (
                'Error'
              ) : (
                applicationCount
              )}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
};

export default JobDashboardItem;
