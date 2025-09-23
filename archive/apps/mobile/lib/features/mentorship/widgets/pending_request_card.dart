import 'package:flutter/material.dart';

class PendingRequestCard extends StatelessWidget {
  final String mentorName;
  final String
  status; // e.g., "Pending", "Rejected" (though maybe rejected shouldn't show here?)

  const PendingRequestCard({
    super.key,
    required this.mentorName,
    this.status = 'Pending',
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
          backgroundColor: theme.colorScheme.secondaryContainer,
          child: Icon(
            Icons.hourglass_top_rounded,
            color: theme.colorScheme.onSecondaryContainer,
            size: 20,
          ),
        ),
        title: Text(mentorName, style: theme.textTheme.titleSmall),
        trailing: Text(
          status,
          style: theme.textTheme.bodySmall?.copyWith(
            fontStyle: FontStyle.italic,
            color: theme.hintColor,
          ),
        ),
        // Optionally add an onTap if needed later (e.g., to withdraw request)
      ),
    );
  }
}
