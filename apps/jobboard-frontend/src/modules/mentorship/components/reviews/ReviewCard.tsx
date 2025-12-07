import { StarRating } from '@shared/components/ui/star-rating';
import { Card } from '@shared/components/ui/card';
import { Avatar, AvatarFallback } from '@shared/components/ui/avatar';
import { Button } from '@shared/components/ui/button';
import { ThumbsUp, Flag, MessageSquare } from 'lucide-react';
import { ReplyCard } from './ReplyCard';
import { ReplyFormDialog } from './ReplyFormDialog';
import type { ReviewResponse } from '@shared/types/workplace.types';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useReportModal } from '@shared/hooks/useReportModal';
import { reportWorkplaceReview } from '@modules/workplace/services/workplace-report.service';
import { useReviewHelpful } from '@shared/hooks/useReviewHelpful';

interface ReviewCardProps {
  workplaceId: number;
  review: ReviewResponse;
  canReply?: boolean;
  onUpdate?: () => void;
  onHelpfulUpdate?: (reviewId: number, newHelpfulCount: number, helpfulByUser?: boolean) => void;
}

export function ReviewCard({
  workplaceId,
  review,
  canReply,
  onUpdate,
  onHelpfulUpdate,
}: ReviewCardProps) {
  const { t } = useTranslation('common');
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const { openReport, ReportModalElement } = useReportModal();

  // Initialize helpful vote hook
  const {
    helpfulCount,
    userVoted,
    isLoading: isHelpfulLoading,
    toggleHelpful,
    canVote,
  } = useReviewHelpful({
    workplaceId,
    reviewId: review.id,
    initialHelpfulCount: review.helpfulCount,
    initialUserVoted: review.helpfulByUser ?? false, // sync initial state from API
  });

  // Handle helpful count updates
  const handleHelpfulClick = async () => {
    const updatedReview = await toggleHelpful();
    // Notify parent component of helpful count change
    if (updatedReview) {
      onHelpfulUpdate?.(review.id, updatedReview.helpfulCount, updatedReview.helpfulByUser);
    }
  };

  const handleReport = () => {
    openReport({
      title: t('reviews.report'),
      subtitle: t('reviews.reportSubtitle', { name: getDisplayName() }),
      contextSnippet: review.content,
      reportType: 'Review',
      reportedName: getDisplayName(),
      onSubmit: async (message, reason) => {
        await reportWorkplaceReview(workplaceId, review.id, message, reason);
      },
    });
  };

  const getInitials = () => {
    if (review.anonymous) return 'A';
    const name = review.nameSurname || review.username;
    if (name) {
      return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (review.anonymous) return t('reviews.anonymous');
    return review.nameSurname || review.username || `User ${review.userId}`;
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
              <button
                onClick={handleReport}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                title={t('reviews.report')}
              >
                <Flag className="h-4 w-4" />
                <span className="sr-only">{t('reviews.report')}</span>
              </button>
            </div>

            {/* Title */}
            {review.title && <h5 className="font-medium text-foreground mb-2">{review.title}</h5>}

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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHelpfulClick}
                disabled={isHelpfulLoading || !canVote}
                className={`flex items-center gap-1.5 text-sm ${
                  userVoted
                    ? 'text-primary hover:text-primary/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title={canVote ? t('reviews.toggleHelpful') : t('reviews.helpful')}
              >
                <ThumbsUp className={`h-4 w-4 ${userVoted ? 'fill-current' : ''}`} />
                <span>
                  {t('reviews.helpful')} ({helpfulCount})
                </span>
              </Button>
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
      {ReportModalElement}
    </>
  );
}
