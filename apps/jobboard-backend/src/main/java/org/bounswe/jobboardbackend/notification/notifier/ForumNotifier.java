package org.bounswe.jobboardbackend.notification.notifier;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.forum.model.ForumComment;
import org.bounswe.jobboardbackend.forum.model.ForumPost;
import org.bounswe.jobboardbackend.notification.model.NotificationType;
import org.bounswe.jobboardbackend.notification.service.NotificationService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ForumNotifier {

    private final NotificationService notificationService;

    private static final String NEW_COMMENT_TITLE = "NEW COMMENT from %s";

    public void notifyNewComment(ForumPost post, ForumComment comment) {

        if (post.getAuthor().getUsername().equals(comment.getAuthor().getUsername())) {
            return;
        }

        String title = String.format(NEW_COMMENT_TITLE, comment.getAuthor().getUsername());

        notificationService.notifyUser(
                post.getAuthor().getUsername(),
                title,
                NotificationType.FORUM_COMMENT,
                comment.getContent(),
                post.getId()
        );
    }

}