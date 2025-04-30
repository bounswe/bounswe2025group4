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

  // Optional: Factory constructor for JSON parsing
  // factory JobApplication.fromJson(Map<String, dynamic> json) { ... }
}
