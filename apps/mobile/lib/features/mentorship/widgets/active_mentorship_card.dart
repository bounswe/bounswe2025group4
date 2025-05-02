import 'package:flutter/material.dart';

class ActiveMentorshipCard extends StatelessWidget {
  final String mentorId;
  final String mentorName;
  final String? mentorRole;
  final VoidCallback onTap;

  const ActiveMentorshipCard({
    super.key,
    required this.mentorId,
    required this.mentorName,
    this.mentorRole,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 16.0),
      elevation: 1.0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.0)),
      child: ListTile(
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
    );
  }
}
