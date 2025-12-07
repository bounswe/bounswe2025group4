import { api } from '@shared/lib/api-client';
import type {
  CreateJobApplicationRequest,
  CvUploadResponse,
  JobApplicationResponse,
} from '@shared/types/api.types';

/**
 * Volunteer Applications Service
 * Kept separate from regular job applications to avoid coupling.
 */
export type CreateVolunteerApplicationRequest = CreateJobApplicationRequest;

/**
 * Get applications submitted by a job seeker for volunteer roles
 */
export async function getVolunteerApplicationsByJobSeeker(
  jobSeekerId: number
): Promise<JobApplicationResponse[]> {
  const response = await api.get<JobApplicationResponse[]>(`/applications/job-seeker/${jobSeekerId}`);
  return response.data;
}

/**
 * Create a volunteer application for a nonprofit job post
 */
export async function createVolunteerApplication(
  data: CreateVolunteerApplicationRequest
): Promise<JobApplicationResponse> {
  const response = await api.post<JobApplicationResponse>('/applications', data);
  return response.data;
}

/**
 * Upload CV for a volunteer application
 */
export async function uploadVolunteerCv(
  applicationId: number,
  file: File
): Promise<CvUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<CvUploadResponse>(`/applications/${applicationId}/cv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
