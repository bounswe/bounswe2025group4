import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '@shared/lib/api-client';
import { applicationsKeys, jobsKeys } from '@shared/lib/query-keys';
import { normalizeApiError } from '@shared/utils/error-handler';
import { useQueryWithToast } from '@shared/hooks/useQueryWithToast';
import type {
  JobApplicationResponse,
  CreateJobApplicationRequest,
  UpdateJobApplicationRequest,
  ApplicationsFilterParams,
  CvUploadResponse,
} from '@shared/types/api.types';

/**
 * Applications Service
 * Handles all API calls related to job applications
 */

/**
 * Get filtered list of applications
 * GET /api/applications
 */
async function fetchApplications(
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
 * Get applications by job seeker ID
 * GET /api/applications/job-seeker/{jobSeekerId}
 */
async function fetchApplicationsByJobSeeker(jobSeekerId: number): Promise<JobApplicationResponse[]> {
  const response = await api.get<JobApplicationResponse[]>(`/applications/job-seeker/${jobSeekerId}`);
  return response.data;
}

/**
 * Get a single application by ID
 * GET /api/applications/{id}
 */
async function fetchApplicationById(id: number): Promise<JobApplicationResponse> {
  const response = await api.get<JobApplicationResponse>(`/applications/${id}`);
  return response.data;
}

/**
 * Create a new job application
 * POST /api/applications
 */
async function createApplication(
  data: CreateJobApplicationRequest
): Promise<JobApplicationResponse> {
  const response = await api.post<JobApplicationResponse>('/applications', data);
  return response.data;
}

/**
 * Approve an application (with optional feedback)
 * PUT /api/applications/{id}/approve
 */
async function approveApplication(
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
async function rejectApplication(
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
async function deleteApplication(id: number): Promise<void> {
  await api.delete(`/applications/${id}`);
}

/**
 * Upload CV for an application
 * POST /api/applications/{id}/cv
 */
async function uploadCv(id: number, file: File): Promise<CvUploadResponse> {
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
async function fetchCvUrl(id: number): Promise<string> {
  const response = await api.get<string>(`/applications/${id}/cv`);
  return response.data;
}

/**
 * Delete CV from an application
 * DELETE /api/applications/{id}/cv
 */
async function deleteCv(id: number): Promise<void> {
  await api.delete(`/applications/${id}/cv`);
}

// Legacy exports for direct calls
export {
  fetchApplications as getApplications,
  fetchApplicationsByJobSeeker as getApplicationsByJobSeeker,
  fetchApplicationById as getApplicationById,
  createApplication,
  approveApplication,
  rejectApplication,
  deleteApplication,
  uploadCv,
  fetchCvUrl as getCvUrl,
  deleteCv,
};

// Hooks
export const useApplicationsQuery = (filters?: ApplicationsFilterParams) =>
  useQueryWithToast<JobApplicationResponse[]>({
    queryKey: [...applicationsKeys.all, 'list', filters ?? {}],
    queryFn: () => fetchApplications(filters),
  });

export const useApplicationsByJobSeekerQuery = (jobSeekerId?: number, enabled = true) =>
  useQueryWithToast<JobApplicationResponse[]>({
    queryKey: applicationsKeys.listByUser(jobSeekerId ?? 'me'),
    queryFn: () => fetchApplicationsByJobSeeker(jobSeekerId as number),
    enabled: Boolean(jobSeekerId) && enabled,
  });

export const useApplicationsByJobQuery = (jobPostId?: number, enabled = true) =>
  useQueryWithToast<JobApplicationResponse[]>({
    queryKey: applicationsKeys.listByJob(jobPostId ?? 'missing'),
    queryFn: () => fetchApplications({ jobPostId: jobPostId as number }),
    enabled: Boolean(jobPostId) && enabled,
  });

export const useApplicationQuery = (id?: number, enabled = true) =>
  useQueryWithToast<JobApplicationResponse>({
    queryKey: id ? applicationsKeys.detail(id) : applicationsKeys.detail('missing'),
    queryFn: () => fetchApplicationById(id as number),
    enabled: Boolean(id) && enabled,
  });

export const useCreateApplicationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobApplicationRequest) => createApplication(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationsKeys.all });
      queryClient.invalidateQueries({ queryKey: jobsKeys.detail(data.jobPostId) });
      toast.success('Application submitted successfully');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useApproveApplicationMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feedback?: string) => approveApplication(id, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationsKeys.detail(id) });
      toast.success('Application approved');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useRejectApplicationMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feedback?: string) => rejectApplication(id, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationsKeys.detail(id) });
      toast.success('Application rejected');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useDeleteApplicationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationsKeys.all });
      toast.success('Application deleted');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useUploadCvMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadCv(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationsKeys.detail(id) });
      toast.success('CV uploaded');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useApplicationCvUrlQuery = (id?: number, enabled = true) =>
  useQueryWithToast<string>({
    queryKey: id ? applicationsKeys.cv(id) : applicationsKeys.cv('missing'),
    queryFn: () => fetchCvUrl(id as number),
    enabled: Boolean(id) && enabled,
  });
