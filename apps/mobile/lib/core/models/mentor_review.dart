import 'dart:convert';
import 'user.dart';

class MentorReview {
  final int id;
  final User mentor;
  final User mentee;
  final int rating;
  final String? comment;
  final DateTime createdAt;
  final DateTime? updatedAt;

  MentorReview({
    required this.id,
    required this.mentor,
    required this.mentee,
    required this.rating,
    this.comment,
    required this.createdAt,
    this.updatedAt,
  });

  factory MentorReview.fromJson(Map<String, dynamic> json) {
    return MentorReview(
      id: json['id'] as int,
      mentor: User.fromJson(json['mentor'] as Map<String, dynamic>),
      mentee: User.fromJson(json['mentee'] as Map<String, dynamic>),
      rating: json['rating'] as int,
      comment: json['comment'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt:
          json['updatedAt'] == null
              ? null
              : DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'mentor': mentor,
      'mentee': mentee,
      'rating': rating,
      'comment': comment,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}
