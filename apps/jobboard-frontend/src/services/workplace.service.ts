/**
 * Workplace Service
 * Handles all workplace-related API calls
 */

import { api } from '@/lib/api-client';
import type {
  WorkplaceCreateRequest,
  WorkplaceUpdateRequest,
  WorkplaceDetailResponse,
  WorkplaceRatingResponse,
  WorkplaceImageResponseDto,
  PaginatedWorkplaceResponse,
  WorkplaceListParams,
  ApiMessage,
} from '@/types/workplace.types';

const BASE_PATH = '/workplace';

/**
 * Get paginated list of workplaces with optional filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @param params.page - Page number (default: 0)
 * @param params.size - Number of items per page (default: 12)
 * @param params.search - Search query to filter workplaces by company name
 * @param params.sector - Filter by sector
 * @param params.location - Filter by location
 * @param params.ethicalTag - Filter by ethical tag
 * @param params.minRating - Minimum rating filter (number)
 * @param params.sortBy - Sort field (e.g., 'rating', 'name', etc.)
 * @returns Paginated list of workplaces
 */
export async function getWorkplaces(
  params: WorkplaceListParams = {}
): Promise<PaginatedWorkplaceResponse> {
  // Build query parameters, filtering out undefined values
  const queryParams: Record<string, string | number> = {
    page: params.page ?? 0,
    size: params.size ?? 12,
  };

  // Add optional parameters only if they are defined
  if (params.search !== undefined && params.search !== null && params.search !== '') {
    queryParams.search = params.search;
  }
  if (params.sector !== undefined && params.sector !== null && params.sector !== '') {
    queryParams.sector = params.sector;
  }
  if (params.location !== undefined && params.location !== null && params.location !== '') {
    queryParams.location = params.location;
  }
  if (params.ethicalTag !== undefined && params.ethicalTag !== null && params.ethicalTag !== '') {
    queryParams.ethicalTag = params.ethicalTag;
  }
  if (params.minRating !== undefined && params.minRating !== null) {
    queryParams.minRating = params.minRating;
  }
  if (params.sortBy !== undefined && params.sortBy !== null && params.sortBy !== '') {
    queryParams.sortBy = params.sortBy;
  }

  const response = await api.get<PaginatedWorkplaceResponse>(BASE_PATH, {
    params: queryParams,
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

/**
 * Delete a workplace (requires employer role and permissions)
 */
export async function deleteWorkplace(id: number): Promise<ApiMessage> {
  const response = await api.delete<ApiMessage>(`${BASE_PATH}/${id}`);
  return response.data;
}
