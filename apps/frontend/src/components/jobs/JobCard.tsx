// Component to display a single job in the list
import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { JobPost } from '../../types/job';
import BusinessIcon from '@mui/icons-material/Business'; // Example Icon
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface JobCardProps {
  job: JobPost;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const formatSalary = (min?: number, max?: number) => {
    if (min && max) return `$${min / 1000}k - $${max / 1000}k`;
    if (min) return `From $${min / 1000}k`;
    if (max) return `Up to $${max / 1000}k`;
    return 'Not specified';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted yesterday';
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Card sx={{ mb: 2, ':hover': { boxShadow: 3 } }}>
      <CardContent
        component={RouterLink}
        to={`/jobs/${job.id}`}
        sx={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ mr: 1 }}>
            <BusinessIcon />
          </Box>
          <Box>
            <Typography variant="h6" component="div">
              {job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {job.company}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 1,
            color: 'text.secondary',
          }}
        >
          <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">{job.location}</Typography>
          <AttachMoneyIcon fontSize="small" sx={{ ml: 1.5, mr: 0.5 }} />
          <Typography variant="body2">
            {formatSalary(job.minSalary, job.maxSalary)}
          </Typography>
          <Chip
            label={job.remote ? 'Remote' : 'On-site'}
            size="small"
            sx={{ ml: 1.5 }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 1,
            color: 'text.secondary',
          }}
        >
          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">
            {formatDate(job.postedDate)}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
          sx={{ mb: 1 }}
        >
          {job.description}
        </Typography>

        {job.ethicalTags && job.ethicalTags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
        )}
      </CardContent>
    </Card>
  );
};

export default JobCard;
