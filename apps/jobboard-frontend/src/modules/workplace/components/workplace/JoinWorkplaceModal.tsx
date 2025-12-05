/**
 * JoinWorkplaceModal Component
 * Modal for searching and requesting to join an existing workplace
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Textarea } from '@shared/components/ui/textarea';
import { Label } from '@shared/components/ui/label';
import { Slider } from '@shared/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import { Search, Building2, Filter, X, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { WorkplaceCard } from '@modules/workplace/components/workplace/WorkplaceCard';
import { getWorkplaces } from '@modules/workplace/services/workplace.service';
import { createEmployerRequest, getMyWorkplaces } from '@modules/employer/services/employer.service';
import {
  employerRequestSchema,
  type EmployerRequestFormData,
} from '@modules/employer/schemas/employer-request.schema';
import type { WorkplaceBriefResponse } from '@shared/types/workplace.types';
import { getErrorMessage } from '@shared/utils/error-handler';

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

interface JoinWorkplaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function JoinWorkplaceModal({ open, onOpenChange, onSuccess }: JoinWorkplaceModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'search' | 'request'>('search');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [searchResults, setSearchResults] = useState<WorkplaceBriefResponse[]>([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState<WorkplaceBriefResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [myWorkplaceIds, setMyWorkplaceIds] = useState<Set<number>>(new Set());
  const [showAlreadyMemberAlert, setShowAlreadyMemberAlert] = useState(false);
  const [alreadyMemberWorkplace, setAlreadyMemberWorkplace] =
    useState<WorkplaceBriefResponse | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployerRequestFormData>({
    resolver: zodResolver(employerRequestSchema),
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep('search');
      setSelectedWorkplace(null);
      setSuccess(false);
      setError(null);
      reset();
      performSearch();
      loadMyWorkplaces();
    }
  }, [open]);

  const loadMyWorkplaces = async () => {
    try {
      const myWorkplaces = await getMyWorkplaces();
      const ids = new Set(myWorkplaces.map(({ workplace }) => workplace.id));
      setMyWorkplaceIds(ids);
    } catch (err) {
      console.warn('Failed to load user workplaces:', err);
    }
  };

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

  useEffect(() => {
    if (open && step === 'search') {
      performSearch();
    }
  }, [filters.sector, filters.sortBy, filters.minRating]);

  const handleSearch = () => {
    performSearch();
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

  const handleWorkplaceSelect = (workplace: WorkplaceBriefResponse) => {
    if (myWorkplaceIds.has(workplace.id)) {
      setAlreadyMemberWorkplace(workplace);
      setShowAlreadyMemberAlert(true);
      return;
    }
    setSelectedWorkplace(workplace);
    setStep('request');
    setError(null);
  };

  const handleBackToSearch = () => {
    setStep('search');
    setSelectedWorkplace(null);
    setError(null);
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
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch (err: unknown) {
      console.error('Failed to submit request:', err);
      setError(getErrorMessage(err, 'Failed to submit request. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        {success ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('workplace.joinModal.requestSubmitted')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('workplace.joinModal.requestSubmittedMessage', {
                company: selectedWorkplace?.companyName,
              })}
            </p>
            <p className="text-sm text-muted-foreground">{t('workplace.joinModal.closing')}</p>
          </div>
        ) : step === 'search' ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('workplace.joinModal.title')}</DialogTitle>
              <DialogDescription>{t('workplace.joinModal.searchDescription')}</DialogDescription>
            </DialogHeader>

            {/* Search Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="modal-search" className="text-base font-semibold">
                  {t('workplace.joinModal.searchPlaceholder')}
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    {t('workplace.joinModal.filters')}
                    {hasActiveFilters && (
                      <span className="ml-1 rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-xs">
                        {
                          [
                            filters.searchQuery,
                            filters.sector,
                            filters.location,
                            filters.minRating > 0 ? 1 : 0,
                            filters.sortBy,
                          ].filter(Boolean).length
                        }
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
                      {t('workplace.joinModal.clear')}
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  id="modal-search"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter company name..."
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  <Search className="h-4 w-4 mr-2" />
                  {isSearching
                    ? t('workplace.joinModal.searching')
                    : t('workplace.joinModal.search')}
                </Button>
              </div>

              {/* Filters Section */}
              {showFilters && (
                <div className="pt-4 border-t space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sector Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="modal-sector">{t('workplace.joinModal.sector')}</Label>
                      <select
                        id="modal-sector"
                        value={filters.sector}
                        onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">{t('workplace.joinModal.allSectors')}</option>
                        {SECTORS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="modal-location">{t('workplace.joinModal.location')}</Label>
                      <Input
                        id="modal-location"
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        placeholder="Enter location..."
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>

                    {/* Sort By Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="modal-sortBy">{t('workplace.joinModal.sortBy')}</Label>
                      <select
                        id="modal-sortBy"
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
                        <Label htmlFor="modal-minRating">
                          {t('workplace.joinModal.minimumRating')}
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {filters.minRating > 0 ? `${filters.minRating.toFixed(1)}★` : 'Any'}
                        </span>
                      </div>
                      <Slider
                        value={[filters.minRating]}
                        onValueChange={(value) =>
                          setFilters({ ...filters, minRating: value[0] ?? 0 })
                        }
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

              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Search Results */}
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  <h3 className="font-semibold sticky top-0 bg-background py-1">
                    {t('workplace.joinModal.searchResults', { count: searchResults.length })}
                  </h3>
                  <div className="space-y-3 max-h-[40vh] overflow-y-scroll pr-1">
                    {searchResults.map((workplace) => (
                      <WorkplaceCard
                        key={workplace.id}
                        workplace={workplace}
                        onClick={() => handleWorkplaceSelect(workplace)}
                      />
                    ))}
                  </div>
                </div>
              ) : filters.searchQuery || hasActiveFilters ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {t('workplace.joinModal.noWorkplacesFound')}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="mt-4"
                    >
                      {t('workplace.joinModal.clearFiltersAndShowAll')}
                    </Button>
                  )}
                </div>
              ) : null}

              {/* Already Member Alert */}
              {showAlreadyMemberAlert && alreadyMemberWorkplace && (
                <Card className="p-4 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                  <div className="flex items-center gap-4">
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
                      <h3 className="font-semibold">{alreadyMemberWorkplace.companyName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('workplace.joinModal.alreadyMember')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAlreadyMemberAlert(false);
                        setAlreadyMemberWorkplace(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToSearch}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle>{t('workplace.joinModal.requestTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('workplace.joinModal.requestDescription')}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Request Form */}
            <div className="space-y-6">
              {/* Selected Workplace Preview */}
              {selectedWorkplace && (
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 block">
                    {t('workplace.joinModal.selectedWorkplace')}
                  </Label>
                  <WorkplaceCard workplace={selectedWorkplace} />
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="note">
                    {t('workplace.joinModal.noteLabel')}
                    <span className="text-muted-foreground text-xs ml-2">
                      {t('workplace.joinModal.noteMaxLength')}
                    </span>
                  </Label>
                  <Textarea
                    id="note"
                    {...register('note')}
                    placeholder={t('workplace.joinModal.notePlaceholder')}
                    rows={4}
                    className={errors.note ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.note && <p className="text-sm text-destructive">{errors.note.message}</p>}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToSearch}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {t('workplace.joinModal.back')}
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('workplace.joinModal.submittingRequest')}
                      </>
                    ) : (
                      t('workplace.joinModal.submitRequest')
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
