package org.bounswe.jobboardbackend.dashboard.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.model.Role; // Role Enum importu
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.dashboard.dto.DashboardStatsResponse;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplicationStatus;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.bounswe.jobboardbackend.mentorship.model.RequestStatus;
import org.bounswe.jobboardbackend.mentorship.repository.MentorProfileRepository;
import org.bounswe.jobboardbackend.mentorship.repository.MentorReviewRepository;
import org.bounswe.jobboardbackend.mentorship.repository.MentorshipRequestRepository;
import org.bounswe.jobboardbackend.mentorship.repository.ResumeReviewRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CommunityDashboardService {

    private final UserRepository userRepository;
    private final JobPostRepository jobPostRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final MentorReviewRepository mentorReviewRepository;
    private final ResumeReviewRepository resumeReviewRepository;
    private final ForumPostRepository forumPostRepository;
    private final ForumCommentRepository forumCommentRepository;

    private DashboardStatsResponse cachedStats = new DashboardStatsResponse();

    @PostConstruct
    public void init() {
        refreshStats();
    }

    @Scheduled(fixedRate = 86400000)
    public void refreshStats() {
        // 1. User Stats
        long totalUsers = userRepository.count();
        long totalEmployers = userRepository.countByRole(Role.ROLE_EMPLOYER);
        long totalJobSeekers = userRepository.countByRole(Role.ROLE_JOBSEEKER);

        // 2. Job Post Stats
        long totalJobPosts = jobPostRepository.count();
        long remoteJobs = jobPostRepository.countByRemoteTrue();
        long inclusiveJobs = jobPostRepository.countByInclusiveOpportunityTrue();
        long newJobs = jobPostRepository.countByPostedDateAfter(LocalDateTime.now().minusDays(7));

        // 3. Job Application Stats
        long totalApps = jobApplicationRepository.count();
        long pendingApps = jobApplicationRepository.countByStatus(JobApplicationStatus.PENDING);
        long acceptedApps = jobApplicationRepository.countByStatus(JobApplicationStatus.APPROVED);
        long rejectedApps = jobApplicationRepository.countByStatus(JobApplicationStatus.REJECTED);

        // 4. Mentorship Stats
        long totalMentors = mentorProfileRepository.count();
        long totalMentorshipRequests = mentorshipRequestRepository.count();
        long acceptedMentorships = mentorshipRequestRepository.countByStatus(RequestStatus.ACCEPTED);
        long pendingRequests = mentorshipRequestRepository.countByStatus(RequestStatus.PENDING);
        long completedMentorships = mentorshipRequestRepository.countByStatus(RequestStatus.COMPLETED);
        long declinedRequests = mentorshipRequestRepository.countByStatus(RequestStatus.DECLINED);
        long closedRequests = mentorshipRequestRepository.countByStatus(RequestStatus.CLOSED);
        long totalMentorReviews = mentorReviewRepository.count();
        long totalResumeReviews = resumeReviewRepository.count();

        // 5. Forum Stats
        long forumPosts = forumPostRepository.count();
        long forumComments = forumCommentRepository.count();
        long newForumPostsThisWeek = forumPostRepository.countByCreatedAtAfter(
                java.time.Instant.now().minus(java.time.Duration.ofDays(7)));


        // update the cached stats
        this.cachedStats = DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalEmployers(totalEmployers)
                .totalJobSeekers(totalJobSeekers)
                .totalJobPosts(totalJobPosts)
                .totalForumPosts(forumPosts)
                .totalForumComments(forumComments)
                .newForumPostsThisWeek(newForumPostsThisWeek)
                .remoteJobsCount(remoteJobs)
                .inclusiveJobsCount(inclusiveJobs)
                .newJobsThisWeekCount(newJobs)
                .totalApplications(totalApps)
                .totalPendingApplications(pendingApps)
                .totalAcceptedApplications(acceptedApps)
                .totalRejectedApplications(rejectedApps)
                .totalMentors(totalMentors)
                .totalMentorshipRequests(totalMentorshipRequests)
                .acceptedMentorships(acceptedMentorships)
                .pendingMentorshipRequests(pendingRequests)
                .completedMentorships(completedMentorships)
                .declinedMentorshipRequests(declinedRequests)
                .closedMentorshipRequests(closedRequests)
                .totalMentorReviews(totalMentorReviews)
                .totalResumeReviews(totalResumeReviews)
                .build();
    }

    public DashboardStatsResponse getStats() {
        return this.cachedStats;
    }
}