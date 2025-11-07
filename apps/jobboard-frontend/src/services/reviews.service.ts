/**
 * Reviews Service
 * Handles workplace review and reply operations
 */

import { api } from '@/lib/api-client';
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
} from '@/types/workplace.types';

/**
 * Get paginated list of reviews for a workplace
 * @param workplaceId Workplace ID
 * @param params Query parameters for filtering and pagination
 */
export async function getWorkplaceReviews(
  workplaceId: number,
  params: ReviewListParams = {}
): Promise<PaginatedReviewResponse> {
  const response = await api.get<PaginatedReviewResponse>(
    `/api/workplace/${workplaceId}/review`,
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
        ...params,
      },
    }
  );
  return response.data;
}

/**
 * Get a specific review
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 */
export async function getReview(
  workplaceId: number,
  reviewId: number
): Promise<ReviewResponse> {
  const response = await api.get<ReviewResponse>(
    `/api/workplace/${workplaceId}/review/${reviewId}`
  );
  return response.data;
}

/**
 * Create a new review for a workplace
 * @param workplaceId Workplace ID
 * @param request Review data
 */
export async function createReview(
  workplaceId: number,
  request: ReviewCreateRequest
): Promise<ReviewResponse> {
  const response = await api.post<ReviewResponse>(
    `/api/workplace/${workplaceId}/review`,
    request
  );
  return response.data;
}

/**
 * Update an existing review
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 * @param request Updated review data
 */
export async function updateReview(
  workplaceId: number,
  reviewId: number,
  request: ReviewUpdateRequest
): Promise<ReviewResponse> {
  const response = await api.put<ReviewResponse>(
    `/api/workplace/${workplaceId}/review/${reviewId}`,
    request
  );
  return response.data;
}

/**
 * Delete a review
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 */
export async function deleteReview(
  workplaceId: number,
  reviewId: number
): Promise<ApiMessage> {
  const response = await api.delete<ApiMessage>(
    `/api/workplace/${workplaceId}/review/${reviewId}`
  );
  return response.data;
}

/**
 * Report a review
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 * @param request Report data (reason and description)
 */
export async function reportReview(
  workplaceId: number,
  reviewId: number,
  request: ReviewReportCreate
): Promise<ApiMessage> {
  const response = await api.post<ApiMessage>(
    `/api/workplace/${workplaceId}/review/${reviewId}/report`,
    request
  );
  return response.data;
}

// ============================================================================
// Reply Operations
// ============================================================================

/**
 * Get the reply to a review
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 */
export async function getReply(
  workplaceId: number,
  reviewId: number
): Promise<ReplyResponse> {
  const response = await api.get<ReplyResponse>(
    `/api/workplace/${workplaceId}/review/${reviewId}/reply`
  );
  return response.data;
}

/**
 * Create a reply to a review (employer only)
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 * @param request Reply data
 */
export async function createReply(
  workplaceId: number,
  reviewId: number,
  request: ReplyCreateRequest
): Promise<ReplyResponse> {
  const response = await api.post<ReplyResponse>(
    `/api/workplace/${workplaceId}/review/${reviewId}/reply`,
    request
  );
  return response.data;
}

/**
 * Update an existing reply
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 * @param request Updated reply data
 */
export async function updateReply(
  workplaceId: number,
  reviewId: number,
  request: ReplyUpdateRequest
): Promise<ReplyResponse> {
  const response = await api.put<ReplyResponse>(
    `/api/workplace/${workplaceId}/review/${reviewId}/reply`,
    request
  );
  return response.data;
}

/**
 * Delete a reply
 * @param workplaceId Workplace ID
 * @param reviewId Review ID
 */
export async function deleteReply(
  workplaceId: number,
  reviewId: number
): Promise<ApiMessage> {
  const response = await api.delete<ApiMessage>(
    `/api/workplace/${workplaceId}/review/${reviewId}/reply`
  );
  return response.data;
}
