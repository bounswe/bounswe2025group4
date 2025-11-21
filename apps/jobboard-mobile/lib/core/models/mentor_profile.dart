import 'dart:convert';
import 'user.dart';
import 'mentor_review.dart';

class MentorProfile {
  final String id; // Using String to be safe with int64/string discrepancies
  final String username;
  final List<String> expertise;
  final int currentMentees;
  final int maxMentees;
  final double averageRating;
  final int reviewCount;
  final List<MentorReview> reviews;

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

  // Helper to determine availability locally since API removed the boolean flag
  bool get isAvailable => currentMentees < maxMentees;

  factory MentorProfile.fromJson(Map<String, dynamic> json) {
    var expertiseList = <String>[];
    if (json['expertise'] != null) {
      expertiseList = List<String>.from(json['expertise']);
    }

    var reviewsList = <MentorReview>[];
    if (json['reviews'] != null) {
      reviewsList = (json['reviews'] as List)
          .map((i) => MentorReview.fromJson(i))
          .toList();
    }

    return MentorProfile(
      id: json['id']?.toString() ?? '',
      username: json['username'] ?? '',
      expertise: expertiseList,
      currentMentees: json['currentMentees'] ?? 0,
      maxMentees: json['maxMentees'] ?? 0,
      averageRating: (json['averageRating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: json['reviewCount'] ?? 0,
      reviews: reviewsList,
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