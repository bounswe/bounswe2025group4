package org.bounswe.jobboardbackend.notification.notifier;


import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplication;
import org.bounswe.jobboardbackend.notification.model.NotificationType;
import org.bounswe.jobboardbackend.notification.service.NotificationService;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JobApplicationNotifier {

    private final NotificationService notificationService;

    private static final String NEW_APP_MSG = "You received a new job application from %s for the position '%s' (Application ID: %d).";
    private static final String APPROVED_MSG = "Your application for '%s' (ID: %d) has been approved by %s.";
    private static final String REJECTED_MSG = "Your application for '%s' (ID: %d) has been rejected by %s.";

    public void notifyNewApplication(JobApplication application) {
        String message = String.format(NEW_APP_MSG,
                application.getJobSeeker().getUsername(),
                application.getJobPost().getTitle(),
                application.getId()
        );

        notificationService.notifyUser(
                application.getJobPost().getEmployer().getUsername(),
                "New Job Application Request",
                NotificationType.JOB_APPLICATION_REQUEST, // Check if you have this type
                message,
                application.getId()
        );
    }

    public void notifyApplicationApproved(JobApplication application, User approver) {
        String message = String.format(APPROVED_MSG,
                application.getJobPost().getTitle(),
                application.getId(),
                approver.getUsername()
        );

        notificationService.notifyUser(
                application.getJobSeeker().getUsername(),
                "Job Application Approved",
                NotificationType.JOB_APPLICATION_APPROVED,
                message,
                application.getId()
        );
    }

    public void notifyApplicationRejected(JobApplication application, User rejecter) {
        String message = String.format(REJECTED_MSG,
                application.getJobPost().getTitle(),
                application.getId(),
                rejecter.getUsername()
        );

        notificationService.notifyUser(
                application.getJobSeeker().getUsername(),
                "Job Application Rejection",
                NotificationType.JOB_APPLICATION_REJECTED,
                message,
                application.getId()
        );
    }
}
