import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/badge.dart' as model;
import '../../../core/providers/font_size_provider.dart';
import '../../../generated/l10n/app_localizations.dart';
import '../screens/badges_page.dart';

class BadgeList extends StatelessWidget {
  final List<model.Badge> badges;

  const BadgeList({
    super.key,
    required this.badges,
  });

  @override
  Widget build(BuildContext context) {
    final fontSizeProvider = Provider.of<FontSizeProvider>(context);
    
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const BadgesPage()),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.workspace_premium,
                        color: Colors.amber,
                        size: 24,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        AppLocalizations.of(context).badges_title,
                        style: TextStyle(
                          fontSize: fontSizeProvider.getScaledFontSize(18),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const Icon(Icons.arrow_forward_ios, size: 16),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                AppLocalizations.of(context).badges_tapToViewAll,
                style: TextStyle(
                  fontSize: fontSizeProvider.getScaledFontSize(12),
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 16),
              if (badges.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        Icon(
                          Icons.workspace_premium,
                          size: 48,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          AppLocalizations.of(context).badges_noBadges,
                          style: TextStyle(
                            fontSize: fontSizeProvider.getScaledFontSize(14),
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                SizedBox(
                  height: 100,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: badges.take(5).length,
                    itemBuilder: (context, index) {
                      final badge = badges[index];
                      return Container(
                        width: 80,
                        margin: const EdgeInsets.only(right: 12),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: _getCategoryColor(badge.category)
                                    .withOpacity(0.2),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                _getCategoryIcon(badge.category),
                                size: 28,
                                color: _getCategoryColor(badge.category),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _formatBadgeName(badge.name),
                              style: TextStyle(
                                fontSize: fontSizeProvider.getScaledFontSize(10),
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              if (badges.length > 5)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Text(
                      AppLocalizations.of(context).badges_moreBadges(badges.length - 5),
                      style: TextStyle(
                        fontSize: fontSizeProvider.getScaledFontSize(12),
                        color: Colors.blue,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatBadgeName(String name) {
    // Convert from SCREAMING_SNAKE_CASE to Title Case
    return name
        .split('_')
        .map((word) => word[0].toUpperCase() + word.substring(1).toLowerCase())
        .join(' ');
  }

  IconData _getCategoryIcon(model.BadgeCategory category) {
    switch (category) {
      case model.BadgeCategory.FORUM:
        return Icons.forum;
      case model.BadgeCategory.JOB_POST:
        return Icons.work;
      case model.BadgeCategory.JOB_APPLICATION:
        return Icons.assignment;
      case model.BadgeCategory.MENTORSHIP:
        return Icons.school;
    }
  }

  Color _getCategoryColor(model.BadgeCategory category) {
    switch (category) {
      case model.BadgeCategory.FORUM:
        return Colors.blue;
      case model.BadgeCategory.JOB_POST:
        return Colors.green;
      case model.BadgeCategory.JOB_APPLICATION:
        return Colors.orange;
      case model.BadgeCategory.MENTORSHIP:
        return Colors.purple;
    }
  }
}