/**
 * Reviews Service
 * Handles workplace review and reply operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '@shared/lib/api-client';
import { normalizeApiError } from '@shared/utils/error-handler';
import { reviewKeys } from '@shared/lib/query-keys';
import { useQueryWithToast } from '@shared/hooks/useQueryWithToast';
import type {
  ReviewCreateRequest,
  ReviewUpdateRequest,
  ReviewResponse,
  ReplyCreateRequest,
  ReplyUpdateRequest,
  ReplyResponse,
  PaginatedReviewResponse,
  ReviewListParams,
  ReviewReportCreate,
  ApiMessage,
} from '@shared/types/workplace.types';

const BASE_PATH = '/workplace';

/**
 * Get paginated list of reviews for a workplace
 * @param workplaceId Workplace ID
 * @param params Query parameters for filtering and pagination
 */
async function fetchWorkplaceReviews(
  workplaceId: number,
  params: ReviewListParams = {},
): Promise<PaginatedReviewResponse> {
  const response = await api.get<PaginatedReviewResponse>(`${BASE_PATH}/${workplaceId}/review`, {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 10,
      ...params,
    },
  });
  return response.data;
}

/**
 * Get a specific review
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 */
async function fetchReview(workplaceId: number, reviewId: number): Promise<ReviewResponse> {
  const response = await api.get<ReviewResponse>(`${BASE_PATH}/${workplaceId}/review/${reviewId}`);
  return response.data;
}

/**
 * Create a new review for a workplace
 * @param workplaceId Workplace ID
 * @param request Review data
 */
async function createReview(
  workplaceId: number,
  request: ReviewCreateRequest,
): Promise<ReviewResponse> {
  const response = await api.post<ReviewResponse>(`${BASE_PATH}/${workplaceId}/review`, request);
  return response.data;
}

/**
 * Update an existing review
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 * @param request Updated review data
 */
async function updateReview(
  workplaceId: number,
  reviewId: number,
  request: ReviewUpdateRequest,
): Promise<ReviewResponse> {
  const response = await api.put<ReviewResponse>(
    `${BASE_PATH}/${workplaceId}/review/${reviewId}`,
    request,
  );
  return response.data;
}

// ============================================================================
// Helpful Vote Operations
// ============================================================================

/**
 * Mark a review as helpful.
 * Backend only exposes this POST endpoint for helpful count interaction.
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 */
async function markReviewHelpful(
  workplaceId: number,
  reviewId: number,
): Promise<ReviewResponse> {
  const response = await api.post<ReviewResponse>(
    `${BASE_PATH}/${workplaceId}/review/${reviewId}/helpful`,
  );
  return response.data;
}

/**
 * Report a review
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 * @param request Report data (reason and description)
 */
async function reportReview(
  workplaceId: number,
  reviewId: number,
  request: ReviewReportCreate,
): Promise<ApiMessage> {
  const response = await api.post<ApiMessage>(
    `${BASE_PATH}/${workplaceId}/review/${reviewId}/report`,
    request,
  );
  return response.data;
}

// ============================================================================
// Reply Operations
// ============================================================================

/**
 * Create a reply to a review (employer only)
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 * @param request Reply data
 */
async function createReply(
  workplaceId: number,
  reviewId: number,
  request: ReplyCreateRequest,
): Promise<ReplyResponse> {
  const response = await api.post<ReplyResponse>(
    `${BASE_PATH}/${workplaceId}/review/${reviewId}/reply`,
    request,
  );
  return response.data;
}

/**
 * Update an existing reply
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 * @param request Updated reply data
 */
async function updateReply(
  workplaceId: number,
  reviewId: number,
  request: ReplyUpdateRequest,
): Promise<ReplyResponse> {
  const response = await api.put<ReplyResponse>(
    `${BASE_PATH}/${workplaceId}/review/${reviewId}/reply`,
    request,
  );
  return response.data;
}

/**
 * Delete a reply
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 */
async function deleteReply(
  workplaceId: number,
  reviewId: number
): Promise<ApiMessage> {
  const response = await api.delete<ApiMessage>(
    `${BASE_PATH}/${workplaceId}/review/${reviewId}/reply`,
  );
  return response.data;
}

// Legacy exports
export {
  fetchWorkplaceReviews as getWorkplaceReviews,
  fetchReview as getReview,
  createReview,
  updateReview,
  markReviewHelpful,
  reportReview,
  createReply,
  updateReply,
  deleteReply,
};

// Hooks
export const useWorkplaceReviewsQuery = (
  workplaceId?: number,
  params?: ReviewListParams,
  enabled = true
) =>
  useQueryWithToast({
    queryKey: workplaceId ? reviewKeys.workplace(workplaceId) : reviewKeys.workplace('missing'),
    queryFn: () => fetchWorkplaceReviews(workplaceId as number, params),
    enabled: Boolean(workplaceId) && enabled,
  });

export const useCreateReviewMutation = (workplaceId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ReviewCreateRequest) => createReview(workplaceId, request),
    onMutate: async (request) => {
      await queryClient.cancelQueries({ queryKey: reviewKeys.workplace(workplaceId) });
      const previous = queryClient.getQueryData<PaginatedReviewResponse>(
        reviewKeys.workplace(workplaceId)
      );
      if (previous) {
        const optimistic: ReviewResponse = {
          id: Date.now(),
          workplaceId,
          userId: 0,
          title: request.title,
          content: request.content,
          anonymous: Boolean(request.anonymous),
          helpfulCount: 0,
          helpfulByUser: false,
          overallRating: Object.values(request.ethicalPolicyRatings ?? {}).reduce(
            (sum, val) => sum + val,
            0
          ) / Math.max(Object.keys(request.ethicalPolicyRatings ?? {}).length, 1),
          ethicalPolicyRatings: request.ethicalPolicyRatings,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        queryClient.setQueryData<PaginatedReviewResponse>(reviewKeys.workplace(workplaceId), {
          ...previous,
          content: [optimistic, ...previous.content],
          totalElements: previous.totalElements + 1,
        });
      }
      return { previous };
    },
    onError: (err, _req, context) => {
      if (context?.previous) {
        queryClient.setQueryData(reviewKeys.workplace(workplaceId), context.previous);
      }
      toast.error(normalizeApiError(err).friendlyMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.workplace(workplaceId) });
      toast.success('Review submitted');
    },
  });
};

export const useUpdateReviewMutation = (workplaceId: number, reviewId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ReviewUpdateRequest) => updateReview(workplaceId, reviewId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.workplace(workplaceId) });
      toast.success('Review updated');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useMarkReviewHelpfulMutation = (workplaceId: number, reviewId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markReviewHelpful(workplaceId, reviewId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: reviewKeys.workplace(workplaceId) });
      const previous = queryClient.getQueryData<PaginatedReviewResponse>(
        reviewKeys.workplace(workplaceId)
      );
      if (previous) {
        const updated = previous.content.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                helpfulCount: review.helpfulCount + 1,
                helpfulByUser: true,
              }
            : review
        );
        queryClient.setQueryData<PaginatedReviewResponse>(reviewKeys.workplace(workplaceId), {
          ...previous,
          content: updated,
        });
      }
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(reviewKeys.workplace(workplaceId), context.previous);
      }
      toast.error(normalizeApiError(err).friendlyMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.workplace(workplaceId) });
    },
  });
};

export const useReportReviewMutation = (workplaceId: number, reviewId: number) =>
  useMutation({
    mutationFn: (request: ReviewReportCreate) => reportReview(workplaceId, reviewId, request),
    onSuccess: () => toast.success('Review reported'),
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });

export const useCreateReplyMutation = (workplaceId: number, reviewId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ReplyCreateRequest) => createReply(workplaceId, reviewId, request),
    onMutate: async (request) => {
      await queryClient.cancelQueries({ queryKey: reviewKeys.workplace(workplaceId) });
      const previous = queryClient.getQueryData<PaginatedReviewResponse>(
        reviewKeys.workplace(workplaceId)
      );
      if (previous) {
        const optimisticReply: ReplyResponse = {
          id: Date.now(),
          reviewId,
          employerUserId: 0,
          content: request.content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = previous.content.map((review) =>
          review.id === reviewId ? { ...review, reply: optimisticReply } : review
        );
        queryClient.setQueryData<PaginatedReviewResponse>(reviewKeys.workplace(workplaceId), {
          ...previous,
          content: updated,
        });
      }
      return { previous };
    },
    onError: (err, _req, context) => {
      if (context?.previous) {
        queryClient.setQueryData(reviewKeys.workplace(workplaceId), context.previous);
      }
      toast.error(normalizeApiError(err).friendlyMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.workplace(workplaceId) });
      toast.success('Reply added');
    },
  });
};

export const useUpdateReplyMutation = (workplaceId: number, reviewId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ReplyUpdateRequest) => updateReply(workplaceId, reviewId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.workplace(workplaceId) });
      toast.success('Reply updated');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useDeleteReplyMutation = (workplaceId: number, reviewId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteReply(workplaceId, reviewId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: reviewKeys.workplace(workplaceId) });
      const previous = queryClient.getQueryData<PaginatedReviewResponse>(
        reviewKeys.workplace(workplaceId)
      );
      if (previous) {
        const updated = previous.content.map((review) =>
          review.id === reviewId ? { ...review, reply: undefined } : review
        );
        queryClient.setQueryData<PaginatedReviewResponse>(reviewKeys.workplace(workplaceId), {
          ...previous,
          content: updated,
        });
      }
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(reviewKeys.workplace(workplaceId), context.previous);
      }
      toast.error(normalizeApiError(err).friendlyMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.workplace(workplaceId) });
      toast.success('Reply deleted');
    },
  });
};
