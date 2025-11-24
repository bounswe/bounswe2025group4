import 'package:flutter/material.dart';
import '../../../core/widgets/a11y.dart';

class MenteeCard extends StatelessWidget {
  final String menteeLabel;
  final VoidCallback onChatTap;

  const MenteeCard({
    super.key,
    required this.menteeLabel,
    required this.onChatTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final initial =
    menteeLabel.isNotEmpty ? menteeLabel[0].toUpperCase() : '?';

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: A11y(
              label: 'Mentee avatar for $menteeLabel',
              child: CircleAvatar(
                child: Text(initial),
              ),
            ),
            title: Text(
              menteeLabel,
              style: theme.textTheme.titleMedium,
            ),
            subtitle: const Text('Mentee'),
            trailing: IconButton(
              icon: const A11y(
                label: 'Open chat',
                child: Icon(Icons.chat),
              ),
              onPressed: onChatTap,
              tooltip: 'Chat with mentee',
            ),
          ),
        ],
      ),
    );
  }
}
