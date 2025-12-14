package org.bounswe.jobboardbackend.badge.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Event published when an employer creates a new job post.
 * Used to trigger badge checks for job posting badges.
 */
@Getter
@AllArgsConstructor
public class JobPostCreatedEvent {
    private final Long employerId;
    private final Long jobPostId;
}

