// Page component for displaying the list of jobs
import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Pagination,
  Typography,
  Alert,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { fetchJobs } from '../api/jobs';
import { JobFilters } from '../types/job';
import JobFilterSidebar from '../components/jobs/JobFilterSidebar';
import JobCard from '../components/jobs/JobCard';
import JobListSkeleton from '../components/jobs/JobListSkeleton';
import EmptyJobsState from '../components/jobs/EmptyJobsState';
import { useDebounce } from '../hooks/useDebounce';

// Function to parse search params into filters
const parseFiltersFromParams = (searchParams: URLSearchParams): JobFilters => {
  const filters: JobFilters = {};
  // Simple parsing, needs refinement for arrays/numbers
  if (searchParams.has('query')) filters.query = searchParams.get('query')!;
  if (searchParams.has('minSalary'))
    filters.minSalary = parseInt(searchParams.get('minSalary')!, 10);
  if (searchParams.has('maxSalary'))
    filters.maxSalary = parseInt(searchParams.get('maxSalary')!, 10);
  if (searchParams.has('ethicalPolicies'))
    filters.ethicalPolicies = searchParams.getAll('ethicalPolicies');
  // Add other filters...
  if (searchParams.has('page'))
    filters.page = parseInt(searchParams.get('page')!, 10);
  return filters;
};

// Function to update search params from filters
const updateSearchParams = (filters: JobFilters, setSearchParams: Function) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else {
        params.set(key, String(value));
      }
    }
  });
  setSearchParams(params, { replace: true }); // Use replace to avoid history buildup
};

const JobListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localFilters, setLocalFilters] = useState<JobFilters>(() => {
    const parsed = parseFiltersFromParams(searchParams);
    // Ensure defaults if not present
    return {
      limit: 10,
      ...parsed,
      page: parsed.page ?? 1,
    };
  });

  // Debounce filters that trigger frequent re-fetches (like text input)
  const debouncedFilters = useDebounce(localFilters, 500);

  const queryKey = useMemo(
    () => ['jobs', debouncedFilters],
    [debouncedFilters]
  );

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey,
    queryFn: () => fetchJobs(debouncedFilters),
    placeholderData: (previousData) => previousData, // Keep showing old data while fetching new
    // staleTime: 5 * 60 * 1000, // 5 minutes, adjust as needed
  });

  const jobs = data?.jobs ?? [];
  const totalCount = data?.totalCount ?? 0;
  const itemsPerPage = debouncedFilters.limit ?? 10;
  const pageCount = Math.ceil(totalCount / itemsPerPage);
  const currentPage = debouncedFilters.page ?? 1;

  const handleFiltersChange = useCallback(
    (newFilterValues: Partial<JobFilters>) => {
      setLocalFilters((prevFilters) => {
        const updatedFilters = { ...prevFilters, ...newFilterValues };
        // Reset page to 1 when filters change (except for page filter itself)
        if (
          !(
            'page' in newFilterValues &&
            Object.keys(newFilterValues).length === 1
          )
        ) {
          updatedFilters.page = 1;
        }
        // Update URL
        updateSearchParams(updatedFilters, setSearchParams);
        return updatedFilters;
      });
    },
    [setSearchParams]
  );

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    handleFiltersChange({ page: newPage });
  };

  // Handle clearing filters
  const clearFilters = () => {
    const defaultFilters = { page: 1, limit: 10 }; // Or whatever defaults are
    setLocalFilters(defaultFilters);
    updateSearchParams(defaultFilters, setSearchParams);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <JobFilterSidebar
            filters={localFilters}
            onFiltersChange={handleFiltersChange}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h5">
              Job Listings ({isLoading || isFetching ? '...' : totalCount}{' '}
              found)
            </Typography>
            {/* Consider adding sorting options here */}
          </Box>

          {isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error fetching jobs:{' '}
              {error instanceof Error
                ? error.message
                : 'An unknown error occurred'}
            </Alert>
          )}

          {isLoading && !data ? (
            <JobListSkeleton count={itemsPerPage} />
          ) : jobs.length > 0 ? (
            <>
              <Box
                sx={{
                  opacity: isFetching ? 0.7 : 1,
                  transition: 'opacity 300ms',
                }}
              >
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </Box>
              {pageCount > 1 && (
                <Pagination
                  count={pageCount}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}
                  disabled={isFetching}
                />
              )}
            </>
          ) : (
            <EmptyJobsState onClearFilters={clearFilters} />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default JobListPage;
