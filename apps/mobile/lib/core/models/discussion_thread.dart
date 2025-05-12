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

  /// List of tags associated with the thread
  final List<String> tags;

  /// Whether this thread has been reported
  final bool reported;

  DiscussionThread({
    required this.id,
    required this.title,
    required this.body,
    required this.creatorId,
    required this.tags,
    required this.reported,
  });

  /// Creates a new Thread object from a JSON map
  factory DiscussionThread.fromJson(Map<String, dynamic> json) {
    return DiscussionThread(
      id: json['id'] as int,
      title: json['title'] as String,
      body: json['body'] as String,
      creatorId: json['creatorId'].toString(),
      tags: (json['tags'] as List<dynamic>).cast<String>(),
      reported: json['reported'] as bool,
    );
  }

  /// Converts this object into a JSON-serializable map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'creatorId': creatorId,
      'tags': tags,
      'reported': reported,
    };
  }

  @override
  String toString() => jsonEncode(toJson());
}