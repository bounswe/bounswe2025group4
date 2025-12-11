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
  final String fullName;
  final String? bio;
  final String? profilePicture;
  final List<String> skills;
  final List<String> interests;

  FullProfile({
    required this.profile,
    this.experience = const [],
    this.education = const [],
    this.badges = const [],
    this.fullName = '',
    this.bio,
    this.profilePicture,
    this.skills = const [],
    this.interests = const [],
  });

  factory FullProfile.fromJson(Map<String, dynamic> json) {
    return FullProfile(
      profile: Profile.fromJson(json), 
      experience: (json['experiences'] as List<dynamic>?) 
          ?.map((e) => Experience.fromJson(e))
          .toList() ?? [],
      education: (json['educations'] as List<dynamic>?) 
          ?.map((e) => Education.fromJson(e))
          .toList() ?? [],
      badges: (json['badges'] as List<dynamic>?)
          ?.map((e) => Badge.fromJson(e))
          .toList() ?? [],
      fullName: json['fullName'] ?? '',
      bio: json['bio'],
      profilePicture: json['profilePicture'],
      skills: (json['skills'] as List<dynamic>?)?.cast<String>() ?? [],
      interests: (json['interests'] as List<dynamic>?)?.cast<String>() ?? [],
    );
  }

  FullProfile copyWith({
    Profile? profile,
    List<Experience>? experience,
    List<Education>? education,
    List<Badge>? badges,
    String? fullName,
    String? bio,
    String? profilePicture,
    List<String>? skills,
    List<String>? interests,
  }) {
    return FullProfile(
      profile: profile ?? this.profile,
      experience: experience ?? this.experience,
      education: education ?? this.education,
      badges: badges ?? this.badges,
      fullName: fullName ?? this.fullName,
      bio: bio ?? this.bio,
      profilePicture: profilePicture ?? this.profilePicture,
      skills: skills ?? this.skills,
      interests: interests ?? this.interests,
    );
  }
}