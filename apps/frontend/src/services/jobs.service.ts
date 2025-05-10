import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import { ApiResponse } from '../types/api';
import { JobFilters, JobPost } from '../types/job';

const JOB_KEYS = {
  all: ['jobs'] as const,
  lists: () => [...JOB_KEYS.all, 'list'] as const,
  list: (filters: JobFilters) => [...JOB_KEYS.lists(), filters] as const,
  details: () => [...JOB_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...JOB_KEYS.details(), id] as const,
};

// Define a type for the raw response from the API
type RawJobPost = Omit<JobPost, 'ethicalTags'> & {
  ethicalTags: string | string[];
};

class JobsService {
  async getAllJobs(filters: JobFilters): Promise<JobPost[]> {
    const response = await apiClient.get<RawJobPost[]>(
      '/jobs',
      filters as Record<string, unknown>
    );
    // Transform ethicalTags from comma-separated string to string array
    return response.data.map((job: RawJobPost) => ({
      ...job,
      ethicalTags:
        typeof job.ethicalTags === 'string'
          ? job.ethicalTags.split(',').map((tag: string) => tag.trim())
          : Array.isArray(job.ethicalTags)
            ? job.ethicalTags
            : [], // Handle if it's already an array or empty
    }));
  }

  async getJobById(id: string): Promise<JobPost> {
    const response = await apiClient.get<JobPost>(`/jobs/${id}`);
    // Transform ethicalTags from comma-separated string to string array
    const job = response.data as RawJobPost;
    return {
      ...job,
      ethicalTags:
        typeof job.ethicalTags === 'string'
          ? job.ethicalTags.split(',').map((tag: string) => tag.trim())
          : [], // Handle if it's already an array or empty
    };
  }

  async createJob(jobData: JobPost): Promise<JobPost> {
    const response = await apiClient.post<JobPost>('/jobs', jobData);
    return response.data;
  }

  async updateJob(id: string, jobData: JobPost): Promise<JobPost> {
    const response = await apiClient.put<JobPost>(`/jobs/${id}`, jobData);
    return response.data;
  }

  async deleteJob(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/jobs/${id}`); // TODO: Update endpoint if needed
  }
}

export const jobsService = new JobsService();

// ----- React Query Hooks -----
export const useGetJobs = (filters: JobFilters) =>
  useQuery<JobPost[], Error, JobPost[], readonly [string, string, JobFilters]>({
    queryKey: JOB_KEYS.list(filters),
    queryFn: () => jobsService.getAllJobs(filters),
    refetchOnWindowFocus: false,
  });

export const useGetJobById = (id: string) =>
  useQuery<JobPost, Error, JobPost, readonly [string, string, string]>({
    queryKey: JOB_KEYS.detail(id),
    queryFn: () => jobsService.getJobById(id),
  });

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation<JobPost, Error, JobPost>({
    mutationFn: (jobData: JobPost) => jobsService.createJob(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_KEYS.lists() });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation<JobPost, Error, { id: string; data: JobPost }>({
    mutationFn: ({ id, data }) => jobsService.updateJob(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: JOB_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: JOB_KEYS.detail(variables.id),
      });
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
    },
  });
};
