class ForumComment {
  final int id;
  final String content;
  final int authorId;
  final String authorUsername;
  final int postId;
  final int? parentCommentId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int upvoteCount;
  final int downvoteCount;

  const ForumComment({
    required this.id,
    required this.content,
    required this.authorId,
    required this.authorUsername,
    required this.postId,
    this.parentCommentId,
    required this.createdAt,
    required this.updatedAt,
    required this.upvoteCount,
    required this.downvoteCount,
  });

  factory ForumComment.fromJson(Map<String, dynamic> json) {
    return ForumComment(
      id: json['id'] as int,
      content: json['content'] as String,
      authorId: json['authorId'] as int,
      authorUsername: json['authorUsername'] as String,
      postId: json['postId'] as int,
      parentCommentId: json['parentCommentId'] as int?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      upvoteCount: json['upvoteCount'] as int? ?? 0,
      downvoteCount: json['downvoteCount'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'authorId': authorId,
      'authorUsername': authorUsername,
      'postId': postId,
      if (parentCommentId != null) 'parentCommentId': parentCommentId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'upvoteCount': upvoteCount,
      'downvoteCount': downvoteCount,
    };
  }

  ForumComment copyWith({
    int? id,
    String? content,
    int? authorId,
    String? authorUsername,
    int? postId,
    int? parentCommentId,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? upvoteCount,
    int? downvoteCount,
  }) {
    return ForumComment(
      id: id ?? this.id,
      content: content ?? this.content,
      authorId: authorId ?? this.authorId,
      authorUsername: authorUsername ?? this.authorUsername,
      postId: postId ?? this.postId,
      parentCommentId: parentCommentId ?? this.parentCommentId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      upvoteCount: upvoteCount ?? this.upvoteCount,
      downvoteCount: downvoteCount ?? this.downvoteCount,
    );
  }
}
