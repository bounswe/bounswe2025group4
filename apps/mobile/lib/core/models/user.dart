enum UserRole {
  student,
  employer,
  admin,
}

class Education {
  final String school;
  final String degree;
  final String field;
  final String startDate;
  final String? endDate;

  Education({
    required this.school,
    required this.degree,
    required this.field,
    required this.startDate,
    this.endDate,
  });
}

class Experience {
  final String company;
  final String position;
  final String description;
  final String startDate;
  final String? endDate;

  Experience({
    required this.company,
    required this.position,
    required this.description,
    required this.startDate,
    this.endDate,
  });
}

class UserBadge {
  final String name;
  final String description;
  final String icon;
  final DateTime earnedAt;

  UserBadge({
    required this.name,
    required this.description,
    required this.icon,
    required this.earnedAt,
  });
}

class User {
  final String id;
  final String username;
  final String email;
  final UserRole role;
  final String? fullName;
  final String? phone;
  final String? location;
  final String? occupation;
  final String? bio;
  final String? profilePicture;
  final List<String> skills;
  final List<String> interests;
  final List<Education> education;
  final List<Experience> experience;
  final List<UserBadge> badges;
  final int forumPostCount;
  final bool isMentor;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    this.fullName,
    this.phone,
    this.location,
    this.occupation,
    this.bio,
    this.profilePicture,
    this.skills = const [],
    this.interests = const [],
    this.education = const [],
    this.experience = const [],
    this.badges = const [],
    this.forumPostCount = 0,
    this.isMentor = false,
  });

  User copyWith({
    String? id,
    String? username,
    String? email,
    UserRole? role,
    String? fullName,
    String? phone,
    String? location,
    String? occupation,
    String? bio,
    String? profilePicture,
    List<String>? skills,
    List<String>? interests,
    List<Education>? education,
    List<Experience>? experience,
    List<UserBadge>? badges,
    int? forumPostCount,
    bool? isMentor,
  }) {
    return User(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      role: role ?? this.role,
      fullName: fullName ?? this.fullName,
      phone: phone ?? this.phone,
      location: location ?? this.location,
      occupation: occupation ?? this.occupation,
      bio: bio ?? this.bio,
      profilePicture: profilePicture ?? this.profilePicture,
      skills: skills ?? this.skills,
      interests: interests ?? this.interests,
      education: education ?? this.education,
      experience: experience ?? this.experience,
      badges: badges ?? this.badges,
      forumPostCount: forumPostCount ?? this.forumPostCount,
      isMentor: isMentor ?? this.isMentor,
    );
  }

  // Add factory constructors for JSON parsing later
}
