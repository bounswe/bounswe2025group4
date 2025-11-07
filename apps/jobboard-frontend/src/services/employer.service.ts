/**
 * Employer Service
 * Handles employer workflow operations (join requests, employer management)
 */

import { api } from '@/lib/api-client';
import type {
  EmployerWorkplaceBrief,
  EmployerListItem,
  EmployerRequestCreate,
  EmployerRequestResolve,
  EmployerRequestResponse,
  PaginatedEmployerRequestResponse,
  EmployerRequestListParams,
  ApiMessage,
} from '@/types/workplace.types';

/**
 * Get all workplaces where the current user is an employer
 */
export async function getMyWorkplaces(): Promise<EmployerWorkplaceBrief[]> {
  const response = await api.get<EmployerWorkplaceBrief[]>(
    '/api/workplace/employers/me'
  );
  return response.data;
}

/**
 * Get list of employers for a specific workplace
 */
export async function getWorkplaceEmployers(
  workplaceId: number
): Promise<EmployerListItem[]> {
  const response = await api.get<EmployerListItem[]>(
    `/api/workplace/${workplaceId}/employers`
  );
  return response.data;
}

/**
 * Remove an employer from a workplace
 * @param workplaceId Workplace ID
 * @param employerId User ID of the employer to remove
 */
export async function removeEmployer(
  workplaceId: number,
  employerId: number
): Promise<ApiMessage> {
  const response = await api.delete<ApiMessage>(
    `/api/workplace/${workplaceId}/employers/${employerId}`
  );
  return response.data;
}

/**
 * Create a request to join a workplace as an employer
 * @param workplaceId Workplace ID to request access to
 * @param request Request data (optional note)
 */
export async function createEmployerRequest(
  workplaceId: number,
  request: EmployerRequestCreate
): Promise<ApiMessage> {
  const response = await api.post<ApiMessage>(
    `/api/workplace/${workplaceId}/employers/request`,
    request
  );
  return response.data;
}

/**
 * Get paginated list of employer join requests for a workplace
 * @param workplaceId Workplace ID
 * @param params Pagination parameters
 */
export async function getEmployerRequests(
  workplaceId: number,
  params: EmployerRequestListParams = {}
): Promise<PaginatedEmployerRequestResponse> {
  const response = await api.get<PaginatedEmployerRequestResponse>(
    `/api/workplace/${workplaceId}/employers/request`,
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
export async function getEmployerRequest(
  workplaceId: number,
  requestId: number
): Promise<EmployerRequestResponse> {
  const response = await api.get<EmployerRequestResponse>(
    `/api/workplace/${workplaceId}/employers/request/${requestId}`
  );
  return response.data;
}

/**
 * Resolve an employer join request (approve or reject)
 * @param workplaceId Workplace ID
 * @param requestId Request ID
 * @param action 'APPROVE' or 'REJECT'
 */
export async function resolveEmployerRequest(
  workplaceId: number,
  requestId: number,
  action: 'APPROVE' | 'REJECT'
): Promise<ApiMessage> {
  const request: EmployerRequestResolve = { action };
  const response = await api.post<ApiMessage>(
    `/api/workplace/${workplaceId}/employers/request/${requestId}`,
    request
  );
  return response.data;
}
