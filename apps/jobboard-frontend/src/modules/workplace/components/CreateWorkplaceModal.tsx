/**
 * CreateWorkplaceModal Component
 * Modal for creating a new workplace
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Textarea } from '@shared/components/ui/textarea';
import { Label } from '@shared/components/ui/label';
import { MultiSelectDropdown } from '@shared/components/ui/multi-select-dropdown';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { createWorkplace } from '@modules/workplace/services/workplace.service';
import {
  createWorkplaceSchema,
  type CreateWorkplaceFormData,
} from '@modules/workplace/schemas/create-workplace.schema';
import { type EthicalTag } from '@shared/types/job';
import { getErrorMessage } from '@shared/utils/error-handler';

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
            <h2 className="text-2xl font-bold mb-2">{t('workplace.createModal.workplaceCreated')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('workplace.createModal.workplaceCreatedDescription')}
            </p>
            <p className="text-sm text-muted-foreground">{t('workplace.createModal.redirecting')}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('workplace.createModal.title')}</DialogTitle>
              <DialogDescription>
                {t('workplace.createModal.description')}
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
                  {t('workplace.createModal.companyName')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-companyName"
                  {...register('companyName')}
                  placeholder={t('workplace.createModal.companyNamePlaceholder')}
                  className={errors.companyName ? 'border-destructive' : ''}
                  disabled={isSubmitting}
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">{t(errors.companyName.message || '')}</p>
                )}
              </div>

              {/* Sector and Location row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sector */}
                <div className="space-y-2">
                  <Label htmlFor="modal-sector">
                    {t('workplace.createModal.sector')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="modal-sector"
                    {...register('sector')}
                    placeholder={t('workplace.createModal.sectorPlaceholder')}
                    className={errors.sector ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.sector && (
                    <p className="text-sm text-destructive">{t(errors.sector.message || '')}</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="modal-location">
                    {t('workplace.createModal.location')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="modal-location"
                    {...register('location')}
                    placeholder={t('workplace.createModal.locationPlaceholder', 'Enter location')}
                    className={errors.location ? 'border-destructive' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{t(errors.location.message || '')}</p>
                  )}
                </div>
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="modal-website">{t('workplace.createModal.website')}</Label>
                <Input
                  id="modal-website"
                  type="url"
                  {...register('website')}
                  placeholder={t('workplace.createModal.websitePlaceholder')}
                  className={errors.website ? 'border-destructive' : ''}
                  disabled={isSubmitting}
                />
                {errors.website && (
                  <p className="text-sm text-destructive">{t(errors.website.message || '')}</p>
                )}
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label htmlFor="modal-shortDescription">
                  {t('workplace.createModal.shortDescription')}
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
                  <p className="text-sm text-destructive">{t(errors.shortDescription.message || '')}</p>
                )}
              </div>

              {/* Detailed Description */}
              <div className="space-y-2">
                <Label htmlFor="modal-detailedDescription">
                  {t('workplace.createModal.detailedDescription')}
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
                  <p className="text-sm text-destructive">{t(errors.detailedDescription.message || '')}</p>
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
                  <p className="text-sm text-destructive">{t(errors.ethicalTags.message || '')}</p>
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
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('workplace.createModal.creating')}
                    </>
                  ) : (
                    t('workplace.createModal.submit')
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
