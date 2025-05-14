import 'package:flutter/material.dart';
import '../../../core/models/badge.dart' as model;

class BadgeList extends StatelessWidget {
  final List<model.Badge> badges;

  const BadgeList({
    super.key,
    required this.badges,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Achievements & Badges',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 16),
        if (badges.isEmpty)
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text('No badges earned yet.'),
          )
        else
          Wrap(
            spacing: 16,
            runSpacing: 16,
            children: badges.map((model.Badge badge) {
              return Tooltip(
                message: badge.description,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Column(
                      children: [
                        Icon(
                          Icons.workspace_premium,
                          size: 40,
                          color: Colors.amber,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          badge.name,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Earned ${_formatEarnedDate(badge.earnedAt)}',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
      ],
    );
  }

  String _formatEarnedDate(String earnedAt) {
    try {
      final date = DateTime.parse(earnedAt);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inDays < 1) {
        return 'today';
      } else if (difference.inDays < 2) {
        return 'yesterday';
      } else if (difference.inDays < 30) {
        return '${difference.inDays} days ago';
      } else if (difference.inDays < 365) {
        final months = (difference.inDays / 30).floor();
        return '$months ${months == 1 ? 'month' : 'months'} ago';
      } else {
        final years = (difference.inDays / 365).floor();
        return '$years ${years == 1 ? 'year' : 'years'} ago';
      }
    } catch (e) {
      return earnedAt;
    }
  }
}