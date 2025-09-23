// lib/core/models/education.dart
class Education {
  final int id;
  final String school;
  final String degree;
  final String field;
  final String startDate;
  final String? endDate;

  Education({
    required this.id,
    required this.school,
    required this.degree,
    required this.field,
    required this.startDate,
    this.endDate,
  });

  factory Education.fromJson(Map<String, dynamic> json) {
    return Education(
      id: json['id'],
      school: json['school'],
      degree: json['degree'],
      field: json['field'],
      startDate: json['startDate'],
      endDate: json['endDate'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'school': school,
      'degree': degree,
      'field': field,
      'startDate': startDate,
      'endDate': endDate,
    };
  }
}