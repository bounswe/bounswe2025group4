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
                  label: 'Mentee avatar for ${request.mentee.username}',
                  child: CircleAvatar(
                    child: Text(request.mentee.username[0].toUpperCase()),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        request.mentee.username,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      if (request.mentee.jobTitle != null)
                        Text(
                          request.mentee.jobTitle!,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              request.message,
              style: Theme.of(context).textTheme.bodyMedium,
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
