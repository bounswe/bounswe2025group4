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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { StarRating } from '@/components/ui/star-rating';
import { useTranslation } from 'react-i18next';
import { createReview } from '@/services/reviews.service';
import type { CreateReviewRequest } from '@/types/review.types';

interface ReviewFormDialogProps {
  companyId: number;
  companyName: string;
  onReviewSubmitted?: () => void;
  trigger?: React.ReactNode;
}

export function ReviewFormDialog({
  companyId,
  companyName,
  onReviewSubmitted,
  trigger,
}: ReviewFormDialogProps) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    culture: 0,
    benefits: 0,
    workLifeBalance: 0,
    management: 0,
    careerGrowth: 0,
    comment: '',
    isAnonymous: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (
      formData.culture === 0 ||
      formData.benefits === 0 ||
      formData.workLifeBalance === 0 ||
      formData.management === 0 ||
      formData.careerGrowth === 0
    ) {
      setError(t('reviews.errors.allRatingsRequired'));
      return;
    }

    if (formData.comment.length < 10) {
      setError(t('reviews.errors.commentTooShort'));
      return;
    }

    if (formData.comment.length > 2000) {
      setError(t('reviews.errors.commentTooLong'));
      return;
    }

    setLoading(true);

    try {
      const request: CreateReviewRequest = {
        companyId,
        isAnonymous: formData.isAnonymous,
        ratings: {
          culture: formData.culture,
          benefits: formData.benefits,
          workLifeBalance: formData.workLifeBalance,
          management: formData.management,
          careerGrowth: formData.careerGrowth,
        },
        comment: formData.comment,
      };

      const response = await createReview(request);

      if (response.success) {
        setOpen(false);
        resetForm();
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        setError(t('reviews.errors.submissionFailed'));
      }
    } catch (err) {
      setError(t('reviews.errors.submissionFailed'));
      console.error('Failed to submit review:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      culture: 0,
      benefits: 0,
      workLifeBalance: 0,
      management: 0,
      careerGrowth: 0,
      comment: '',
      isAnonymous: false,
    });
    setError(null);
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
          <DialogTitle>{t('reviews.writeReviewFor', { company: companyName })}</DialogTitle>
          <DialogDescription>{t('reviews.shareExperience')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold">{t('reviews.rateYourExperience')}</h4>

            <div className="grid gap-4">
              {/* Culture */}
              <div className="flex items-center justify-between">
                <Label htmlFor="culture">{t('reviews.categories.culture')}</Label>
                <StarRating
                  value={formData.culture}
                  onChange={(value) => setFormData({ ...formData, culture: value })}
                  size="md"
                />
              </div>

              {/* Benefits */}
              <div className="flex items-center justify-between">
                <Label htmlFor="benefits">{t('reviews.categories.benefits')}</Label>
                <StarRating
                  value={formData.benefits}
                  onChange={(value) => setFormData({ ...formData, benefits: value })}
                  size="md"
                />
              </div>

              {/* Work-Life Balance */}
              <div className="flex items-center justify-between">
                <Label htmlFor="workLifeBalance">
                  {t('reviews.categories.workLifeBalance')}
                </Label>
                <StarRating
                  value={formData.workLifeBalance}
                  onChange={(value) => setFormData({ ...formData, workLifeBalance: value })}
                  size="md"
                />
              </div>

              {/* Management */}
              <div className="flex items-center justify-between">
                <Label htmlFor="management">{t('reviews.categories.management')}</Label>
                <StarRating
                  value={formData.management}
                  onChange={(value) => setFormData({ ...formData, management: value })}
                  size="md"
                />
              </div>

              {/* Career Growth */}
              <div className="flex items-center justify-between">
                <Label htmlFor="careerGrowth">{t('reviews.categories.careerGrowth')}</Label>
                <StarRating
                  value={formData.careerGrowth}
                  onChange={(value) => setFormData({ ...formData, careerGrowth: value })}
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">{t('reviews.yourReview')}</Label>
            <Textarea
              id="comment"
              placeholder={t('reviews.reviewPlaceholder')}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={6}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              {formData.comment.length} / 2000 {t('reviews.characters')}
            </p>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isAnonymous: checked as boolean })
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
              {t('reviews.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('reviews.submitting') : t('reviews.submitReview')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
