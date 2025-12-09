package org.bounswe.jobboardbackend.notification.dto;

import org.bounswe.jobboardbackend.notification.model.NotificationType;

/**
 * Request body when creating/sending a notification via REST.
 */
public record NotificationRequest(
        String title,
        NotificationType notificationType,
        String message,
        Long linkId
) { }

