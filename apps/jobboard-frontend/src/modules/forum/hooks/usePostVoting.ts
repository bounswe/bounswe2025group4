/**
 * usePostVoting Hook
 * Manages upvote/downvote state and operations for forum posts
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upvotePost, downvotePost, removePostUpvote, removePostDownvote } from '@modules/forum/services/forum.service';
import { normalizeApiError } from '@shared/utils/error-handler';
import { forumKeys } from '@shared/lib/query-keys';

interface UsePostVotingProps {
  postId: number;
  initialUpvoteCount: number;
  initialDownvoteCount: number;
  initialUserUpvoted?: boolean;
  initialUserDownvoted?: boolean;
}

interface UsePostVotingReturn {
  upvoteCount: number;
  downvoteCount: number;
  userUpvoted: boolean;
  userDownvoted: boolean;
  isLoading: boolean;
  toggleUpvote: () => Promise<void>;
  toggleDownvote: () => Promise<void>;
}

export function usePostVoting({
  postId,
  initialUpvoteCount,
  initialDownvoteCount,
  initialUserUpvoted = false,
  initialUserDownvoted = false,
}: UsePostVotingProps): UsePostVotingReturn {
  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount);
  const [downvoteCount, setDownvoteCount] = useState(initialDownvoteCount);
  const [userUpvoted, setUserUpvoted] = useState(initialUserUpvoted);
  const [userDownvoted, setUserDownvoted] = useState(initialUserDownvoted);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state when initial values change (e.g., when post data loads)
  useEffect(() => {
    setUpvoteCount(initialUpvoteCount);
    setDownvoteCount(initialDownvoteCount);
    setUserUpvoted(initialUserUpvoted ?? false);
    setUserDownvoted(initialUserDownvoted ?? false);
  }, [initialUpvoteCount, initialDownvoteCount, initialUserUpvoted, initialUserDownvoted]);
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();

  const upvoteMutation = useMutation({
    mutationFn: () => upvotePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
    },
  });

  const removeUpvoteMutation = useMutation({
    mutationFn: () => removePostUpvote(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
    },
  });

  const downvoteMutation = useMutation({
    mutationFn: () => downvotePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
    },
  });

  const removeDownvoteMutation = useMutation({
    mutationFn: () => removePostDownvote(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
    },
  });

  const toggleUpvote = useCallback(async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);

    // Save previous state for rollback
    const prevUpvoteCount = upvoteCount;
    const prevDownvoteCount = downvoteCount;
    const prevUserUpvoted = userUpvoted;
    const prevUserDownvoted = userDownvoted;

    try {
      if (userUpvoted) {
        // Remove upvote
        setUserUpvoted(false);
        setUpvoteCount(Math.max(upvoteCount - 1, 0));
        await removeUpvoteMutation.mutateAsync();
      } else {
        // Add upvote (and remove downvote if exists)
        if (userDownvoted) {
          setUserDownvoted(false);
          setDownvoteCount(Math.max(downvoteCount - 1, 0));
        }
        setUserUpvoted(true);
        setUpvoteCount(upvoteCount + 1);
        await upvoteMutation.mutateAsync();
      }
    } catch (error) {
      // Rollback optimistic updates
      setUpvoteCount(prevUpvoteCount);
      setDownvoteCount(prevDownvoteCount);
      setUserUpvoted(prevUserUpvoted);
      setUserDownvoted(prevUserDownvoted);

      console.error('Failed to toggle upvote:', error);
      toast.error(normalizeApiError(error, t('forum.voteError') || 'Failed to update vote').friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  }, [upvoteCount, downvoteCount, userUpvoted, userDownvoted, isLoading, postId, upvoteMutation, removeUpvoteMutation, t]);

  const toggleDownvote = useCallback(async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);

    // Save previous state for rollback
    const prevUpvoteCount = upvoteCount;
    const prevDownvoteCount = downvoteCount;
    const prevUserUpvoted = userUpvoted;
    const prevUserDownvoted = userDownvoted;

    try {
      if (userDownvoted) {
        // Remove downvote
        setUserDownvoted(false);
        setDownvoteCount(Math.max(downvoteCount - 1, 0));
        await removeDownvoteMutation.mutateAsync();
      } else {
        // Add downvote (and remove upvote if exists)
        if (userUpvoted) {
          setUserUpvoted(false);
          setUpvoteCount(Math.max(upvoteCount - 1, 0));
        }
        setUserDownvoted(true);
        setDownvoteCount(downvoteCount + 1);
        await downvoteMutation.mutateAsync();
      }
    } catch (error) {
      // Rollback optimistic updates
      setUpvoteCount(prevUpvoteCount);
      setDownvoteCount(prevDownvoteCount);
      setUserUpvoted(prevUserUpvoted);
      setUserDownvoted(prevUserDownvoted);

      console.error('Failed to toggle downvote:', error);
      toast.error(normalizeApiError(error, t('forum.voteError') || 'Failed to update vote').friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  }, [upvoteCount, downvoteCount, userUpvoted, userDownvoted, isLoading, postId, downvoteMutation, removeDownvoteMutation, t]);

  return {
    upvoteCount,
    downvoteCount,
    userUpvoted,
    userDownvoted,
    isLoading,
    toggleUpvote,
    toggleDownvote,
  };
}
