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
  MenuItem,
  Select,
  Button,
  FormControl,
  InputLabel,
} from '@mui/material';
import { JobFilters } from '../../types/job';

interface JobFilterSidebarProps {
  filters: JobFilters;
  onFiltersChange: (newFilters: Partial<JobFilters>) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isFetching: boolean;
}

const JobFilterSidebar: React.FC<JobFilterSidebarProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isFetching,
}) => {
  const handleSalaryChange = (event: Event, newValue: number | number[]) => {
    event.preventDefault();
    if (Array.isArray(newValue)) {
      onFiltersChange({ minSalary: newValue[0], maxSalary: newValue[1] });
    }
  };

  // Placeholder ethical policies
  const ethicalPoliciesOptions = [
    'fair_wage',
    'diversity',
    'sustainability',
    'wellbeing',
    'transparency',
  ];

  const handlePolicyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const currentPolicies = filters.ethicalTags || [];
    const newPolicies = checked
      ? [...currentPolicies, name]
      : currentPolicies.filter((policy) => policy !== name);
    onFiltersChange({ ethicalTags: newPolicies });
  };

  return (
    <Box sx={{ p: 2, borderRight: 1, borderColor: 'divider', minWidth: 240 }}>
      <FormControl>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>

        {/* Search Term */}
        <TextField
          label="Search Jobs" // Added search input
          variant="outlined"
          fullWidth
          size="small"
          value={filters.title || ''}
          onChange={(e) =>
            onFiltersChange({ title: e.target.value || undefined })
          }
          sx={{ mb: 2 }}
        />

        {/* Salary Range */}
        <Typography gutterBottom>Monthly Salary Range ($)</Typography>
        <Slider
          value={[filters.minSalary ?? 0, filters.maxSalary ?? 15000]} // Example range 0-200k
          onChange={handleSalaryChange}
          valueLabelDisplay="auto"
          min={0}
          max={15000}
          step={100}
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
                  checked={filters.ethicalTags?.includes(policy) ?? false}
                  onChange={handlePolicyChange}
                  name={policy}
                />
              }
              label={policy
                .replace('_', ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())} // Basic formatting
            />
          ))}
        </FormGroup>

        {/* Company Filter (Placeholder - needs data) */}
        <TextField
          label="Company Name"
          variant="outlined"
          fullWidth
          size="small"
          value={filters.companyName || ''}
          onChange={(e) =>
            onFiltersChange({ companyName: e.target.value || undefined })
          }
          sx={{ mb: 2 }}
        />

        {/* Remote Work Preference */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="remote-work-preference-label">
            Remote Work Preference
          </InputLabel>
          <Select
            labelId="remote-work-preference-label"
            label="Remote Work Preference"
            size="small"
            value={
              filters.isRemote === undefined
                ? 'Any'
                : filters.isRemote
                  ? 'Remote'
                  : 'Onsite'
            }
            onChange={(e) => {
              const value = e.target.value;
              onFiltersChange({
                isRemote:
                  value === 'Remote'
                    ? true
                    : value === 'Onsite'
                      ? false
                      : undefined,
              });
            }}
          >
            <MenuItem value="Any">Does not matter</MenuItem>
            <MenuItem value="Remote">Remote</MenuItem>
            <MenuItem value="Onsite">On-site</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={onApplyFilters}
          sx={{ mt: 2, width: '100%' }}
          disabled={isFetching}
        >
          Apply Filters
        </Button>
        <Button
          variant="outlined"
          onClick={onClearFilters}
          sx={{ mt: 1, width: '100%' }}
          disabled={isFetching}
        >
          Clear All Filters
        </Button>
      </FormControl>
    </Box>
  );
};

export default JobFilterSidebar;
