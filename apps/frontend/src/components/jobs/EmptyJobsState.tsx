// Component to display when no jobs match the filters
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff'; // Example Icon

interface EmptyJobsStateProps {
  onClearFilters?: () => void;
}

const EmptyJobsState: React.FC<EmptyJobsStateProps> = ({ onClearFilters }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        textAlign: 'center',
        height: '50vh', // Adjust height as needed
      }}
    >
      <SearchOffIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        No Jobs Found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Try adjusting your filters or broadening your search.
      </Typography>
      {onClearFilters && (
        <Button variant="outlined" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </Box>
  );
};

export default EmptyJobsState;
