import 'package:mobile/core/models/user.dart';

class Comment {
  final int id;
  final String body;
  final User author;
  final bool reported;

  Comment({
    required this.id,
    required this.body,
    required this.author,
    required this.reported,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'],
      body: json['body'],
      author: User.fromJson(json['author']),
      reported: json['reported'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'body': body,
      'author': {
        'id': author.id,
        'username': author.username,
        'email': author.email,
        'bio': author.bio ?? '',
        'userType': author.role.name,
        'companyName': author.company ?? '',
        'employerId': author.employerId ?? '',
      },
      'reported': reported,
    };
  }
}
