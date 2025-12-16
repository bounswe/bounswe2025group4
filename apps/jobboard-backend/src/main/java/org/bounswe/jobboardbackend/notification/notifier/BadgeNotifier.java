package org.bounswe.jobboardbackend.notification.notifier;

import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.badge.model.Badge;
import org.bounswe.jobboardbackend.notification.model.NotificationType;
import org.bounswe.jobboardbackend.notification.service.NotificationService;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class BadgeNotifier {

    private final NotificationService notificationService;

    private static final String BADGE_EARNED_MSG = "Congratulations! You earned the '%s' badge!";

    public void notifyBadgeEarned(User user, Badge badge) {
        String message = String.format(
                BADGE_EARNED_MSG,
                badge.getName()
        );

        notificationService.notifyUser(
                user.getUsername(),
                "Awarded Badge",
                NotificationType.AWARDED_BADGE,
                message,
                badge.getId()
        );
    }
}