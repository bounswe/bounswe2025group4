/**
 * useCommentVoting Hook
 * Manages upvote/downvote state and operations for forum comments
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upvoteComment, downvoteComment, removeCommentUpvote, removeCommentDownvote } from '@modules/forum/services/forum.service';
import { normalizeApiError } from '@shared/utils/error-handler';
import { forumKeys } from '@shared/lib/query-keys';

interface UseCommentVotingProps {
  commentId: number;
  postId: number;
  initialUpvoteCount: number;
  initialDownvoteCount: number;
  initialUserUpvoted?: boolean;
  initialUserDownvoted?: boolean;
}

interface UseCommentVotingReturn {
  upvoteCount: number;
  downvoteCount: number;
  userUpvoted: boolean;
  userDownvoted: boolean;
  isLoading: boolean;
  toggleUpvote: () => Promise<void>;
  toggleDownvote: () => Promise<void>;
}

export function useCommentVoting({
  commentId,
  postId,
  initialUpvoteCount,
  initialDownvoteCount,
  initialUserUpvoted = false,
  initialUserDownvoted = false,
}: UseCommentVotingProps): UseCommentVotingReturn {
  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount);
  const [downvoteCount, setDownvoteCount] = useState(initialDownvoteCount);
  const [userUpvoted, setUserUpvoted] = useState(initialUserUpvoted);
  const [userDownvoted, setUserDownvoted] = useState(initialUserDownvoted);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();

  const upvoteMutation = useMutation({
    mutationFn: () => upvoteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.comment(commentId) });
    },
  });

  const removeUpvoteMutation = useMutation({
    mutationFn: () => removeCommentUpvote(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.comment(commentId) });
    },
  });

  const downvoteMutation = useMutation({
    mutationFn: () => downvoteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.comment(commentId) });
    },
  });

  const removeDownvoteMutation = useMutation({
    mutationFn: () => removeCommentDownvote(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.comment(commentId) });
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
  }, [upvoteCount, downvoteCount, userUpvoted, userDownvoted, isLoading, commentId, upvoteMutation, removeUpvoteMutation, t]);

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
  }, [upvoteCount, downvoteCount, userUpvoted, userDownvoted, isLoading, commentId, downvoteMutation, removeDownvoteMutation, t]);

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
