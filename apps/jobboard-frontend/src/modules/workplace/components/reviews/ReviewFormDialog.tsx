import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/components/ui/dialog';
import { Button } from '@shared/components/ui/button';
import { Label } from '@shared/components/ui/label';
import { Input } from '@shared/components/ui/input';
import { Textarea } from '@shared/components/ui/textarea';
import { Checkbox } from '@shared/components/ui/checkbox';
import { StarRating } from '@shared/components/ui/star-rating';
import { useTranslation } from 'react-i18next';
import type { ReviewCreateRequest, ReviewResponse } from '@shared/types/workplace.types';
import { useCreateReviewMutation } from '@modules/workplace/services/reviews.service';
import { normalizeApiError } from '@shared/utils/error-handler';
import { TAG_TO_KEY_MAP } from '@shared/constants/ethical-tags';

interface ReviewFormDialogProps {
  workplaceId: number;
  workplaceName: string;
  ethicalTags?: string[];
  onReviewSubmitted?: () => void;
  onOptimisticReview?: (review: ReviewResponse) => void;
  onReviewSettled?: (optimisticId: number, actual?: ReviewResponse) => void;
  trigger?: React.ReactNode;
}

export function ReviewFormDialog({
  workplaceId,
  workplaceName,
  ethicalTags,
  onReviewSubmitted,
  onOptimisticReview,
  onReviewSettled,
  trigger,
}: ReviewFormDialogProps) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createReviewMutation = useCreateReviewMutation(workplaceId);

  const policyOptions = useMemo(
    () => (ethicalTags && ethicalTags.length > 0 ? ethicalTags : []),
    [ethicalTags],
  );

  const createEmptyPolicyRatings = useCallback(
    (policies: string[]) => Object.fromEntries(policies.map((policy) => [policy, 0])),
    [],
  );

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    policyRatings: createEmptyPolicyRatings(policyOptions),
    anonymous: false,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      policyRatings: createEmptyPolicyRatings(policyOptions),
    }));
  }, [policyOptions, createEmptyPolicyRatings]);

  const calculateOverallRating = (ratings: Record<string, number>) => {
    const entries = Object.values(ratings ?? {});
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, val) => acc + val, 0);
    return sum / entries.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const optimisticId = Date.now();

    // Validation - at least one rating required
    const hasRating =
      policyOptions.length === 0 || Object.values(formData.policyRatings).some((r) => r > 0);
    if (!hasRating) {
      setError(t('reviews.errors.atLeastOneRating'));
      return;
    }

    // Content is optional but if provided must meet length requirements
    if (formData.content && formData.content.length > 0) {
      if (formData.content.length < 10) {
        setError(t('reviews.errors.commentTooShort'));
        return;
      }
      if (formData.content.length > 4000) {
        setError(t('reviews.errors.commentTooLong'));
        return;
      }
    }

    try {
      const request: ReviewCreateRequest = {
        title: formData.title || undefined,
        content: formData.content || undefined,
        ethicalPolicyRatings: formData.policyRatings,
        anonymous: formData.anonymous,
      };
      const optimisticReview: ReviewResponse = {
        id: optimisticId,
        workplaceId,
        userId: 0,
        title: request.title,
        content: request.content,
        anonymous: Boolean(request.anonymous),
        helpfulCount: 0,
        helpfulByUser: false,
        overallRating: calculateOverallRating(request.ethicalPolicyRatings),
        ethicalPolicyRatings: request.ethicalPolicyRatings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onOptimisticReview?.(optimisticReview);

      setLoading(true);
      const created = await createReviewMutation.mutateAsync(request);
      onReviewSettled?.(optimisticId, created);
      setOpen(false);
      resetForm();
      onReviewSubmitted?.();
    } catch (err: unknown) {
      onReviewSettled?.(optimisticId);
      const normalized = normalizeApiError(err, t('reviews.errors.submissionFailed'));
      setError(normalized.friendlyMessage);
      console.error('Failed to submit review:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      policyRatings: createEmptyPolicyRatings(policyOptions),
      anonymous: false,
    });
    setError(null);
  };

  const handlePolicyRatingChange = (policy: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      policyRatings: {
        ...prev.policyRatings,
        [policy]: value,
      },
    }));
  };

  const getPolicyLabel = (policy: string) => {
    const translationKey = TAG_TO_KEY_MAP[policy as keyof typeof TAG_TO_KEY_MAP];
    return translationKey ? t(`jobs.tags.tags.${translationKey}`, policy) : policy;
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button>{t('reviews.writeReview')}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('reviews.writeReviewFor', { company: workplaceName })}</DialogTitle>
          <DialogDescription>{t('reviews.shareExperience')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {t('reviews.reviewTitle')} ({t('common.optional')})
            </Label>
            <Input
              id="title"
              placeholder={t('reviews.titlePlaceholder')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={255}
            />
          </div>

          {/* Ethical Policy Ratings */}
          <div className="space-y-4">
            <h4 className="font-semibold">{t('reviews.rateEthicalPolicies')}</h4>
            <p className="text-sm text-muted-foreground">{t('reviews.rateAtLeastOne')}</p>

            <div className="grid gap-4">
              {policyOptions.map((policy) => (
                <div key={policy} className="flex items-center justify-between">
                  <Label htmlFor={policy} className="capitalize">
                    {getPolicyLabel(policy)}
                  </Label>
                  <StarRating
                    value={formData.policyRatings[policy] || 0}
                    onChange={(value) => handlePolicyRatingChange(policy, value)}
                    size="md"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              {t('reviews.yourReview')} ({t('common.optional')})
            </Label>
            <Textarea
              id="content"
              placeholder={t('reviews.reviewPlaceholder')}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              {formData.content.length} / 4000 {t('reviews.characters')}
            </p>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.anonymous}
              onCheckedChange={(checked) => setFormData({ ...formData, anonymous: checked as boolean })}
            />
            <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
              {t('reviews.postAnonymously')}
            </Label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.submitting') : t('reviews.submitReview')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

