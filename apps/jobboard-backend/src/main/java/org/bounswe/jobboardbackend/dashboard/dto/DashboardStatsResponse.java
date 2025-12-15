package org.bounswe.jobboardbackend.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response containing public community statistics")
public class DashboardStatsResponse {

    // user related stats
    @Schema(description = "Total number of registered users", example = "1500")
    private long totalUsers;

    @Schema(description = "Total number of employers", example = "100")
    private long totalEmployers;

    @Schema(description = "Total number of job seekers", example = "1400")
    private long totalJobSeekers;

    @Schema(description = "Total number of forum posts", example = "200")
    private long totalForumPosts;

    @Schema(description = "Total number of forum comments", example = "500")
    private long totalForumComments;

    @Schema(description = "Number of new forum posts in the last 7 days", example = "25")
    private long newForumPostsThisWeek;

    // job post related stats
    @Schema(description = "Total number of job posts", example = "500")
    private long totalJobPosts;

    @Schema(description = "Number of remote jobs", example = "200")
    private long remoteJobsCount;

    @Schema(description = "Number of inclusive opportunity jobs", example = "50")
    private long inclusiveJobsCount;

    @Schema(description = "Number of new jobs posted in the last 7 days", example = "25")
    private long newJobsThisWeekCount;

    // job application related stats
    @Schema(description = "Total number of job applications", example = "3000")
    private long totalApplications;

    @Schema(description = "Number of pending job applications", example = "500")
    private long totalPendingApplications;

    @Schema(description = "Number of accepted job applications", example = "200")
    private long totalAcceptedApplications;

    @Schema(description = "Number of rejected job applications", example = "2300")
    private long totalRejectedApplications;

    // mentorship related stats
    @Schema(description = "Total number of mentors", example = "50")
    private long totalMentors;

    @Schema(description = "Total number of mentorship requests", example = "150")
    private long totalMentorshipRequests;

    @Schema(description = "Number of accepted mentorship requests", example = "40")
    private long acceptedMentorships; // ACCEPTED status

    @Schema(description = "Number of pending mentorship requests", example = "10")
    private long pendingMentorshipRequests; // PENDING status

    @Schema(description = "Number of completed mentorships", example = "30")
    private long completedMentorships; // COMPLETED status

    @Schema(description = "Number of declined mentorship requests", example = "20")
    private long declinedMentorshipRequests; // DECLINED status

    @Schema(description = "Number of closed mentorship requests", example = "50")
    private long closedMentorshipRequests; // CLOSED status

    @Schema(description = "Total number of mentor reviews", example = "25")
    private long totalMentorReviews;

    @Schema(description = "Total number of resume reviews", example = "15")
    private long totalResumeReviews;
}