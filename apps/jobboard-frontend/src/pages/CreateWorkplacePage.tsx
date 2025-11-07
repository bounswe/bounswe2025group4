/**
 * CreateWorkplacePage
 * Form for employers to create a new workplace
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
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { createWorkplace } from '@/services/workplace.service';
import { createWorkplaceSchema, type CreateWorkplaceFormData } from '@/schemas/create-workplace.schema';
import { type EthicalTag } from '@/types/job';

export default function CreateWorkplacePage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<EthicalTag[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateWorkplaceFormData>({
    resolver: zodResolver(createWorkplaceSchema),
    defaultValues: {
      ethicalTags: [],
    },
  });

  const onSubmit = async (data: CreateWorkplaceFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const workplace = await createWorkplace({
        ...data,
        ethicalTags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      navigate(`/workplace/${workplace.id}`);
    } catch (err: any) {
      console.error('Failed to create workplace:', err);
      setError(err.response?.data?.message || 'Failed to create workplace. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (tags: EthicalTag[]) => {
    setSelectedTags(tags);
    setValue('ethicalTags', tags);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Workplace</h1>
          <p className="text-muted-foreground">
            Add your company to the platform and start building your reputation
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                {...register('companyName')}
                placeholder="Enter company name"
                className={errors.companyName ? 'border-destructive' : ''}
              />
              {errors.companyName && (
                <p className="text-sm text-destructive">{errors.companyName.message}</p>
              )}
            </div>

            {/* Sector */}
            <div className="space-y-2">
              <Label htmlFor="sector">
                Sector <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sector"
                {...register('sector')}
                placeholder="e.g., Technology, Healthcare, Education"
                className={errors.sector ? 'border-destructive' : ''}
              />
              {errors.sector && (
                <p className="text-sm text-destructive">{errors.sector.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="e.g., San Francisco, CA"
                className={errors.location ? 'border-destructive' : ''}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                {...register('website')}
                placeholder="https://www.example.com"
                className={errors.website ? 'border-destructive' : ''}
              />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website.message}</p>
              )}
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <Label htmlFor="shortDescription">
                Short Description
                <span className="text-muted-foreground text-xs ml-2">(max 300 characters)</span>
              </Label>
              <Textarea
                id="shortDescription"
                {...register('shortDescription')}
                placeholder="A brief tagline or summary"
                rows={2}
                className={errors.shortDescription ? 'border-destructive' : ''}
              />
              {errors.shortDescription && (
                <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
              )}
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <Label htmlFor="detailedDescription">
                Detailed Description
                <span className="text-muted-foreground text-xs ml-2">(max 4000 characters)</span>
              </Label>
              <Textarea
                id="detailedDescription"
                {...register('detailedDescription')}
                placeholder="Tell us about your company's mission, values, and culture"
                rows={6}
                className={errors.detailedDescription ? 'border-destructive' : ''}
              />
              {errors.detailedDescription && (
                <p className="text-sm text-destructive">{errors.detailedDescription.message}</p>
              )}
            </div>

            {/* Ethical Tags */}
            <div className="space-y-3">
              <Label>Ethical Tags</Label>
              <p className="text-sm text-muted-foreground">
                Select tags that represent your company's ethical commitments
              </p>
              <MultiSelectDropdown
                selectedTags={selectedTags}
                onTagsChange={handleTagsChange}
                placeholder={t('ethicalTags.select')}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Creating...' : 'Create Workplace'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
