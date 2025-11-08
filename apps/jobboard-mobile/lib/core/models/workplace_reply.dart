/// Model for workplace review reply
class WorkplaceReply {
  final int id;
  final int reviewId;
  final int employerUserId;
  final String content;
  final DateTime createdAt;
  final DateTime updatedAt;

  WorkplaceReply({
    required this.id,
    required this.reviewId,
    required this.employerUserId,
    required this.content,
    required this.createdAt,
    required this.updatedAt,
  });

  factory WorkplaceReply.fromJson(Map<String, dynamic> json) {
    return WorkplaceReply(
      id: json['id'] as int,
      reviewId: json['reviewId'] as int,
      employerUserId: json['employerUserId'] as int,
      content: json['content'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'reviewId': reviewId,
      'employerUserId': employerUserId,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
