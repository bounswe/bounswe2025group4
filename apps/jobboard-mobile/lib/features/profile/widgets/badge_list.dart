import 'package:flutter/material.dart';
import '../../../core/models/badge.dart' as model;
import '../../../generated/l10n/app_localizations.dart';

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
          AppLocalizations.of(context)!.badges_title,
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 16),
        if (badges.isEmpty)
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(AppLocalizations.of(context)!.badges_noBadges),
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
                          AppLocalizations.of(context)!.badges_earned(_formatEarnedDate(context, badge.earnedAt)),
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

  String _formatEarnedDate(BuildContext context, String earnedAt) {
    try {
      final date = DateTime.parse(earnedAt);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inDays < 1) {
        return AppLocalizations.of(context)!.badges_today;
      } else if (difference.inDays < 2) {
        return AppLocalizations.of(context)!.badges_yesterday;
      } else if (difference.inDays < 30) {
        return AppLocalizations.of(context)!.badges_daysAgo(difference.inDays);
      } else if (difference.inDays < 365) {
        final months = (difference.inDays / 30).floor();
        final monthText = months == 1 
            ? AppLocalizations.of(context)!.badges_month 
            : AppLocalizations.of(context)!.badges_months;
        return AppLocalizations.of(context)!.badges_monthsAgo(months, monthText);
      } else {
        final years = (difference.inDays / 365).floor();
        final yearText = years == 1 
            ? AppLocalizations.of(context)!.badges_year 
            : AppLocalizations.of(context)!.badges_years;
        return AppLocalizations.of(context)!.badges_yearsAgo(years, yearText);
      }
    } catch (e) {
      return earnedAt;
    }
  }
}