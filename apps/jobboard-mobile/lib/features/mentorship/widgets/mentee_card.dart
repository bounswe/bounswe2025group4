import 'package:flutter/material.dart';
import 'package:mobile/core/models/user.dart';
import '../../../core/widgets/a11y.dart';

class MenteeCard extends StatelessWidget {
  final User mentee;
  final VoidCallback onChatTap;
  final VoidCallback? onCompleteTap;
  final VoidCallback? onCancelTap;

  const MenteeCard({
    super.key,
    required this.mentee,
    required this.onChatTap,
    this.onCompleteTap,
    this.onCancelTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: A11y(
              label: 'Mentee avatar for ${mentee.username}',
              child: CircleAvatar(
                child: Text(mentee.username[0].toUpperCase()),
              ),
            ),
            title: Text(mentee.username),
            subtitle: Text(mentee.jobTitle ?? 'Mentee'),
            trailing: IconButton(
              icon: const A11y(label: 'Open chat', child: Icon(Icons.chat)),
              onPressed: onChatTap,
              tooltip: 'Chat with mentee',
            ),
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
