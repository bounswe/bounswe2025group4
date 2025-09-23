import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from './api';
import { Application, ApplicationStatus } from '../types/application';

export interface ApplicationSubmitData {
  jobSeekerId: number;
  jobPostingId: number;
}

interface RawApplication extends Omit<Application, 'submissionDate'> {
  submissionDate: string;
}

export class ApplicationsService {
  async getApplicationsByJobId(jobId: string): Promise<Application[]> {
    const response = await apiClient.get<Application[]>(
      `/applications/${jobId}`
    );
    return response.data.map((application) => ({
      ...application,
      submissionDate: new Date(application.submissionDate),
    }));
  }

  async getApplicationStatus(applicationId: string): Promise<Application> {
    const response = await apiClient.get<RawApplication>(
      `/applications/${applicationId}`
    );
    return {
      ...response.data,
      submissionDate: new Date(response.data.submissionDate),
    };
  }

  async getApplicationsByUserId(userId: string): Promise<Application[]> {
    const response = await apiClient.get<RawApplication[]>(
      `/applications?userId=${userId}`
    );
    // date parsing
    return response.data.map((application) => ({
      ...application,
      submissionDate: new Date(application.submissionDate),
    }));
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

  async submitApplication(data: ApplicationSubmitData): Promise<Application> {
    const response = await apiClient.post<Application>('/applications', data);
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

export const useUpdateApplicationStatus = () => {
  return useMutation<
    Application,
    Error,
    {
      applicationId: string;
      status: ApplicationStatus;
      feedback?: string;
    }
  >({
    mutationFn: ({ applicationId, status, feedback }) =>
      applicationsService.updateApplicationStatus(
        applicationId,
        status,
        feedback
      ),
  });
};

export const useSubmitApplication = () => {
  return useMutation<Application, Error, ApplicationSubmitData>({
    mutationFn: (data) => applicationsService.submitApplication(data),
  });
};
