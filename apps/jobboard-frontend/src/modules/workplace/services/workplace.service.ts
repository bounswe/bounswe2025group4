/**
 * Workplace Service
 * Handles all workplace-related API calls
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '@shared/lib/api-client';
import { workplaceKeys } from '@shared/lib/query-keys';
import { normalizeApiError } from '@shared/utils/error-handler';
import { useQueryWithToast } from '@shared/hooks/useQueryWithToast';
import type {
  WorkplaceCreateRequest,
  WorkplaceUpdateRequest,
  WorkplaceDetailResponse,
  WorkplaceRatingResponse,
  WorkplaceImageResponseDto,
  PaginatedWorkplaceResponse,
  WorkplaceListParams,
  ApiMessage,
} from '@shared/types/workplace.types';

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
async function fetchWorkplaces(
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
async function fetchWorkplaceById(
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
async function createWorkplace(
  request: WorkplaceCreateRequest
): Promise<WorkplaceDetailResponse> {
  const response = await api.post<WorkplaceDetailResponse>(BASE_PATH, request);
  return response.data;
}

/**
 * Update an existing workplace (requires employer role and permissions)
 */
async function updateWorkplace(
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
async function fetchWorkplaceRating(
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
async function uploadWorkplaceImage(
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
async function deleteWorkplaceImage(id: number): Promise<ApiMessage> {
  const response = await api.delete<ApiMessage>(`${BASE_PATH}/${id}/image`);
  return response.data;
}

/**
 * Delete a workplace (requires employer role and permissions)
 */
async function deleteWorkplace(id: number): Promise<ApiMessage> {
  const response = await api.delete<ApiMessage>(`${BASE_PATH}/${id}`);
  return response.data;
}

// Legacy exports
export {
  fetchWorkplaces as getWorkplaces,
  fetchWorkplaceById as getWorkplaceById,
  fetchWorkplaceRating as getWorkplaceRating,
  createWorkplace,
  updateWorkplace,
  uploadWorkplaceImage,
  deleteWorkplaceImage,
  deleteWorkplace,
};

// Hooks
export const useWorkplacesQuery = (params?: WorkplaceListParams) =>
  useQueryWithToast<PaginatedWorkplaceResponse>({
    queryKey: [...workplaceKeys.list, params ?? {}] as const,
    queryFn: () => fetchWorkplaces(params),
  });

export const useWorkplaceQuery = (
  id?: number,
  options?: { includeReviews?: boolean; reviewsLimit?: number },
  enabled = true
) =>
  useQueryWithToast<WorkplaceDetailResponse>({
    queryKey: id ? workplaceKeys.detail(id) : workplaceKeys.detail('missing'),
    queryFn: () =>
      fetchWorkplaceById(id as number, options?.includeReviews ?? false, options?.reviewsLimit ?? 3),
    enabled: Boolean(id) && enabled,
  });

export const useWorkplaceRatingQuery = (id?: number, enabled = true) =>
  useQueryWithToast<WorkplaceRatingResponse>({
    queryKey: id ? workplaceKeys.reports(id) : workplaceKeys.reports('missing'),
    queryFn: () => fetchWorkplaceRating(id as number),
    enabled: Boolean(id) && enabled,
  });

export const useCreateWorkplaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: WorkplaceCreateRequest) => createWorkplace(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workplaceKeys.list });
      toast.success('Workplace created');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useUpdateWorkplaceMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: WorkplaceUpdateRequest) => updateWorkplace(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workplaceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: workplaceKeys.list });
      toast.success('Workplace updated');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useUploadWorkplaceImageMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadWorkplaceImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workplaceKeys.detail(id) });
      toast.success('Image uploaded');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useDeleteWorkplaceImageMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteWorkplaceImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workplaceKeys.detail(id) });
      toast.success('Image deleted');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useDeleteWorkplaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteWorkplace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workplaceKeys.list });
      toast.success('Workplace deleted');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};
