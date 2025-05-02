/// A single comment on a discussion thread.
class Comment {
  final String id;
  final String threadId;
  final String authorId;
  final String authorName;
  final String authorAvatarUrl;
  final String body;
  final DateTime createdAt;

  Comment({
    required this.id,
    required this.threadId,
    required this.authorId,
    required this.authorName,
    required this.authorAvatarUrl,
    required this.body,
    required this.createdAt,
  });

// TODO: factory fromJson / toJson
}