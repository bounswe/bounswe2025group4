/**
 * Workplace API Types
 * Generated from OpenAPI specification
 */

// ============================================================================
// Workplace Types
// ============================================================================

export interface WorkplaceCreateRequest {
  companyName: string;
  sector: string;
  location: string;
  shortDescription?: string;
  detailedDescription?: string;
  ethicalTags?: string[];
  website?: string;
}

export interface WorkplaceUpdateRequest {
  companyName?: string;
  sector?: string;
  location?: string;
  shortDescription?: string;
  detailedDescription?: string;
  ethicalTags?: string[];
  website?: string;
}

export interface WorkplaceBriefResponse {
  id: number;
  companyName: string;
  imageUrl?: string;
  sector: string;
  location: string;
  shortDescription?: string;
  overallAvg: number;
  ethicalTags: string[];
  ethicalAverages: Record<string, number>;
}

export interface WorkplaceDetailResponse {
  id: number;
  companyName: string;
  imageUrl?: string;
  sector: string;
  location: string;
  shortDescription?: string;
  detailedDescription?: string;
  website?: string;
  ethicalTags: string[];
  overallAvg: number;
  ethicalAverages: Record<string, number>;
  recentReviews?: ReviewResponse[];
  reviewCount?: number;
  employers: EmployerListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkplaceRatingResponse {
  workplaceId: number;
  overallAvg: number;
  ethicalAverages: Record<string, number>;
}

export interface WorkplaceImageResponseDto {
  imageUrl: string;
  updatedAt: string;
}

// ============================================================================
// Review Types
// ============================================================================

export interface ReviewCreateRequest {
  title?: string;
  content?: string;
  ethicalPolicyRatings: Record<string, number>;
  anonymous?: boolean;
}

export interface ReviewUpdateRequest {
  title?: string;
  content?: string;
  ethicalPolicyRatings?: Record<string, number>;
  isAnonymous?: boolean;
}

export interface ReviewResponse {
  id: number;
  workplaceId: number;
  userId: number;
  username?: string;
  nameSurname?: string;
  title?: string;
  content?: string;
  anonymous: boolean;
  helpfulCount: number;
  helpfulByUser?: boolean;
  overallRating: number;
  ethicalPolicyRatings: Record<string, number>;
  reply?: ReplyResponse;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Reply Types
// ============================================================================

export interface ReplyCreateRequest {
  content: string;
}

export interface ReplyUpdateRequest {
  content: string;
}

export interface ReplyResponse {
  id: number;
  reviewId: number;
  employerUserId: number;
  workplaceName?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Employer Types
// ============================================================================

export interface EmployerListItem {
  userId: number;
  username: string;
  nameSurname?: string;
  email: string;
  role: string;
  joinedAt: string;
}

export interface EmployerWorkplaceBrief {
  role: string;
  workplace: WorkplaceBriefResponse;
}

export interface EmployerRequestCreate {
  note?: string;
}

export interface EmployerRequestResolve {
  action: 'APPROVE' | 'REJECT';
}

export interface EmployerRequestResponse {
  id: number;
  workplaceId: number;
  createdByUserId: number;
  status: string;
  workplaceCompanyName?: string;
  createdByUsername?: string;
  nameSurname?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Report Types
// ============================================================================

export interface ReviewReportCreate {
  reasonType: string;
  description?: string;
}

export interface WorkplaceReportCreate {
  reasonType: string;
  description?: string;
}

// ============================================================================
// Pagination & Utility Types
// ============================================================================

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiMessage {
  message: string;
  code?: string;
  timestamp: string;
}

// Type aliases for paginated responses
export type PaginatedWorkplaceResponse = PaginatedResponse<WorkplaceBriefResponse>;
export type PaginatedReviewResponse = PaginatedResponse<ReviewResponse>;
export type PaginatedEmployerRequestResponse = PaginatedResponse<EmployerRequestResponse>;

// ============================================================================
// Query Parameter Types
// ============================================================================

export interface WorkplaceListParams {
  page?: number;
  size?: number;
  sector?: string;
  location?: string;
  ethicalTag?: string;
  minRating?: number;
  sortBy?: string;
  search?: string;
}

export interface ReviewListParams {
  page?: number;
  size?: number;
  rating?: string;
  ratingFilter?: string;
  sortBy?: string;
  hasComment?: boolean;
  policy?: string;
  policyMin?: number;
}

export interface EmployerRequestListParams {
  page?: number;
  size?: number;
}
