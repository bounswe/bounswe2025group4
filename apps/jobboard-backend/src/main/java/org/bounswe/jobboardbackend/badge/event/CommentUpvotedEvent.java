package org.bounswe.jobboardbackend.badge.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Event published when a comment receives an upvote.
 * Used to trigger badge checks for upvote-related badges.
 * Note: The userId here is the COMMENT AUTHOR (who receives the upvote), not the voter.
 */
@Getter
@AllArgsConstructor
public class CommentUpvotedEvent {
    private final Long commentAuthorId;
    private final Long commentId;
}

