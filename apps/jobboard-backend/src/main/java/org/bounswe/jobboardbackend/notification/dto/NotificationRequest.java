package org.bounswe.jobboardbackend.notification.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import org.bounswe.jobboardbackend.notification.model.NotificationType;

/**
 * Request body when creating/sending a notification via REST.
 */
@Schema(description = "Request object for sending notifications")
public record NotificationRequest(
                @Schema(description = "Title of the notification", example = "New Message") String title,

                @Schema(description = "Type of the notification", example = "MESSAGE") NotificationType notificationType,

                @Schema(description = "Body of the notification", example = "You have a new message from Jane.") String message,

                @Schema(description = "ID of the related entity (e.g., job post ID, conversation ID)", example = "101") Long linkId) {
}
