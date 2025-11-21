/**
 * CreateWorkplaceModal Component
 * Modal for creating a new workplace
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { createWorkplace } from '@/services/workplace.service';
import {
  createWorkplaceSchema,
  type CreateWorkplaceFormData,
} from '@/schemas/create-workplace.schema';
import { type EthicalTag } from '@/types/job';
import { getErrorMessage } from '@/utils/error-handler';

interface CreateWorkplaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateWorkplaceModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateWorkplaceModalProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdWorkplaceId, setCreatedWorkplaceId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<EthicalTag[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateWorkplaceFormData>({
    resolver: zodResolver(createWorkplaceSchema),
    defaultValues: {
      ethicalTags: [],
    },
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setSuccess(false);
      setError(null);
      setCreatedWorkplaceId(null);
      setSelectedTags([]);
      reset();
    }
  }, [open, reset]);

  const handleTagsChange = (tags: EthicalTag[]) => {
    setSelectedTags(tags);
    setValue('ethicalTags', tags);
  };

  const onSubmit = async (data: CreateWorkplaceFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const workplace = await createWorkplace({
        ...data,
        ethicalTags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      setCreatedWorkplaceId(workplace.id);
      setSuccess(true);
      onSuccess?.();
      // Navigate to the new workplace after a short delay
      setTimeout(() => {
        onOpenChange(false);
        navigate(`/workplace/${workplace.id}`);
      }, 2000);
    } catch (err: unknown) {
      console.error('Failed to create workplace:', err);
      setError(getErrorMessage(err, 'Failed to create workplace. Please try again.'));
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {success ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Workplace Created!</h2>
            <p className="text-muted-foreground mb-4">
              Your workplace has been created successfully. Redirecting to your new workplace...
            </p>
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create New Workplace</DialogTitle>
              <DialogDescription>
                Add your company to the platform and start building your reputation
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="modal-companyName">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-companyName"
                  {...register('companyName')}
                  placeholder="Enter company name"
                  className={errors.companyName ? 'border-destructive' : ''}
                  disabled={isSubmitting}
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">{errors.companyName.message}</p>
                )}
              </div>

              {/* Sector and Location row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sector */}
                <div className="space-y-2">
                  <Label htmlFor="modal-sector">
                    Sector <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="modal-sector"
                    {...register('sector')}
                    placeholder="e.g., Technology, Healthcare"
                    className={errors.sector ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.sector && (
                    <p className="text-sm text-destructive">{errors.sector.message}</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="modal-location">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="modal-location"
                    {...register('location')}
                    placeholder="e.g., San Francisco, CA"
                    className={errors.location ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location.message}</p>
                  )}
                </div>
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="modal-website">Website</Label>
                <Input
                  id="modal-website"
                  type="url"
                  {...register('website')}
                  placeholder="https://www.example.com"
                  className={errors.website ? 'border-destructive' : ''}
                  disabled={isSubmitting}
                />
                {errors.website && (
                  <p className="text-sm text-destructive">{errors.website.message}</p>
                )}
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label htmlFor="modal-shortDescription">
                  Short Description
                  <span className="text-muted-foreground text-xs ml-2">(max 300 characters)</span>
                </Label>
                <Textarea
                  id="modal-shortDescription"
                  {...register('shortDescription')}
                  placeholder="A brief tagline or summary"
                  rows={2}
                  className={errors.shortDescription ? 'border-destructive' : ''}
                  disabled={isSubmitting}
                />
                {errors.shortDescription && (
                  <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
                )}
              </div>

              {/* Detailed Description */}
              <div className="space-y-2">
                <Label htmlFor="modal-detailedDescription">
                  Detailed Description
                  <span className="text-muted-foreground text-xs ml-2">(max 4000 characters)</span>
                </Label>
                <Textarea
                  id="modal-detailedDescription"
                  {...register('detailedDescription')}
                  placeholder="Tell us about your company's mission, values, and culture"
                  rows={4}
                  className={errors.detailedDescription ? 'border-destructive' : ''}
                  disabled={isSubmitting}
                />
                {errors.detailedDescription && (
                  <p className="text-sm text-destructive">{errors.detailedDescription.message}</p>
                )}
              </div>

              {/* Ethical Tags */}
              <div className="space-y-2">
                <Label>Ethical Tags</Label>
                <p className="text-sm text-muted-foreground">
                  Select tags that represent your company's ethical commitments
                </p>
                <MultiSelectDropdown
                  selectedTags={selectedTags}
                  onTagsChange={handleTagsChange}
                  placeholder={t('ethicalTags.select')}
                />
                {errors.ethicalTags && (
                  <p className="text-sm text-destructive">{errors.ethicalTags.message}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Workplace'
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
