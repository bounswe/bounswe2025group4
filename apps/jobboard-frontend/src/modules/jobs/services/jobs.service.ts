import { api } from '@shared/lib/api-client';
import type {
  JobPostResponse,
  CreateJobPostRequest,
  UpdateJobPostRequest,
  JobsFilterParams,
} from '@shared/types/api.types';
import type { AxiosRequestConfig } from 'axios';

/**
 * Jobs Service
 * Handles all API calls related to job posts
 */

/**
 * Get filtered list of jobs
 * GET /api/jobs
 */
export async function getJobs(filters?: JobsFilterParams): Promise<JobPostResponse[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.title) params.append('title', filters.title);
    if (filters.companyName) params.append('companyName', filters.companyName);
    if (filters.ethicalTags) {
      filters.ethicalTags.forEach((tag) => params.append('ethicalTags', tag));
    }
    if (filters.minSalary !== undefined) params.append('minSalary', filters.minSalary.toString());
    if (filters.maxSalary !== undefined) params.append('maxSalary', filters.maxSalary.toString());
    if (filters.isRemote !== undefined) params.append('isRemote', filters.isRemote.toString());
    if (filters.inclusiveOpportunity !== undefined) {
      params.append('inclusiveOpportunity', filters.inclusiveOpportunity.toString());
    }
  }

  const queryString = params.toString();
  const url = queryString ? `/jobs?${queryString}` : '/jobs';

  const response = await api.get<JobPostResponse[]>(url, {
    skipAuthRedirect: true,
  } as unknown as AxiosRequestConfig);
  return response.data as JobPostResponse[];
}

/**
 * Get a single job post by ID
 * GET /api/jobs/{id}
 */
export async function getJobById(id: number): Promise<JobPostResponse> {
  const response = await api.get<JobPostResponse>(`/jobs/${id}`);
  return response.data;
}

/**
 * Get all jobs posted by a specific employer
 * GET /api/jobs/employer/{employerId}
 */
export async function getJobsByEmployer(employerId: number): Promise<JobPostResponse[]> {
  const response = await api.get<JobPostResponse[]>(`/jobs/employer/${employerId}`);
  return response.data;
}

/**
 * Create a new job post
 * POST /api/jobs
 */
export async function createJob(data: CreateJobPostRequest): Promise<JobPostResponse> {
  const response = await api.post<JobPostResponse>('/jobs', data);
  return response.data;
}

/**
 * Update an existing job post
 * PUT /api/jobs/{id}
 */
export async function updateJob(id: number, data: UpdateJobPostRequest): Promise<JobPostResponse> {
  const response = await api.put<JobPostResponse>(`/jobs/${id}`, data);
  return response.data;
}

/**
 * Delete a job post
 * DELETE /api/jobs/{id}
 */
export async function deleteJob(id: number): Promise<void> {
  await api.delete(`/jobs/${id}`);
}

