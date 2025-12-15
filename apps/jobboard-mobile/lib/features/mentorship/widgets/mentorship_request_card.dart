import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile/core/models/mentorship_request.dart';
import '../../../core/widgets/a11y.dart';

class MentorshipRequestCard extends StatelessWidget {
  final MentorshipRequest request;
  final VoidCallback onAccept;
  final VoidCallback onReject;
  final VoidCallback onTap;

  const MentorshipRequestCard({
    super.key,
    required this.request,
    required this.onAccept,
    required this.onReject,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final menteeLabel = request.requesterUsername ??
        request.requesterId ??
        'Mentee';
    final safeLabel = menteeLabel ?? 'User';
    final initial = menteeLabel[0].toUpperCase();
      return  InkWell(
        onTap: onTap, // ✅ THIS was missing
        borderRadius: BorderRadius.circular(12),
        child: Card(
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
                  Text("Show Request",
                      style: Theme.of(context).textTheme.bodyMedium,
                  )
                ],
              ),

            ],
          ),
        ),
        )
      );
  }
}
