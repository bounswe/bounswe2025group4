import { api } from '@shared/lib/api-client';
import type { AxiosRequestConfig } from 'axios';

/**
 * Dashboard statistics response from backend
 */
export interface DashboardStatsResponse {
  // User statistics
  totalUsers: number;
  totalEmployers: number;
  totalJobSeekers: number;

  // Forum statistics
  totalForumPosts: number;
  totalForumComments: number;
  newForumPostsThisWeek: number;

  // Job post statistics
  totalJobPosts: number;
  remoteJobsCount: number;
  inclusiveJobsCount: number;
  newJobsThisWeekCount: number;

  // Application statistics
  totalApplications: number;
  totalPendingApplications: number;
  totalAcceptedApplications: number;
  totalRejectedApplications: number;

  // Mentorship statistics
  totalMentors: number;
  totalMentorshipRequests: number;
  acceptedMentorships: number;
  pendingMentorshipRequests: number;
  completedMentorships: number;
  declinedMentorshipRequests: number;
  closedMentorshipRequests: number;
  totalMentorReviews: number;

  // Resume review statistics
  totalResumeReviews: number;
}

/**
 * Dashboard Service
 * Handles public API calls for community statistics
 */

/**
 * Get community dashboard statistics
 * GET /api/public/dashboard
 */
export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const response = await api.get<DashboardStatsResponse>('/public/dashboard', {
    skipAuthRedirect: true,
  } as unknown as AxiosRequestConfig);
  return response.data;
}
