/**
 * WorkplacesPage
 * Displays all workplaces for employees to browse, search, and visit
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Search, Building2, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { WorkplaceCard } from '@/components/workplace/WorkplaceCard';
import { getWorkplaces } from '@/services/workplace.service';
import type { WorkplaceBriefResponse } from '@/types/workplace.types';
import CenteredLoader from '@/components/CenteredLoader';
import CenteredError from '@/components/CenteredError';

// Common sectors
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

// Sort options
const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'rating', label: 'Rating (High to Low)' },
  { value: 'rating,asc', label: 'Rating (Low to High)' },
  { value: 'companyName', label: 'Name (A to Z)' },
  { value: 'companyName,desc', label: 'Name (Z to A)' },
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
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [workplaces, setWorkplaces] = useState<WorkplaceBriefResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const performSearch = useCallback(async (pageNum: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params: Parameters<typeof getWorkplaces>[0] = {
        page: pageNum,
        size: 12,
      };

      if (filters.searchQuery.trim()) {
        params.search = filters.searchQuery.trim();
      }
      if (filters.sector) {
        params.sector = filters.sector;
      }
      if (filters.location.trim()) {
        params.location = filters.location.trim();
      }
      if (filters.minRating > 0) {
        params.minRating = filters.minRating;
      }
      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
      }

      const results = await getWorkplaces(params);
      setWorkplaces(results.content);
      setTotalPages(results.totalPages);
      setTotalElements(results.totalElements);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load workplaces:', err);
      setError('Failed to load workplaces');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    performSearch(0);
  }, [performSearch]);

  const handleSearch = () => {
    performSearch(0);
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

  if (loading && workplaces.length === 0) {
    return <CenteredLoader />;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Workplaces</h1>
            <p className="text-muted-foreground">
              Explore and discover companies to learn more about their culture and ratings
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="search" className="text-base font-semibold">
              Search Workplaces
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-xs">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              id="search"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter company name..."
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="pt-4 mt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sector Filter */}
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <select
                    id="sector"
                    value={filters.sector}
                    onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">All Sectors</option>
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    placeholder="Enter location..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                </div>

                {/* Sort By Filter */}
                <div className="space-y-2">
                  <Label htmlFor="sortBy">Sort By</Label>
                  <select
                    id="sortBy"
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Minimum Rating Filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="minRating">Minimum Rating</Label>
                    <span className="text-sm text-muted-foreground">
                      {filters.minRating > 0 ? `${filters.minRating.toFixed(1)}★` : 'Any'}
                    </span>
                  </div>
                  <Slider
                    value={[filters.minRating]}
                    onValueChange={(value) => setFilters({ ...filters, minRating: value[0] ?? 0 })}
                    min={0}
                    max={5}
                    step={0.5}
                    className="w-full"
                    aria-label="Minimum rating"
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
            message="Failed to load workplaces. Please try again."
            onRetry={() => performSearch(page)}
          />
        )}

        {/* Results count */}
        {!error && (
          <p className="text-sm text-muted-foreground mb-4">
            {loading ? 'Loading...' : `${totalElements} workplace${totalElements !== 1 ? 's' : ''} found`}
          </p>
        )}

        {/* Empty State */}
        {!error && !loading && workplaces.length === 0 && (
          <Card className="p-8 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Workplaces Found</h2>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters or search query'
                : 'There are no workplaces available at the moment'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </Card>
        )}

        {/* Workplaces Grid */}
        {!error && workplaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
              onClick={() => performSearch(page - 1)}
              disabled={page === 0 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performSearch(page + 1)}
              disabled={page >= totalPages - 1 || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
