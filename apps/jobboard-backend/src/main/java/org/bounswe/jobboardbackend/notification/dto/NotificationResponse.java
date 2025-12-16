package org.bounswe.jobboardbackend.notification.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import org.bounswe.jobboardbackend.notification.model.Notification;
import org.bounswe.jobboardbackend.notification.model.NotificationType;

/**
 * DTO returned to clients when listing notifications.
 */
@Schema(description = "Response object containing notification details")
public record NotificationResponse(
        @Schema(description = "Unique ID of the notification", example = "500") Long id,

        @Schema(description = "Title of the notification", example = "Job Application Update") String title,

        @Schema(description = "Type of the notification", example = "APPLICATION_STATUS") NotificationType notificationType,

        @Schema(description = "Content of the notification", example = "Your application has been viewed.") String message,

        @Schema(description = "Timestamp of creation (epoch millis)", example = "1678886400000") Long timestamp,

        @Schema(description = "Whether the notification has been read", example = "false") boolean read,

        @Schema(description = "Username of the recipient", example = "johndoe") String username,

        @Schema(description = "ID of the related entity", example = "202") Long linkId) {

    public static NotificationResponse fromEntity(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getNotificationType(),
                n.getMessage(),
                n.getCreatedAt(),
                n.isReadFlag(),
                n.getUsername(),
                n.getLinkId());
    }
}
