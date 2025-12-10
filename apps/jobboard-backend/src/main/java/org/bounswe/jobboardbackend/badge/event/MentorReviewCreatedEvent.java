package org.bounswe.jobboardbackend.badge.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Event published when a mentee leaves a review for a mentor.
 * Used to trigger badge checks for feedback giver badges.
 */
@Getter
@AllArgsConstructor
public class MentorReviewCreatedEvent {
    private final Long reviewerUserId;
    private final Long reviewId;
}

