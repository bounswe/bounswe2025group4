// lib/core/models/full_profile.dart
import 'profile.dart';
import 'experience.dart';
import 'education.dart';
import 'badge.dart';

class FullProfile {
  final Profile profile;
  final List<Experience> experience;
  final List<Education> education;
  final List<Badge> badges;

  FullProfile({
    required this.profile,
    this.experience = const [],
    this.education = const [],
    this.badges = const [],
  });

  factory FullProfile.fromJson(Map<String, dynamic> json) {
    return FullProfile(
      profile: Profile.fromJson(json['profile']),
      experience: (json['experience'] as List<dynamic>?)
          ?.map((e) => Experience.fromJson(e))
          .toList() ?? [],
      education: (json['education'] as List<dynamic>?)
          ?.map((e) => Education.fromJson(e))
          .toList() ?? [],
      badges: (json['badges'] as List<dynamic>?)
          ?.map((e) => Badge.fromJson(e))
          .toList() ?? [],
    );
  }

  FullProfile copyWith({
    Profile? profile,
    List<Experience>? experience,
    List<Education>? education,
    List<Badge>? badges,
  }) {
    return FullProfile(
      profile: profile ?? this.profile,
      experience: experience ?? this.experience,
      education: education ?? this.education,
      badges: badges ?? this.badges,
    );
  }
}