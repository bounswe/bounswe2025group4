import 'dart:convert';
import 'user.dart';
import 'mentor_review.dart';

class MentorProfile {
  final String id;
  final String username;
  final List<String> expertise;
  final int currentMentees;
  final int maxMentees;
  final double averageRating;
  final int reviewCount;
  final List<MentorReview> reviews;

  /// Derived availability: backend no longer has `isAvailable`,
  /// so we infer it as "has capacity left".
  bool get isAvailable => currentMentees < maxMentees;

  MentorProfile({
    required this.id,
    required this.username,
    required this.expertise,
    required this.currentMentees,
    required this.maxMentees,
    required this.averageRating,
    required this.reviewCount,
    this.reviews = const [],
  });

  factory MentorProfile.fromJson(Map<String, dynamic> json) {
    return MentorProfile(
      id: json['id']?.toString() ?? '',
      username: json['username'] ?? '',
      expertise: (json['expertise'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList() ??
          const [],
      currentMentees: json['currentMentees'] ?? 0,
      maxMentees: json['maxMentees'] ?? 0,
      averageRating: (json['averageRating'] ?? 0.0).toDouble(),
      reviewCount: json['reviewCount'] ?? 0,
      reviews: (json['reviews'] as List<dynamic>?)
          ?.map((e) => MentorReview.fromJson(e))
          .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'expertise': expertise,
      'currentMentees': currentMentees,
      'maxMentees': maxMentees,
      'averageRating': averageRating,
      'reviewCount': reviewCount,
      'reviews': reviews.map((r) => r.toJson()).toList(),
    };
  }
}
