import 'package:flutter/material.dart';
import '../../../core/models/user.dart';

class BadgesGrid extends StatelessWidget {
  final List<UserBadge> badges;
  final VoidCallback? onEdit;

  const BadgesGrid({
    super.key,
    required this.badges,
    this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    if (badges.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 16),
          child: Text('You have no badges yet', style: TextStyle(fontSize: 14)),
        ),
      );
    }
    return SizedBox(
      height: 90,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: badges.length,
        separatorBuilder: (context, i) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final badge = badges[index];
          return Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            elevation: 2,
            child: InkWell(
              onTap: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: Text(badge.name),
                    content: Text(badge.description),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('OK'),
                      ),
                    ],
                  ),
                );
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      IconData(
                        int.parse(badge.icon),
                        fontFamily: 'MaterialIcons',
                      ),
                      size: 32,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      badge.name,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.labelSmall,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
} 