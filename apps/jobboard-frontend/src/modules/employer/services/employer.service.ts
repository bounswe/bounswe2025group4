/**
 * Employer Service
 * Handles employer workflow operations (join requests, employer management)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '@shared/lib/api-client';
import { employerKeys, workplaceKeys } from '@shared/lib/query-keys';
import { normalizeApiError } from '@shared/utils/error-handler';
import { useQueryWithToast } from '@shared/hooks/useQueryWithToast';
import type {
  EmployerWorkplaceBrief,
  EmployerListItem,
  EmployerRequestCreate,
  EmployerRequestResolve,
  EmployerRequestResponse,
  PaginatedEmployerRequestResponse,
  EmployerRequestListParams,
  ApiMessage,
} from '@shared/types/workplace.types';

const BASE_PATH = '/workplace';

/**
 * Get all workplaces where the current user is an employer
 */
async function fetchMyWorkplaces(): Promise<EmployerWorkplaceBrief[]> {
  const response = await api.get<EmployerWorkplaceBrief[]>(
    `${BASE_PATH}/employers/me`
  );
  return response.data;
}

/**
 * Get list of employers for a specific workplace
 */
async function fetchWorkplaceEmployers(
  workplaceId: number
): Promise<EmployerListItem[]> {
  const response = await api.get<EmployerListItem[]>(
    `${BASE_PATH}/${workplaceId}/employers`
  );
  return response.data;
}

/**
 * Remove an employer from a workplace
 * @param workplaceId Workplace ID
 * @param employerId User ID of the employer to remove
 */
async function removeEmployerRequest(
  workplaceId: number,
  employerId: number
): Promise<ApiMessage> {
  const response = await api.delete<ApiMessage>(
    `${BASE_PATH}/${workplaceId}/employers/${employerId}`
  );
  return response.data;
}

/**
 * Create a request to join a workplace as an employer
 * @param workplaceId Workplace ID to request access to
 * @param request Request data (optional note)
 */
async function createEmployerRequest(
  workplaceId: number,
  request: EmployerRequestCreate
): Promise<ApiMessage> {
  const response = await api.post<ApiMessage>(
    `${BASE_PATH}/${workplaceId}/employers/request`,
    request
  );
  return response.data;
}

/**
 * Get paginated list of employer join requests for a workplace
 * @param workplaceId Workplace ID
 * @param params Pagination parameters
 */
async function fetchEmployerRequests(
  workplaceId: number,
  params: EmployerRequestListParams = {}
): Promise<PaginatedEmployerRequestResponse> {
  const response = await api.get<PaginatedEmployerRequestResponse>(
    `${BASE_PATH}/${workplaceId}/employers/request`,
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    }
  );
  return response.data;
}

/**
 * Get current user's employer requests (across workplaces)
 */
async function fetchMyEmployerRequests(
  params: EmployerRequestListParams = {}
): Promise<PaginatedEmployerRequestResponse> {
  const response = await api.get<PaginatedEmployerRequestResponse>(
    `${BASE_PATH}/employers/requests/me`,
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    }
  );
  return response.data;
}

/**
 * Get a specific employer join request
 * @param workplaceId Workplace ID
 * @param requestId Request ID
 */
async function fetchEmployerRequest(
  workplaceId: number,
  requestId: number
): Promise<EmployerRequestResponse> {
  const response = await api.get<EmployerRequestResponse>(
    `${BASE_PATH}/${workplaceId}/employers/request/${requestId}`
  );
  return response.data;
}

/**
 * Resolve an employer join request (approve or reject)
 * @param workplaceId Workplace ID
 * @param requestId Request ID
 * @param action 'APPROVE' or 'REJECT'
 */
async function resolveEmployerRequest(
  workplaceId: number,
  requestId: number,
  action: 'APPROVE' | 'REJECT'
): Promise<ApiMessage> {
  const request: EmployerRequestResolve = { action };
  const response = await api.post<ApiMessage>(
      `${BASE_PATH}/${workplaceId}/employers/request/${requestId}`,
    request
  );
  return response.data;
}

// Legacy exports
export {
  fetchMyWorkplaces as getMyWorkplaces,
  fetchWorkplaceEmployers as getWorkplaceEmployers,
  removeEmployerRequest as removeEmployer,
  createEmployerRequest,
  fetchEmployerRequests as getEmployerRequests,
  fetchMyEmployerRequests as getMyEmployerRequests,
  fetchEmployerRequest as getEmployerRequest,
  resolveEmployerRequest,
};

// Hooks
export const useMyWorkplacesQuery = (enabled = true) =>
  useQueryWithToast<EmployerWorkplaceBrief[]>({
    queryKey: employerKeys.workplaces,
    queryFn: fetchMyWorkplaces,
    enabled,
  });

export const useWorkplaceEmployersQuery = (workplaceId?: number, enabled = true) =>
  useQueryWithToast<EmployerListItem[]>({
    queryKey: workplaceId ? workplaceKeys.employers(workplaceId) : workplaceKeys.employers('missing'),
    queryFn: () => fetchWorkplaceEmployers(workplaceId as number),
    enabled: Boolean(workplaceId) && enabled,
  });

export const useEmployerRequestsQuery = (
  workplaceId?: number,
  params?: EmployerRequestListParams,
  enabled = true
) =>
  useQueryWithToast<PaginatedEmployerRequestResponse>({
    queryKey: workplaceId
      ? [...employerKeys.requests(workplaceId), params ?? {}]
      : employerKeys.requests('missing'),
    queryFn: () => fetchEmployerRequests(workplaceId as number, params),
    enabled: Boolean(workplaceId) && enabled,
  });

export const useMyEmployerRequestsQuery = (params?: EmployerRequestListParams) =>
  useQueryWithToast<PaginatedEmployerRequestResponse>({
    queryKey: [...employerKeys.myRequests, params ?? {}],
    queryFn: () => fetchMyEmployerRequests(params),
  });

export const useEmployerRequestQuery = (
  workplaceId?: number,
  requestId?: number,
  enabled = true
) =>
  useQueryWithToast<EmployerRequestResponse>({
    queryKey:
      workplaceId && requestId
        ? employerKeys.requests(`${workplaceId}-${requestId}`)
        : employerKeys.requests('missing'),
    queryFn: () => fetchEmployerRequest(workplaceId as number, requestId as number),
    enabled: Boolean(workplaceId && requestId) && enabled,
  });

export const useCreateEmployerRequestMutation = (workplaceId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: EmployerRequestCreate) => createEmployerRequest(workplaceId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employerKeys.myRequests });
      toast.success('Request submitted');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useRemoveEmployerMutation = (workplaceId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employerId: number) => removeEmployerRequest(workplaceId, employerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workplaceKeys.employers(workplaceId) });
      toast.success('Employer removed');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useResolveEmployerRequestMutation = (workplaceId: number, requestId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: EmployerRequestResolve['action']) => resolveEmployerRequest(workplaceId, requestId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employerKeys.requests(workplaceId) });
      toast.success('Request processed');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};
