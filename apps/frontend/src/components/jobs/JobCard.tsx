// Component to display a single job in the list
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Job } from '../../types/job';
import BusinessIcon from '@mui/icons-material/Business'; // Example Icon
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const formatSalary = (min?: number, max?: number) => {
    if (min && max) return `$${min / 1000}k - $${max / 1000}k`;
    if (min) return `From $${min / 1000}k`;
    if (max) return `Up to $${max / 1000}k`;
    return 'Not specified';
  };

  return (
    <Card sx={{ mb: 2, ':hover': { boxShadow: 3 } }}>
      <CardContent
        component={RouterLink}
        to={`/jobs/${job.id}`}
        sx={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar
            src={job.company.logoUrl}
            alt={job.company.name}
            sx={{ mr: 1, width: 40, height: 40 }}
          >
            <BusinessIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" component="div">
              {job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {job.company.name}
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
            {formatSalary(job.salaryMin, job.salaryMax)}
          </Typography>
          <Chip label={job.employmentType} size="small" sx={{ ml: 1.5 }} />
        </Box>

        {/* Consider showing a snippet of the description or key skills */}
        {/* <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
          {job.description}
        </Typography> */}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {job.ethicalPolicies.map((policy) => (
            <Chip
              key={policy}
              label={policy.replace('-', ' ')}
              size="small"
              variant="outlined"
              color="success"
            />
          ))}
        </Box>

        {/* Add Posted Date */}
        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          sx={{ mt: 1, textAlign: 'right' }}
        >
          Posted: {new Date(job.postedDate).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default JobCard;
