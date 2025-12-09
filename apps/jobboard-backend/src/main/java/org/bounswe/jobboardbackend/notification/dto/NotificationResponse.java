package org.bounswe.jobboardbackend.notification.dto;

import org.bounswe.jobboardbackend.notification.model.Notification;
import org.bounswe.jobboardbackend.notification.model.NotificationType;

/**
 * DTO returned to clients when listing notifications.
 */
public record NotificationResponse(
        Long id,
        String title,
        NotificationType notificationType,
        String message,
        Long timestamp,
        boolean read,
        String username,
        Long linkId
) {

    public static NotificationResponse fromEntity(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getNotificationType(),
                n.getMessage(),
                n.getTimestamp(),
                n.isReadFlag(),
                n.getUsername(),
                n.getLinkId()
        );
    }
}

