import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { api } from '@shared/lib/api-client';
import { jobsKeys } from '@shared/lib/query-keys';
import { normalizeApiError } from '@shared/utils/error-handler';
import { useQueryWithToast } from '@shared/hooks/useQueryWithToast';
import type {
  JobPostResponse,
  CreateJobPostRequest,
  UpdateJobPostRequest,
  JobsFilterParams,
} from '@shared/types/api.types';

/**
 * Jobs Service
 * Handles all API calls related to job posts
 */

/**
 * Get filtered list of jobs
 * GET /api/jobs
 */
const buildJobsUrl = (filters?: JobsFilterParams) => {
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
    if (filters.nonProfit !== undefined) {
      params.append('nonProfit', filters.nonProfit.toString());
    }
  }

  const queryString = params.toString();
  return queryString ? `/jobs?${queryString}` : '/jobs';
};

async function fetchJobs(filters?: JobsFilterParams): Promise<JobPostResponse[]> {
  const url = buildJobsUrl(filters);
  const response = await api.get<JobPostResponse[]>(url, {
    skipAuthRedirect: true,
  } as unknown as AxiosRequestConfig);
  return response.data;
}

/**
 * Get a single job post by ID
 * GET /api/jobs/{id}
 */
async function fetchJobById(id: number): Promise<JobPostResponse> {
  const response = await api.get<JobPostResponse>(`/jobs/${id}`);
  return response.data;
}

/**
 * Get all jobs posted by a specific employer
 * GET /api/jobs/employer/{employerId}
 */
async function fetchJobsByEmployer(employerId: number): Promise<JobPostResponse[]> {
  const response = await api.get<JobPostResponse[]>(`/jobs/employer/${employerId}`);
  return response.data;
}

/**
 * Create a new job post
 * POST /api/jobs
 */
async function createJob(data: CreateJobPostRequest): Promise<JobPostResponse> {
  const response = await api.post<JobPostResponse>('/jobs', data);
  return response.data;
}

/**
 * Update an existing job post
 * PUT /api/jobs/{id}
 */
async function updateJob(id: number, data: UpdateJobPostRequest): Promise<JobPostResponse> {
  const response = await api.put<JobPostResponse>(`/jobs/${id}`, data);
  return response.data;
}

/**
 * Delete a job post
 * DELETE /api/jobs/{id}
 */
async function deleteJob(id: number): Promise<void> {
  await api.delete(`/jobs/${id}`);
}

// Legacy exports for direct calls
export {
  fetchJobs as getJobs,
  fetchJobById as getJobById,
  fetchJobsByEmployer as getJobsByEmployer,
  createJob,
  updateJob,
  deleteJob,
};

// Query Hooks
export const useJobsQuery = (filters?: JobsFilterParams) =>
  useQueryWithToast<JobPostResponse[]>({
    queryKey: jobsKeys.list(filters),
    queryFn: () => fetchJobs(filters),
  });

export const useJobQuery = (id?: number, enabled = true) =>
  useQueryWithToast<JobPostResponse>({
    queryKey: id ? jobsKeys.detail(id) : jobsKeys.detail('missing'),
    queryFn: () => fetchJobById(id as number),
    enabled: Boolean(id) && enabled,
  });

export const useJobsByEmployerQuery = (employerId?: number, enabled = true) =>
  useQueryWithToast<JobPostResponse[]>({
    queryKey: employerId ? jobsKeys.employer(employerId) : jobsKeys.employer('missing'),
    queryFn: () => fetchJobsByEmployer(employerId as number),
    enabled: Boolean(employerId) && enabled,
  });

export const useCreateJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobPostRequest) => createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.all });
      toast.success('Job created successfully');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useUpdateJobMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateJobPostRequest) => updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: jobsKeys.all });
      toast.success('Job updated successfully');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useDeleteJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.all });
      toast.success('Job deleted successfully');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

