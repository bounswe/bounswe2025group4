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
  nonProfit?: boolean;
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
  nonProfit?: boolean;
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
  nonProfit?: boolean;
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
  nonProfit?: boolean;
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
  motivation: string;
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
  motivation: string; // Motivation message from mentee
}

/**
 * Request payload for responding to a mentorship request
 */
export interface RespondToRequestDTO {
  accept: boolean;
  responseMessage: string;
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

// ============================================================================
// RESUME REVIEW
// ============================================================================

/**
 * Resume review response from API
 */
export interface ResumeReviewDTO {
  resumeReviewId: number;
  fileUrl: string | null;
  reviewStatus: string; // ACTIVE, COMPLETED, CLOSED
  feedback: string | null;
}

/**
 * Resume file upload response
 */
export interface ResumeFileResponseDTO {
  resumeReviewId: number;
  fileUrl: string;
  reviewStatus: string;
  uploadedAt: string; // ISO 8601 date-time string
}

/**
 * Request payload for creating a chat message
 */
export interface CreateMessageDTO {
  content: string;
}

// ============================================================================
// FORUM
// ============================================================================

/**
 * Forum comment response from API
 */
export interface ForumCommentResponseDTO {
  id: number;
  content: string;
  authorId: number;
  authorUsername: string;
  postId: number;
  parentCommentId?: number | null;
  createdAt: string;
  updatedAt: string;
  upvoteCount: number;
  downvoteCount: number;
}

/**
 * Forum post response from API
 */
export interface ForumPostResponseDTO {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorUsername: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  upvoteCount: number;
  downvoteCount: number;
  comments: ForumCommentResponseDTO[];
}

/**
 * Create post request payload
 */
export interface CreateForumPostRequest {
  title: string;
  content: string;
  tags?: string[];
}

/**
 * Update post request payload
 */
export interface UpdateForumPostRequest {
  title?: string;
  content?: string;
  tags?: string[];
}

/**
 * Create comment request payload
 */
export interface CreateForumCommentRequest {
  content: string;
  parentCommentId?: number | null;
}

/**
 * Update comment request payload
 */
export interface UpdateForumCommentRequest {
  content: string;
}

// ============================================================================
// USER ACTIVITY STREAM
// ============================================================================

/**
 * Activity type enum matching backend ActivityType
 */
export type ActivityType =
  | 'REGISTER'
  | 'UPDATE_PROFILE'
  | 'CREATE_WORKPLACE'
  | 'CREATE_JOB'
  | 'APPLY_JOB'
  | 'APPROVE_APPLICATION'
  | 'REJECT_APPLICATION'
  | 'CREATE_REVIEW'
  | 'REQUEST_MENTORSHIP'
  | 'ACCEPT_MENTORSHIP'
  | 'COMPLETE_MENTORSHIP'
  | 'CREATE_THREAD'
  | 'CREATE_COMMENT'
  | 'UPVOTE_THREAD'
  | 'DOWNVOTE_THREAD'
  | 'EDIT_THREAD'
  | 'DELETE_THREAD';

/**
 * Actor information in activity response
 */
export interface ActivityActor {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Activity response from backend
 * Matches backend Activity entity structure
 */
export interface ActivityResponse {
  id: number;
  actor: ActivityActor;
  type: ActivityType;
  entityId?: number;
  entityType?: string;
  createdAt: string; // ISO 8601 date-time
}

/**
 * Paginated activity response (Spring Data Page format)
 */
export interface PaginatedActivitiesResponse {
  content: ActivityResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  first: boolean;
  empty: boolean;
}

/**
 * Activity query parameters
 */
export interface ActivityQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * W3C Activity Streams 2.0 Actor
 * Spec: https://www.w3.org/TR/activitystreams-core/#actors
 */
export interface AS2Actor {
  type: 'Person' | 'Organization' | 'Service';
  id: string; // User URI
  name?: string; // Username
}

/**
 * W3C Activity Streams 2.0 Object
 * Spec: https://www.w3.org/TR/activitystreams-core/#object
 */
export interface AS2Object {
  type: string; // Person, JobPosting, Article, etc.
  id: string; // Entity URI
  name?: string; // Optional entity name
}

/**
 * W3C Activity Streams 2.0 Activity
 * Spec: https://www.w3.org/TR/activitystreams-core/#activities
 */
export interface AS2Activity {
  '@context'?: string; // Only on first activity in collection
  type: string; // AS2 activity type (Create, Update, Join, etc.)
  id: string; // Unique activity URI
  actor: AS2Actor;
  object: AS2Object;
  summary?: string; // Optional activity summary
  published: string; // ISO 8601 timestamp
}

/**
 * W3C Activity Streams 2.0 OrderedCollection
 * Used for activity stream exports
 * Spec: https://www.w3.org/TR/activitystreams-core/#collections
 *
 * Provides GDPR/KVKK data portability compliance using
 * W3C Activity Streams 2.0 (2017 Recommendation) format
 */
export interface AS2OrderedCollection {
  '@context': 'https://www.w3.org/ns/activitystreams';
  type: 'OrderedCollection';
  totalItems: number;
  published: string; // Collection creation timestamp
  orderedItems: AS2Activity[];
}
