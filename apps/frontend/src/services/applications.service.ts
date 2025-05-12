import { useQuery } from '@tanstack/react-query';
import { apiClient } from './api';
import { Application, ApplicationStatus } from '../types/application';

export class ApplicationsService {
  async getApplicationsByJobId(jobId: string): Promise<Application[]> {
    const response = await apiClient.get<Application[]>(
      `/applications/${jobId}`
    );
    return response.data;
  }

  async getApplicationStatus(applicationId: string): Promise<Application> {
    const response = await apiClient.get<Application>(
      `/applications/${applicationId}`
    );
    return response.data;
  }

  async getApplicationsByUserId(userId: string): Promise<Application[]> {
    const response = await apiClient.get<Application[]>(
      `/applications?userId=${userId}`
    );
    return response.data;
  }

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    feedback?: string
  ): Promise<Application> {
    const response = await apiClient.put<Application>(
      `/applications/${applicationId}`,
      { status, feedback }
    );
    return response.data;
  }
}

export const applicationsService = new ApplicationsService();

// ----- React Query Hooks -----

export const useGetApplicationStatus = (applicationId: string) => {
  return useQuery<Application, Error, Application, readonly [string, string]>({
    queryKey: ['application', applicationId],
    queryFn: () => applicationsService.getApplicationStatus(applicationId),
  });
};

export const useGetApplicationsByJobId = (jobId: string) => {
  return useQuery<
    Application[],
    Error,
    Application[],
    readonly [string, string]
  >({
    queryKey: ['applications', jobId],
    queryFn: () => applicationsService.getApplicationsByJobId(jobId),
    refetchOnWindowFocus: false,
  });
};

export const useGetApplicationsByUserId = (userId: string | null) => {
  return useQuery<
    Application[],
    Error,
    Application[],
    readonly [string, string | null]
  >({
    queryKey: ['userApplications', userId],
    queryFn: () =>
      userId
        ? applicationsService.getApplicationsByUserId(userId)
        : Promise.resolve([]),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
};
