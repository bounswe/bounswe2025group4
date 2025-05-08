import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api, queryClient, ApiResponse } from './api';

export interface Job {
  id: string;
  title: string;
  description: string;
  company: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  ethicalPolicies: string[];
  requirements: string[];
  responsibilities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  search?: string;
  type?: Job['type'];
  ethicalPolicies?: string[];
  salaryMin?: number;
  salaryMax?: number;
  companyId?: string;
  page?: number;
  limit?: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  coverLetter: string;
  resumeUrl: string;
  createdAt: string;
}

export interface CreateJobData {
  title: string;
  description: string;
  location: string;
  type: Job['type'];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  ethicalPolicies: string[];
  requirements: string[];
  responsibilities: string[];
}

const JOBS_KEYS = {
  all: ['jobs'] as const,
  lists: () => [...JOBS_KEYS.all, 'list'] as const,
  list: (filters: JobFilters) => [...JOBS_KEYS.lists(), filters] as const,
  details: () => [...JOBS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...JOBS_KEYS.details(), id] as const,
  applications: () => [...JOBS_KEYS.all, 'applications'] as const,
};

interface JobsResponse {
  jobs: Job[];
  total: number;
  hasMore: boolean;
}

export const useJobs = (filters: JobFilters = {}) => {
  return useInfiniteQuery({
    queryKey: JOBS_KEYS.list(filters),
    queryFn: ({ pageParam }) =>
      api.get<JobsResponse>('/jobs', { ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: ApiResponse<JobsResponse>) =>
      lastPage.data.hasMore ? lastPage.data.total + 1 : undefined,
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: JOBS_KEYS.detail(id),
    queryFn: () => api.get<Job>(`/jobs/${id}`),
  });
};

export const useCreateJob = () => {
  return useMutation({
    mutationFn: (data: CreateJobData) => api.post<Job>('/jobs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEYS.lists() });
    },
  });
};

export const useUpdateJob = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobData> }) =>
      api.patch<Job>(`/jobs/${id}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: JOBS_KEYS.detail(data.data.id),
      });
    },
  });
};

export const useDeleteJob = () => {
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/jobs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEYS.lists() });
    },
  });
};

export const useApplyForJob = () => {
  return useMutation({
    mutationFn: ({
      jobId,
      data,
    }: {
      jobId: string;
      data: { coverLetter: string; resumeUrl: string };
    }) => api.post<JobApplication>(`/jobs/${jobId}/apply`, data),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({
        queryKey: JOBS_KEYS.detail(jobId),
      });
    },
  });
};
