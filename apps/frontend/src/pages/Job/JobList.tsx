// Page component for displaying the list of jobs
import React, { useState, useCallback } from 'react';
import { Box, Container, Grid, Typography, Alert, Pagination } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { useGetJobs } from '../../services/jobs.service';
import { JobPost, JobFilters } from '../../types/job';
import JobFilterSidebar from '../../components/jobs/JobFilterSidebar';
import JobCard from '../../components/jobs/JobCard';
import JobListSkeleton from '../../components/jobs/JobListSkeleton';
import EmptyJobsState from '../../components/jobs/EmptyJobsState';

// Function to parse search params into filters
const parseFiltersFromParams = (searchParams: URLSearchParams): JobFilters => {
  const filters: JobFilters = {};
  if (searchParams.has('title')) filters.title = searchParams.get('title')!;
  if (searchParams.has('companyName'))
    filters.companyName = searchParams.get('companyName')!;
  if (searchParams.has('ethicalTags'))
    filters.ethicalTags = searchParams.getAll('ethicalTags');
  if (searchParams.has('minSalary'))
    filters.minSalary = parseInt(searchParams.get('minSalary')!, 10);
  if (searchParams.has('maxSalary'))
    filters.maxSalary = parseInt(searchParams.get('maxSalary')!, 10);
  if (searchParams.has('isRemote'))
    filters.isRemote = searchParams.get('isRemote') === 'true';
  return filters;
};

// Function to update search params from filters
const updateSearchParams = (
  filters: JobFilters,
  setSearchParams: (
    params: URLSearchParams,
    options?: { replace: boolean }
  ) => void
) => {
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
  setSearchParams(params, { replace: true });
};

const JobListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  const getInitialFilters = useCallback(() => {
    const parsed = parseFiltersFromParams(searchParams);
    return {
      ...parsed,
    };
  }, [searchParams]);

  const [localFilters, setLocalFilters] =
    useState<JobFilters>(getInitialFilters);
  const [activeFilters, setActiveFilters] =
    useState<JobFilters>(getInitialFilters);

  const { data, isLoading, isError, error, isFetching } =
    useGetJobs(activeFilters);

  const jobs = data ?? [];

  // Pagination logic
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const currentJobs = jobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  const handleFiltersChange = useCallback(
    (newFilterValues: Partial<JobFilters>) => {
      setLocalFilters((prevFilters) => ({
        ...prevFilters,
        ...newFilterValues,
      }));
    },
    []
  );

  const handleApplyFilters = useCallback(() => {
    setActiveFilters(localFilters);
    updateSearchParams(localFilters, setSearchParams);
    setCurrentPage(1); // Reset to first page
  }, [localFilters, setSearchParams]);

  const clearAllFilters = useCallback(() => {
    const defaultFilters: JobFilters = {};
    setLocalFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    updateSearchParams(defaultFilters, setSearchParams);
    setCurrentPage(1); // Reset to first page
  }, [setSearchParams]);

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <JobFilterSidebar
            filters={localFilters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={clearAllFilters}
            isFetching={isFetching}
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
              Job Listings ({isLoading || isFetching ? '...' : jobs.length}{' '}
              found)
            </Typography>
          </Box>

          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}
            />
          )}

          {isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error fetching jobs:{' '}
              {error instanceof Error
                ? error.message
                : 'An unknown error occurred'}
            </Alert>
          )}

          {isLoading && jobs.length === 0 ? (
            <JobListSkeleton count={10} />
          ) : jobs.length > 0 ? (
            <>
              <Box
                sx={{
                  opacity: isFetching ? 0.7 : 1,
                  transition: 'opacity 300ms',
                }}
              >
                {currentJobs.map((job: JobPost) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </Box>
              {totalPages > 1 && (
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
                />
              )}
            </>
          ) : (
            <EmptyJobsState onClearFilters={clearAllFilters} />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default JobListPage;
