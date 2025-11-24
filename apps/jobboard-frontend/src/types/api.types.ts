// ============================================================================
// JOB POSTS
// ============================================================================

/**
 * Job post response from API
 */
import type { WorkplaceBriefResponse } from './workplace.types';

/**
 * Job post response from API
 */
export interface JobPostResponse {
  id: number;
  jobId?: number;
  jobPostId?: number;
  employerId: number;
  workplaceId?: number;
  title: string;
  description: string;
  workplace: WorkplaceBriefResponse;
  location: string;
  remote: boolean;
  inclusiveOpportunity: boolean;
  minSalary: number;
  maxSalary: number;
  contact: string;
  postedDate: string; // ISO 8601 date-time string
}

/**
 * Request payload for creating a job post
 */
export interface CreateJobPostRequest {
  title: string; // max 100 chars
  description: string; // max 1000 chars
  workplaceId: number; // required, links job to workplace
  remote: boolean;
  inclusiveOpportunity?: boolean;
  minSalary?: number;
  maxSalary?: number;
  contact: string; // required, min 1 char
}

/**
 * Request payload for updating a job post
 */
export interface UpdateJobPostRequest {
  title?: string; // max 100 chars
  description?: string; // max 1000 chars
  workplaceId?: number;
  location?: string;
  remote?: boolean;
  inclusiveOpportunity?: boolean;
  minSalary?: number;
  maxSalary?: number;
  contact?: string;
}

/**
 * Query parameters for filtering jobs
 */
export interface JobsFilterParams {
  title?: string;
  companyName?: string;
  workplaceId?: number;
  ethicalTags?: string[];
  minSalary?: number;
  maxSalary?: number;
  isRemote?: boolean;
  inclusiveOpportunity?: boolean;
}

// ============================================================================
// JOB APPLICATIONS
// ============================================================================

/**
 * Application status type
 */
export type JobApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Job application response from API
 */
export interface JobApplicationResponse {
  id: number;
  title: string;
  company: string;
  applicantName: string;
  jobSeekerId: number;
  jobPostId: number;
  status: JobApplicationStatus;
  specialNeeds?: string;
  feedback?: string;
  cvUrl?: string;
  coverLetter?: string;
  appliedDate: string; // ISO 8601 date-time string
}

/**
 * Request payload for creating a job application
 */
export interface CreateJobApplicationRequest {
  jobPostId: number;
  specialNeeds?: string; // max 500 chars
  coverLetter?: string; // max 2000 chars
}

/**
 * Response from CV upload endpoint
 */
export interface CvUploadResponse {
  cvUrl: string;
  uploadedAt: string; // ISO 8601 date-time string
}

/**
 * Request payload for updating a job application (feedback)
 */
export interface UpdateJobApplicationRequest {
  feedback?: string; // max 1000 chars
}

/**
 * Query parameters for filtering applications
 */
export interface ApplicationsFilterParams {
  jobSeekerId?: number;
  jobPostId?: number;
}

// ============================================================================
// PROFILE (for reference)
// ============================================================================

export interface ProfileResponseDto {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  bio?: string;
  imageUrl?: string;
  educations: EducationResponseDto[];
  experiences: ExperienceResponseDto[];
  skills: SkillResponseDto[];
  interests: InterestResponseDto[];
  badges: BadgeResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface EducationResponseDto {
  id: number;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface ExperienceResponseDto {
  id: number;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

export interface SkillResponseDto {
  id: number;
  name: string;
  level?: string;
}

export interface InterestResponseDto {
  id: number;
  name: string;
}

export interface BadgeResponseDto {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  criteria?: string;
  earnedAt: string;
}

export interface PublicProfileResponseDto {
  userId: number;
  firstName: string;
  lastName: string;
  bio?: string;
  imageUrl?: string;
  educations: EducationResponseDto[];
  experiences: ExperienceResponseDto[];
  badges: BadgeResponseDto[];
}

// ============================================================================
// COMMON
// ============================================================================

/**
 * Generic message response from API
 */
export interface MessageResponse {
  message: string;
}

// ============================================================================
// MENTORSHIP
// ============================================================================

/**
 * Request payload for creating a mentor profile
 */
export interface CreateMentorProfileDTO {
  expertise: string[];
  maxMentees: number;
}

/**
 * Request payload for updating a mentor profile
 */
export interface UpdateMentorProfileDTO {
  expertise?: string[];
  maxMentees?: number;
}

/**
 * Mentor profile response from API
 */
export interface MentorProfileDTO {
  id: string;
  username: string;
  expertise: string[];
  currentMentees: number;
  maxMentees: number;
  averageRating: number;
  reviewCount: number;
}

/**
 * Mentor review response from API
 */
export interface MentorReviewDTO {
  id: number;
  reviewerUsername: string;
  rating: number;
  comment: string;
  createdAt: string; // ISO 8601 date-time string
}

/**
 * Detailed mentor profile response from API (includes reviews)
 */
export interface MentorProfileDetailDTO {
  id: string;
  username: string;
  expertise: string[];
  currentMentees: number;
  maxMentees: number;
  averageRating: number;
  reviewCount: number;
  reviews: MentorReviewDTO[];
}

/**
 * Request payload for creating a mentorship request
 */
export interface CreateMentorshipRequestDTO {
  mentorId: number;
}

/**
 * Mentorship request response from API
 */
export interface MentorshipRequestDTO {
  id: string;
  requesterId: string;
  mentorId: string;
  status: string; // PENDING, ACCEPTED, REJECTED
  createdAt: string; // ISO 8601 date-time string
  message?: string; // Optional: message from mentee
  goals?: string[]; // Optional: learning goals
  expectedDuration?: string; // Optional: expected mentorship duration
  preferredTime?: string; // Optional: preferred meeting time
}

/**
 * Request payload for responding to a mentorship request
 */
export interface RespondToRequestDTO {
  accept: boolean;
}

export interface CreateRatingDTO {
  resumeReviewId: number;
  rating: number;
  comment: string;
}

/**
 * Mentorship details response from API (for mentee)
 */
export interface MentorshipDetailsDTO {
  mentorshipRequestId: number;
  requestStatus: string; // PENDING, ACCEPTED, REJECTED, COMPLETED, CLOSED
  requestCreatedAt: string; // ISO 8601 date-time string
  mentorId: number;
  mentorUsername: string;
  resumeReviewId: number;
  reviewStatus: string; // ACTIVE, COMPLETED, CLOSED
  conversationId: number;
}

// ============================================================================
// CHAT
// ============================================================================

/**
 * Chat message DTO from backend
 */
export interface ChatMessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  timestamp: string; // ISO 8601 date-time string
  read?: boolean;
  senderAvatar?: string;
}

/**
 * Request payload for creating a chat message
 */
export interface CreateMessageDTO {
  content: string;
}