package org.bounswe.jobboardbackend.badge.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bounswe.jobboardbackend.badge.event.CommentCreatedEvent;
import org.bounswe.jobboardbackend.badge.event.CommentUpvotedEvent;
import org.bounswe.jobboardbackend.badge.event.ForumPostCreatedEvent;
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
}

