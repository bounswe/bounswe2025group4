package org.bounswe.jobboardbackend.notification.notifier;


import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.mentorship.model.Message;
import org.bounswe.jobboardbackend.notification.model.NotificationType;
import org.bounswe.jobboardbackend.notification.service.NotificationService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatNotifier {

    private final NotificationService notificationService;

    public void notifyNewMessage(Message message, boolean isReceiverSubscribed) {

        if (isReceiverSubscribed) {
            return;
        }

        String mentorUsername = message.getConversation().getResumeReview().getMentor().getUser().getUsername();
        String jobSeekerUsername = message.getConversation().getResumeReview().getJobSeeker().getUsername();
        String senderUsername = message.getSender().getUsername();

        String senderName = senderUsername.equals(mentorUsername) ? mentorUsername : jobSeekerUsername;
        String receiverName = senderUsername.equals(mentorUsername) ? jobSeekerUsername : mentorUsername;

        String notificationText = "NEW MESSAGE from " + senderName;

        notificationService.notifyUser(
                receiverName,
                notificationText,
                NotificationType.NEW_MESSAGE,
                message.getContent(),
                message.getConversation().getId()
        );
    }
}
