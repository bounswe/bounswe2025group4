// lib/core/models/badge.dart
class Badge {
  final int id;
  final String name;
  final String description;
  final String icon;
  final String earnedAt;

  Badge({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.earnedAt,
  });

  factory Badge.fromJson(Map<String, dynamic> json) {
    return Badge(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      icon: json['icon'],
      earnedAt: json['earnedAt'],
    );
  }
}