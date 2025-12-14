import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/badge_provider.dart';
import '../../../core/providers/font_size_provider.dart';
import '../../../core/models/badge.dart';

class BadgeItem extends StatelessWidget {
  final BadgeDisplay badgeDisplay;
  final Color categoryColor;

  const BadgeItem({
    super.key,
    required this.badgeDisplay,
    required this.categoryColor,
  });

  @override
  Widget build(BuildContext context) {
    final fontSizeProvider = Provider.of<FontSizeProvider>(context);
    final isEarned = badgeDisplay.isEarned;

    return GestureDetector(
      onTap: () {
        _showBadgeDetails(context);
      },
      child: Card(
        elevation: isEarned ? 4 : 1,
        color: isEarned ? null : Colors.grey[200],
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Badge icon
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isEarned
                      ? categoryColor.withOpacity(0.2)
                      : Colors.grey[300],
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _getBadgeIcon(badgeDisplay.category),
                  size: 32,
                  color: isEarned ? categoryColor : Colors.grey[400],
                ),
              ),
              const SizedBox(height: 8),
              // Badge name
              Text(
                _formatBadgeName(badgeDisplay.name),
                style: TextStyle(
                  fontSize: fontSizeProvider.getScaledFontSize(11),
                  fontWeight: isEarned ? FontWeight.bold : FontWeight.normal,
                  color: isEarned ? Colors.black : Colors.grey[600],
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              // Earned indicator
              if (isEarned)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: categoryColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '✓',
                    style: TextStyle(
                      fontSize: fontSizeProvider.getScaledFontSize(10),
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.grey[400],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Locked',
                    style: TextStyle(
                      fontSize: fontSizeProvider.getScaledFontSize(9),
                      color: Colors.white,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getBadgeIcon(BadgeCategory category) {
    switch (category) {
      case BadgeCategory.FORUM:
        return Icons.forum;
      case BadgeCategory.JOB_POST:
        return Icons.work;
      case BadgeCategory.JOB_APPLICATION:
        return Icons.assignment;
      case BadgeCategory.MENTORSHIP:
        return Icons.school;
    }
  }

  String _formatBadgeName(String name) {
    // Convert from SCREAMING_SNAKE_CASE to Title Case
    return name
        .split('_')
        .map((word) => word[0].toUpperCase() + word.substring(1).toLowerCase())
        .join(' ');
  }

  void _showBadgeDetails(BuildContext context) {
    final fontSizeProvider = Provider.of<FontSizeProvider>(context, listen: false);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: categoryColor.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(
                _getBadgeIcon(badgeDisplay.category),
                color: categoryColor,
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                _formatBadgeName(badgeDisplay.name),
                style: TextStyle(
                  fontSize: fontSizeProvider.getScaledFontSize(18),
                ),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              badgeDisplay.description,
              style: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(14),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Icon(Icons.flag, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 8),
                Text(
                  'Requirement: ${badgeDisplay.threshold}',
                  style: TextStyle(
                    fontSize: fontSizeProvider.getScaledFontSize(12),
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (badgeDisplay.isEarned) ...[
              Row(
                children: [
                  Icon(Icons.check_circle, size: 16, color: categoryColor),
                  const SizedBox(width: 8),
                  Text(
                    'Earned on ${_formatDate(badgeDisplay.awardedAt!)}',
                    style: TextStyle(
                      fontSize: fontSizeProvider.getScaledFontSize(12),
                      color: categoryColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ] else ...[
              Row(
                children: [
                  Icon(Icons.lock, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 8),
                  Text(
                    'Not yet earned',
                    style: TextStyle(
                      fontSize: fontSizeProvider.getScaledFontSize(12),
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }
}
