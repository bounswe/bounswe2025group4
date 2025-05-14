// lib/core/models/experience.dart
class Experience {
  final int id;
  final String company;
  final String position;
  final String? description;
  final String startDate;
  final String? endDate;

  Experience({
    required this.id,
    required this.company,
    required this.position,
    this.description,
    required this.startDate,
    this.endDate,
  });

  factory Experience.fromJson(Map<String, dynamic> json) {
    return Experience(
      id: json['id'],
      company: json['company'],
      position: json['position'],
      description: json['description'],
      startDate: json['startDate'],
      endDate: json['endDate'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'company': company,
      'position': position,
      'description': description,
      'startDate': startDate,
      'endDate': endDate,
    };
  }
}