import { useMutation, useQuery } from '@tanstack/react-query';
import { api, queryClient } from './api';
import { User } from './auth.service';

export interface Mentor extends User {
  specialties: string[];
  experience: number;
  availability: {
    status: 'available' | 'limited' | 'unavailable';
    maxMentees: number;
    currentMentees: number;
  };
  rating: number;
  totalReviews: number;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  mentorshipRequestId: string;
  mentor: User;
  mentee: User;
  lastMessage?: ChatMessage;
  unreadCount: number;
  status: 'active' | 'completed';
  createdAt: string;
}

export interface MentorReview {
  id: string;
  mentorId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const MENTORSHIP_KEYS = {
  all: ['mentorship'] as const,
  mentors: () => [...MENTORSHIP_KEYS.all, 'mentors'] as const,
  mentor: (id: string) => [...MENTORSHIP_KEYS.mentors(), id] as const,
  requests: () => [...MENTORSHIP_KEYS.all, 'requests'] as const,
  threads: () => [...MENTORSHIP_KEYS.all, 'threads'] as const,
  thread: (id: string) => [...MENTORSHIP_KEYS.threads(), id] as const,
  messages: (threadId: string) =>
    [...MENTORSHIP_KEYS.thread(threadId), 'messages'] as const,
};

export const useMentors = (filters?: {
  specialty?: string;
  availability?: Mentor['availability']['status'];
}) => {
  return useQuery({
    queryKey: MENTORSHIP_KEYS.mentors(),
    queryFn: () => api.get<Mentor[]>('/mentors', filters),
  });
};

export const useMentor = (id: string) => {
  return useQuery({
    queryKey: MENTORSHIP_KEYS.mentor(id),
    queryFn: () => api.get<Mentor>(`/mentors/${id}`),
  });
};

export const useRequestMentorship = () => {
  return useMutation({
    mutationFn: (data: { mentorId: string; message: string }) =>
      api.post<MentorshipRequest>('/mentorship/requests', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENTORSHIP_KEYS.requests() });
    },
  });
};

export const useRespondToRequest = () => {
  return useMutation({
    mutationFn: ({
      requestId,
      status,
    }: {
      requestId: string;
      status: 'accepted' | 'rejected';
    }) =>
      api.patch<MentorshipRequest>(`/mentorship/requests/${requestId}`, {
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENTORSHIP_KEYS.requests() });
      queryClient.invalidateQueries({ queryKey: MENTORSHIP_KEYS.threads() });
    },
  });
};

export const useChatThreads = () => {
  return useQuery({
    queryKey: MENTORSHIP_KEYS.threads(),
    queryFn: () => api.get<ChatThread[]>('/mentorship/threads'),
  });
};

export const useChatThread = (threadId: string) => {
  return useQuery({
    queryKey: MENTORSHIP_KEYS.thread(threadId),
    queryFn: () => api.get<ChatThread>(`/mentorship/threads/${threadId}`),
  });
};

export const useChatMessages = (threadId: string) => {
  return useQuery({
    queryKey: MENTORSHIP_KEYS.messages(threadId),
    queryFn: () =>
      api.get<ChatMessage[]>(`/mentorship/threads/${threadId}/messages`),
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: ({
      threadId,
      content,
    }: {
      threadId: string;
      content: string;
    }) =>
      api.post<ChatMessage>(`/mentorship/threads/${threadId}/messages`, {
        content,
      }),
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({
        queryKey: MENTORSHIP_KEYS.messages(threadId),
      });
      queryClient.invalidateQueries({
        queryKey: MENTORSHIP_KEYS.thread(threadId),
      });
    },
  });
};

export const useCompleteMentorship = () => {
  return useMutation({
    mutationFn: (threadId: string) =>
      api.patch<ChatThread>(`/mentorship/threads/${threadId}/complete`, {}),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: MENTORSHIP_KEYS.thread(data.data.id),
      });
    },
  });
};

export const useReviewMentor = () => {
  return useMutation({
    mutationFn: (data: { mentorId: string; rating: number; comment: string }) =>
      api.post<MentorReview>('/mentorship/reviews', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: MENTORSHIP_KEYS.mentor(data.data.mentorId),
      });
    },
  });
};
