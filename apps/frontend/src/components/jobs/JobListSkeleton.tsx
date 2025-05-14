// Skeleton loader for the JobList page
import React from 'react';
import { Box, Skeleton } from '@mui/material';

interface JobListSkeletonProps {
  count?: number;
}

const JobListSkeleton: React.FC<JobListSkeletonProps> = ({ count = 5 }) => {
  return (
    <Box sx={{ width: '100%' }}>
      {[...Array(count)].map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" sx={{ fontSize: '1.25rem' }} width="60%" />
            <Skeleton
              variant="text"
              sx={{ fontSize: '0.875rem' }}
              width="40%"
            />
            <Box sx={{ display: 'flex', mt: 1 }}>
              <Skeleton
                variant="text"
                sx={{ fontSize: '0.875rem' }}
                width="25%"
              />
              <Skeleton
                variant="text"
                sx={{ fontSize: '0.875rem', ml: 2 }}
                width="30%"
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={100} height={24} />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default JobListSkeleton;
