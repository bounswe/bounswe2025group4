// ============================================================================
// JOB POSTS
// ============================================================================

/**
 * Job post response from API
 */
export interface JobPostResponse {
  id: number;
  employerId: number;
  title: string;
  description: string;
  company: string;
  location: string;
  remote: boolean;
  ethicalTags: string;
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
  company: string; // required, min 1 char
  location: string; // required, min 1 char
  remote: boolean;
  ethicalTags?: string;
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
  company?: string;
  location?: string;
  remote?: boolean;
  ethicalTags?: string;
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
  appliedDate: string; // ISO 8601 date-time string
}

/**
 * Request payload for creating a job application
 */
export interface CreateJobApplicationRequest {
  jobPostId: number;
  specialNeeds?: string; // max 500 chars
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
