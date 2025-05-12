import 'dart:convert';
import 'user.dart';

class MentorReview {
  final int id;
  final User mentor;
  final User mentee;
  final int rating;
  final String? comment;
  final DateTime createdAt;
  final DateTime updatedAt;

  MentorReview({
    required this.id,
    required this.mentor,
    required this.mentee,
    required this.rating,
    this.comment,
    required this.createdAt,
    required this.updatedAt,
  });

  factory MentorReview.fromJson(Map<String, dynamic> json) {
    return MentorReview(
      id: json['id'],
      mentor: User.fromJson(json['mentor']),
      mentee: User.fromJson(json['mentee']),
      rating: json['rating'],
      comment: json['comment'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
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
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
