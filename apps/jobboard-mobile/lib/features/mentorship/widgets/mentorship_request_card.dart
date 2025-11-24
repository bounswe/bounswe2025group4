import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile/core/models/mentorship_request.dart';
import '../../../core/widgets/a11y.dart';

class MentorshipRequestCard extends StatelessWidget {
  final MentorshipRequest request;
  final VoidCallback onAccept;
  final VoidCallback onReject;

  const MentorshipRequestCard({
    super.key,
    required this.request,
    required this.onAccept,
    required this.onReject,
  });

  @override
  Widget build(BuildContext context) {
    final menteeLabel = request.requesterUsername ??
        request.requesterId ??
        'Mentee';
    final safeLabel = menteeLabel ?? 'User';
    final initial = menteeLabel[0].toUpperCase();
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                A11y(
                  label: 'Mentee avatar for ${menteeLabel ?? 'Unknown'}',
                  child: CircleAvatar(child: Text(initial)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    menteeLabel ?? 'Unknown',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              'Requested at: ${request.createdAt.toLocal()}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 4),
            Text(
              'Status: ${request.status.name}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () {
                    HapticFeedback.lightImpact();
                    onReject();
                  },
                  child: const Text('Reject'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () {
                    HapticFeedback.mediumImpact();
                    onAccept();
                  },
                  child: const Text('Accept'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
