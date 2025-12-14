package org.bounswe.jobboardbackend.badge.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Event published when a mentor accepts a mentorship request.
 * Used to trigger badge checks for both mentor and mentee.
 */
@Getter
@AllArgsConstructor
public class MentorshipRequestAcceptedEvent {
    private final Long mentorUserId;
    private final Long menteeUserId;
    private final Long requestId;
}

