import 'forum_comment.dart';

class ForumPost {
  final int id;
  final String title;
  final String content;
  final int authorId;
  final String authorUsername;
  final List<String> tags;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int commentCount;
  final int upvoteCount;
  final int downvoteCount;
  final List<ForumComment> comments;

  const ForumPost({
    required this.id,
    required this.title,
    required this.content,
    required this.authorId,
    required this.authorUsername,
    required this.tags,
    required this.createdAt,
    required this.updatedAt,
    required this.commentCount,
    required this.upvoteCount,
    required this.downvoteCount,
    required this.comments,
  });

  factory ForumPost.fromJson(Map<String, dynamic> json) {
    return ForumPost(
      id: json['id'] as int,
      title: json['title'] as String,
      content: json['content'] as String,
      authorId: json['authorId'] as int,
      authorUsername: json['authorUsername'] as String,
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
          [],
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      commentCount: json['commentCount'] as int? ?? 0,
      upvoteCount: json['upvoteCount'] as int? ?? 0,
      downvoteCount: json['downvoteCount'] as int? ?? 0,
      comments:
          (json['comments'] as List<dynamic>?)
              ?.map((e) => ForumComment.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'authorId': authorId,
      'authorUsername': authorUsername,
      'tags': tags,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'commentCount': commentCount,
      'upvoteCount': upvoteCount,
      'downvoteCount': downvoteCount,
      'comments': comments.map((c) => c.toJson()).toList(),
    };
  }

  ForumPost copyWith({
    int? id,
    String? title,
    String? content,
    int? authorId,
    String? authorUsername,
    List<String>? tags,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? commentCount,
    int? upvoteCount,
    int? downvoteCount,
    List<ForumComment>? comments,
  }) {
    return ForumPost(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      authorId: authorId ?? this.authorId,
      authorUsername: authorUsername ?? this.authorUsername,
      tags: tags ?? this.tags,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      commentCount: commentCount ?? this.commentCount,
      upvoteCount: upvoteCount ?? this.upvoteCount,
      downvoteCount: downvoteCount ?? this.downvoteCount,
      comments: comments ?? this.comments,
    );
  }
}
