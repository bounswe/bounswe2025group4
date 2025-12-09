/**
 * WorkplaceSettingsPage
 * Allows employers to edit workplace information and manage settings
 */

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Textarea } from '@shared/components/ui/textarea';
import { Label } from '@shared/components/ui/label';
import { MultiSelectDropdown } from '@shared/components/ui/multi-select-dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import { Building2, Upload, ArrowLeft, Save, Trash2, AlertTriangle } from 'lucide-react';
import {
  useWorkplaceQuery,
  useUpdateWorkplaceMutation,
  useUploadWorkplaceImageMutation,
  useDeleteWorkplaceImageMutation,
  useDeleteWorkplaceMutation,
} from '@modules/workplace/services/workplace.service';
import {
  updateWorkplaceSchema,
  type UpdateWorkplaceFormData,
} from '@modules/workplace/schemas/update-workplace.schema';
import type { WorkplaceDetailResponse } from '@shared/types/workplace.types';
import type { EthicalTag } from '@shared/types/job';
import { getErrorMessage } from '@shared/utils/error-handler';
import { useAuth } from '@/modules/auth/contexts/AuthContext';

export default function WorkplaceSettingsPage() {
  const { workplaceId } = useParams<{ workplaceId: string }>();
  const workplaceIdNumber = workplaceId ? parseInt(workplaceId, 10) : undefined;
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const {
    data: workplace,
    isLoading: isWorkplaceLoading,
    isError: isWorkplaceError,
    refetch: refetchWorkplace,
  } = useWorkplaceQuery(workplaceIdNumber, { includeReviews: false, reviewsLimit: 0 }, Boolean(workplaceIdNumber));
  const updateWorkplaceMutation = useUpdateWorkplaceMutation(workplaceIdNumber ?? 0);
  const uploadWorkplaceImageMutation = useUploadWorkplaceImageMutation(workplaceIdNumber ?? 0);
  const deleteWorkplaceImageMutation = useDeleteWorkplaceImageMutation(workplaceIdNumber ?? 0);
  const deleteWorkplaceMutation = useDeleteWorkplaceMutation();
  const isUploadingImage = uploadWorkplaceImageMutation.isPending || deleteWorkplaceImageMutation.isPending;
  const isSubmitting = updateWorkplaceMutation.isPending;
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedTags, setSelectedTags] = useState<EthicalTag[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const isDeleting = deleteWorkplaceMutation.isPending;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<UpdateWorkplaceFormData>({
    resolver: zodResolver(updateWorkplaceSchema),
  });

  useEffect(() => {
    if (!workplace) return;

    setSelectedTags((workplace.ethicalTags || []) as EthicalTag[]);

    reset({
      companyName: workplace.companyName,
      sector: workplace.sector,
      location: workplace.location,
      shortDescription: workplace.shortDescription || '',
      detailedDescription: workplace.detailedDescription || '',
      website: workplace.website || '',
      ethicalTags: workplace.ethicalTags || [],
    });
  }, [workplace, reset]);

  useEffect(() => {
    if (isWorkplaceError) {
      setError(t('workplace.settings.failedToLoad'));
    }
  }, [isWorkplaceError, t]);

  // Check if user is an employer of this workplace
  const isEmployer = workplace?.employers?.some((emp) => emp.userId === user?.id);

  useEffect(() => {
    if (!isWorkplaceLoading && workplace && !isEmployer) {
      // Redirect if user is not an employer
      navigate(`/workplace/${workplaceId}`);
    }
  }, [isWorkplaceLoading, workplace, isEmployer, navigate, workplaceId]);

  const onSubmit = async (data: UpdateWorkplaceFormData) => {
    if (!workplaceIdNumber) return;

    setError(null);
    setSuccess(false);

    try {
      // Only send fields that have values
      const updateData: Record<string, unknown> = {};

      if (data.companyName) updateData.companyName = data.companyName;
      if (data.sector) updateData.sector = data.sector;
      if (data.location) updateData.location = data.location;
      if (data.shortDescription !== undefined) {
        updateData.shortDescription = data.shortDescription || undefined;
      }
      if (data.detailedDescription !== undefined) {
        updateData.detailedDescription = data.detailedDescription || undefined;
      }
      if (data.website !== undefined) {
        updateData.website = data.website || undefined;
      }
      if (selectedTags.length > 0) {
        updateData.ethicalTags = selectedTags;
      } else {
        updateData.ethicalTags = [];
      }

      await updateWorkplaceMutation.mutateAsync(updateData);
      refetchWorkplace();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Failed to update workplace:', err);
      setError(getErrorMessage(err, 'Failed to update workplace. Please try again.'));
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!workplaceIdNumber) return;

    setError(null);

    try {
      await uploadWorkplaceImageMutation.mutateAsync(file);
      await refetchWorkplace();
      setImagePreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      console.error('Failed to upload image:', err);
      setError(getErrorMessage(err, 'Failed to upload image. Please try again.'));
    }
  };

  const handleImageDelete = async () => {
    if (!workplaceIdNumber) return;

    setError(null);

    try {
      await deleteWorkplaceImageMutation.mutateAsync();
      await refetchWorkplace();
      setImagePreview(null);
    } catch (err: unknown) {
      console.error('Failed to delete image:', err);
      setError(getErrorMessage(err, 'Failed to delete image. Please try again.'));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagsChange = (tags: EthicalTag[]) => {
    setSelectedTags(tags);
    setValue('ethicalTags', tags);
  };

  const handleDeleteWorkplace = async () => {
    if (!workplaceIdNumber || !workplace) return;
    if (deleteConfirmation !== workplace.companyName) return;

    setError(null);

    try {
      await deleteWorkplaceMutation.mutateAsync(workplaceIdNumber);
      navigate('/workplaces');
    } catch (err: unknown) {
      console.error('Failed to delete workplace:', err);
      setError(getErrorMessage(err, t('workplace.settings.dangerZone.deleteFailed')));
      setShowDeleteDialog(false);
    }
  };

  if (isWorkplaceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (isWorkplaceError || !workplace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            {error || t('workplace.settings.notFound.title')}
          </h2>
          <p className="text-muted-foreground mb-4">
            {t('workplace.settings.notFound.description')}
          </p>
          <Link to="/workplaces/my">
            <Button>{t('workplace.settings.notFound.goToWorkplaces')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-lg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to={`/workplaces/details/${workplaceId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('workplace.settings.backToWorkplace')}
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('workplace.settings.title')}</h1>
          <p className="text-muted-foreground">{t('workplace.settings.subtitle')}</p>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="p-4 mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <p className="text-green-800 dark:text-green-200">
              {t('workplace.settings.updateSuccess')}
            </p>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="p-4 mb-6 bg-destructive/10 border-destructive">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload Section */}
          <Card className="p-6">
            <h2 className="text-xl font-bold">{t('workplace.settings.companyLogo')}</h2>
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={imagePreview} alt={t('workplace.settings.imagePreviewAlt')} />
                    <AvatarFallback>
                      <Building2 className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                ) : workplace.imageUrl ? (
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={workplace.imageUrl} alt={workplace.companyName} />
                    <AvatarFallback>
                      <Building2 className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-primary/10">
                      <Building2 className="h-12 w-12 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label htmlFor="image-upload">
                    <Button type="button" variant="outline" disabled={isUploadingImage} asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {imagePreview
                          ? t('workplace.settings.changeImage')
                          : t('workplace.settings.uploadImage')}
                      </span>
                    </Button>
                  </Label>
                  {workplace.imageUrl && !imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploadingImage}
                      onClick={handleImageDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
                {imagePreview && selectedFile && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={isUploadingImage}
                      onClick={() => handleImageUpload(selectedFile)}
                    >
                      {isUploadingImage
                        ? t('workplace.settings.uploading')
                        : t('workplace.settings.saveImage')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                )}
                <p className="text-base text-muted-foreground">
                  {t('workplace.settings.imageGuidelines', {
                    defaultValue: 'Recommended: Square image, at least 200x200 pixels',
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-bold">{t('workplace.settings.basicInformation')}</h2>
            <div className="space-y-4">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  {t('workplace.settings.companyName')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="companyName"
                  {...register('companyName')}
                  placeholder={t('workplace.settings.companyNamePlaceholder')}
                  className={errors.companyName ? 'border-destructive' : ''}
                />
                {errors.companyName && (
                  <p className="text-base text-destructive">{errors.companyName.message}</p>
                )}
              </div>

              {/* Sector */}
              <div className="space-y-2">
                <Label htmlFor="sector">
                  {t('workplace.settings.sector')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sector"
                  {...register('sector')}
                  placeholder={t('workplace.settings.sectorPlaceholder')}
                  className={errors.sector ? 'border-destructive' : ''}
                />
                {errors.sector && (
                  <p className="text-base text-destructive">{errors.sector.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  {t('workplace.settings.location')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder={t('workplace.settings.locationPlaceholder')}
                  className={errors.location ? 'border-destructive' : ''}
                />
                {errors.location && (
                  <p className="text-base text-destructive">{errors.location.message}</p>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">{t('workplace.settings.website')}</Label>
                <Input
                  id="website"
                  type="url"
                  {...register('website')}
                  placeholder={t('workplace.settings.websitePlaceholder', {
                    defaultValue: 'https://www.example.com',
                  })}
                  className={errors.website ? 'border-destructive' : ''}
                />
                {errors.website && (
                  <p className="text-base text-destructive">{errors.website.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6">
            <h2 className="text-xl font-bold">{t('workplace.settings.description')}</h2>
            <div className="space-y-4">
              {/* Short Description */}
              <div className="space-y-2">
                <Label htmlFor="shortDescription">
                  {t('workplace.settings.shortDescription')}
                  <span className="text-muted-foreground text-base ml-2">
                    {t('workplace.settings.shortDescriptionHint', { defaultValue: '(max 300 characters)' })}
                  </span>
                </Label>
                <Textarea
                  id="shortDescription"
                  {...register('shortDescription')}
                  placeholder={t('workplace.settings.shortDescriptionPlaceholder')}
                  rows={2}
                  className={errors.shortDescription ? 'border-destructive' : ''}
                />
                {errors.shortDescription && (
                  <p className="text-base text-destructive">{errors.shortDescription.message}</p>
                )}
              </div>

              {/* Detailed Description */}
              <div className="space-y-2">
                <Label htmlFor="detailedDescription">
                  {t('workplace.settings.detailedDescription')}
                  <span className="text-muted-foreground text-base ml-2">
                    {t('workplace.settings.detailedDescriptionHint', { defaultValue: '(max 4000 characters)' })}
                  </span>
                </Label>
                <Textarea
                  id="detailedDescription"
                  {...register('detailedDescription')}
                  placeholder={t('workplace.settings.detailedDescriptionPlaceholder', {
                    defaultValue: "Tell us about your company's mission, values, and culture",
                  })}
                  rows={6}
                  className={errors.detailedDescription ? 'border-destructive' : ''}
                />
                {errors.detailedDescription && (
                  <p className="text-base text-destructive">{errors.detailedDescription.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Ethical Tags */}
          <Card className="p-6">
            <h2 className="text-xl font-bold">{t('workplace.settings.ethicalTags')}</h2>
            <div className="space-y-2">
              <p className="text-base text-muted-foreground">
                {t('workplace.settings.ethicalTagsHelper', {
                  defaultValue: "Select tags that represent your company's ethical commitments",
                })}
              </p>
              <MultiSelectDropdown
                selectedTags={selectedTags}
                onTagsChange={handleTagsChange}
                placeholder={t('jobs.tags.select')}
              />
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/workplace/${workplaceId}`)}
              disabled={isSubmitting}
              className="flex-1"
            >
              {t('workplace.settings.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <span className="mr-2">{t('workplace.settings.saving')}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('workplace.settings.saveChanges')}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Danger Zone */}
        <Card className="p-6 mt-8 border-2 border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-destructive mb-1">
                {t('workplace.settings.dangerZone.title')}
              </h2>
              <p className="text-base text-muted-foreground">
                {t('workplace.settings.dangerZone.deleteDescription')}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('workplace.settings.dangerZone.deleteButton')}
          </Button>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                {t('workplace.settings.dangerZone.confirmTitle')}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-3 pt-2">
                  <p className="text-base">
                    {t('workplace.settings.dangerZone.confirmDescription')}
                  </p>
                  <p className="font-semibold text-base">
                    {t('workplace.settings.dangerZone.confirmWarning')}
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="delete-confirmation" className="text-base font-medium">
                  {t('workplace.settings.dangerZone.confirmPlaceholder')}
                </Label>
                <Input
                  id="delete-confirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={workplace?.companyName}
                  className="font-mono"
                  autoComplete="off"
                />
                {deleteConfirmation && deleteConfirmation !== workplace?.companyName && (
                  <p className="text-base text-destructive">
                    {t('workplace.settings.dangerZone.confirmHelper', {
                      defaultValue: 'Please type the exact workplace name to confirm',
                    })}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmation('');
                }}
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                {t('workplace.settings.dangerZone.confirmCancel')}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteWorkplace}
                disabled={
                  isDeleting ||
                  deleteConfirmation !== workplace?.companyName
                }
                className="w-full sm:w-auto"
              >
                {isDeleting ? (
                  t('workplace.settings.dangerZone.deleting')
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('workplace.settings.dangerZone.confirmButton')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

