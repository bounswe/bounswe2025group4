// lib/core/models/badge.dart

enum BadgeCategory {
  FORUM,
  JOB_POST,
  JOB_APPLICATION,
  MENTORSHIP,
}

enum BadgeType {
  // Forum badges
  FIRST_VOICE,
  COMMUNITY_PILLAR,
  CONVERSATION_STARTER,
  DISCUSSION_DRIVER,
  HELPFUL,
  VALUABLE_CONTRIBUTOR,
  
  // Job Post badges
  FIRST_LISTING,
  HIRING_MACHINE,
  
  // Job Application badges
  FIRST_STEP,
  PERSISTENT,
  HIRED,
  CAREER_STAR,
  
  // Mentorship badges
  GUIDE,
  FIRST_MENTEE,
  DEDICATED_MENTOR,
  SEEKING_GUIDANCE,
  MENTORED,
  FEEDBACK_GIVER,
}

class BadgeTypeInfo {
  final String type; // Enum name for matching (e.g., "GUIDE")
  final String name; // Display name for UI (e.g., "Guide")
  final String description;
  final BadgeCategory category;
  final int threshold;

  BadgeTypeInfo({
    required this.type,
    required this.name,
    required this.description,
    required this.category,
    required this.threshold,
  });

  factory BadgeTypeInfo.fromJson(Map<String, dynamic> json) {
    final type = json['type'] ?? '';
    return BadgeTypeInfo(
      type: type, // Enum name for matching
      name: json['name'] ?? '', // Display name
      description: json['description'] ?? '',
      category: _determineCategoryFromType(type),
      threshold: json['threshold'] ?? 0,
    );
  }

  // Map badge types to categories (since backend doesn't send category)
  static BadgeCategory _determineCategoryFromType(String type) {
    const forumBadges = {
      'FIRST_VOICE', 'COMMUNITY_PILLAR', 'CONVERSATION_STARTER',
      'DISCUSSION_DRIVER', 'HELPFUL', 'VALUABLE_CONTRIBUTOR'
    };
    const jobPostBadges = {'FIRST_LISTING', 'HIRING_MACHINE'};
    const jobApplicationBadges = {
      'FIRST_STEP', 'PERSISTENT', 'HIRED', 'CAREER_STAR'
    };
    const mentorshipBadges = {
      'GUIDE', 'FIRST_MENTEE', 'DEDICATED_MENTOR',
      'SEEKING_GUIDANCE', 'MENTORED', 'FEEDBACK_GIVER'
    };

    if (forumBadges.contains(type)) return BadgeCategory.FORUM;
    if (jobPostBadges.contains(type)) return BadgeCategory.JOB_POST;
    if (jobApplicationBadges.contains(type)) return BadgeCategory.JOB_APPLICATION;
    if (mentorshipBadges.contains(type)) return BadgeCategory.MENTORSHIP;
    
    return BadgeCategory.FORUM; // Default
  }
}

class Badge {
  final String badgeType;
  final String name;
  final String description;
  final BadgeCategory category;
  final DateTime? awardedAt;
  final int threshold;

  Badge({
    required this.badgeType,
    required this.name,
    required this.description,
    required this.category,
    this.awardedAt,
    required this.threshold,
  });

  factory Badge.fromJson(Map<String, dynamic> json) {
    final badgeType = json['badgeType'] ?? json['type'] ?? '';
    return Badge(
      badgeType: badgeType,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      category: BadgeTypeInfo._determineCategoryFromType(badgeType),
      awardedAt: json['earnedAt'] != null 
          ? DateTime.parse(json['earnedAt']) 
          : null,
      threshold: json['threshold'] ?? 0,
    );
  }

  bool get isEarned => awardedAt != null;
}