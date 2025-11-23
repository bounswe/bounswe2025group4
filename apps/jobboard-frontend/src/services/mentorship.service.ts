import { api } from '@/lib/api-client';
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
} from '@/types/api.types';

/**
 * Mentorship Service
 * Handles all API calls related to mentorship
 */

/**
 * Get all mentor profiles
 * GET /api/mentorship
 */
export async function getMentors(): Promise<MentorProfileDetailDTO[]> {
  const response = await api.get<MentorProfileDetailDTO[]>('/mentorship');
  return response.data;
}

/**
 * Get a single mentor profile by ID
 * GET /api/mentorship/mentor/{userId}
 */
export async function getMentorProfile(userId: number): Promise<MentorProfileDetailDTO> {
  const response = await api.get<MentorProfileDetailDTO>(`/mentorship/mentor/${userId}`);
  return response.data;
}

/**
 * Create a mentor profile
 * POST /api/mentorship/mentor
 */
export async function createMentorProfile(
  data: CreateMentorProfileDTO
): Promise<MentorProfileDTO> {
  const response = await api.post<MentorProfileDTO>('/mentorship/mentor', data);
  return response.data;
}

/**
 * Update a mentor profile
 * PUT /api/mentorship/mentor/{userId}
 */
export async function updateMentorProfile(
  userId: number,
  data: UpdateMentorProfileDTO
): Promise<MentorProfileDTO> {
  const response = await api.put<MentorProfileDTO>(`/mentorship/mentor/${userId}`, data);
  return response.data;
}

/**
 * Create a mentorship request
 * POST /api/mentorship/requests
 */
export async function createMentorshipRequest(
  data: CreateMentorshipRequestDTO
): Promise<MentorshipRequestDTO> {
  try {
    const response = await api.post<MentorshipRequestDTO>('/mentorship/requests', data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get mentorship details for a mentee
 * GET /api/mentorship/mentee/{menteeId}/requests
 */
export async function getMenteeMentorships(menteeId: number): Promise<MentorshipDetailsDTO[]> {
  const response = await api.get<MentorshipDetailsDTO[]>(`/mentorship/mentee/${menteeId}/requests`);
  return response.data;
}

/**
 * Get mentorship requests for a mentor
 * GET /api/mentorship/mentor/{mentorId}/requests
 */
export async function getMentorMentorshipRequests(mentorId: number): Promise<MentorshipRequestDTO[]> {
  const response = await api.get<MentorshipRequestDTO[]>(`/mentorship/mentor/${mentorId}/requests`);
  return response.data;
}

/**
 * Respond to a mentorship request (accept/reject)
 * PATCH /api/mentorship/requests/{requestId}/respond
 */
export async function respondToMentorshipRequest(
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
export async function completeMentorship(resumeReviewId: number): Promise<void> {
  await api.patch(`/mentorship/review/${resumeReviewId}/complete`);
}

/**
 * Rate a mentor (write a review)
 * POST /api/mentorship/ratings
 */
export async function rateMentor(data: CreateRatingDTO): Promise<void> {
  await api.post('/mentorship/ratings', data);
}

