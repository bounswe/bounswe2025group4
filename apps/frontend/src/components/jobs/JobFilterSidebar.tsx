// Placeholder for Job Filter Sidebar component
import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Checkbox,
  FormGroup,
  FormControlLabel,
  TextField,
  Button,
} from '@mui/material';
import { JobFilters } from '../../types/job';

interface JobFilterSidebarProps {
  filters: JobFilters;
  onFiltersChange: (newFilters: Partial<JobFilters>) => void;
  // TODO: Add available options for filters (e.g., list of companies, policies)
}

const JobFilterSidebar: React.FC<JobFilterSidebarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleSalaryChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      onFiltersChange({ minSalary: newValue[0], maxSalary: newValue[1] });
    }
  };

  // Placeholder ethical policies
  const ethicalPoliciesOptions = [
    'fair-wage',
    'equal-opportunity',
    'sustainability',
  ];

  const handlePolicyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const currentPolicies = filters.ethicalPolicies || [];
    const newPolicies = checked
      ? [...currentPolicies, name]
      : currentPolicies.filter((policy) => policy !== name);
    onFiltersChange({ ethicalPolicies: newPolicies });
  };

  return (
    <Box sx={{ p: 2, borderRight: 1, borderColor: 'divider', minWidth: 240 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>

      {/* Search Term */}
      <TextField
        label="Search Jobs" // Added search input
        variant="outlined"
        fullWidth
        size="small"
        value={filters.query || ''}
        onChange={(e) =>
          onFiltersChange({ query: e.target.value || undefined })
        }
        sx={{ mb: 2 }}
      />

      {/* Salary Range */}
      <Typography gutterBottom>Salary Range ($k)</Typography>
      <Slider
        value={[filters.minSalary ?? 0, filters.maxSalary ?? 200]} // Example range 0-200k
        onChange={handleSalaryChange}
        valueLabelDisplay="auto"
        min={0}
        max={200}
        step={10}
        sx={{ mb: 2 }}
      />

      {/* Ethical Policies */}
      <Typography gutterBottom>Ethical Policies</Typography>
      <FormGroup sx={{ mb: 2 }}>
        {ethicalPoliciesOptions.map((policy) => (
          <FormControlLabel
            key={policy}
            control={
              <Checkbox
                checked={filters.ethicalPolicies?.includes(policy) ?? false}
                onChange={handlePolicyChange}
                name={policy}
              />
            }
            label={policy
              .replace('-', ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase())} // Basic formatting
          />
        ))}
      </FormGroup>

      {/* Company Filter (Placeholder - needs data) */}
      <Typography gutterBottom>Company</Typography>
      <TextField
        label="Company Name" // Simple text filter for now
        variant="outlined"
        fullWidth
        size="small"
        // value={filters.companyId || ''} // Need to map ID/Name
        // onChange={(e) => onFiltersChange({ companyId: e.target.value || undefined })}
        disabled // Needs actual company list/autocomplete
        sx={{ mb: 2 }}
      />

      {/* Add more filters as needed (Location, Employment Type) */}

      <Button variant="outlined" onClick={() => onFiltersChange({})}>
        {' '}
        {/* Basic Reset */} Reset Filters
      </Button>
    </Box>
  );
};

export default JobFilterSidebar;
