import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '@shared/lib/api-client';
import { mentorshipKeys } from '@shared/lib/query-keys';
import { normalizeApiError } from '@shared/utils/error-handler';
import { useQueryWithToast } from '@shared/hooks/useQueryWithToast';
import type {
  CreateMentorProfileDTO,
  UpdateMentorProfileDTO,
  MentorProfileDTO,
  MentorProfileDetailDTO,
  CreateMentorshipRequestDTO,
  MentorshipRequestDTO,
  MentorshipDetailsDTO,
  RespondToRequestDTO,
  CreateRatingDTO,
  ResumeReviewDTO,
  ResumeFileResponseDTO,
} from '@shared/types/api.types';

/**
 * Mentorship Service
 * Handles all API calls related to mentorship
 */

async function fetchMentors(): Promise<MentorProfileDetailDTO[]> {
  try {
    const response = await api.get<MentorProfileDetailDTO[]>('/mentorship');
    return response.data;
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    // If backend is unavailable (502), return empty array instead of throwing
    if (status === 502) {
      console.warn('Backend service temporarily unavailable (502), returning empty mentor list');
      return [];
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Get a single mentor profile by ID
 * GET /api/mentorship/mentor/{userId}
 * Returns null if profile doesn't exist (404)
 */
async function fetchMentorProfile(userId: number): Promise<MentorProfileDetailDTO | null> {
  try {
    // Use validateStatus to treat 404 and 502 as success (not an error) to prevent console logging
    const response = await api.get<MentorProfileDetailDTO>(`/mentorship/mentor/${userId}`, {
      validateStatus: (status) => status === 200 || status === 404 || status === 502
    });
    
    // If 404, return null (profile doesn't exist)
    if (response.status === 404) {
      return null;
    }
    
    // If 502, return null (backend service unavailable)
    if (response.status === 502) {
      console.warn(`[Mentorship Service] Backend returned 502 for mentor profile userId: ${userId}`);
      return null;
    }
    
    return response.data;
  } catch (error: unknown) {
    // Fallback: if validateStatus didn't work, check for 404 or 502
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      return null;
    }
    if (status === 502) {
      console.warn(`[Mentorship Service] Backend returned 502 for mentor profile userId: ${userId}`);
      return null;
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Create a mentor profile
 * POST /api/mentorship/mentor
 */
async function createMentorProfile(
  data: CreateMentorProfileDTO
): Promise<MentorProfileDTO> {
  const response = await api.post<MentorProfileDTO>('/mentorship/mentor', data);
  return response.data;
}

/**
 * Update a mentor profile
 * PUT /api/mentorship/mentor/{userId}
 */
async function updateMentorProfile(
  userId: number,
  data: UpdateMentorProfileDTO
): Promise<MentorProfileDTO> {
  const response = await api.put<MentorProfileDTO>(`/mentorship/mentor/${userId}`, data);
  return response.data;
}

/**
 * Delete a mentor profile
 * DELETE /api/mentorship/mentor/{userId}
 */
async function deleteMentorProfile(userId: number): Promise<void> {
  await api.delete(`/mentorship/mentor/${userId}`);
}

/**
 * Create a mentorship request
 * POST /api/mentorship/requests
 */
async function createMentorshipRequest(
  data: CreateMentorshipRequestDTO
): Promise<MentorshipRequestDTO> {
  const response = await api.post<MentorshipRequestDTO>('/mentorship/requests', data);
  return response.data;
}

/**
 * Get mentorship details for a mentee
 * GET /api/mentorship/mentee/{menteeId}/requests
 */
async function fetchMenteeMentorships(menteeId: number): Promise<MentorshipDetailsDTO[]> {
  const response = await api.get<MentorshipDetailsDTO[]>(`/mentorship/mentee/${menteeId}/requests`);
  return response.data;
}

/**
 * Get mentorship requests for a mentor
 * GET /api/mentorship/mentor/{mentorId}/requests
 */
async function fetchMentorMentorshipRequests(mentorId: number): Promise<MentorshipRequestDTO[]> {
  const response = await api.get<MentorshipRequestDTO[]>(`/mentorship/mentor/${mentorId}/requests`);
  return response.data;
}

/**
 * Respond to a mentorship request (accept/reject)
 * PATCH /api/mentorship/requests/{requestId}/respond
 */
async function respondToMentorshipRequest(
  requestId: number,
  data: RespondToRequestDTO
): Promise<MentorshipRequestDTO> {
  const response = await api.patch<MentorshipRequestDTO>(`/mentorship/requests/${requestId}/respond`, data);
  return response.data;
}

/**
 * Complete a mentorship
 * PATCH /api/mentorship/review/{resumeReviewId}/complete
 */
async function completeMentorship(resumeReviewId: number): Promise<void> {
  await api.patch(`/mentorship/review/${resumeReviewId}/complete`);
}

/**
 * Rate a mentor (write a review)
 * POST /api/mentorship/ratings
 */
async function rateMentor(data: CreateRatingDTO): Promise<void> {
  await api.post('/mentorship/ratings', data);
}

/**
 * Get resume review details
 * GET /api/mentorship/{resumeReviewId}
 */
async function fetchResumeReview(resumeReviewId: number): Promise<ResumeReviewDTO> {
  const response = await api.get<ResumeReviewDTO>(`/mentorship/${resumeReviewId}`);
  return response.data;
}

/**
 * Get resume file URL
 * GET /api/mentorship/{resumeReviewId}/file
 */
async function fetchResumeFileUrl(resumeReviewId: number): Promise<string> {
  const response = await api.get<{ fileUrl: string }>(`/mentorship/${resumeReviewId}/file`);
  return response.data.fileUrl;
}

/**
 * Upload resume file
 * POST /api/mentorship/{resumeReviewId}/file
 */
async function uploadResumeFile(resumeReviewId: number, file: File): Promise<ResumeFileResponseDTO> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ResumeFileResponseDTO>(`/mentorship/${resumeReviewId}/file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Close mentorship
 * PATCH /api/mentorship/review/{resumeReviewId}/close
 */
async function closeMentorship(resumeReviewId: number): Promise<void> {
  await api.patch(`/mentorship/review/${resumeReviewId}/close`);
}

// Legacy exports
export {
  fetchMentors as getMentors,
  fetchMentorProfile as getMentorProfile,
  createMentorProfile,
  updateMentorProfile,
  deleteMentorProfile,
  createMentorshipRequest,
  fetchMenteeMentorships as getMenteeMentorships,
  fetchMentorMentorshipRequests as getMentorMentorshipRequests,
  respondToMentorshipRequest,
  completeMentorship,
  rateMentor,
  fetchResumeReview as getResumeReview,
  fetchResumeFileUrl as getResumeFileUrl,
  uploadResumeFile,
  closeMentorship,
};

// Hooks
export const useMentorsQuery = () =>
  useQueryWithToast({
    queryKey: mentorshipKeys.mentors,
    queryFn: () => fetchMentors(),
  });

export const useMentorProfileQuery = (userId?: number, enabled = true) =>
  useQueryWithToast({
    queryKey: userId ? mentorshipKeys.mentorProfile(userId) : mentorshipKeys.mentorProfile('missing'),
    queryFn: () => fetchMentorProfile(userId as number),
    enabled: Boolean(userId) && enabled,
  });

export const useCreateMentorProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMentorProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.mentors });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: mentorshipKeys.mentorProfile(data.id) });
      }
      toast.success('Mentor profile created');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useUpdateMentorProfileMutation = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMentorProfileDTO) => updateMentorProfile(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.mentorProfile(userId) });
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.mentors });
      toast.success('Mentor profile updated');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useDeleteMentorProfileMutation = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteMentorProfile(userId),
    onSuccess: () => {
      // Remove all mentorship-related queries for this user
      queryClient.removeQueries({ queryKey: mentorshipKeys.mentorProfile(userId) });
      queryClient.removeQueries({ queryKey: mentorshipKeys.mentorRequests(userId) });
      // Invalidate mentors list to remove deleted profile from browse page
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.mentors });
      // Clear cache to prevent showing deleted profile
      queryClient.refetchQueries({ queryKey: mentorshipKeys.mentors });
      toast.success('Mentor profile deleted');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useCreateMentorshipRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMentorshipRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.menteeMentorships('me') });
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.mentorRequests('me') });
      toast.success('Mentorship request sent');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useMenteeMentorshipsQuery = (menteeId?: number, enabled = true) =>
  useQueryWithToast({
    queryKey: mentorshipKeys.menteeMentorships(menteeId ?? 'me'),
    queryFn: () => fetchMenteeMentorships(menteeId as number),
    enabled: Boolean(menteeId) && enabled,
  });

export const useMentorMentorshipRequestsQuery = (mentorId?: number, enabled = true) =>
  useQueryWithToast({
    queryKey: mentorshipKeys.mentorRequests(mentorId ?? 'me'),
    queryFn: () => fetchMentorMentorshipRequests(mentorId as number),
    enabled: Boolean(mentorId) && enabled,
  });

export const useRespondToMentorshipRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, accept, responseMessage }: { requestId: number; accept: boolean; responseMessage: string }) =>
      respondToMentorshipRequest(requestId, {
        accept,
        responseMessage,
      }),
    onMutate: async ({ requestId, accept }) => {
      await queryClient.cancelQueries({ queryKey: mentorshipKeys.mentorRequests('me') });
      const previous = queryClient.getQueryData<MentorshipRequestDTO[]>(
        mentorshipKeys.mentorRequests('me')
      );

      if (previous) {
        const requestIdString = String(requestId);
        const updated = previous.map((request) =>
          request.id === requestIdString
            ? { ...request, status: accept ? 'ACCEPTED' : 'REJECTED' }
            : request
        );
        queryClient.setQueryData(mentorshipKeys.mentorRequests('me'), updated);
      }

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(mentorshipKeys.mentorRequests('me'), context.previous);
      }
      toast.error(normalizeApiError(err).friendlyMessage);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.mentorRequests('me') });
      toast.success(variables.accept ? 'Request accepted' : 'Request rejected');
    },
  });
};

export const useCompleteMentorshipMutation = (resumeReviewId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => completeMentorship(resumeReviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.menteeMentorships('me') });
      toast.success('Mentorship completed');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useCloseMentorshipMutation = (resumeReviewId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => closeMentorship(resumeReviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.menteeMentorships('me') });
      toast.success('Mentorship closed');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useRateMentorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rateMentor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.menteeMentorships('me') });
      toast.success('Review submitted');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useResumeReviewQuery = (resumeReviewId?: number, enabled = true) =>
  useQueryWithToast({
    queryKey: resumeReviewId ? ['resume-review', resumeReviewId] : ['resume-review', 'missing'],
    queryFn: () => fetchResumeReview(resumeReviewId as number),
    enabled: Boolean(resumeReviewId) && enabled,
  });

export const useResumeFileUrlQuery = (resumeReviewId?: number, enabled = true) =>
  useQueryWithToast({
    queryKey: resumeReviewId ? ['resume-review-file', resumeReviewId] : ['resume-review-file', 'missing'],
    queryFn: () => fetchResumeFileUrl(resumeReviewId as number),
    enabled: Boolean(resumeReviewId) && enabled,
  });

export const useUploadResumeFileMutation = (resumeReviewId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadResumeFile(resumeReviewId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume-review', resumeReviewId] });
      queryClient.invalidateQueries({ queryKey: ['resume-review-file', resumeReviewId] });
      toast.success('Resume file uploaded');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

