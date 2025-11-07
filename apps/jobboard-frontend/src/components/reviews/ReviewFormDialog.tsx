import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { StarRating } from '@/components/ui/star-rating';
import { useTranslation } from 'react-i18next';
import { createReview } from '@/services/reviews.service';
import type { ReviewCreateRequest } from '@/types/workplace.types';
import { getErrorMessage } from '@/utils/error-handler';

interface ReviewFormDialogProps {
  workplaceId: number;
  workplaceName: string;
  onReviewSubmitted?: () => void;
  trigger?: React.ReactNode;
}

export function ReviewFormDialog({
  workplaceId,
  workplaceName,
  onReviewSubmitted,
  trigger,
}: ReviewFormDialogProps) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default ethical policies - can be customized
  const defaultPolicies = [
    'diversity',
    'sustainability',
    'workLifeBalance',
    'fairCompensation',
    'transparency',
  ];

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    policyRatings: Object.fromEntries(defaultPolicies.map(p => [p, 0])),
    anonymous: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation - at least one rating required
    const hasRating = Object.values(formData.policyRatings).some(r => r > 0);
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

    setLoading(true);

    try {
      const request: ReviewCreateRequest = {
        title: formData.title || undefined,
        content: formData.content || undefined,
        ethicalPolicyRatings: formData.policyRatings,
        anonymous: formData.anonymous,
      };

      await createReview(workplaceId, request);
      setOpen(false);
      resetForm();
      onReviewSubmitted?.();
    } catch (err: unknown) {
      setError(getErrorMessage(err, t('reviews.errors.submissionFailed')));
      console.error('Failed to submit review:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      policyRatings: Object.fromEntries(defaultPolicies.map(p => [p, 0])),
      anonymous: false,
    });
    setError(null);
  };

  const handlePolicyRatingChange = (policy: string, value: number) => {
    setFormData({
      ...formData,
      policyRatings: {
        ...formData.policyRatings,
        [policy]: value,
      },
    });
  };

  const formatPolicyName = (policy: string) => {
    return policy.replace(/([A-Z])/g, ' $1').trim();
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
            <Label htmlFor="title">{t('reviews.reviewTitle')} ({t('common.optional')})</Label>
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
              {defaultPolicies.map((policy) => (
                <div key={policy} className="flex items-center justify-between">
                  <Label htmlFor={policy} className="capitalize">
                    {formatPolicyName(policy)}
                  </Label>
                  <StarRating
                    value={formData.policyRatings[policy]}
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
              onCheckedChange={(checked) =>
                setFormData({ ...formData, anonymous: checked as boolean })
              }
            />
            <Label
              htmlFor="anonymous"
              className="text-sm font-normal cursor-pointer"
            >
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
