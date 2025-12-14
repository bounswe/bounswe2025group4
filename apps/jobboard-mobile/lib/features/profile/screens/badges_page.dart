import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/badge_provider.dart';
import '../../../core/providers/font_size_provider.dart';
import '../../../core/models/badge.dart';
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
          'My Badges',
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
                        'Failed to load badges',
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
                        child: const Text('Retry'),
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
    final allBadgesGrouped = badgeProvider.allBadgesGrouped;

    return RefreshIndicator(
      onRefresh: () => badgeProvider.fetchAllBadgeData(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Summary card
            _buildSummaryCard(badgeProvider, fontSizeProvider),
            const SizedBox(height: 24),

            // Forum Badges
            _buildCategorySection(
              context,
              'Forum Badges',
              BadgeCategory.FORUM,
              allBadgesGrouped[BadgeCategory.FORUM] ?? [],
              fontSizeProvider,
              Icons.forum,
              Colors.blue,
            ),
            const SizedBox(height: 24),

            // Job Post Badges
            _buildCategorySection(
              context,
              'Job Post Badges',
              BadgeCategory.JOB_POST,
              allBadgesGrouped[BadgeCategory.JOB_POST] ?? [],
              fontSizeProvider,
              Icons.work,
              Colors.green,
            ),
            const SizedBox(height: 24),

            // Job Application Badges
            _buildCategorySection(
              context,
              'Job Application Badges',
              BadgeCategory.JOB_APPLICATION,
              allBadgesGrouped[BadgeCategory.JOB_APPLICATION] ?? [],
              fontSizeProvider,
              Icons.assignment,
              Colors.orange,
            ),
            const SizedBox(height: 24),

            // Mentorship Badges
            _buildCategorySection(
              context,
              'Mentorship Badges',
              BadgeCategory.MENTORSHIP,
              allBadgesGrouped[BadgeCategory.MENTORSHIP] ?? [],
              fontSizeProvider,
              Icons.school,
              Colors.purple,
            ),
            const SizedBox(height: 50),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard(
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
                    'Badges Earned',
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

  Widget _buildCategorySection(
    BuildContext context,
    String title,
    BadgeCategory category,
    List<BadgeDisplay> badges,
    FontSizeProvider fontSizeProvider,
    IconData icon,
    Color color,
  ) {
    final earnedCount = badges.where((b) => b.isEarned).length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(width: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(20),
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: color.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '$earnedCount/${badges.length}',
                style: TextStyle(
                  fontSize: fontSizeProvider.getScaledFontSize(12),
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (badges.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'No badges in this category',
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
              childAspectRatio: 0.85,
            ),
            itemCount: badges.length,
            itemBuilder: (context, index) {
              return BadgeItem(
                badgeDisplay: badges[index],
                categoryColor: color,
              );
            },
          ),
      ],
    );
  }
}
