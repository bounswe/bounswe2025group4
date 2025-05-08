import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api, queryClient } from './api';
import { User } from './auth.service';

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: User;
  tags: string[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadComment {
  id: string;
  threadId: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadData {
  title: string;
  content: string;
  tags: string[];
}

export interface ThreadFilters {
  search?: string;
  tags?: string[];
  authorId?: string;
  page?: number;
  limit?: number;
}

const FORUM_KEYS = {
  all: ['forum'] as const,
  threads: () => [...FORUM_KEYS.all, 'threads'] as const,
  thread: (filters: ThreadFilters) =>
    [...FORUM_KEYS.threads(), filters] as const,
  threadDetail: (id: string) =>
    [...FORUM_KEYS.threads(), 'detail', id] as const,
  comments: (threadId: string) =>
    [...FORUM_KEYS.threadDetail(threadId), 'comments'] as const,
  tags: () => [...FORUM_KEYS.all, 'tags'] as const,
};

export const useThreads = (filters: ThreadFilters = {}) => {
  return useInfiniteQuery({
    queryKey: FORUM_KEYS.thread(filters),
    queryFn: ({ pageParam }) =>
      api.get<{
        threads: ForumThread[];
        total: number;
        hasMore: boolean;
      }>('/forum/threads', { ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.data.hasMore ? lastPage.data.total + 1 : undefined,
  });
};

export const useThread = (id: string) => {
  return useQuery({
    queryKey: FORUM_KEYS.threadDetail(id),
    queryFn: () => api.get<ForumThread>(`/forum/threads/${id}`),
  });
};

export const useCreateThread = () => {
  return useMutation({
    mutationFn: (data: CreateThreadData) =>
      api.post<ForumThread>('/forum/threads', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORUM_KEYS.threads() });
    },
  });
};

export const useUpdateThread = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateThreadData>;
    }) => api.patch<ForumThread>(`/forum/threads/${id}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: FORUM_KEYS.threads() });
      queryClient.invalidateQueries({
        queryKey: FORUM_KEYS.threadDetail(data.data.id),
      });
    },
  });
};

export const useDeleteThread = () => {
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/forum/threads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORUM_KEYS.threads() });
    },
  });
};

export const useThreadComments = (threadId: string) => {
  return useInfiniteQuery({
    queryKey: FORUM_KEYS.comments(threadId),
    queryFn: ({ pageParam }) =>
      api.get<{
        comments: ThreadComment[];
        total: number;
        hasMore: boolean;
      }>(`/forum/threads/${threadId}/comments`, { page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.data.hasMore ? lastPage.data.total + 1 : undefined,
  });
};

export const useCreateComment = () => {
  return useMutation({
    mutationFn: ({
      threadId,
      content,
    }: {
      threadId: string;
      content: string;
    }) =>
      api.post<ThreadComment>(`/forum/threads/${threadId}/comments`, {
        content,
      }),
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({
        queryKey: FORUM_KEYS.comments(threadId),
      });
      queryClient.invalidateQueries({
        queryKey: FORUM_KEYS.threadDetail(threadId),
      });
    },
  });
};

export const useUpdateComment = () => {
  return useMutation({
    mutationFn: ({
      threadId,
      commentId,
      content,
    }: {
      threadId: string;
      commentId: string;
      content: string;
    }) =>
      api.patch<ThreadComment>(
        `/forum/threads/${threadId}/comments/${commentId}`,
        { content }
      ),
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({
        queryKey: FORUM_KEYS.comments(threadId),
      });
    },
  });
};

export const useDeleteComment = () => {
  return useMutation({
    mutationFn: ({
      threadId,
      commentId,
    }: {
      threadId: string;
      commentId: string;
    }) => api.delete<void>(`/forum/threads/${threadId}/comments/${commentId}`),
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({
        queryKey: FORUM_KEYS.comments(threadId),
      });
      queryClient.invalidateQueries({
        queryKey: FORUM_KEYS.threadDetail(threadId),
      });
    },
  });
};

export const useReportContent = () => {
  return useMutation({
    mutationFn: (data: {
      type: 'thread' | 'comment';
      id: string;
      reason: string;
    }) => api.post<void>('/forum/reports', data),
  });
};

export const useAvailableTags = () => {
  return useQuery({
    queryKey: FORUM_KEYS.tags(),
    queryFn: () => api.get<string[]>('/forum/tags'),
  });
};
