import 'package:flutter/material.dart';
import '../../../../core/models/user.dart';

class ActivityTab extends StatelessWidget {
  final User user;

  const ActivityTab({
    super.key,
    required this.user,
  });

  @override
  Widget build(BuildContext context) {
    // TODO: Implement activity feed when the API is ready
    return Center(
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.timeline, size: 32, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 12),
              Text(
                'Activity feed will be displayed here soon.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Theme.of(context).colorScheme.secondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
} 