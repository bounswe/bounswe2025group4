import { useEffect, useMemo, useState } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { JobCard } from '@modules/jobs/components/jobs/JobCard';
import { JobFilters } from '@modules/jobs/components/jobs/JobFilters';
import { MobileJobFilters } from '@modules/jobs/components/jobs/MobileJobFilters';
import { Button } from '@shared/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@shared/components/ui/pagination';
import { Input } from '@shared/components/ui/input';
import { cn } from '@shared/lib/utils';
import { type Job, type JobType } from '@shared/types/job';
import { useFilters } from '@shared/hooks/useFilters';
import { useJobsQuery } from '@modules/jobs/services/jobs.service';
import type { JobPostResponse } from '@shared/types/api.types';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import { Card, CardContent } from '@shared/components/ui/card';
import { normalizeApiError } from '@shared/utils/error-handler';

const ITEMS_PER_PAGE = 10;

/**
 * Convert API JobPostResponse to Job type for JobCard component
 */
function convertJobPostToJob(jobPost: JobPostResponse): Job {
  // Note: API doesn't provide job type field, using default value
  // This can be enhanced if the API adds job type information in the future
  const type: JobType[] = ['Full-time'];

  return {
    id: jobPost.id.toString(),
    title: jobPost.title,
    workplace: jobPost.workplace || {
      id: 0,
      companyName: 'Unknown Company',
      sector: 'Unknown',
      location: 'Unknown',
      shortDescription: undefined,
      overallAvg: 0,
      ethicalTags: [],
      ethicalAverages: {},
    },
    location: jobPost.remote ? 'Remote' : jobPost.location,
    type,
    minSalary: Math.floor(jobPost.minSalary / 1000), // Convert to 'k' format
    maxSalary: Math.floor(jobPost.maxSalary / 1000),
    logoUrl: jobPost.workplace?.imageUrl, // Use workplace logo if available
    inclusiveOpportunity: jobPost.inclusiveOpportunity,
  };
}

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamValue = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(searchParamValue);
  const [searchFilter, setSearchFilter] = useState(searchParamValue);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const { t, i18n } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';

  const {
    selectedEthicalTags,
    salaryRange,
    companyNameFilter,
    isRemoteOnly,
    isDisabilityInclusive,
    resetFilters,
  } = useFilters();

  const filters = useMemo(
    () => ({
      title: searchFilter || undefined,
      companyName: companyNameFilter || undefined,
      ethicalTags: selectedEthicalTags.length > 0 ? selectedEthicalTags : undefined,
      minSalary: salaryRange[0] * 1000,
      maxSalary: salaryRange[1] * 1000,
      isRemote: isRemoteOnly ? true : undefined,
      inclusiveOpportunity: isDisabilityInclusive ? true : undefined,
    }),
    [
      searchFilter,
      companyNameFilter,
      selectedEthicalTags,
      salaryRange,
      isRemoteOnly,
      isDisabilityInclusive,
    ],
  );

  const jobsQuery = useJobsQuery(filters);
  const jobsData: JobPostResponse[] = useMemo(
    () => (jobsQuery.data ?? []) as JobPostResponse[],
    [jobsQuery.data],
  );
  const normalizedError = jobsQuery.error ? normalizeApiError(jobsQuery.error) : null;
  const isAuthError = normalizedError?.status === 401;
  const jobs = useMemo(() => jobsData.map(convertJobPostToJob), [jobsData]);

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

  // Jobs are now filtered on the server, so we just use them directly
  const filteredJobs = jobs;
  const isLoading = jobsQuery.isLoading;
  const hasError = Boolean(jobsQuery.error);
  const errorMessage = normalizedError?.friendlyMessage;

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
    <div className="bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 lg:flex-row lg:items-start lg:gap-10">
        {/* Filters */}
        <aside className="sticky top-[88px] hidden w-64 shrink-0 self-start lg:block">
          <div className="space-y-6 p-5">
            <h2 className="text-xl font-semibold">{t('jobs.filtersHeading')}</h2>
            <JobFilters />
            <Button type="button" variant="outline" className="w-full" onClick={handleResetFilters}>
              {t('jobs.resetFilters')}
            </Button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
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
                  className="h-14 rounded-lg border border-border bg-card pl-11 pr-12 text-lg"
                  aria-label={t('jobs.searchAria')}
                />
                {searchInput && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 size-9 -translate-y-1/2 rounded-md text-muted-foreground hover:bg-muted"
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
              ) : hasError ? (
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
                        <Button
                          asChild
                          className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                        >
                          <Link to="/register">{t('jobs.authRequired.signUp')}</Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="border-amber-300 dark:border-amber-700"
                        >
                          <Link to="/login">{t('jobs.authRequired.login')}</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <p className="text-lg text-destructive">{errorMessage || t('jobs.error')}</p>
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
                      <p className="text-lg text-muted-foreground">{t('jobs.noResults')}</p>
                      <Button variant="outline" onClick={handleResetFilters}>
                        {t('jobs.resetFilters')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paginatedJobs.map((job: Job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Pagination */}
              {!isLoading && !hasError && jobCount > 0 && (
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
                          isRtl && 'rotate-180',
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
                          isRtl && 'rotate-180',
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
