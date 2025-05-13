import 'dart:convert';

/// Model representing a discussion thread.
class DiscussionThread {
  /// Unique identifier of the thread
  final int id;

  /// Thread title
  final String title;

  /// Thread body/content
  final String body;

  /// ID of the user who created the thread
  final String creatorId;

  final String creatorUsername;

  /// List of tags associated with the thread
  final List<String> tags;

  /// Whether this thread has been reported
  final bool reported;

  /// Number of comments on this thread
  final int commentCount;

  /// When the thread was created
  final DateTime createdAt;

  /// When the thread was last edited (can be null)
  final DateTime? editedAt;

  const DiscussionThread({
    required this.id,
    required this.title,
    required this.body,
    required this.creatorId,
    required this.creatorUsername,
    required this.tags,
    required this.reported,
    this.commentCount = 0,
    required this.createdAt,
    this.editedAt,
  });

  /// Creates a new Thread object from a JSON map
  factory DiscussionThread.fromJson(Map<String, dynamic> json) {
    return DiscussionThread(
      id: json['id'] as int,
      title: json['title'] as String,
      body: json['body'] as String,
      creatorId: json['creatorId'].toString(),
      creatorUsername: json['creatorUsername'].toString(),
      tags: (json['tags'] as List<dynamic>).cast<String>(),
      reported: json['reported'] as bool,
      commentCount: json['commentCount'] as int? ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      editedAt: json['editedAt'] != null
          ? DateTime.parse(json['editedAt'] as String)
          : null,
    );
  }

  /// Converts this object into a JSON-serializable map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'creatorId': creatorId,
      'creatorUsername': creatorUsername,
      'tags': tags,
      'reported': reported,
      'commentCount': commentCount,
      'createdAt': createdAt.toIso8601String(),
      if (editedAt != null) 'editedAt': editedAt!.toIso8601String(),
    };
  }

  /// Creates a copy of this thread with updated fields
  DiscussionThread copyWith({
    int? id,
    String? title,
    String? body,
    String? creatorId,
    String? creatorUsername,
    List<String>? tags,
    bool? reported,
    int? commentCount,
    DateTime? createdAt,
    DateTime? editedAt,
  }) {
    return DiscussionThread(
      id: id ?? this.id,
      title: title ?? this.title,
      body: body ?? this.body,
      creatorId: creatorId ?? this.creatorId,
      creatorUsername: creatorUsername ?? this.creatorUsername,
      tags: tags ?? this.tags,
      reported: reported ?? this.reported,
      commentCount: commentCount ?? this.commentCount,
      createdAt: createdAt ?? this.createdAt,
      editedAt: editedAt ?? this.editedAt,
    );
  }

  @override
  String toString() => jsonEncode(toJson());
}