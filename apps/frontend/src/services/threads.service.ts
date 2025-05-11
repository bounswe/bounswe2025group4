import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Thread,
  CreateThreadRequest,
  Comment,
  CreateCommentRequest,
  Tag,
} from '../types/thread';
import { apiClient } from './api';

const THREAD_KEYS = {
  all: ['threads'] as const,
  lists: () => [...THREAD_KEYS.all, 'list'] as const,
  detail: (id: number) => [...THREAD_KEYS.all, 'detail', id] as const,
  comments: (threadId: number) =>
    [...THREAD_KEYS.all, 'comments', threadId] as const,
  tags: () => [...THREAD_KEYS.all, 'tags'] as const,
  likers: (threadId: number) =>
    [...THREAD_KEYS.all, 'likers', threadId] as const,
};

class ThreadsService {
  async getAllThreads(): Promise<Thread[]> {
    const response = await apiClient.get<Thread[]>('/threads');
    return response.data;
  }

  async createThread(threadData: CreateThreadRequest): Promise<Thread> {
    const response = await apiClient.post<Thread>('/threads', threadData);
    return response.data;
  }

  async deleteThread(threadId: number): Promise<void> {
    await apiClient.delete(`/threads/${threadId}`);
  }

  async getThreadComments(threadId: number): Promise<Comment[]> {
    const response = await apiClient.get<Comment[]>(
      `/threads/${threadId}/comments`
    );
    return response.data;
  }

  async createComment(
    threadId: number,
    commentData: CreateCommentRequest
  ): Promise<Comment> {
    const response = await apiClient.post<Comment>(
      `/threads/${threadId}/comments`,
      commentData
    );
    return response.data;
  }

  async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete(`/comments/${commentId}`);
  }

  async getThreadTags(): Promise<Tag[]> {
    const response = await apiClient.get<Tag[]>('/threads/tags');
    return response.data;
  }
}

export const threadsService = new ThreadsService();

// ----- React Query Hook -----
export const useGetThreads = () =>
  useQuery<Thread[], Error>({
    queryKey: ['threads'],
    queryFn: () => threadsService.getAllThreads(),
    refetchOnWindowFocus: false,
  });

export const useGetThreadById = (id: number) =>
  useQuery<Thread, Error>({
    queryKey: THREAD_KEYS.detail(id),
    queryFn: async () => {
      // Since there's no direct endpoint to get a single thread,
      // we'll fetch all threads and find the one with matching ID
      const threads = await threadsService.getAllThreads();
      const thread = threads.find((t) => t.id === id);
      if (!thread) {
        throw new Error(`Thread with id ${id} not found`);
      }
      return thread;
    },
    enabled: !!id, // Only run the query if id is provided
  });

export const useCreateThread = () => {
  const queryClient = useQueryClient();

  return useMutation<Thread, Error, CreateThreadRequest>({
    mutationFn: (threadData) => threadsService.createThread(threadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: THREAD_KEYS.lists() });
    },
  });
};

export const useDeleteThread = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (threadId) => threadsService.deleteThread(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: THREAD_KEYS.lists() });
    },
  });
};

export const useGetThreadTags = () =>
  useQuery<Tag[], Error>({
    queryKey: THREAD_KEYS.tags(),
    queryFn: () => threadsService.getThreadTags(),
  });

export const useGetThreadComments = (threadId: number) =>
  useQuery<Comment[], Error>({
    queryKey: THREAD_KEYS.comments(threadId),
    queryFn: () => threadsService.getThreadComments(threadId),
    enabled: !!threadId, // Only run the query if threadId is provided
  });

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Comment,
    Error,
    { threadId: number; data: CreateCommentRequest }
  >({
    mutationFn: ({ threadId, data }) =>
      threadsService.createComment(threadId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: THREAD_KEYS.comments(variables.threadId),
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { commentId: number; threadId: number }>({
    mutationFn: ({ commentId }) => threadsService.deleteComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: THREAD_KEYS.comments(variables.threadId),
      });
    },
  });
};
