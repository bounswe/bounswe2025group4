import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/badge_provider.dart';
import '../../../core/providers/font_size_provider.dart';
import '../../../core/models/badge.dart';
import '../../../generated/l10n/app_localizations.dart';
import '../widgets/badge_item.dart';

class BadgesPage extends StatefulWidget {
  const BadgesPage({super.key});

  @override
  State<BadgesPage> createState() => _BadgesPageState();
}

class _BadgesPageState extends State<BadgesPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final badgeProvider = Provider.of<BadgeProvider>(context, listen: false);
      badgeProvider.fetchAllBadgeData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final badgeProvider = Provider.of<BadgeProvider>(context);
    final fontSizeProvider = Provider.of<FontSizeProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          AppLocalizations.of(context).badges_myBadges,
          style: TextStyle(fontSize: fontSizeProvider.getScaledFontSize(20)),
        ),
      ),
      body: badgeProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : badgeProvider.error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 64, color: Colors.red),
                      const SizedBox(height: 16),
                      Text(
                        AppLocalizations.of(context).badges_failedToLoad,
                        style: TextStyle(
                          fontSize: fontSizeProvider.getScaledFontSize(18),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        badgeProvider.error!,
                        style: TextStyle(
                          fontSize: fontSizeProvider.getScaledFontSize(14),
                          color: Colors.grey[600],
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          badgeProvider.fetchAllBadgeData();
                        },
                        child: Text(AppLocalizations.of(context).common_retry),
                      ),
                    ],
                  ),
                )
              : _buildBadgeContent(context, badgeProvider, fontSizeProvider),
    );
  }

  Widget _buildBadgeContent(
    BuildContext context,
    BadgeProvider badgeProvider,
    FontSizeProvider fontSizeProvider,
  ) {
    // Get all badges in a single flat list
    final allBadgesGrouped = badgeProvider.allBadgesGrouped;
    final allBadges = <BadgeDisplay>[];
    
    // Flatten all categories into a single list
    allBadgesGrouped.forEach((category, badges) {
      allBadges.addAll(badges);
    });

    return RefreshIndicator(
      onRefresh: () => badgeProvider.fetchAllBadgeData(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Summary card
            _buildSummaryCard(context, badgeProvider, fontSizeProvider),
            const SizedBox(height: 24),

            // All badges in one grid
            if (allBadges.isEmpty)
              Center(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                AppLocalizations.of(context).badges_noBadgesAvailable,
                style: TextStyle(
                  fontSize: fontSizeProvider.getScaledFontSize(14),
                  color: Colors.grey[600],
                ),
              ),
            ),
              )
            else
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.75, // Reduced from 0.85 to make cards taller
                ),
                itemCount: allBadges.length,
                itemBuilder: (context, index) {
                  final badge = allBadges[index];
                  return BadgeItem(
                    badgeDisplay: badge,
                    categoryColor: _getCategoryColor(badge.category),
                  );
                },
              ),
            const SizedBox(height: 50),
          ],
        ),
      ),
    );
  }

  Color _getCategoryColor(BadgeCategory category) {
    switch (category) {
      case BadgeCategory.FORUM:
        return Colors.blue;
      case BadgeCategory.JOB_POST:
        return Colors.green;
      case BadgeCategory.JOB_APPLICATION:
        return Colors.orange;
      case BadgeCategory.MENTORSHIP:
        return Colors.purple;
    }
  }

  Widget _buildSummaryCard(
    BuildContext context,
    BadgeProvider badgeProvider,
    FontSizeProvider fontSizeProvider,
  ) {
    final earnedCount = badgeProvider.earnedBadges.length;
    final totalCount = badgeProvider.allBadgeTypes.length;

    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.amber.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.workspace_premium,
                size: 40,
                color: Colors.amber,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppLocalizations.of(context).badges_earnedCount,
                    style: TextStyle(
                      fontSize: fontSizeProvider.getScaledFontSize(16),
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$earnedCount / $totalCount',
                    style: TextStyle(
                      fontSize: fontSizeProvider.getScaledFontSize(28),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: totalCount > 0 ? earnedCount / totalCount : 0,
                    backgroundColor: Colors.grey[300],
                    valueColor: const AlwaysStoppedAnimation<Color>(Colors.amber),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

}
