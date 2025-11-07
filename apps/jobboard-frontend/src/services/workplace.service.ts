/**
 * Workplace Service
 * Handles all workplace-related API calls
 */

import { api } from '@/lib/api-client';
import type {
  WorkplaceCreateRequest,
  WorkplaceUpdateRequest,
  WorkplaceDetailResponse,
  WorkplaceBriefResponse,
  WorkplaceRatingResponse,
  WorkplaceImageResponseDto,
  PaginatedWorkplaceResponse,
  WorkplaceListParams,
  ApiMessage,
} from '@/types/workplace.types';

const BASE_PATH = '/api/workplace';

/**
 * Get paginated list of workplaces with optional filters
 */
export async function getWorkplaces(
  params: WorkplaceListParams = {}
): Promise<PaginatedWorkplaceResponse> {
  const response = await api.get<PaginatedWorkplaceResponse>(BASE_PATH, {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 12,
      ...params,
    },
  });
  return response.data;
}

/**
 * Get detailed information about a specific workplace
 * @param id Workplace ID
 * @param includeReviews Whether to include recent reviews
 * @param reviewsLimit Number of reviews to include (default: 3)
 */
export async function getWorkplaceById(
  id: number,
  includeReviews: boolean = false,
  reviewsLimit: number = 3
): Promise<WorkplaceDetailResponse> {
  const response = await api.get<WorkplaceDetailResponse>(`${BASE_PATH}/${id}`, {
    params: {
      includeReviews,
      reviewsLimit,
    },
  });
  return response.data;
}

/**
 * Create a new workplace (requires employer role)
 */
export async function createWorkplace(
  request: WorkplaceCreateRequest
): Promise<WorkplaceDetailResponse> {
  const response = await api.post<WorkplaceDetailResponse>(BASE_PATH, request);
  return response.data;
}

/**
 * Update an existing workplace (requires employer role and permissions)
 */
export async function updateWorkplace(
  id: number,
  request: WorkplaceUpdateRequest
): Promise<WorkplaceDetailResponse> {
  const response = await api.put<WorkplaceDetailResponse>(
    `${BASE_PATH}/${id}`,
    request
  );
  return response.data;
}

/**
 * Get rating information for a workplace
 */
export async function getWorkplaceRating(
  id: number
): Promise<WorkplaceRatingResponse> {
  const response = await api.get<WorkplaceRatingResponse>(
    `${BASE_PATH}/${id}/rating`
  );
  return response.data;
}

/**
 * Upload an image for a workplace
 * @param id Workplace ID
 * @param file Image file
 */
export async function uploadWorkplaceImage(
  id: number,
  file: File
): Promise<WorkplaceImageResponseDto> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<WorkplaceImageResponseDto>(
    `${BASE_PATH}/${id}/image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

/**
 * Delete the image of a workplace
 */
export async function deleteWorkplaceImage(id: number): Promise<ApiMessage> {
  const response = await api.delete<ApiMessage>(`${BASE_PATH}/${id}/image`);
  return response.data;
}
