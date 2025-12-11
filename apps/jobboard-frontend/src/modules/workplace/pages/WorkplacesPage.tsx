/**
 * WorkplacesPage
 * Displays all workplaces for employees to browse, search, and visit.
 */

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Slider } from '@shared/components/ui/slider';
import { Search, Building2, Filter, X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { WorkplaceCard } from '@/modules/workplace/components/WorkplaceCard';
import { useWorkplacesQuery } from '@modules/workplace/services/workplace.service';
import type { WorkplaceBriefResponse } from '@shared/types/workplace.types';
import CenteredError from '@shared/components/common/CenteredError';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { normalizeApiError } from '@shared/utils/error-handler';

const SECTORS = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Creative Arts',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Non-profit',
  'Other',
];

const SORT_OPTIONS = [
  { value: '', labelKey: 'default' },
  { value: 'nameDesc', labelKey: 'nameDesc' },
  { value: 'nameAsc', labelKey: 'nameAsc' },
  { value: 'reviewCountDesc', labelKey: 'reviewCountDesc' },
  { value: 'reviewCountAsc', labelKey: 'reviewCountAsc' },
  { value: 'ratingDesc', labelKey: 'ratingDesc' },
  { value: 'ratingAsc', labelKey: 'ratingAsc' },
];

interface Filters {
  searchQuery: string;
  sector: string;
  location: string;
  minRating: number;
  sortBy: string;
}

const initialFilters: Filters = {
  searchQuery: '',
  sector: '',
  location: '',
  minRating: 0,
  sortBy: '',
};

export default function WorkplacesPage() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const isEmployer = user?.role === 'ROLE_EMPLOYER';
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const queryParams = useMemo(
    () => {
      const params: any = { page, size: 12 };
      if (filters.searchQuery.trim()) params.search = filters.searchQuery.trim();
      if (filters.sector) params.sector = filters.sector;
      if (filters.location.trim()) params.location = filters.location.trim();
      if (filters.minRating > 0) params.minRating = filters.minRating;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      return params;
    },
    [filters, page]
  );

  const workplacesQuery = useWorkplacesQuery(queryParams);
  const workplaces: WorkplaceBriefResponse[] = workplacesQuery.data?.content ?? [];
  const normalizedError = workplacesQuery.error ? normalizeApiError(workplacesQuery.error) : null;
  const loading = workplacesQuery.isLoading;

  useEffect(() => {
    if (workplacesQuery.data) {
      setTotalPages(workplacesQuery.data.totalPages);
      setTotalElements(workplacesQuery.data.totalElements);
    }
  }, [workplacesQuery.data]);

  useEffect(() => {
    if (normalizedError) {
      setError(normalizedError.friendlyMessage);
    } else {
      setError(null);
    }
  }, [normalizedError]);


  const handleSearch = () => {
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.sector ||
    filters.location ||
    filters.minRating > 0 ||
    filters.sortBy;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-6 px-4 py-6 pb-24 lg:pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{t('workplaces.title')}</h1>
            <p className="text-muted-foreground">{t('workplaces.description')}</p>
          </div>
          {isEmployer && (
            <Button variant="outline" asChild className="gap-2">
              <Link to="/workplaces/my">
                {t('workplaces.tabs.my', 'My Workplaces')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="search" className="text-base font-semibold">
              {t('workplaces.searchTitle')}
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {t('workplaces.filters.title')}
                {hasActiveFilters && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                    {[
                      filters.searchQuery,
                      filters.sector,
                      filters.location,
                      filters.minRating > 0 ? 1 : 0,
                      filters.sortBy,
                    ].filter(Boolean).length}
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  {t('workplaces.filters.clear')}
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <Input
              id="search"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('workplaces.searchPlaceholder')}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              {loading ? t('common.searching') : t('common.search')}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sector">{t('workplaces.filters.sector')}</Label>
                  <select
                    id="sector"
                    value={filters.sector}
                    onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">{t('workplaces.filters.allSectors')}</option>
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {s.toLowerCase().replace(/ /g, '')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">{t('workplaces.filters.location')}</Label>
                  <Input
                    id="location"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    placeholder={t('workplaces.filters.locationPlaceholder')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortBy">{t('workplaces.filters.sortBy')}</Label>
                  <select
                    id="sortBy"
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(`workplaces.filters.sortOptions.${option.labelKey}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="minRating">{t('workplaces.filters.minRating')}</Label>
                    <span className="text-sm text-muted-foreground">
                      {filters.minRating > 0
                        ? t('workplaces.filters.ratingWithValue', { rating: filters.minRating.toFixed(1) })
                        : t('workplaces.filters.anyRating')}
                    </span>
                  </div>
                  <Slider
                    value={[filters.minRating]}
                    onValueChange={(value) => setFilters({ ...filters, minRating: value[0] ?? 0 })}
                    min={0}
                    max={5}
                    step={0.5}
                    className="w-full"
                    aria-label={t('workplaces.filters.minRating')}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>0★</span>
                    <span>5★</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

            {error && (
              <CenteredError
                message={error}
                onRetry={() => workplacesQuery.refetch()}
              />
            )}

        {!error && (
          <p className="text-sm text-muted-foreground">
            {loading ? t('workplaces.loading') : t('workplaces.workplacesFound', { count: totalElements })}
          </p>
        )}

        {!error && !loading && workplaces.length === 0 && (
          <Card className="p-8 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">{t('workplaces.empty.title')}</h2>
            <p className="mb-4 text-muted-foreground">
              {t(hasActiveFilters ? 'workplaces.empty.adjustFilters' : 'workplaces.empty.noWorkplaces')}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                {t('workplaces.filters.clearFilters')}
              </Button>
            )}
          </Card>
        )}

        {!error && !loading && workplaces.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workplaces.map((workplace) => (
              <WorkplaceCard key={workplace.id} workplace={workplace} />
            ))}
          </div>
        )}

            {/* Pagination */}
            {!error && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t('common.pagination.previous')}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t('common.pagination.pageInfo', { page: page + 1, total: totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={page >= totalPages - 1 || loading}
                >
                  {t('common.pagination.next')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
      
      </div>
    </div>
  );
}

