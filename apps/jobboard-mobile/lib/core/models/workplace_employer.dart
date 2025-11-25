/// Model for workplace employer information
class WorkplaceEmployer {
  final int userId;
  final String username;
  final String email;
  final String role; // OWNER or MANAGER
  final DateTime joinedAt;

  WorkplaceEmployer({
    required this.userId,
    required this.username,
    required this.email,
    required this.role,
    required this.joinedAt,
  });

  factory WorkplaceEmployer.fromJson(Map<String, dynamic> json) {
    return WorkplaceEmployer(
      userId: json['userId'] as int,
      username: json['username'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      joinedAt: DateTime.parse(json['joinedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'username': username,
      'email': email,
      'role': role,
      'joinedAt': joinedAt.toIso8601String(),
    };
  }
}
