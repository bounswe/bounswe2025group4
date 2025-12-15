/// Enum for different types of notifications
enum NotificationType {
  NEW_MESSAGE,
  MENTORSHIP_REQUEST,
  MENTORSHIP_APPROVED,
  MENTORSHIP_REJECTED,
  JOB_APPLICATION_REQUEST,
  JOB_APPLICATION_APPROVED,
  JOB_APPLICATION_REJECTED,
  FORUM_COMMENT,
  FORUM_REPORT,
  AWARDED_BADGE,
  GENERAL,
}

/// Extension to parse notification type from string
extension NotificationTypeExtension on NotificationType {
  static NotificationType fromString(String value) {
    switch (value.toUpperCase()) {
      case 'NEW_MESSAGE':
        return NotificationType.NEW_MESSAGE;
      case 'MENTORSHIP_REQUEST':
        return NotificationType.MENTORSHIP_REQUEST;
      case 'MENTORSHIP_APPROVED':
        return NotificationType.MENTORSHIP_APPROVED;
      case 'MENTORSHIP_REJECTED':
        return NotificationType.MENTORSHIP_REJECTED;
      case 'JOB_APPLICATION_REQUEST':
        return NotificationType.JOB_APPLICATION_REQUEST;
      case 'JOB_APPLICATION_APPROVED':
        return NotificationType.JOB_APPLICATION_APPROVED;
      case 'JOB_APPLICATION_REJECTED':
        return NotificationType.JOB_APPLICATION_REJECTED;
      case 'FORUM_COMMENT':
        return NotificationType.FORUM_COMMENT;
      case 'FORUM_REPORT':
        return NotificationType.FORUM_REPORT;
      case 'AWARDED_BADGE':
        return NotificationType.AWARDED_BADGE;
      default:
        return NotificationType.GENERAL;
    }
  }

  String toDisplayString() {
    switch (this) {
      case NotificationType.NEW_MESSAGE:
        return 'New Message';
      case NotificationType.MENTORSHIP_REQUEST:
        return 'Mentorship Request';
      case NotificationType.MENTORSHIP_APPROVED:
        return 'Mentorship Approved';
      case NotificationType.MENTORSHIP_REJECTED:
        return 'Mentorship Rejected';
      case NotificationType.JOB_APPLICATION_REQUEST:
        return 'Job Application';
      case NotificationType.JOB_APPLICATION_APPROVED:
        return 'Application Approved';
      case NotificationType.JOB_APPLICATION_REJECTED:
        return 'Application Rejected';
      case NotificationType.FORUM_COMMENT:
        return 'Forum Comment';
      case NotificationType.FORUM_REPORT:
        return 'Forum Report';
      case NotificationType.AWARDED_BADGE:
        return 'Badge Awarded';
      case NotificationType.GENERAL:
        return 'Notification';
    }
  }
}

