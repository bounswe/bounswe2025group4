/// Represents a job posting.
class JobPost {
  final String id;
  final String title;
  final String company;
  final String description;
  final List<String> ethicalPolicies; // IDs or names of policies
  final String? salaryRange;
  final String contactInfo;
  final String jobType; // e.g., "Full-time", "Part-time"
  final DateTime datePosted;
  // Add other relevant fields like location, etc.

  JobPost({
    required this.id,
    required this.title,
    required this.company,
    required this.jobType,
    required this.datePosted,
    this.description = '',
    this.ethicalPolicies = const [],
    this.salaryRange,
    this.contactInfo = '',
  });

  // Optional: Factory constructor for JSON parsing
  // factory JobPost.fromJson(Map<String, dynamic> json) {
  //   return JobPost(
  //     id: json['id'],
  //     title: json['title'],
  //     company: json['company'],
  //     jobType: json['jobType'],
  //     datePosted: DateTime.parse(json['datePosted']), // Assuming ISO 8601 format
  //     description: json['description'] ?? '',
  //     ethicalPolicies: List<String>.from(json['ethicalPolicies'] ?? []),
  //     salaryRange: json['salaryRange'],
  //     contactInfo: json['contactInfo'] ?? '',
  //   );
  // }
}
