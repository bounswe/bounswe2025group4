package org.bounswe.jobboardbackend.notification.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.exception.ApiError;
import org.bounswe.jobboardbackend.notification.dto.NotificationRequest;
import org.bounswe.jobboardbackend.notification.dto.NotificationResponse;
import org.bounswe.jobboardbackend.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification Management API")
public class NotificationController {

        private final NotificationService notificationService;

        @Operation(summary = "Broadcast Notification", description = "Sends a notification to all users.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Broadcast sent successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"Invalid notification data\", \"path\": \"/api/notifications/broadcast\" }"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/notifications/broadcast\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Admin only)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"Access denied\", \"path\": \"/api/notifications/broadcast\" }")))
        })
        @PostMapping("/broadcast")
        public ResponseEntity<Void> notifyAll(
                        @RequestBody NotificationRequest request) {
                notificationService.notifyAll(request.title(), request.notificationType(), request.message(),
                                request.linkId());
                return ResponseEntity.ok().build();
        }

        @Operation(summary = "Send Notification to User", description = "Sends a notification to a specific user.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Notification sent successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"Invalid notification data\", \"path\": \"/api/notifications/user/username\" }"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/notifications/user/username\" }"))),
                        @ApiResponse(responseCode = "404", description = "User not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"USER_NOT_FOUND\", \"message\": \"User not found\", \"path\": \"/api/notifications/user/username\" }")))
        })
        @PostMapping("/user/{username}")
        public ResponseEntity<Void> notifyUser(
                        @Parameter(description = "Username of the recipient") @PathVariable String username,
                        @RequestBody NotificationRequest request) {
                notificationService.notifyUser(username, request.title(), request.notificationType(), request.message(),
                                request.linkId());
                return ResponseEntity.ok().build();
        }

        @Operation(summary = "Get My Notifications", description = "Retrieves unread notifications for the authenticated user.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Notifications retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/notifications/me\" }")))
        })
        @GetMapping("/me")
        public ResponseEntity<List<NotificationResponse>> getMyNotifications(Principal principal) {
                List<NotificationResponse> unread = notificationService.getNotificationsForUser(principal.getName());
                return ResponseEntity.ok(unread);
        }

        @Operation(summary = "Mark Notification as Read", description = "Marks a specific notification as read.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Notification marked as read"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/notifications/1/read\" }"))),
                        @ApiResponse(responseCode = "404", description = "Notification not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Notification not found\", \"path\": \"/api/notifications/1/read\" }")))
        })
        @PostMapping("/{id}/read")
        public ResponseEntity<Void> markAsRead(
                        @Parameter(description = "ID of the notification") @PathVariable Long id,
                        Principal principal) {
                notificationService.markAsRead(id, principal.getName());
                return ResponseEntity.ok().build();
        }
}
