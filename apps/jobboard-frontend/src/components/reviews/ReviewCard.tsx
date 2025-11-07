import { StarRating } from '@/components/ui/star-rating';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Flag, MessageSquare } from 'lucide-react';
import { ReplyCard } from './ReplyCard';
import { ReplyFormDialog } from './ReplyFormDialog';
import type { ReviewResponse } from '@/types/workplace.types';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { reportReview } from '@/services/reviews.service';

interface ReviewCardProps {
  workplaceId: number;
  review: ReviewResponse;
  canReply?: boolean;
  onUpdate?: () => void;
}

export function ReviewCard({ workplaceId, review, canReply, onUpdate }: ReviewCardProps) {
  const { t } = useTranslation('common');
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);


  const handleReport = async () => {
    const reason = prompt(t('reviews.reportPrompt'));
    if (!reason) return;

    setIsReporting(true);
    try {
      await reportReview(workplaceId, review.id, {
        reasonType: 'OTHER',
        description: reason,
      });
      alert(t('reviews.reportSuccess'));
    } catch (error) {
      console.error('Failed to report review:', error);
      alert(t('reviews.reportError'));
    } finally {
      setIsReporting(false);
    }
  };

  const getInitials = () => {
    if (review.anonymous) return 'A';
    // For now, use default initials - would need username from API
    return 'U';
  };

  const getDisplayName = () => {
    if (review.anonymous) return t('reviews.anonymous');
    // Would need username from API
    return `User ${review.userId}`;
  };

  const handleReplySuccess = () => {
    setIsReplyDialogOpen(false);
    onUpdate?.();
  };

  // Convert ethicalPolicyRatings to display format
  const policyEntries = Object.entries(review.ethicalPolicyRatings || {});

  return (
    <>
      <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">{getDisplayName()}</h4>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <StarRating value={review.overallRating} readonly size="sm" showValue />
              </div>
            </div>

            {/* Title */}
            {review.title && (
              <h5 className="font-medium text-foreground mb-2">{review.title}</h5>
            )}

            {/* Content */}
            {review.content && (
              <p className="text-foreground mb-4 leading-relaxed whitespace-pre-wrap">
                {review.content}
              </p>
            )}

            {/* Policy Ratings */}
            {policyEntries.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {policyEntries.map(([policy, rating]) => (
                  <div key={policy} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground capitalize">
                      {policy.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <StarRating value={rating as number} readonly size="sm" />
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ThumbsUp className="h-4 w-4" />
                <span>
                  {t('reviews.helpful')} ({review.helpfulCount})
                </span>
              </div>
              <button
                onClick={handleReport}
                disabled={isReporting}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              >
                <Flag className="h-4 w-4" />
                <span>{t('reviews.report')}</span>
              </button>
              {canReply && !review.reply && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReplyDialogOpen(true)}
                  className="ml-auto"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t('reviews.reply.replyToReview')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Display Reply if it exists */}
        {review.reply && (
          <ReplyCard
            workplaceId={workplaceId}
            reviewId={review.id}
            reply={review.reply}
            onUpdate={onUpdate}
            onDelete={onUpdate}
          />
        )}
      </Card>

      {/* Reply Dialog */}
      {isReplyDialogOpen && (
        <ReplyFormDialog
          workplaceId={workplaceId}
          reviewId={review.id}
          open={isReplyDialogOpen}
          onOpenChange={setIsReplyDialogOpen}
          onSuccess={handleReplySuccess}
        />
      )}
    </>
  );
}
