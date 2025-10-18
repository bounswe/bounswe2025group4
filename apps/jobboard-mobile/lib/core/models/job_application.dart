enum ApplicationStatus { pending, approved, rejected }

/// Represents a job application submitted by a job seeker.
class JobApplication {
  final String id; // Unique ID for the application itself
  final String jobPostId; // ID of the job post applied for
  final String jobTitle;
  final String companyName;
  final String applicantName; // Name of the job seeker who applied
  final String jobSeekerId; // ID of the job seeker who applied
  final ApplicationStatus status;
  final DateTime dateApplied;
  final String? specialNeeds; // Special needs or requirements
  final String? feedback; // Feedback from employer

  JobApplication({
    required this.id,
    required this.jobPostId,
    required this.jobTitle,
    required this.companyName,
    required this.applicantName,
    required this.jobSeekerId,
    required this.status,
    required this.dateApplied,
    this.specialNeeds,
    this.feedback,
  });

  // Factory constructor for JSON parsing
  // Matches backend API response structure
  factory JobApplication.fromJson(Map<String, dynamic> json) {
    print("Attempting to parse JobApplication from JSON: $json"); // Debug print

    // Helper to safely parse date
    DateTime? parseDate(String? dateString) {
      if (dateString == null) return null;
      try {
        return DateTime.parse(dateString);
      } catch (e) {
        print("Error parsing date: $dateString, Error: $e");
        return DateTime.now(); // Default to now if parsing fails
      }
    }

    // Helper to parse status enum (backend sends UPPERCASE like "PENDING")
    ApplicationStatus parseStatus(String? statusString) {
      if (statusString == null) return ApplicationStatus.pending;
      try {
        return ApplicationStatus.values.firstWhere(
          (e) => e.name.toLowerCase() == statusString.toLowerCase(),
        );
      } catch (e) {
        print("Error parsing status: $statusString, Error: $e");
        return ApplicationStatus.pending;
      }
    }

    return JobApplication(
      id:
          json['id']?.toString() ??
          (throw Exception('Missing required field: id')),
      jobPostId:
          json['jobPostId']?.toString() ??
          (throw Exception('Missing required field: jobPostId')),
      jobTitle: json['title'] ?? 'N/A',
      companyName: json['company'] ?? 'N/A',
      applicantName: json['applicantName'] ?? 'N/A',
      jobSeekerId:
          json['jobSeekerId']?.toString() ??
          (throw Exception('Missing required field: jobSeekerId')),
      status: parseStatus(json['status']),
      dateApplied: parseDate(json['appliedDate']) ?? DateTime.now(),
      specialNeeds: json['specialNeeds'],
      feedback: json['feedback'],
    );
  }
}
