package org.bounswe.jobboardbackend.notification.service;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.notification.dto.NotificationMessage;
import org.bounswe.jobboardbackend.notification.dto.NotificationResponse;
import org.bounswe.jobboardbackend.notification.model.Notification;
import org.bounswe.jobboardbackend.notification.model.NotificationType;
import org.bounswe.jobboardbackend.notification.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository repository;

    public void notifyAll(String title, NotificationType notificationType, String message, Long linkId) {
        long now = System.currentTimeMillis();

        Notification notification =
                new Notification(null, null, title, notificationType, message, now, now, false, linkId);
        repository.save(notification);

        NotificationMessage payload =
                new NotificationMessage(title, notificationType, message, now);

        messagingTemplate.convertAndSend("/topic/notifications", payload);
    }

    public void notifyUser(String username, String title, NotificationType notificationType, String message, Long linkId) {
        long now = System.currentTimeMillis();

        Notification notification =
                new Notification(null, username, title, notificationType, message, now, now, false, linkId);
        repository.save(notification);

        NotificationMessage payload =
                new NotificationMessage(title, notificationType, message, now);

        messagingTemplate.convertAndSendToUser(
                username,
                "/queue/notifications",
                payload
        );
    }

    public List<NotificationResponse> getNotificationsForUser(String username) {
        long oneDayAgo = System.currentTimeMillis() - 24 * 60 * 60 * 1000;
        return repository.findActiveNotificationsByUsername(username, oneDayAgo)
                .stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    public void markAsRead(Long id, String username) {
        long now = System.currentTimeMillis();
        Notification n = repository.findById(id)
                .orElseThrow(() -> new HandleException(ErrorCode.NOTIFICATION_NOT_FOUND, "Notification not found"));

        // simple ownership check; adjust to your security model
        if (n.getUsername() != null && !n.getUsername().equals(username)) {
            throw new HandleException(ErrorCode.ACCESS_DENIED, "Not allowed to modify this notification");
        }

        n.setReadFlag(true);
        n.setUpdatedAt(now);
        repository.save(n);
    }

        @org.springframework.transaction.annotation.Transactional
        public void deleteUserData(String username) {
                repository.deleteByUsername(username);
        }
}
