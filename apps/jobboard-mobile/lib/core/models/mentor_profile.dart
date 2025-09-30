import 'dart:convert';
import 'user.dart';

class MentorProfile {
  final int id;
  final User user;
  final int capacity;
  final int currentMenteeCount;
  final double averageRating;
  final int reviewCount;
  final bool isAvailable;

  MentorProfile({
    required this.id,
    required this.user,
    required this.capacity,
    required this.currentMenteeCount,
    required this.averageRating,
    required this.reviewCount,
    required this.isAvailable,
  });

  factory MentorProfile.fromJson(Map<String, dynamic> json) {
    return MentorProfile(
      id: json['id'],
      user: User.fromJson(json['user']),
      capacity: json['capacity'],
      currentMenteeCount: json['currentMenteeCount'],
      averageRating: json['averageRating']?.toDouble() ?? 0.0,
      reviewCount: json['reviewCount'],
      isAvailable: json['isAvailable'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user': user.toJson(),
      'capacity': capacity,
      'currentMenteeCount': currentMenteeCount,
      'averageRating': averageRating,
      'reviewCount': reviewCount,
      'isAvailable': isAvailable,
    };
  }
}
