import 'dart:convert';
import 'user.dart';

class MentorReview {
  final int id;
  final String reviewerUsername;
  final double rating;
  final String? comment;
  final DateTime createdAt;

  MentorReview({
    required this.id,
    required this.reviewerUsername,
    required this.rating,
    this.comment,
    required this.createdAt,
  });

  factory MentorReview.fromJson(Map<String, dynamic> json) {
    return MentorReview(
      id: json['id'] is int
          ? json['id'] as int
          : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      reviewerUsername: json['reviewerUsername'] ?? '',
      rating: (json['rating'] ?? 0.0).toDouble(),
      comment: json['comment'],
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'reviewerUsername': reviewerUsername,
      'rating': rating,
      'comment': comment,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
