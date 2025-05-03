enum ApplicationStatus { pending, approved, rejected }

/// Represents a job application submitted by a job seeker.
class JobApplication {
  final String id; // Unique ID for the application itself
  final String jobId; // ID of the job applied for
  final String jobTitle;
  final String companyName;
  final String applicantName; // Name of the job seeker who applied
  final ApplicationStatus status;
  final DateTime dateApplied;
  final String?
  employerFeedback; // Optional feedback (Req 1.1.3.7.1, 1.1.3.8.1)

  JobApplication({
    required this.id,
    required this.jobId,
    required this.jobTitle,
    required this.companyName,
    required this.applicantName,
    required this.status,
    required this.dateApplied,
    this.employerFeedback,
  });

  // Factory constructor for JSON parsing
  // Adjust field names based on the actual API response structure
  factory JobApplication.fromJson(Map<String, dynamic> json) {
    print("Attempting to parse JobApplication from JSON: $json"); // Debug print

    // Helper to safely parse date
    DateTime? parseDate(String? dateString) {
      if (dateString == null) return null;
      try {
        return DateTime.parse(dateString);
      } catch (e) {
        print("Error parsing date: $dateString, Error: $e");
        return DateTime.now(); // Default to now if parsing fails, or handle differently
      }
    }

    // Helper to parse status enum
    ApplicationStatus parseStatus(String? statusString) {
      if (statusString == null) return ApplicationStatus.pending; // Default
      try {
        return ApplicationStatus.values.firstWhere(
          (e) => e.name.toLowerCase() == statusString.toLowerCase(),
        );
      } catch (e) {
        print("Error parsing status: $statusString, Error: $e");
        return ApplicationStatus.pending; // Default if status is invalid
      }
    }

    return JobApplication(
      // Assume API returns string IDs, convert if necessary
      id:
          json['id']?.toString() ??
          (throw Exception('Missing required field: id')),
      jobId:
          json['jobId']?.toString() ??
          (throw Exception('Missing required field: jobId')),
      // These fields might come directly from the application endpoint,
      // or you might need separate logic/calls to fetch related job/user details.
      // Adjust the keys ('jobTitle', 'companyName', 'applicantName') as needed.
      jobTitle:
          json['jobTitle'] ?? 'N/A', // Provide default or fetch separately
      companyName:
          json['companyName'] ?? 'N/A', // Provide default or fetch separately
      applicantName:
          json['applicantName'] ?? 'N/A', // Provide default or fetch separately
      status: parseStatus(json['status']),
      dateApplied:
          parseDate(json['dateApplied']) ??
          DateTime.now(), // Use helper and provide default
      employerFeedback: json['employerFeedback'],
    );
  }
}
