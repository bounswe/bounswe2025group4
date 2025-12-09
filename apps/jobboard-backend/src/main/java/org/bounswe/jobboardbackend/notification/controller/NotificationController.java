package org.bounswe.jobboardbackend.notification.controller;

import lombok.RequiredArgsConstructor;
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
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/broadcast")
    public ResponseEntity<Void> notifyAll(
            @RequestBody NotificationRequest request
    ) {
        notificationService.notifyAll(request.title(), request.notificationType(), request.message(), request.linkId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/user/{username}")
    public ResponseEntity<Void> notifyUser(
            @PathVariable String username,
            @RequestBody NotificationRequest request
    ) {
        notificationService.notifyUser(username, request.title(), request.notificationType(), request.message(), request.linkId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(Principal principal) {
        List<NotificationResponse> unread =
                notificationService.getNotificationsForUser(principal.getName());
        return ResponseEntity.ok(unread);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Principal principal) {
        notificationService.markAsRead(id, principal.getName());
        return ResponseEntity.ok().build();
    }
}

