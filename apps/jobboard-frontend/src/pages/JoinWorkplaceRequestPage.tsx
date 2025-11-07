/**
 * JoinWorkplaceRequestPage
 * Allows employers to request access to manage an existing workplace
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Building2 } from 'lucide-react';
import { WorkplaceCard } from '@/components/workplace/WorkplaceCard';
import { getWorkplaces } from '@/services/workplace.service';
import { createEmployerRequest } from '@/services/employer.service';
import { employerRequestSchema, type EmployerRequestFormData } from '@/schemas/employer-request.schema';
import type { WorkplaceBriefResponse } from '@/types/workplace.types';
import { getErrorMessage } from '@/utils/error-handler';

export default function JoinWorkplaceRequestPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WorkplaceBriefResponse[]>([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState<WorkplaceBriefResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployerRequestFormData>({
    resolver: zodResolver(employerRequestSchema),
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    try {
      const results = await getWorkplaces({
        search: searchQuery,
        page: 0,
        size: 10,
      });
      setSearchResults(results.content);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search workplaces');
    } finally {
      setIsSearching(false);
    }
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
          <Card className="p-6 mb-6">
            <Label htmlFor="search" className="mb-2 block">
              Search for a workplace
            </Label>
            <div className="flex gap-2">
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter company name..."
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold">Search Results</h3>
                {searchResults.map((workplace) => (
                  <div
                    key={workplace.id}
                    onClick={() => setSelectedWorkplace(workplace)}
                    className="cursor-pointer"
                  >
                    <WorkplaceCard workplace={workplace} />
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="mt-6 text-center py-8">
                <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No workplaces found</p>
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
      </div>
    </div>
  );
}
