/// A single forum thread / discussion.
class DiscussionThread {
  final String id;
  final String title;
  final String authorId;
  final String authorName;
  final String authorAvatarUrl;   // if shows avatars
  final String body;
  final List<String> tags;        // e.g. ["Ethics","Contracts"]
  final int likeCount;
  final int commentCount;
  final DateTime createdAt;

  DiscussionThread({
    required this.id,
    required this.title,
    required this.authorId,
    required this.authorName,
    required this.authorAvatarUrl,
    required this.body,
    required this.tags,
    required this.likeCount,
    required this.commentCount,
    required this.createdAt,
  })  : assert(title.length <= 100, 'Title must be at most 100 characters');

// TODO: factory fromJson / toJson when real API is ready
}