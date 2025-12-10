package org.bounswe.jobboardbackend.badge.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bounswe.jobboardbackend.badge.event.CommentCreatedEvent;
import org.bounswe.jobboardbackend.badge.event.CommentUpvotedEvent;
import org.bounswe.jobboardbackend.badge.event.ForumPostCreatedEvent;
import org.bounswe.jobboardbackend.badge.event.JobPostCreatedEvent;
import org.bounswe.jobboardbackend.badge.event.JobApplicationCreatedEvent;
import org.bounswe.jobboardbackend.badge.event.JobApplicationApprovedEvent;
import org.bounswe.jobboardbackend.badge.event.MentorProfileCreatedEvent;
import org.bounswe.jobboardbackend.badge.event.MentorshipRequestCreatedEvent;
import org.bounswe.jobboardbackend.badge.event.MentorshipRequestAcceptedEvent;
import org.bounswe.jobboardbackend.badge.event.MentorReviewCreatedEvent;
import org.bounswe.jobboardbackend.badge.service.BadgeService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Listens to application events and triggers badge checks accordingly.
 * This keeps badge logic decoupled from the main business services.
 * 
 * Uses @TransactionalEventListener to ensure badges are only awarded
 * after the main transaction commits successfully.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BadgeEventListener {

    private final BadgeService badgeService;

    /**
     * Handle forum post creation - check for post-related badges.
     * Only executes after the transaction commits successfully.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onForumPostCreated(ForumPostCreatedEvent event) {
        try {
            log.debug("Forum post created by user {}, checking badges...", event.getUserId());
            badgeService.checkForumPostBadges(event.getUserId());
        } catch (Exception e) {
            log.error("Badge check failed for forum post by user {}: {}", event.getUserId(), e.getMessage());
        }
    }

    /**
     * Handle comment creation - check for comment-related badges.
     * Only executes after the transaction commits successfully.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCommentCreated(CommentCreatedEvent event) {
        try {
            log.debug("Comment created by user {}, checking badges...", event.getUserId());
            badgeService.checkForumCommentBadges(event.getUserId());
        } catch (Exception e) {
            log.error("Badge check failed for comment by user {}: {}", event.getUserId(), e.getMessage());
        }
    }

    /**
     * Handle comment upvote - check for upvote-related badges for the comment author.
     * Only executes after the transaction commits successfully.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCommentUpvoted(CommentUpvotedEvent event) {
        try {
            log.debug("Comment by user {} received upvote, checking badges...", event.getCommentAuthorId());
            badgeService.checkUpvoteBadges(event.getCommentAuthorId());
        } catch (Exception e) {
            log.error("Badge check failed for upvote on comment by user {}: {}", event.getCommentAuthorId(), e.getMessage());
        }
    }

    // ==================== JOB POST EVENTS ====================

    /**
     * Handle job post creation - check for job posting badges.
     * Only executes after the transaction commits successfully.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onJobPostCreated(JobPostCreatedEvent event) {
        try {
            log.debug("Job post created by employer {}, checking badges...", event.getEmployerId());
            badgeService.checkJobPostBadges(event.getEmployerId());
        } catch (Exception e) {
            log.error("Badge check failed for job post by employer {}: {}", event.getEmployerId(), e.getMessage());
        }
    }

    // ==================== JOB APPLICATION EVENTS ====================

    /**
     * Handle job application creation - check for job application badges.
     * Only executes after the transaction commits successfully.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onJobApplicationCreated(JobApplicationCreatedEvent event) {
        try {
            log.debug("Job application created by job seeker {}, checking badges...", event.getJobSeekerId());
            badgeService.checkJobApplicationBadges(event.getJobSeekerId());
        } catch (Exception e) {
            log.error("Badge check failed for job application by job seeker {}: {}", event.getJobSeekerId(), e.getMessage());
        }
    }

    /**
     * Handle job application approval - check for job acceptance badges.
     * Only executes after the transaction commits successfully.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onJobApplicationApproved(JobApplicationApprovedEvent event) {
        try {
            log.debug("Job application approved for job seeker {}, checking badges...", event.getJobSeekerId());
            badgeService.checkJobAcceptanceBadges(event.getJobSeekerId());
        } catch (Exception e) {
            log.error("Badge check failed for job application approval for job seeker {}: {}", event.getJobSeekerId(), e.getMessage());
        }
    }

    // ==================== MENTORSHIP EVENTS ====================

    /**
     * Handle mentor profile creation - award GUIDE badge.
     * Only executes after the transaction commits successfully.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMentorProfileCreated(MentorProfileCreatedEvent event) {
        try {
            log.debug("Mentor profile created by user {}, checking badges...", event.getMentorUserId());
            badgeService.checkMentorProfileBadge(event.getMentorUserId());
        } catch (Exception e) {
            log.error("Badge check failed for mentor profile creation by user {}: {}", event.getMentorUserId(), e.getMessage());
        }
    }

    /**
     * Handle mentorship request creation - check for mentee request badges.
     * Only executes after the transaction commits successfully.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMentorshipRequestCreated(MentorshipRequestCreatedEvent event) {
        try {
            log.debug("Mentorship request created by mentee {}, checking badges...", event.getMenteeUserId());
            badgeService.checkMenteeRequestBadges(event.getMenteeUserId());
        } catch (Exception e) {
            log.error("Badge check failed for mentorship request by mentee {}: {}", event.getMenteeUserId(), e.getMessage());
        }
    }

    /**
     * Handle mentorship request acceptance - check badges for both mentor and mentee.
     * Only executes after the transaction commits successfully.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMentorshipRequestAccepted(MentorshipRequestAcceptedEvent event) {
        try {
            log.debug("Mentorship request accepted by mentor {}, checking badges...", event.getMentorUserId());
            // Check mentor badges
            badgeService.checkMentorAcceptanceBadges(event.getMentorUserId());
            // Check mentee badges
            badgeService.checkMenteeAcceptanceBadges(event.getMenteeUserId());
        } catch (Exception e) {
            log.error("Badge check failed for mentorship acceptance: mentor {}, mentee {}: {}", 
                event.getMentorUserId(), event.getMenteeUserId(), e.getMessage());
        }
    }

    /**
     * Handle mentor review creation - check for feedback giver badges.
     * Only executes after the transaction commits successfully.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMentorReviewCreated(MentorReviewCreatedEvent event) {
        try {
            log.debug("Mentor review created by user {}, checking badges...", event.getReviewerUserId());
            badgeService.checkFeedbackGiverBadges(event.getReviewerUserId());
        } catch (Exception e) {
            log.error("Badge check failed for mentor review by user {}: {}", event.getReviewerUserId(), e.getMessage());
        }
    }
}

