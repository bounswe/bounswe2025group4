import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/badge_provider.dart';
import '../../../core/providers/font_size_provider.dart';
import '../../../core/models/badge.dart';
import '../../../generated/l10n/app_localizations.dart';

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
          padding: const EdgeInsets.symmetric(horizontal: 6.0, vertical: 10.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Badge icon
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: isEarned
                      ? categoryColor.withOpacity(0.2)
                      : Colors.grey[300],
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _getBadgeIcon(badgeDisplay.badgeType.type),
                  size: 28,
                  color: isEarned ? categoryColor : Colors.grey[400],
                ),
              ),
              const SizedBox(height: 6),
              // Badge name
              Flexible(
                child: Text(
                  _formatBadgeName(badgeDisplay.name),
                  style: TextStyle(
                    fontSize: fontSizeProvider.getScaledFontSize(10.5),
                    fontWeight: isEarned ? FontWeight.bold : FontWeight.normal,
                    color: isEarned ? Colors.black : Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 6),
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
                    AppLocalizations.of(context).badges_locked,
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

  IconData _getBadgeIcon(String badgeType) {
    // Map each specific badge type to a unique icon
    switch (badgeType.toUpperCase()) {
      // Forum Badges
      case 'FIRST_VOICE':
        return Icons.record_voice_over; // First forum post
      case 'COMMUNITY_PILLAR':
        return Icons.account_balance; // 25 posts - pillar of community
      case 'CONVERSATION_STARTER':
        return Icons.chat_bubble_outline; // First comment
      case 'DISCUSSION_DRIVER':
        return Icons.forum; // 50 comments - driving discussions
      case 'HELPFUL':
        return Icons.thumb_up; // 10 upvotes
      case 'VALUABLE_CONTRIBUTOR':
        return Icons.stars; // 50 upvotes - valuable content
      
      // Job Post Badges (Employer)
      case 'FIRST_LISTING':
        return Icons.post_add; // First job post
      case 'HIRING_MACHINE':
        return Icons.business_center; // 15 job posts
      
      // Job Application Badges (Job Seeker)
      case 'FIRST_STEP':
        return Icons.assignment_turned_in; // First application
      case 'PERSISTENT':
        return Icons.trending_up; // 15 applications
      case 'HIRED':
        return Icons.celebration; // First job offer
      case 'CAREER_STAR':
        return Icons.emoji_events; // 5 job offers
      
      // Mentor Badges
      case 'GUIDE':
        return Icons.school; // Created mentor profile
      case 'FIRST_MENTEE':
        return Icons.person_add; // First mentee
      case 'DEDICATED_MENTOR':
        return Icons.groups; // 5 mentees
      
      // Mentee Badges
      case 'SEEKING_GUIDANCE':
        return Icons.explore; // First mentorship request
      case 'MENTORED':
        return Icons.handshake; // Got accepted by mentor
      case 'FEEDBACK_GIVER':
        return Icons.rate_review; // Left first review
      
      // Default fallback
      default:
        return Icons.workspace_premium;
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
                _getBadgeIcon(badgeDisplay.badgeType.type),
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
                  AppLocalizations.of(context).badges_requirement(badgeDisplay.threshold),
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
                    AppLocalizations.of(context).badges_earnedOn(_formatDate(badgeDisplay.awardedAt!)),
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
                    AppLocalizations.of(context).badges_notYetEarned,
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
            child: Text(AppLocalizations.of(context).badges_close),
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
