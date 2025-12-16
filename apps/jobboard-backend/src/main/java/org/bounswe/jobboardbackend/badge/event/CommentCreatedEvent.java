package org.bounswe.jobboardbackend.badge.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Event published when a user creates a new comment on a forum post.
 * Used to trigger badge checks for comment-related badges.
 */
@Getter
@AllArgsConstructor
public class CommentCreatedEvent {
    private final Long userId;
    private final Long commentId;
    private final Long postId;
}

