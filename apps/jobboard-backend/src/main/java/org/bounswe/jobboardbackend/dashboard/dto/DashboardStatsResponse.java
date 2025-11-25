package org.bounswe.jobboardbackend.dashboard.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    // user related stats
    private long totalUsers;
    private long totalEmployers;
    private long totalJobSeekers;

    private long totalForumPosts;      // mock for now

    // job post  related stats
    private long totalJobPosts;
    private long remoteJobsCount;
    private long inclusiveJobsCount;
    private long newJobsThisWeekCount;

    // job application related stats
    private long totalApplications;
    private long totalPendingApplications;
    private long totalAcceptedApplications;
    private long totalRejectedApplications;

    // mentorship related stats
    private long totalMentors;
    private long totalMentorshipRequests;
    private long acceptedMentorships;              // ACCEPTED status
    private long pendingMentorshipRequests;        // PENDING status
    private long completedMentorships;             // COMPLETED status
    private long declinedMentorshipRequests;       // DECLINED status
    private long closedMentorshipRequests;         // CLOSED status
    private long totalMentorReviews;
    private long totalResumeReviews;
}