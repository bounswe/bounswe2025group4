import { StarRating } from '@/components/ui/star-rating';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import type { Review } from '@/types/review.types';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: number) => void;
  onNotHelpful?: (reviewId: number) => void;
}

export function ReviewCard({ review, onHelpful, onNotHelpful }: ReviewCardProps) {
  const { t } = useTranslation('common');
  const [hasVoted, setHasVoted] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('reviews.today');
    if (diffDays === 1) return t('reviews.yesterday');
    if (diffDays < 7) return t('reviews.daysAgo', { count: diffDays });
    if (diffDays < 30) return t('reviews.weeksAgo', { count: Math.floor(diffDays / 7) });
    if (diffDays < 365) return t('reviews.monthsAgo', { count: Math.floor(diffDays / 30) });
    return t('reviews.yearsAgo', { count: Math.floor(diffDays / 365) });
  };

  const handleHelpful = () => {
    if (!hasVoted && onHelpful) {
      onHelpful(review.id);
      setHasVoted(true);
    }
  };

  const handleNotHelpful = () => {
    if (!hasVoted && onNotHelpful) {
      onNotHelpful(review.id);
      setHasVoted(true);
    }
  };

  const getInitials = (name: string) => {
    const anonymousLabel = t('reviews.anonymous');
    if (name === 'Anonymous' || name === anonymousLabel) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = (name: string) => {
    if (name === 'Anonymous') return t('reviews.anonymous');
    return name;
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {getInitials(review.username)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground">{getDisplayName(review.username)}</h4>
                <span className="text-sm text-muted-foreground">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              <StarRating value={review.overallRating} readonly size="sm" showValue />
            </div>
          </div>

          <p className="text-foreground mb-4 leading-relaxed">{review.comment}</p>

          {/* Category Ratings */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('reviews.categories.culture')}:
              </span>
              <StarRating value={review.ratings.culture} readonly size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('reviews.categories.benefits')}:
              </span>
              <StarRating value={review.ratings.benefits} readonly size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('reviews.categories.workLifeBalance')}:
              </span>
              <StarRating value={review.ratings.workLifeBalance} readonly size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('reviews.categories.management')}:
              </span>
              <StarRating value={review.ratings.management} readonly size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('reviews.categories.careerGrowth')}:
              </span>
              <StarRating value={review.ratings.careerGrowth} readonly size="sm" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-3 border-t">
            <button
              onClick={handleHelpful}
              disabled={hasVoted}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>
                {t('reviews.helpful')} ({review.helpful})
              </span>
            </button>
            <button
              onClick={handleNotHelpful}
              disabled={hasVoted}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ThumbsDown className="h-4 w-4" />
              <span>({review.notHelpful})</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors ml-auto">
              <Flag className="h-4 w-4" />
              <span>{t('reviews.report')}</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
