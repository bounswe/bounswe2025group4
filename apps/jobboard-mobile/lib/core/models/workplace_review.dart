import 'workplace_reply.dart';

/// Model for workplace review
class WorkplaceReview {
  final int id;
  final int workplaceId;
  final int userId;
  final String username;
  final String nameSurname;
  final String title;
  final String content;
  final bool anonymous;
  final int helpfulCount;
  final double overallRating;
  final Map<String, int> ethicalPolicyRatings;
  final WorkplaceReply? reply;
  final DateTime createdAt;
  final DateTime updatedAt;

  WorkplaceReview({
    required this.id,
    required this.workplaceId,
    required this.userId,
    required this.username,
    required this.nameSurname,
    required this.title,
    required this.content,
    required this.anonymous,
    required this.helpfulCount,
    required this.overallRating,
    required this.ethicalPolicyRatings,
    this.reply,
    required this.createdAt,
    required this.updatedAt,
  });

  factory WorkplaceReview.fromJson(Map<String, dynamic> json) {
    return WorkplaceReview(
      id: json['id'] as int? ?? 0,
      workplaceId: json['workplaceId'] as int? ?? 0,
      userId: json['userId'] as int? ?? 0,
      username: json['username'] as String? ?? '',
      nameSurname: json['nameSurname'] as String? ?? '',
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? '',
      anonymous: json['anonymous'] as bool? ?? false,
      helpfulCount: json['helpfulCount'] as int? ?? 0,
      overallRating: (json['overallRating'] as num?)?.toDouble() ?? 0.0,
      ethicalPolicyRatings:
          json['ethicalPolicyRatings'] != null
              ? Map<String, int>.from(
                json['ethicalPolicyRatings'] as Map<String, dynamic>,
              )
              : {},
      reply:
          json['reply'] != null
              ? WorkplaceReply.fromJson(json['reply'] as Map<String, dynamic>)
              : null,
      createdAt: DateTime.parse(
        json['createdAt'] as String? ?? DateTime.now().toIso8601String(),
      ),
      updatedAt: DateTime.parse(
        json['updatedAt'] as String? ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'workplaceId': workplaceId,
      'userId': userId,
      'username': username,
      'nameSurname': nameSurname,
      'title': title,
      'content': content,
      'anonymous': anonymous,
      'helpfulCount': helpfulCount,
      'overallRating': overallRating,
      'ethicalPolicyRatings': ethicalPolicyRatings,
      if (reply != null) 'reply': reply!.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
