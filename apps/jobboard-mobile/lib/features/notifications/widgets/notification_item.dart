import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/models/notification.dart' as models;
import '../../../core/models/notification_type.dart';

/// Widget for displaying a single notification item
class NotificationItem extends StatelessWidget {
  final models.Notification notification;
  final VoidCallback onTap;
  final VoidCallback? onMarkAsRead;

  const NotificationItem({
    super.key,
    required this.notification,
    required this.onTap,
    this.onMarkAsRead,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final notificationType = NotificationTypeExtension.fromString(
      notification.notificationType,
    );

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      elevation: notification.read ? 0 : 2,
      color: notification.read
          ? theme.colorScheme.surface
          : theme.colorScheme.primaryContainer.withOpacity(0.1),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icon
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _getNotificationColor(notificationType)
                      .withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  _getNotificationIcon(notificationType),
                  color: _getNotificationColor(notificationType),
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),

              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            notification.title,
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: notification.read
                                  ? FontWeight.normal
                                  : FontWeight.bold,
                            ),
                          ),
                        ),
                        if (!notification.read)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),

                    // Message
                    Text(
                      notification.message,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.7),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),

                    // Time and actions
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _formatTimestamp(notification.timestamp),
                          style: theme.textTheme.bodySmall?.copyWith(
                            color:
                                theme.colorScheme.onSurface.withOpacity(0.5),
                          ),
                        ),
                        if (onMarkAsRead != null)
                          TextButton(
                            onPressed: onMarkAsRead,
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: Text(
                              'Mark as read',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.primary,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Get icon for notification type
  IconData _getNotificationIcon(NotificationType type) {
    switch (type) {
      case NotificationType.NEW_MESSAGE:
        return Icons.message;
      case NotificationType.MENTORSHIP_REQUEST:
        return Icons.people;
      case NotificationType.MENTORSHIP_APPROVED:
        return Icons.check_circle;
      case NotificationType.MENTORSHIP_REJECTED:
        return Icons.cancel;
      case NotificationType.JOB_APPLICATION_REQUEST:
        return Icons.work;
      case NotificationType.JOB_APPLICATION_APPROVED:
        return Icons.check_circle;
      case NotificationType.JOB_APPLICATION_REJECTED:
        return Icons.cancel;
      case NotificationType.FORUM_COMMENT:
        return Icons.comment;
      case NotificationType.FORUM_REPORT:
        return Icons.report;
      case NotificationType.AWARDED_BADGE:
        return Icons.emoji_events;
      case NotificationType.GENERAL:
        return Icons.notifications;
    }
  }

  /// Get color for notification type
  Color _getNotificationColor(NotificationType type) {
    switch (type) {
      case NotificationType.NEW_MESSAGE:
        return Colors.blue;
      case NotificationType.MENTORSHIP_REQUEST:
        return Colors.purple;
      case NotificationType.MENTORSHIP_APPROVED:
        return Colors.green;
      case NotificationType.MENTORSHIP_REJECTED:
        return Colors.red;
      case NotificationType.JOB_APPLICATION_REQUEST:
        return Colors.orange;
      case NotificationType.JOB_APPLICATION_APPROVED:
        return Colors.green;
      case NotificationType.JOB_APPLICATION_REJECTED:
        return Colors.red;
      case NotificationType.FORUM_COMMENT:
        return Colors.teal;
      case NotificationType.FORUM_REPORT:
        return Colors.amber;
      case NotificationType.AWARDED_BADGE:
        return Colors.amber;
      case NotificationType.GENERAL:
        return Colors.grey;
    }
  }

  /// Format timestamp to human-readable format
  String _formatTimestamp(int timestamp) {
    final date = DateTime.fromMillisecondsSinceEpoch(timestamp);
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return DateFormat('MMM d, y').format(date);
    }
  }
}

