import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/notification_provider.dart';

/// Badge widget showing unread notification count
class NotificationBadge extends StatelessWidget {
  final VoidCallback onTap;

  const NotificationBadge({
    super.key,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<NotificationProvider>(
      builder: (context, notificationProvider, child) {
        final unreadCount = notificationProvider.unreadCount;

        return Stack(
          clipBehavior: Clip.none,
          children: [
            IconButton(
              icon: const Icon(Icons.notifications),
              onPressed: onTap,
            ),
            if (unreadCount > 0)
              Positioned(
                right: 8,
                top: 8,
                child: IgnorePointer(
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 1.5),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 18,
                      minHeight: 18,
                    ),
                    child: Center(
                      child: Text(
                        unreadCount > 99 ? '99+' : '$unreadCount',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}

