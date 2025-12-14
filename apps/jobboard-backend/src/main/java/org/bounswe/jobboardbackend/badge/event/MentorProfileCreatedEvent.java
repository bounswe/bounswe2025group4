package org.bounswe.jobboardbackend.badge.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Event published when a user creates a mentor profile.
 * Used to trigger badge checks for mentor badges.
 */
@Getter
@AllArgsConstructor
public class MentorProfileCreatedEvent {
    private final Long mentorUserId;
}

