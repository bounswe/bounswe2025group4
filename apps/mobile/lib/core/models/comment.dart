import 'package:mobile/core/models/user.dart';

class Comment {
  final int id;
  final String body;
  final User author;
  final bool reported;
  final DateTime createdAt;
  final DateTime? editedAt;

  const Comment({
    required this.id,
    required this.body,
    required this.author,
    required this.reported,
    required this.createdAt,
    this.editedAt,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'],
      body: json['body'],
      author: User.fromJson(json['author']),
      reported: json['reported'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      editedAt: json['editedAt'] != null
          ? DateTime.parse(json['editedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'body': body,
      'author': author.toJson(),
      'reported': reported,
      'createdAt': createdAt.toIso8601String(),
      if (editedAt != null) 'editedAt': editedAt!.toIso8601String(),
    };
  }

  Comment copyWith({
    int? id,
    String? body,
    User? author,
    bool? reported,
    DateTime? createdAt,
    DateTime? editedAt,
  }) {
    return Comment(
      id: id ?? this.id,
      body: body ?? this.body,
      author: author ?? this.author,
      reported: reported ?? this.reported,
      createdAt: createdAt ?? this.createdAt,
      editedAt: editedAt ?? this.editedAt,
    );
  }
}