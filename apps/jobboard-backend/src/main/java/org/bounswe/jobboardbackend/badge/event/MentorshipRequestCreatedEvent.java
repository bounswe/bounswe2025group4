package org.bounswe.jobboardbackend.badge.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Event published when a mentee sends a mentorship request.
 * Used to trigger badge checks for mentee badges.
 */
@Getter
@AllArgsConstructor
public class MentorshipRequestCreatedEvent {
    private final Long menteeUserId;
    private final Long requestId;
}

