import '../models/user.dart';

class BadgeService {
  // Badge earning criteria
  static const int MESSAGE_THRESHOLD = 10;
  static const int POST_THRESHOLD = 5;
  static const int APPLICATION_THRESHOLD = 3;

  // Badge types
  static const String MESSAGE_BADGE = 'message_master';
  static const String POST_BADGE = 'content_creator';
  static const String APPLICATION_BADGE = 'job_seeker';

  // Badge descriptions
  static const Map<String, String> BADGE_DESCRIPTIONS = {
    MESSAGE_BADGE: 'Sent 10 messages',
    POST_BADGE: 'Shared 5 posts',
    APPLICATION_BADGE: 'Made 3 job applications',
  };

  // Badge icons
  static const Map<String, String> BADGE_ICONS = {
    MESSAGE_BADGE: '💬',
    POST_BADGE: '📝',
    APPLICATION_BADGE: '📋',
  };

  // Update user's badges
  Future<List<UserBadge>> updateBadges(User user, {
    int messageCount = 0,
    int postCount = 0,
    int applicationCount = 0,
  }) async {
    List<UserBadge> updatedBadges = List.from(user.badges);

    // Message badge check
    if (messageCount >= MESSAGE_THRESHOLD && 
        !updatedBadges.any((badge) => badge.type == MESSAGE_BADGE)) {
      updatedBadges.add(UserBadge(
        type: MESSAGE_BADGE,
        description: BADGE_DESCRIPTIONS[MESSAGE_BADGE]!,
        icon: BADGE_ICONS[MESSAGE_BADGE]!,
        earnedAt: DateTime.now(),
      ));
    }

    // Post badge check
    if (postCount >= POST_THRESHOLD && 
        !updatedBadges.any((badge) => badge.type == POST_BADGE)) {
      updatedBadges.add(UserBadge(
        type: POST_BADGE,
        description: BADGE_DESCRIPTIONS[POST_BADGE]!,
        icon: BADGE_ICONS[POST_BADGE]!,
        earnedAt: DateTime.now(),
      ));
    }

    // Application badge check
    if (applicationCount >= APPLICATION_THRESHOLD && 
        !updatedBadges.any((badge) => badge.type == APPLICATION_BADGE)) {
      updatedBadges.add(UserBadge(
        type: APPLICATION_BADGE,
        description: BADGE_DESCRIPTIONS[APPLICATION_BADGE]!,
        icon: BADGE_ICONS[APPLICATION_BADGE]!,
        earnedAt: DateTime.now(),
      ));
    }

    return updatedBadges;
  }
} 