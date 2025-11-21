import 'dart:convert';
import 'user.dart';

class MentorReview {
  final int id;
  final String mentorUsername;
  final double rating;
  final String? comment;
  final DateTime createdAt;

  MentorReview({
    required this.id,
    required this.mentorUsername,
    required this.rating,
    this.comment,
    required this.createdAt,
  });

  factory MentorReview.fromJson(Map<String, dynamic> json) {
    return MentorReview(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      mentorUsername: json['mentorUsername'] ?? 'Anonymous',
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      comment: json['comment'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'mentorUsername': mentorUsername,
      'rating': rating,
      'comment': comment,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}