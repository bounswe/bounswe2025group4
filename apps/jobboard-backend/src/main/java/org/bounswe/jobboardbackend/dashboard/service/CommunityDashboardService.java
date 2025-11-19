package org.bounswe.jobboardbackend.dashboard.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.model.Role; // Role Enum importu
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.dashboard.dto.DashboardStatsResponse;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplicationStatus;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CommunityDashboardService {

    private final UserRepository userRepository;
    private final JobPostRepository jobPostRepository;
    private final JobApplicationRepository jobApplicationRepository;

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

        // mock for now
        long forumPosts = 0;
        long mentorships = 0;


        // update the cached stats
        this.cachedStats = DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalEmployers(totalEmployers)
                .totalJobSeekers(totalJobSeekers)
                .totalJobPosts(totalJobPosts)
                .totalForumPosts(forumPosts)
                .currentMentorships(mentorships)
                .remoteJobsCount(remoteJobs)
                .inclusiveJobsCount(inclusiveJobs)
                .newJobsThisWeekCount(newJobs)
                .totalApplications(totalApps)
                .totalPendingApplications(pendingApps)
                .totalAcceptedApplications(acceptedApps)
                .totalRejectedApplications(rejectedApps)
                .build();
    }

    public DashboardStatsResponse getStats() {
        return this.cachedStats;
    }
}