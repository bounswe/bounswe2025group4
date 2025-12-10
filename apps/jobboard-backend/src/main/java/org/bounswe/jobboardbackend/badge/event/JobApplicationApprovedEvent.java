package org.bounswe.jobboardbackend.badge.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Event published when a job application is approved by an employer.
 * Used to trigger badge checks for job acceptance badges.
 */
@Getter
@AllArgsConstructor
public class JobApplicationApprovedEvent {
    private final Long jobSeekerId;
    private final Long applicationId;
}

