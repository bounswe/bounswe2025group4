import 'package:flutter/material.dart';
import '../../../core/widgets/a11y.dart';

class MenteeCard extends StatelessWidget {
  final String menteeLabel;
  final VoidCallback onChatTap;
  final VoidCallback? onComplete;
  final VoidCallback? onCancel;

  const MenteeCard({
    super.key,
    required this.menteeLabel,
    required this.onChatTap,
    this.onComplete,
    this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final initial =
    menteeLabel.isNotEmpty ? menteeLabel[0].toUpperCase() : '?';

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        children: [
          ListTile(
            leading: CircleAvatar(child: Text(initial)),
            title: Text(menteeLabel, style: theme.textTheme.titleMedium),
            subtitle: const Text('Mentee'),
            trailing: IconButton(
              icon: const Icon(Icons.chat),
              onPressed: onChatTap,
            ),
          ),

          // Action buttons
          if (onComplete != null || onCancel != null)
            Padding(
              padding: const EdgeInsets.only(
                left: 16,
                right: 16,
                bottom: 12,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (onCancel != null)
                    TextButton(
                      onPressed: onCancel,
                      style: TextButton.styleFrom(
                        foregroundColor: Colors.red,
                      ),
                      child: const Text('Cancel'),
                    ),
                  if (onComplete != null)
                    ElevatedButton(
                      onPressed: onComplete,

                      child: const Text('Complete'),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
