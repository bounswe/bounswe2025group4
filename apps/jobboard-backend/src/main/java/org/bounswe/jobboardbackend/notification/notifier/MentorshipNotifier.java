package org.bounswe.jobboardbackend.notification.notifier;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.mentorship.model.MentorshipRequest;
import org.bounswe.jobboardbackend.notification.model.NotificationType;
import org.bounswe.jobboardbackend.notification.service.NotificationService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MentorshipNotifier {

    private final NotificationService notificationService;

    // Use a formatter or constants to keep strings out of logic
    private static final String REQUEST_MSG = "You received a new mentorship request from %s. (Request ID: %d). Motivation: \"%s\"";
    private static final String APPROVED_MSG = "Your mentorship request (ID: %d) for mentor '%s' has been approved. Mentor's message: '%s'.";
    private static final String REJECTED_MSG = "Your mentorship request (ID: %d) for mentor '%s' has been rejected. Mentor's message: '%s'.";

    public void notifyRequestCreated(MentorshipRequest request) {
        String message = String.format(REQUEST_MSG,
                request.getRequester().getUsername(),
                request.getId(),
                request.getMotivation()
        );

        notificationService.notifyUser(
                request.getMentor().getUser().getUsername(),
                "New Mentorship Request",
                NotificationType.MENTORSHIP_REQUEST,
                message,
                request.getId()
        );
    }

    public void notifyRequestResponded(MentorshipRequest request, String responseMsg, boolean approved, Long conversationId) {
        if (approved) {
            String message = String.format(APPROVED_MSG, request.getId(), request.getMentor().getUser().getUsername(), responseMsg);
            notificationService.notifyUser(request.getRequester().getUsername(), "Mentorship Approval", NotificationType.MENTORSHIP_APPROVED, message, conversationId);
        } else {
            String message = String.format(REJECTED_MSG, request.getId(), request.getMentor().getUser().getUsername(), responseMsg);
            notificationService.notifyUser(request.getRequester().getUsername(), "Mentorship Rejection", NotificationType.MENTORSHIP_REJECTED, message, null);
        }
    }
}