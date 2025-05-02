import 'package:flutter/material.dart';
import '../../../../core/models/user.dart';

class ApplicationsTab extends StatelessWidget {
  final User user;

  const ApplicationsTab({
    super.key,
    required this.user,
  });

  @override
  Widget build(BuildContext context) {
    // TODO: Implement applications list when the API is ready
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
              Icon(Icons.assignment, size: 32, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 12),
              Text(
                'Applications will be displayed here soon.',
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