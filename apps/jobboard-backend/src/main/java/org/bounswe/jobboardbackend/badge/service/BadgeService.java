package org.bounswe.jobboardbackend.badge.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.badge.model.Badge;
import org.bounswe.jobboardbackend.badge.model.BadgeType;
import org.bounswe.jobboardbackend.badge.repository.BadgeRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentUpvoteRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostRepository;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplicationStatus;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.bounswe.jobboardbackend.mentorship.model.RequestStatus;
import org.bounswe.jobboardbackend.mentorship.repository.MentorProfileRepository;
import org.bounswe.jobboardbackend.mentorship.repository.MentorReviewRepository;
import org.bounswe.jobboardbackend.mentorship.repository.MentorshipRequestRepository;
import org.bounswe.jobboardbackend.notification.model.NotificationType;
import org.bounswe.jobboardbackend.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service responsible for awarding badges to users based on their activities.
 * Badges are independent of Profile - linked directly to User.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final ForumPostRepository forumPostRepository;
    private final ForumCommentRepository forumCommentRepository;
    private final ForumCommentUpvoteRepository forumCommentUpvoteRepository;
    private final JobPostRepository jobPostRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final MentorReviewRepository mentorReviewRepository;
    private final NotificationService notificationService;

    /**
     * Award a badge to a user if they don't already have it.
     * Uses REQUIRES_NEW to ensure badge is saved in its own transaction,
     * especially important when called from @TransactionalEventListener.
     *
     * @param userId    The user's ID
     * @param badgeType The type of badge to award
     * @return true if badge was awarded, false if user already has it
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean awardBadge(Long userId, BadgeType badgeType) {
        // Check if user already has this badge
        if (badgeRepository.existsByUserIdAndBadgeType(userId, badgeType)) {
            log.debug("User {} already has badge {}", userId, badgeType);
            return false;
        }
        
        // Create and save the badge
        Badge badge = Badge.builder()
                .userId(userId)
                .badgeType(badgeType)
                .name(badgeType.getDisplayName())
                .description(badgeType.getDescription())
                .criteria(badgeType.getCriteria())
                .build();
        
        badgeRepository.save(badge);

        User user = User.builder().id(userId).build();
        String message = String.format(
                "Congratulations! You earned the '%s' badge!",
                badgeType.getDisplayName()
        );

        notificationService.notifyUser(
                user.getUsername(),
                "Awarded Badge",
                NotificationType.AWARDED_BADGE,
                message,
                badge.getId()
        );

        
        return true;
    }

    /**
     * Check if user qualifies for any forum post badges and award them.
     * Called after a user creates a new forum post.
     *
     * @param userId The user's ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void checkForumPostBadges(Long userId) {
        long postCount = forumPostRepository.countByAuthorId(userId);
        
        if (postCount >= BadgeType.FIRST_VOICE.getThreshold()) {
            awardBadge(userId, BadgeType.FIRST_VOICE);
        }
        if (postCount >= BadgeType.COMMUNITY_PILLAR.getThreshold()) {
            awardBadge(userId, BadgeType.COMMUNITY_PILLAR);
        }
    }

    /**
     * Check if user qualifies for any forum comment badges and award them.
     * Called after a user creates a new comment.
     *
     * @param userId The user's ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void checkForumCommentBadges(Long userId) {
        long commentCount = forumCommentRepository.countByAuthorId(userId);
        
        if (commentCount >= BadgeType.CONVERSATION_STARTER.getThreshold()) {
            awardBadge(userId, BadgeType.CONVERSATION_STARTER);
        }
        if (commentCount >= BadgeType.DISCUSSION_DRIVER.getThreshold()) {
            awardBadge(userId, BadgeType.DISCUSSION_DRIVER);
        }
    }

    /**
     * Check if user qualifies for any upvote badges and award them.
     * Called after one of the user's comments receives an upvote.
     *
     * @param userId The comment author's user ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void checkUpvoteBadges(Long userId) {
        long upvoteCount = forumCommentUpvoteRepository.countUpvotesReceivedByUser(userId);
        
        if (upvoteCount >= BadgeType.HELPFUL.getThreshold()) {
            awardBadge(userId, BadgeType.HELPFUL);
        }
        if (upvoteCount >= BadgeType.VALUABLE_CONTRIBUTOR.getThreshold()) {
            awardBadge(userId, BadgeType.VALUABLE_CONTRIBUTOR);
        }
    }

    // ==================== JOB POST BADGES (Employer) ====================

    /**
     * Check if employer qualifies for any job posting badges and award them.
     * Called after an employer creates a new job post.
     *
     * @param employerId The employer's user ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void checkJobPostBadges(Long employerId) {
        long jobPostCount = jobPostRepository.countByEmployerId(employerId);
        
        if (jobPostCount >= BadgeType.FIRST_LISTING.getThreshold()) {
            awardBadge(employerId, BadgeType.FIRST_LISTING);
        }
        if (jobPostCount >= BadgeType.HIRING_MACHINE.getThreshold()) {
            awardBadge(employerId, BadgeType.HIRING_MACHINE);
        }
    }

    // ==================== JOB APPLICATION BADGES (Job Seeker) ====================

    /**
     * Check if jobseeker qualifies for any job application badges and award them.
     * Called after a jobseeker submits a new application.
     *
     * @param jobSeekerId The jobseeker's user ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void checkJobApplicationBadges(Long jobSeekerId) {
        long applicationCount = jobApplicationRepository.countByJobSeekerId(jobSeekerId);
        
        if (applicationCount >= BadgeType.FIRST_STEP.getThreshold()) {
            awardBadge(jobSeekerId, BadgeType.FIRST_STEP);
        }
        if (applicationCount >= BadgeType.PERSISTENT.getThreshold()) {
            awardBadge(jobSeekerId, BadgeType.PERSISTENT);
        }
    }

    /**
     * Check if jobseeker qualifies for any job acceptance badges and award them.
     * Called after a job application is approved by an employer.
     *
     * @param jobSeekerId The jobseeker's user ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void checkJobAcceptanceBadges(Long jobSeekerId) {
        long acceptedCount = jobApplicationRepository.countByJobSeekerIdAndStatus(
            jobSeekerId, JobApplicationStatus.APPROVED);
        
        if (acceptedCount >= BadgeType.HIRED.getThreshold()) {
            awardBadge(jobSeekerId, BadgeType.HIRED);
        }
        if (acceptedCount >= BadgeType.CAREER_STAR.getThreshold()) {
            awardBadge(jobSeekerId, BadgeType.CAREER_STAR);
        }
    }

    // ==================== MENTOR BADGES ====================

    /**
     * Award GUIDE badge when a user creates a mentor profile.
     * Called after a user creates their mentor profile.
     *
     * @param mentorUserId The mentor's user ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void checkMentorProfileBadge(Long mentorUserId) {
        // If mentor profile exists, award GUIDE badge
        if (mentorProfileRepository.existsById(mentorUserId)) {
            awardBadge(mentorUserId, BadgeType.GUIDE);
        }
    }

    /**
     * Check if mentor qualifies for any mentee acceptance badges and award them.
     * Called after a mentor accepts a mentorship request.
     *
     * @param mentorUserId The mentor's user ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void checkMentorAcceptanceBadges(Long mentorUserId) {
        long acceptedCount = mentorshipRequestRepository.countByMentorIdAndStatus(
            mentorUserId, RequestStatus.ACCEPTED);
        
        if (acceptedCount >= BadgeType.FIRST_MENTEE.getThreshold()) {
            awardBadge(mentorUserId, BadgeType.FIRST_MENTEE);
        }
        if (acceptedCount >= BadgeType.DEDICATED_MENTOR.getThreshold()) {
            awardBadge(mentorUserId, BadgeType.DEDICATED_MENTOR);
        }
    }

    // ==================== MENTEE BADGES ====================

    /**
     * Check if mentee qualifies for mentorship request badges and award them.
     * Called after a mentee sends a mentorship request.
     *
     * @param menteeUserId The mentee's user ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void checkMenteeRequestBadges(Long menteeUserId) {
        long requestCount = mentorshipRequestRepository.countByRequesterId(menteeUserId);
        
        if (requestCount >= BadgeType.SEEKING_GUIDANCE.getThreshold()) {
            awardBadge(menteeUserId, BadgeType.SEEKING_GUIDANCE);
        }
    }

    /**
     * Check if mentee qualifies for mentorship acceptance badges and award them.
     * Called after a mentee's request is accepted by a mentor.
     *
     * @param menteeUserId The mentee's user ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void checkMenteeAcceptanceBadges(Long menteeUserId) {
        long acceptedCount = mentorshipRequestRepository.countByRequesterIdAndStatus(
            menteeUserId, RequestStatus.ACCEPTED);
        
        if (acceptedCount >= BadgeType.MENTORED.getThreshold()) {
            awardBadge(menteeUserId, BadgeType.MENTORED);
        }
    }

    /**
     * Check if mentee qualifies for feedback giver badges and award them.
     * Called after a mentee leaves a review for a mentor.
     *
     * @param reviewerUserId The reviewer's (mentee's) user ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void checkFeedbackGiverBadges(Long reviewerUserId) {
        long reviewCount = mentorReviewRepository.countByReviewerId(reviewerUserId);
        
        if (reviewCount >= BadgeType.FEEDBACK_GIVER.getThreshold()) {
            awardBadge(reviewerUserId, BadgeType.FEEDBACK_GIVER);
        }
    }
}

