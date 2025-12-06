/**
 * useReviewHelpful Hook
 * Manages helpful vote state and operations for reviews
 */

import { useState, useCallback } from 'react';
import { markReviewHelpful } from '@modules/mentorship/services/reviews.service';
import type { ReviewResponse } from '@shared/types/workplace.types';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface UseReviewHelpfulProps {
  workplaceId: number;
  reviewId: number;
  initialHelpfulCount: number;
  initialUserVoted?: boolean;
}

interface UseReviewHelpfulReturn {
  helpfulCount: number;
  userVoted: boolean;
  isLoading: boolean;
  toggleHelpful: () => Promise<ReviewResponse | undefined>;
  canVote: boolean;
}

export function useReviewHelpful({
  workplaceId,
  reviewId,
  initialHelpfulCount,
  initialUserVoted = false,
}: UseReviewHelpfulProps): UseReviewHelpfulReturn {
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [userVoted, setUserVoted] = useState(initialUserVoted);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation('common');

  const canVote = true; // will be enhanced with auth checks when available

  const toggleHelpful = useCallback(async (): Promise<ReviewResponse | undefined> => {
    if (isLoading || !canVote) return;

    setIsLoading(true);

    // Optimistic update
    const previousCount = helpfulCount;
    const previousVoted = userVoted;
    const optimisticCount = previousVoted ? previousCount - 1 : previousCount + 1;

    setUserVoted(!previousVoted);
    setHelpfulCount(Math.max(optimisticCount, 0));

    try {
      // Backend toggles helpful status via single POST endpoint
      const updatedReview = await markReviewHelpful(workplaceId, reviewId);

      const newUserVoted = !!updatedReview.helpfulByUser;
      setHelpfulCount(updatedReview.helpfulCount);
      setUserVoted(newUserVoted);

      toast.success(
        newUserVoted
          ? t('reviews.helpfulMarked') || 'Marked as helpful'
          : t('reviews.helpfulRemoved') || 'Removed helpful mark',
      );

      return updatedReview;
    } catch (error) {
      // Revert optimistic update on error
      setHelpfulCount(previousCount);
      setUserVoted(previousVoted);

      console.error('Failed to toggle helpful vote:', error);

      toast.error(t('reviews.helpfulError') || 'Failed to update helpful vote');
    } finally {
      setIsLoading(false);
    }
  }, [workplaceId, reviewId, helpfulCount, isLoading, canVote, toast, t, userVoted]);

  return {
    helpfulCount,
    userVoted,
    isLoading,
    toggleHelpful,
    canVote,
  };
}
