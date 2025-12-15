import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/notification_provider.dart';
import '../../../core/providers/tab_navigation_provider.dart';
import '../../../core/models/notification_type.dart';
import '../widgets/notification_item.dart';

/// Screen for displaying all notifications
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    // Fetch notifications when screen opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationProvider>().fetchNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          Consumer<NotificationProvider>(
            builder: (context, notificationProvider, child) {
              if (notificationProvider.unreadCount > 0) {
                return TextButton(
                  onPressed: () async {
                    try {
                      await notificationProvider.markAllAsRead();
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('All notifications marked as read'),
                            duration: Duration(seconds: 2),
                          ),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Error: ${e.toString()}'),
                            backgroundColor: Colors.red,
                          ),
                        );
                      }
                    }
                  },
                  child: const Text('Mark all as read'),
                );
              }
              return const SizedBox.shrink();
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<NotificationProvider>().fetchNotifications();
            },
          ),
        ],
      ),
      body: Consumer<NotificationProvider>(
        builder: (context, notificationProvider, child) {
          // Loading state
          if (notificationProvider.isLoading &&
              notificationProvider.notifications.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          // Error state
          if (notificationProvider.error != null &&
              notificationProvider.notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 64,
                    color: theme.colorScheme.error,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Error loading notifications',
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    notificationProvider.error!,
                    style: theme.textTheme.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () {
                      notificationProvider.fetchNotifications();
                    },
                    icon: const Icon(Icons.refresh),
                    label: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          // Empty state
          if (notificationProvider.notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.notifications_none,
                    size: 64,
                    color: theme.colorScheme.onSurface.withOpacity(0.3),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No notifications yet',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.5),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'You\'ll see notifications here when you have new activity',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.4),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }

          // Notifications list
          return RefreshIndicator(
            onRefresh: () => notificationProvider.fetchNotifications(),
            child: ListView.builder(
              itemCount: notificationProvider.notifications.length,
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemBuilder: (context, index) {
                final notification = notificationProvider.notifications[index];
                return NotificationItem(
                  notification: notification,
                  onTap: () {
                    _handleNotificationTap(context, notification);
                  },
                  onMarkAsRead: notification.read
                      ? null
                      : () async {
                          try {
                            await notificationProvider.markAsRead(
                              notification.id,
                            );
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Error: ${e.toString()}'),
                                  backgroundColor: Colors.red,
                                ),
                              );
                            }
                          }
                        },
                );
              },
            ),
          );
        },
      ),
    );
  }

  /// Handle notification tap - navigate to related content
  void _handleNotificationTap(
    BuildContext context,
    notification,
  ) async {
    // Mark as read
    if (!notification.read) {
      try {
        await context
            .read<NotificationProvider>()
            .markAsRead(notification.id);
      } catch (e) {
        print('Error marking notification as read: $e');
      }
    }

    if (!context.mounted) return;

    // Navigate based on notification type - simple tab navigation
    switch (notification.notificationType) {
      // Mentorlük ve DM bildirimleri → Mentorship sayfasına
      case NotificationType.NEW_MESSAGE:
      case NotificationType.MENTORSHIP_REQUEST:
      case NotificationType.MENTORSHIP_APPROVED:
      case NotificationType.MENTORSHIP_REJECTED:
        _navigateToMentorshipTab(context);
        break;

      // İş bildirimleri → Job sayfasına
      case NotificationType.JOB_APPLICATION_REQUEST:
      case NotificationType.JOB_APPLICATION_APPROVED:
      case NotificationType.JOB_APPLICATION_REJECTED:
        _navigateToJobTab(context);
        break;

      // Forum bildirimleri → Forum sayfasına
      case NotificationType.FORUM_COMMENT:
      case NotificationType.FORUM_REPORT:
        _navigateToForumTab(context);
        break;

      // Badge bildirimleri → Profile sayfasına
      case NotificationType.AWARDED_BADGE:
        _navigateToProfileTab(context);
        break;
    }
  }

  /// Navigate to mentorship tab in MainScaffold (index 2)
  void _navigateToMentorshipTab(BuildContext context) {
    Navigator.popUntil(context, (route) => route.isFirst);
    Provider.of<TabNavigationProvider>(context, listen: false).changeTab(2);
  }

  /// Navigate to job tab in MainScaffold (index 1)
  void _navigateToJobTab(BuildContext context) {
    Navigator.popUntil(context, (route) => route.isFirst);
    Provider.of<TabNavigationProvider>(context, listen: false).changeTab(1);
  }

  /// Navigate to forum tab in MainScaffold (index 0)
  void _navigateToForumTab(BuildContext context) {
    Navigator.popUntil(context, (route) => route.isFirst);
    Provider.of<TabNavigationProvider>(context, listen: false).changeTab(0);
  }

  /// Navigate to profile tab in MainScaffold (index 3)
  void _navigateToProfileTab(BuildContext context) {
    Navigator.popUntil(context, (route) => route.isFirst);
    Provider.of<TabNavigationProvider>(context, listen: false).changeTab(3);
  }

  /// Show error snackbar
  void _showErrorSnackBar(BuildContext context, String message) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

}

