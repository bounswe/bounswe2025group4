// src/services/mentorship.service.ts
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  MentorProfile,
  CreateMentorProfileRequest,
  MentorshipRequest,
  CreateMentorshipRequestRequest,
  RequestStatus,
  UpdateMentorProfileRequest,
} from '../types/mentor';
import { apiClient } from './api';

const MENTOR_KEYS = {
  all: ['mentors'] as const,
  profiles: () => [...MENTOR_KEYS.all, 'profiles'] as const,
  profile: (id: number) => [...MENTOR_KEYS.all, 'profile', id] as const,
  profileByUserId: (userId: number) =>
    [...MENTOR_KEYS.all, 'profileByUserId', userId] as const,
  requests: () => [...MENTOR_KEYS.all, 'requests'] as const,
  mentorRequests: () => [...MENTOR_KEYS.all, 'mentorRequests'] as const,
  menteeRequests: () => [...MENTOR_KEYS.all, 'menteeRequests'] as const,
};

class MentorService {
  async getAllMentorProfiles(): Promise<MentorProfile[]> {
    const response = await apiClient.get<MentorProfile[]>('/mentor/profiles');
    return response.data;
  }

  async createMentorProfile(
    profileData: CreateMentorProfileRequest
  ): Promise<MentorProfile> {
    const response = await apiClient.post<MentorProfile>(
      '/mentor/profile',
      profileData
    );
    return response.data;
  }

  async getMentorProfileByUserId(userId: number): Promise<MentorProfile> {
    const response = await apiClient.get<MentorProfile>(
      `/mentor/profile/${userId}`
    );
    return response.data;
  }

  async createMentorshipRequest(
    requestData: CreateMentorshipRequestRequest
  ): Promise<MentorshipRequest> {
    const response = await apiClient.post<MentorshipRequest>(
      '/mentor/request',
      requestData
    );
    return response.data;
  }

  async getMentorRequests(): Promise<MentorshipRequest[]> {
    const response = await apiClient.get<MentorshipRequest[]>(
      '/mentor/requests/mentor'
    );
    return response.data;
  }

  async getMenteeRequests(): Promise<MentorshipRequest[]> {
    const response = await apiClient.get<MentorshipRequest[]>(
      '/mentor/requests/mentee'
    );
    return response.data;
  }

  async updateMentorshipRequestStatus(
    requestId: number,
    status: RequestStatus
  ): Promise<MentorshipRequest> {
    const response = await apiClient.patch<MentorshipRequest>(
      `/mentor/request/${requestId}/status`,
      { status }
    );
    return response.data;
  }

  async updateMentorProfile(
    profileData: UpdateMentorProfileRequest
  ): Promise<MentorProfile> {
    const response = await apiClient.put<MentorProfile>(
      '/api/mentor/profile',
      profileData
    );
    return response.data;
  }
}

export const mentorService = new MentorService();

// ----- React Query Hooks -----
export const useGetMentorProfiles = () =>
  useQuery<MentorProfile[], Error>({
    queryKey: MENTOR_KEYS.profiles(),
    queryFn: () => mentorService.getAllMentorProfiles(),
    refetchOnWindowFocus: false,
  });

export const useGetMentorProfileById = (id: number) =>
  useQuery<MentorProfile, Error>({
    queryKey: MENTOR_KEYS.profile(id),
    queryFn: async () => {
      // Since there's no direct endpoint to get a single profile,
      // we'll fetch all profiles and find the one with matching ID
      const profiles = await mentorService.getAllMentorProfiles();
      const profile = profiles.find((p) => p.id === id);
      if (!profile) {
        throw new Error(`Mentor profile with id ${id} not found`);
      }
      return profile;
    },
    enabled: !!id, // Only run the query if id is provided
  });

export const useGetMentorProfileByUserId = (userId: number) =>
  useQuery<MentorProfile, Error>({
    queryKey: MENTOR_KEYS.profileByUserId(userId),
    queryFn: () => mentorService.getMentorProfileByUserId(userId),
    enabled: !!userId, // Only run the query if userId is provided
  });

export const useCreateMentorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<MentorProfile, Error, CreateMentorProfileRequest>({
    mutationFn: (profileData) => mentorService.createMentorProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENTOR_KEYS.profiles() });
    },
  });
};

export const useCreateMentorshipRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<MentorshipRequest, Error, CreateMentorshipRequestRequest>({
    mutationFn: (requestData) =>
      mentorService.createMentorshipRequest(requestData),
    onSuccess: () => {
      // Invalidate any potentially affected queries
      queryClient.invalidateQueries({ queryKey: MENTOR_KEYS.requests() });
    },
    onError: (error) => {
      // You could add specific error handling here if needed
      console.error('Failed to create mentorship request:', error);
    },
  });
};

export const useGetMentorRequests = () =>
  useQuery<MentorshipRequest[], Error>({
    queryKey: MENTOR_KEYS.mentorRequests(),
    queryFn: () => mentorService.getMentorRequests(),
    refetchOnWindowFocus: false,
  });

export const useGetMenteeRequests = () =>
  useQuery<MentorshipRequest[], Error>({
    queryKey: MENTOR_KEYS.menteeRequests(),
    queryFn: () => mentorService.getMenteeRequests(),
    refetchOnWindowFocus: false,
  });

export const useUpdateMentorshipRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MentorshipRequest,
    Error,
    { requestId: number; status: RequestStatus }
  >({
    mutationFn: ({ requestId, status }) =>
      mentorService.updateMentorshipRequestStatus(requestId, status),
    onSuccess: () => {
      // Invalidate any potentially affected queries
      queryClient.invalidateQueries({ queryKey: MENTOR_KEYS.requests() });
      queryClient.invalidateQueries({ queryKey: MENTOR_KEYS.mentorRequests() });
      queryClient.invalidateQueries({ queryKey: MENTOR_KEYS.menteeRequests() });
    },
    onError: (error) => {
      console.error('Failed to update mentorship request status:', error);
    },
  });
};

export const useUpdateMentorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<MentorProfile, Error, UpdateMentorProfileRequest>({
    mutationFn: (profileData) => mentorService.updateMentorProfile(profileData),
    onSuccess: (data) => {
      // Invalidate the profile queries
      queryClient.invalidateQueries({ queryKey: MENTOR_KEYS.profiles() });
      queryClient.invalidateQueries({
        queryKey: MENTOR_KEYS.profileByUserId(data.user.id),
      });

      if (data.id) {
        queryClient.invalidateQueries({
          queryKey: MENTOR_KEYS.profile(data.id),
        });
      }
    },
    onError: (error) => {
      console.error('Failed to update mentor profile:', error);
    },
  });
};
