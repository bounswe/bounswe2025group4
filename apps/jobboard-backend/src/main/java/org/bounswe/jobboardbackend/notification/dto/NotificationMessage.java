package org.bounswe.jobboardbackend.notification.dto;

import org.bounswe.jobboardbackend.notification.model.NotificationType;

/**
 * Payload sent over WebSocket to clients.
 */
public record NotificationMessage(
        String title,
        NotificationType notificationType,
        String message,
        long timestamp
) { }