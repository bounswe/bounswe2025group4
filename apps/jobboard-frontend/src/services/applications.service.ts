import { api } from '@/lib/api-client';
import type {
  JobApplicationResponse,
  CreateJobApplicationRequest,
  UpdateJobApplicationRequest,
  ApplicationsFilterParams,
  CvUploadResponse,
} from '@/types/api.types';

/**
 * Applications Service
 * Handles all API calls related to job applications
 */

/**
 * Get filtered list of applications
 * GET /api/applications
 */
export async function getApplications(
  filters?: ApplicationsFilterParams
): Promise<JobApplicationResponse[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.jobSeekerId !== undefined) {
      params.append('jobSeekerId', filters.jobSeekerId.toString());
    }
    if (filters.jobPostId !== undefined) {
      params.append('jobPostId', filters.jobPostId.toString());
    }
  }

  const queryString = params.toString();
  const url = queryString ? `/applications?${queryString}` : '/applications';

  const response = await api.get<JobApplicationResponse[]>(url);
  return response.data;
}

/**
 * Get a single application by ID
 * GET /api/applications/{id}
 */
export async function getApplicationById(id: number): Promise<JobApplicationResponse> {
  const response = await api.get<JobApplicationResponse>(`/applications/${id}`);
  return response.data;
}

/**
 * Create a new job application
 * POST /api/applications
 */
export async function createApplication(
  data: CreateJobApplicationRequest
): Promise<JobApplicationResponse> {
  const response = await api.post<JobApplicationResponse>('/applications', data);
  return response.data;
}

/**
 * Approve an application (with optional feedback)
 * PUT /api/applications/{id}/approve
 */
export async function approveApplication(
  id: number,
  feedback?: string
): Promise<JobApplicationResponse> {
  const data: UpdateJobApplicationRequest = feedback ? { feedback } : {};
  const response = await api.put<JobApplicationResponse>(`/applications/${id}/approve`, data);
  return response.data;
}

/**
 * Reject an application (with optional feedback)
 * PUT /api/applications/{id}/reject
 */
export async function rejectApplication(
  id: number,
  feedback?: string
): Promise<JobApplicationResponse> {
  const data: UpdateJobApplicationRequest = feedback ? { feedback } : {};
  const response = await api.put<JobApplicationResponse>(`/applications/${id}/reject`, data);
  return response.data;
}

/**
 * Delete an application
 * DELETE /api/applications/{id}
 */
export async function deleteApplication(id: number): Promise<void> {
  await api.delete(`/applications/${id}`);
}

/**
 * Upload CV for an application
 * POST /api/applications/{id}/cv
 */
export async function uploadCv(id: number, file: File): Promise<CvUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<CvUploadResponse>(`/applications/${id}/cv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Get CV URL for an application
 * GET /api/applications/{id}/cv
 */
export async function getCvUrl(id: number): Promise<string> {
  const response = await api.get<string>(`/applications/${id}/cv`);
  return response.data;
}

/**
 * Delete CV from an application
 * DELETE /api/applications/{id}/cv
 */
export async function deleteCv(id: number): Promise<void> {
  await api.delete(`/applications/${id}/cv`);
}
