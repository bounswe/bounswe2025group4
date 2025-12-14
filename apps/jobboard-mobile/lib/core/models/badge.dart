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
  final String name;
  final String description;
  final BadgeCategory category;
  final int threshold;

  BadgeTypeInfo({
    required this.name,
    required this.description,
    required this.category,
    required this.threshold,
  });

  factory BadgeTypeInfo.fromJson(Map<String, dynamic> json) {
    return BadgeTypeInfo(
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      category: _parseBadgeCategory(json['category']),
      threshold: json['threshold'] ?? 0,
    );
  }

  static BadgeCategory _parseBadgeCategory(String? category) {
    if (category == null) return BadgeCategory.FORUM;
    switch (category.toUpperCase()) {
      case 'FORUM':
        return BadgeCategory.FORUM;
      case 'JOB_POST':
        return BadgeCategory.JOB_POST;
      case 'JOB_APPLICATION':
        return BadgeCategory.JOB_APPLICATION;
      case 'MENTORSHIP':
        return BadgeCategory.MENTORSHIP;
      default:
        return BadgeCategory.FORUM;
    }
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
    return Badge(
      badgeType: json['badgeType'] ?? json['type'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      category: _parseBadgeCategory(json['category']),
      awardedAt: json['awardedAt'] != null 
          ? DateTime.parse(json['awardedAt']) 
          : null,
      threshold: json['threshold'] ?? 0,
    );
  }

  static BadgeCategory _parseBadgeCategory(String? category) {
    if (category == null) return BadgeCategory.FORUM;
    switch (category.toUpperCase()) {
      case 'FORUM':
        return BadgeCategory.FORUM;
      case 'JOB_POST':
        return BadgeCategory.JOB_POST;
      case 'JOB_APPLICATION':
        return BadgeCategory.JOB_APPLICATION;
      case 'MENTORSHIP':
        return BadgeCategory.MENTORSHIP;
      default:
        return BadgeCategory.FORUM;
    }
  }

  bool get isEarned => awardedAt != null;
}