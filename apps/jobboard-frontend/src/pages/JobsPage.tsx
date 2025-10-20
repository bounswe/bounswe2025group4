import { useEffect, useMemo, useState } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import { MobileJobFilters } from '@/components/jobs/MobileJobFilters';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type Job, type JobType, type Policy } from '@/types/job';
import { useFilters } from '@/hooks/useFilters';
import { getJobs } from '@/services/jobs.service';
import type { JobPostResponse } from '@/types/api.types';
import CenteredLoader from '@/components/CenteredLoader';
import { AxiosError } from 'axios';
import { Card, CardContent } from '@/components/ui/card';

const ITEMS_PER_PAGE = 10;

/**
 * Convert API JobPostResponse to Job type for JobCard component
 */
function convertJobPostToJob(jobPost: JobPostResponse): Job {
  // Parse ethical tags (comma-separated string) into Policy array
  const policies = jobPost.ethicalTags
    ? (jobPost.ethicalTags.split(',').map((tag) => tag.trim()) as Policy[])
    : [];

  // Determine job type based on available data (can be enhanced later)
  const type: JobType[] = ['Full-time']; // Default, as API doesn't provide job type

  return {
    id: jobPost.id.toString(),
    title: jobPost.title,
    company: jobPost.company,
    location: jobPost.remote ? 'Remote' : jobPost.location,
    policies,
    type,
    minSalary: Math.floor(jobPost.minSalary / 1000), // Convert to 'k' format
    maxSalary: Math.floor(jobPost.maxSalary / 1000),
    logoUrl: undefined, // API doesn't provide logo
  };
}

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamValue = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(searchParamValue);
  const [searchFilter, setSearchFilter] = useState(searchParamValue);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const { t, i18n } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';

  const { selectedPolicies, selectedJobTypes, salaryRange, locationFilter, resetFilters } =
    useFilters();
  const policiesKey = selectedPolicies.join(',');
  const salaryKey = `${salaryRange[0]}-${salaryRange[1]}`;

  useEffect(() => {
    setSearchInput((prev) => (prev === searchParamValue ? prev : searchParamValue));
    setSearchFilter((prev) => {
      if (prev === searchParamValue) {
        return prev;
      }
      setCurrentPage(1);
      return searchParamValue;
    });
  }, [searchParamValue]);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIsAuthError(false);

        // Build filter params based on user selections
        const filters = {
          title: searchFilter || undefined,
          ethicalTags: selectedPolicies.length > 0 ? selectedPolicies : undefined,
          minSalary: salaryRange[0] * 1000, // Convert back to actual salary
          maxSalary: salaryRange[1] * 1000,
          isRemote: locationFilter?.toLowerCase() === 'remote' ? true : undefined,
        };

        const jobPosts = await getJobs(filters);
        const convertedJobs = jobPosts.map(convertJobPostToJob);
        setJobs(convertedJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);

        // Check if it's a 401 authentication error
        if (err instanceof AxiosError && err.response?.status === 401) {
          setIsAuthError(true);
          setError('auth_error');
        } else {
          setError('fetch_error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [searchFilter, policiesKey, salaryKey, locationFilter]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesJobTypes =
        selectedJobTypes.length > 0
          ? job.type.some((type) => selectedJobTypes.includes(type))
          : true;

      const matchesLocation =
        locationFilter && locationFilter.toLowerCase() !== 'remote'
          ? job.location.toLowerCase().includes(locationFilter.toLowerCase())
          : true;

      return matchesJobTypes && matchesLocation;
    });
  }, [jobs, selectedJobTypes, locationFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredJobs.slice(start, end);
  }, [filteredJobs, currentPage]);

  const updateSearchParam = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set('search', value);
    } else {
      next.delete('search');
    }
    setSearchParams(next, { replace: true });
  };

  const handleSearchSubmit = () => {
    const trimmed = searchInput.trim();
    setSearchInput(trimmed);
    updateSearchParam(trimmed);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateSearchParam('');
  };

  const handleResetFilters = () => {
    resetFilters();
    handleClearSearch();
    setCurrentPage(1);
  };

  const jobCount = filteredJobs.length;

  const paginationNumbers = useMemo(() => {
    const pages: number[] = [];

    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }
      return pages;
    }

    pages.push(1, 2, 3);

    if (currentPage > 5) {
      pages.push(-1);
    }

    const start = Math.max(4, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let page = start; page <= end; page += 1) {
      if (!pages.includes(page)) {
        pages.push(page);
      }
    }

    if (currentPage < totalPages - 3) {
      pages.push(-2);
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="container mx-auto px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex w-full flex-row gap-8">
        {/* Filters */}
        <aside className="sticky top-[88px] hidden w-100 shrink-0 lg:block">
          <div className="sticky top-[88px] space-y-6 p-6">
            <h2 className="text-xl font-semibold">{t('jobs.filtersHeading')}</h2>
            <JobFilters />
            <Button type="button" variant="outline" className="w-full" onClick={handleResetFilters}>
              {t('jobs.resetFilters')}
            </Button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex flex-col gap-4 pt-2 min-w-6xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {/* Search Input*/}
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="size-5" aria-hidden />
                </span>
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                  placeholder={t('jobs.searchPlaceholder')}
                  id="search-input"
                  className="h-14 rounded-lg border border-border pl-11 pr-12 bg-card text-lg"
                  aria-label={t('jobs.searchAria')}
                />
                {searchInput && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-md text-muted-foreground hover:bg-muted"
                    aria-label={t('jobs.clearSearch')}
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                )}
              </div>
              <MobileJobFilters
                isOpen={isMobileFiltersOpen}
                onOpenChange={setIsMobileFiltersOpen}
                onResetFilters={handleResetFilters}
                filtersContent={<JobFilters />}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <section className="flex-1 space-y-6">
              {isLoading ? (
                <CenteredLoader />
              ) : error ? (
                isAuthError ? (
                  <Card className="gap-4 py-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                    <CardContent className="px-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-2 flex-1">
                          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                            {t('jobs.authRequired.title')}
                          </h3>
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            {t('jobs.authRequired.description')}
                          </p>
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            {t('jobs.authRequired.invitation')}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button asChild className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600">
                          <Link to="/register">{t('jobs.authRequired.signUp')}</Link>
                        </Button>
                        <Button asChild variant="outline" className="border-amber-300 dark:border-amber-700">
                          <Link to="/login">{t('jobs.authRequired.login')}</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <p className="text-lg text-destructive">{t('jobs.error')}</p>
                    <Button onClick={() => window.location.reload()}>{t('jobs.retry')}</Button>
                  </div>
                )
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">
                      {t('jobs.results', { count: jobCount })}
                    </h1>
                    <span className="text-sm text-muted-foreground">
                      {t('jobs.resultsDescription', { count: jobCount })}
                    </span>
                  </div>

                  {/* Job Cards */}
                  {jobCount === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <p className="text-lg text-muted-foreground">
                        {t('jobs.noResults')}
                      </p>
                      <Button variant="outline" onClick={handleResetFilters}>
                        {t('jobs.resetFilters')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paginatedJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Pagination */}
              {!isLoading && !error && jobCount > 0 && (
              <Pagination className="pt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setCurrentPage((page) => Math.max(1, page - 1));
                      }}
                      aria-disabled={currentPage === 1}
                      className={cn(
                        currentPage === 1 && 'pointer-events-none opacity-50',
                        isRtl && 'rotate-180'
                      )}
                    />
                  </PaginationItem>
                  {paginationNumbers.map((page, index) => {
                    if (page < 0) {
                      return (
                        <PaginationItem key={`ellipsis-${page}-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(event) => {
                            event.preventDefault();
                            setCurrentPage(page);
                          }}
                          className={cn(
                            'size-10 rounded-lg text-sm',
                            page === currentPage
                              ? 'border-primary text-primary'
                              : 'text-muted-foreground hover:text-primary',
                          )}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setCurrentPage((page) => Math.min(totalPages, page + 1));
                      }}
                      aria-disabled={currentPage === totalPages}
                      className={cn(
                        currentPage === totalPages && 'pointer-events-none opacity-50',
                        isRtl && 'rotate-180'
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
