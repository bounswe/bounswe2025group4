package org.bounswe.jobboardbackend.badge.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bounswe.jobboardbackend.badge.model.Badge;
import org.bounswe.jobboardbackend.badge.model.BadgeType;
import org.bounswe.jobboardbackend.badge.repository.BadgeRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentUpvoteRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service responsible for awarding badges to users based on their activities.
 * Badges are independent ofProfile - linked directly to User.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final ForumPostRepository forumPostRepository;
    private final ForumCommentRepository forumCommentRepository;
    private final ForumCommentUpvoteRepository forumCommentUpvoteRepository;

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
                .icon(badgeType.getIcon())
                .criteria(badgeType.getCriteria())
                .build();
        
        badgeRepository.save(badge);
        log.info("Awarded badge {} to user {}", badgeType, userId);
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
        if (postCount >= BadgeType.THOUGHT_LEADER.getThreshold()) {
            awardBadge(userId, BadgeType.THOUGHT_LEADER);
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
        if (commentCount >= BadgeType.ACTIVE_VOICE.getThreshold()) {
            awardBadge(userId, BadgeType.ACTIVE_VOICE);
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
}

