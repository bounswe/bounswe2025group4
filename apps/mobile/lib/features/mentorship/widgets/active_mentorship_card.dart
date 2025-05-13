import 'package:flutter/material.dart';

class ActiveMentorshipCard extends StatelessWidget {
  final String mentorId;
  final String mentorName;
  final String? mentorRole;
  final VoidCallback onTap;
  final VoidCallback? onCompleteTap;
  final VoidCallback? onCancelTap;

  const ActiveMentorshipCard({
    super.key,
    required this.mentorId,
    required this.mentorName,
    this.mentorRole,
    required this.onTap,
    this.onCompleteTap,
    this.onCancelTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 16.0),
      elevation: 1.0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.0)),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: CircleAvatar(
              backgroundColor: theme.colorScheme.primaryContainer,
              child: Text(
                mentorName.isNotEmpty ? mentorName[0] : '?',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onPrimaryContainer,
                ),
              ),
            ),
            title: Text(mentorName, style: theme.textTheme.titleSmall),
            subtitle:
                mentorRole != null
                    ? Text(
                      mentorRole!,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.secondary,
                      ),
                    )
                    : null,
            trailing: const Icon(Icons.message_outlined, size: 20),
            onTap: onTap, // Trigger navigation
          ),
          if (onCompleteTap != null || onCancelTap != null)
            Padding(
              padding: const EdgeInsets.only(
                left: 16.0,
                right: 16.0,
                bottom: 8.0,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (onCompleteTap != null)
                    TextButton.icon(
                      icon: const Icon(
                        Icons.check_circle_outline,
                        color: Colors.green,
                      ),
                      label: const Text(
                        'Complete',
                        style: TextStyle(color: Colors.green),
                      ),
                      onPressed: onCompleteTap,
                    ),
                  const SizedBox(width: 8.0),
                  if (onCancelTap != null)
                    TextButton.icon(
                      icon: const Icon(
                        Icons.cancel_outlined,
                        color: Colors.red,
                      ),
                      label: const Text(
                        'Cancel',
                        style: TextStyle(color: Colors.red),
                      ),
                      onPressed: onCancelTap,
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
