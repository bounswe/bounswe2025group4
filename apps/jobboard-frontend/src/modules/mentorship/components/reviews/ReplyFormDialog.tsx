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
} from '@shared/components/ui/dialog';
import { Button } from '@shared/components/ui/button';
import { Textarea } from '@shared/components/ui/textarea';
import { Label } from '@shared/components/ui/label';
import { useCreateReplyMutation, useUpdateReplyMutation } from '@modules/mentorship/services/reviews.service';
import type { ReplyResponse } from '@shared/types/workplace.types';
import { normalizeApiError } from '@shared/utils/error-handler';

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
  onOptimisticReply?: (reply: ReplyResponse) => void;
  onReplySettled?: (reviewId: number, optimisticId: number, actual?: ReplyResponse) => void;
}

export function ReplyFormDialog({
  workplaceId,
  reviewId,
  existingReply,
  open,
  onOpenChange,
  onSuccess,
  onOptimisticReply,
  onReplySettled,
}: ReplyFormDialogProps) {
  const { t } = useTranslation('common');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createReplyMutation = useCreateReplyMutation(workplaceId, reviewId);
  const updateReplyMutation = useUpdateReplyMutation(workplaceId, reviewId);

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
    setError(null);
    setIsSubmitting(true);
    const optimisticId = existingReply?.id ?? Date.now();

    try {
      const optimisticReply: ReplyResponse = {
        id: optimisticId,
        reviewId,
        employerUserId: 0,
        content: data.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onOptimisticReply?.(optimisticReply);

      if (isEditMode) {
        const updated = await updateReplyMutation.mutateAsync(data);
        onReplySettled?.(reviewId, optimisticId, updated);
      } else {
        const created = await createReplyMutation.mutateAsync(data);
        onReplySettled?.(reviewId, optimisticId, created);
      }

      reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      onReplySettled?.(reviewId, optimisticId);
      console.error('Failed to submit reply:', err);
      setError(
        normalizeApiError(
          err,
          t(isEditMode ? 'reviews.reply.updateError' : 'reviews.reply.submitError')
        ).friendlyMessage
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
