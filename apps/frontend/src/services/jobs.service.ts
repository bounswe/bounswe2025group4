import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import { ApiResponse } from '../types/api';
import { Job } from '../types/job';

export interface CreateJobDto {
  title: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  ethicalPolicies: string[]; // e.g., ['fair-wage', 'equal-opportunity']
  companyId: string;
}

export interface UpdateJobDto {
  title?: string;
  description?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  ethicalPolicies?: string[]; // e.g., ['fair-wage', 'equal-opportunity']
  companyId?: string;
}

export interface JobFilters {
  query?: string;
  location?: string;
  employmentType?: string[];
  companyId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedJobsResponse {
  jobs: Job[];
  totalCount: number;
  // Add other pagination fields like currentPage, totalPages if available from API
}

const JOB_KEYS = {
  all: ['jobs'] as const,
  lists: () => [...JOB_KEYS.all, 'list'] as const,
  list: (filters: JobFilters) => [...JOB_KEYS.lists(), filters] as const,
  details: () => [...JOB_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...JOB_KEYS.details(), id] as const,
};

class JobsService {
  async getAllJobs(filters: JobFilters): Promise<PaginatedJobsResponse> {
    const response = await apiClient.get<PaginatedJobsResponse>('/jobs', { params: filters });
    return response.data;
  }

  async getJobById(id: string): Promise<Job> {
    const response = await apiClient.get<Job>(`/jobs/${id}`);
    return response.data;
  }

  async createJob(jobData: CreateJobDto): Promise<Job> {
    const response = await apiClient.post<Job>('/jobs', jobData);
    return response.data;
  }

  async updateJob(id: string, jobData: UpdateJobDto): Promise<Job> {
    const response = await apiClient.put<Job>(`/jobs/${id}`, jobData);
    return response.data;
  }

  async deleteJob(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/jobs/${id}`); // TODO: Update endpoint if needed
  }
}

export const jobsService = new JobsService();

// ----- React Query Hooks -----
export const useGetJobs = (filters: JobFilters) =>
  useQuery<PaginatedJobsResponse, Error, PaginatedJobsResponse, readonly [string, string, JobFilters]>({
    queryKey: JOB_KEYS.list(filters),
    queryFn: () => jobsService.getAllJobs(filters),
  });

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation<Job, Error, CreateJobDto>({
    mutationFn: (jobData: CreateJobDto) => jobsService.createJob(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_KEYS.lists() });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation<Job, Error, { id: string; data: UpdateJobDto }>({
    mutationFn: ({ id, data }) => jobsService.updateJob(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: JOB_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: JOB_KEYS.detail(variables.id),
      });
      // Optionally, update the specific cache entry:
      // queryClient.setQueryData(JOB_KEYS.detail(variables.id), updatedData);
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => jobsService.deleteJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: JOB_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: JOB_KEYS.detail(id) });
      // More aggressive invalidation:
      // queryClient.invalidateQueries({ queryKey: JOB_KEYS.all });
    },
  });
};
