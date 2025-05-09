import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import { ApiResponse } from '../types/api';
// TODO: Define and import job-related types (e.g., Job, CreateJobDto, UpdateJobDto)
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

const JOB_KEYS = {
  all: ['jobs'] as const,
  lists: () => [...JOB_KEYS.all, 'list'] as const,
  list: (filters: string) => [...JOB_KEYS.lists(), { filters }] as const,
  details: () => [...JOB_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...JOB_KEYS.details(), id] as const,
};

class JobsService {
  async getAllJobs(/* TODO: Add filter parameters if needed */): Promise<
    Job[]
  > {
    // TODO: Replace 'any' with 'Job[]'
    const response = await apiClient.get<Job[]>('/jobs'); // TODO: Replace 'any' with 'Job[]' and update endpoint
    return response.data;
  }

  async getJobById(id: string): Promise<Job> {
    // TODO: Replace 'any' with 'Job'
    const response = await apiClient.get<Job>(`/jobs/${id}`); // TODO: Replace 'any' with 'Job' and update endpoint
    return response.data;
  }

  async createJob(jobData: CreateJobDto): Promise<Job> {
    // TODO: Replace 'any' with 'CreateJobDto' and 'Job'
    const response = await apiClient.post<Job>('/jobs', jobData); // TODO: Replace 'any' with 'Job' and update endpoint
    return response.data;
  }

  async updateJob(id: string, jobData: UpdateJobDto): Promise<Job> {
    // TODO: Replace 'any' with 'UpdateJobDto' and 'Job'
    const response = await apiClient.put<Job>(`/jobs/${id}`, jobData); // TODO: Replace 'any' with 'Job' and update endpoint
    return response.data;
  }

  async deleteJob(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/jobs/${id}`); // TODO: Update endpoint if needed
  }
}

export const jobsService = new JobsService();

// ----- React Query Hooks -----
// TODO: Define and use proper types for hooks

export const useGetJobs = (/* TODO: Add filter parameters if needed */) =>
  useQuery<Job[], Error>({
    // TODO: Replace 'any[]' with 'Job[]'
    queryKey: JOB_KEYS.list('all'), // Adjust key as needed
    queryFn: () => jobsService.getAllJobs(/* TODO: Pass filters */),
  });

export const useGetJobById = (id: string) =>
  useQuery<Job, Error>({
    // TODO: Replace 'any' with 'Job'
    queryKey: JOB_KEYS.detail(id),
    queryFn: () => jobsService.getJobById(id),
    enabled: !!id, // Only run query if id is available
  });

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation<Job, Error, CreateJobDto>({
    // TODO: Replace 'any' with 'Job' and 'CreateJobDto'
    mutationFn: (jobData: CreateJobDto) => jobsService.createJob(jobData), // TODO: Replace 'any' with 'CreateJobDto'
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_KEYS.lists() });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation<Job, Error, { id: string; data: UpdateJobDto }>({
    // TODO: Replace 'any' with 'Job' and 'UpdateJobDto' for data
    mutationFn: ({ id, data }) => jobsService.updateJob(id, data),
    onSuccess: (data, variables) => {
      // TODO: Use proper type for data if available
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
