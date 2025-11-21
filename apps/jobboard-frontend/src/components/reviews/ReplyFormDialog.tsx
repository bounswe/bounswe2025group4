/**
 * ReplyFormDialog Component
 * Form dialog for employers to reply to reviews
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createReply, updateReply } from '@/services/reviews.service';
import type { ReplyResponse } from '@/types/workplace.types';
import { getErrorMessage } from '@/utils/error-handler';

const replySchema = z.object({
  content: z
    .string()
    .min(10, 'Reply must be at least 10 characters')
    .max(2000, 'Reply must not exceed 2000 characters'),
});

type ReplyFormData = z.infer<typeof replySchema>;

interface ReplyFormDialogProps {
  workplaceId: number;
  reviewId: number;
  existingReply?: ReplyResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ReplyFormDialog({
  workplaceId,
  reviewId,
  existingReply,
  open,
  onOpenChange,
  onSuccess,
}: ReplyFormDialogProps) {
  const { t } = useTranslation('common');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      content: existingReply?.content || '',
    },
  });

  const isEditMode = !!existingReply;

  const onSubmit = async (data: ReplyFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditMode) {
        await updateReply(workplaceId, reviewId, data);
      } else {
        await createReply(workplaceId, reviewId, data);
      }

      reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error('Failed to submit reply:', err);
      setError(
        getErrorMessage(
          err,
          t(isEditMode ? 'reviews.reply.updateError' : 'reviews.reply.submitError')
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? t('reviews.reply.editReply')
                : t('reviews.reply.replyToReview')}
            </DialogTitle>
            <DialogDescription>
              {t('reviews.reply.replyDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="content">
                {t('reviews.reply.yourReply')}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Textarea
                id="content"
                {...register('content')}
                placeholder={t('reviews.reply.replyPlaceholder')}
                rows={6}
                className={errors.content ? 'border-destructive' : ''}
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('reviews.reply.characterLimit', { min: 10, max: 2000 })}
              </p>
            </div>

            <div className="p-3 bg-muted/50 rounded-md text-sm">
              <p className="font-medium mb-1">{t('reviews.reply.guidelines')}</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t('reviews.reply.guideline1')}</li>
                <li>{t('reviews.reply.guideline2')}</li>
                <li>{t('reviews.reply.guideline3')}</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t('common.submitting')
                : isEditMode
                ? t('common.update')
                : t('reviews.reply.postReply')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
