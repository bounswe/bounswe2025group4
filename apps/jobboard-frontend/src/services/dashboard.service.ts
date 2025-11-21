import { api } from '@/lib/api-client';
import type { AxiosRequestConfig } from 'axios';

/**
 * Dashboard statistics response from backend
 */
export interface DashboardStatsResponse {
  // User statistics
  totalUsers: number;
  totalEmployers: number;
  totalJobSeekers: number;

  // Job post statistics
  totalJobPosts: number;
  remoteJobs: number;
  inclusiveOpportunities: number;
  newJobsThisWeek: number;

  // Application statistics
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;

  // Mentorship statistics
  totalMentors: number;
  acceptedMentorships: number;
  pendingMentorships: number;
  completedMentorships: number;
  declinedMentorships: number;
  closedMentorships: number;
  totalReviews: number;
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
