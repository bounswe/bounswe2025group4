package org.bounswe.jobboardbackend.badge.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Event published when a user creates a new forum post.
 * Used to trigger badge checks for post-related badges.
 */
@Getter
@AllArgsConstructor
public class ForumPostCreatedEvent {
    private final Long userId;
    private final Long postId;
}

