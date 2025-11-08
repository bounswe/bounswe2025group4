/**
 * JoinWorkplaceRequestPage
 * Allows employers to request access to manage an existing workplace
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Search, Building2, Filter, X, CheckCircle2 } from 'lucide-react';
import { WorkplaceCard } from '@/components/workplace/WorkplaceCard';
import { getWorkplaces } from '@/services/workplace.service';
import { createEmployerRequest, getMyWorkplaces } from '@/services/employer.service';
import { employerRequestSchema, type EmployerRequestFormData } from '@/schemas/employer-request.schema';
import type { WorkplaceBriefResponse } from '@/types/workplace.types';
import { getErrorMessage } from '@/utils/error-handler';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

export default function JoinWorkplaceRequestPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [searchResults, setSearchResults] = useState<WorkplaceBriefResponse[]>([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState<WorkplaceBriefResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [myWorkplaceIds, setMyWorkplaceIds] = useState<Set<number>>(new Set());
  const [showAlreadyMemberModal, setShowAlreadyMemberModal] = useState(false);
  const [alreadyMemberWorkplace, setAlreadyMemberWorkplace] = useState<WorkplaceBriefResponse | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployerRequestFormData>({
    resolver: zodResolver(employerRequestSchema),
  });

  // Unified search function that uses all filters
  const performSearch = useCallback(async () => {
    setIsSearching(true);
    setError(null);
    try {
      const params: Parameters<typeof getWorkplaces>[0] = {
        page: 0,
        size: 20,
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
      setSearchResults(results.content);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search workplaces');
    } finally {
      setIsSearching(false);
    }
  }, [filters]);

  // Fetch user's workplaces on component mount
  useEffect(() => {
    const loadMyWorkplaces = async () => {
      try {
        const myWorkplaces = await getMyWorkplaces();
        const ids = new Set(myWorkplaces.map(({ workplace }) => workplace.id));
        setMyWorkplaceIds(ids);
      } catch (err) {
        // Silently fail - user might not be an employer yet
        console.warn('Failed to load user workplaces:', err);
      }
    };
    loadMyWorkplaces();
  }, []);

  // Fetch workplaces on component mount
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const handleSearch = async () => {
    await performSearch();
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    // Trigger search after clearing
    setTimeout(() => {
      performSearch();
    }, 0);
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.sector ||
    filters.location ||
    filters.minRating > 0 ||
    filters.sortBy;

  const handleWorkplaceSelect = (workplace: WorkplaceBriefResponse) => {
    // Check if user is already a member
    if (myWorkplaceIds.has(workplace.id)) {
      setAlreadyMemberWorkplace(workplace);
      setShowAlreadyMemberModal(true);
      return;
    }
    // Otherwise, proceed with selection
    setSelectedWorkplace(workplace);
  };

  const onSubmit = async (data: EmployerRequestFormData) => {
    if (!selectedWorkplace) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createEmployerRequest(selectedWorkplace.id, {
        note: data.note,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/employer/workplaces');
      }, 2000);
    } catch (err: unknown) {
      console.error('Failed to submit request:', err);
      setError(getErrorMessage(err, 'Failed to submit request. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Request Submitted</h2>
          <p className="text-muted-foreground mb-4">
            Your request to join <strong>{selectedWorkplace?.companyName}</strong> has been submitted.
            The workplace administrators will review your request.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to your workplaces...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Request to Join Workplace</h1>
          <p className="text-muted-foreground">
            Search for an existing workplace and request to become an employer
          </p>
        </div>

        {/* Search Section */}
        {!selectedWorkplace && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="search" className="text-base font-semibold">
                Search for a workplace
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
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Filters Section */}
            {showFilters && (
              <div className="pt-4 border-t space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sector Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <select
                      id="sector"
                      value={filters.sector}
                      onChange={(e) => {
                        setFilters({ ...filters, sector: e.target.value });
                        setTimeout(() => performSearch(), 0);
                      }}
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
                      onChange={(e) => {
                        setFilters({ ...filters, sortBy: e.target.value });
                        setTimeout(() => performSearch(), 0);
                      }}
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
                      onValueChange={(value) => {
                        setFilters({ ...filters, minRating: value[0] ?? 0 });
                        setTimeout(() => performSearch(), 0);
                      }}
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

            {error && !selectedWorkplace && (
              <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-3">
                <h3 className="font-semibold">Search Results</h3>
                {searchResults.map((workplace) => (
                  <WorkplaceCard
                    key={workplace.id}
                    workplace={workplace}
                    onClick={() => handleWorkplaceSelect(workplace)}
                  />
                ))}
              </div>
            )}

            {searchResults.length === 0 && (filters.searchQuery || hasActiveFilters) && !isSearching && (
              <div className="mt-6 text-center py-8">
                <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No workplaces found</p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="mt-4"
                  >
                    Clear filters and show all
                  </Button>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Request Form */}
        {selectedWorkplace && (
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Selected Workplace</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedWorkplace(null);
                    setError(null);
                  }}
                >
                  Change
                </Button>
              </div>
              <WorkplaceCard workplace={selectedWorkplace} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="note">
                  Note to Administrators (Optional)
                  <span className="text-muted-foreground text-xs ml-2">(max 500 characters)</span>
                </Label>
                <Textarea
                  id="note"
                  {...register('note')}
                  placeholder="Explain why you want to manage this workplace..."
                  rows={4}
                  className={errors.note ? 'border-destructive' : ''}
                />
                {errors.note && (
                  <p className="text-sm text-destructive">{errors.note.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedWorkplace(null)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Already Member Modal */}
        <Dialog open={showAlreadyMemberModal} onOpenChange={setShowAlreadyMemberModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Already a Member</DialogTitle>
              <DialogDescription>
                You are already a member of this workplace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {alreadyMemberWorkplace && (
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {alreadyMemberWorkplace.imageUrl ? (
                      <img
                        src={alreadyMemberWorkplace.imageUrl}
                        alt={alreadyMemberWorkplace.companyName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{alreadyMemberWorkplace.companyName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {alreadyMemberWorkplace.sector} • {alreadyMemberWorkplace.location}
                    </p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                You are already an employer of this workplace. You can manage it from your workplaces page.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAlreadyMemberModal(false);
                    setAlreadyMemberWorkplace(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowAlreadyMemberModal(false);
                    setAlreadyMemberWorkplace(null);
                    navigate('/employer/workplaces');
                  }}
                >
                  Go to My Workplaces
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
