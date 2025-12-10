package org.bounswe.jobboardbackend.badge.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Event published when a jobseeker submits a new job application.
 * Used to trigger badge checks for job application badges.
 */
@Getter
@AllArgsConstructor
public class JobApplicationCreatedEvent {
    private final Long jobSeekerId;
    private final Long applicationId;
}

