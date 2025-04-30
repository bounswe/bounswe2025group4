import '../models/job_post.dart'; // Adjust path if needed
import '../models/job_application.dart'; // Import the new model
import 'package:http/http.dart' as http;
import 'dart:convert'; // Needed for actual API call example

// Define ethical policies and job types (could come from API later)
const List<String> _availableEthicalPolicies = [
  'fair_wage',
  'diversity',
  'sustainability',
  'wellbeing',
  'transparency',
];
const List<String> _availableJobTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
];

/// Placeholder service for API interactions.
/// Replace with actual HTTP calls to your backend.
class ApiService {
  // Expose available filters
  List<String> get availableEthicalPolicies => _availableEthicalPolicies;
  List<String> get availableJobTypes => _availableJobTypes;

  /// Fetches job postings based on query and filters.
  Future<List<JobPost>> fetchJobPostings({
    String? query,
    Map<String, List<String>>? filters, // Changed to Map
  }) async {
    print('API: Fetching job postings (query: $query, filters: $filters)');
    await Future.delayed(const Duration(seconds: 1)); // Simulate network delay

    final List<String>? policyFilters = filters?['policies'];
    final List<String>? jobTypeFilters = filters?['jobTypes'];

    // --- Placeholder Data --- (Replace with actual API call)
    final List<JobPost> allJobs = [
      JobPost(
        id: '1',
        title: 'Software Engineer',
        company: 'Ethical Corp',
        jobType: 'Full-time',
        datePosted: DateTime.now().subtract(const Duration(days: 2)),
        ethicalPolicies: ['fair_wage', 'diversity'],
        salaryRange: '\$80k - \$100k',
        contactInfo: 'hr@ethical.com',
      ),
      JobPost(
        id: '2',
        title: 'UX Designer',
        company: 'Green Tech',
        jobType: 'Full-time',
        datePosted: DateTime.now().subtract(const Duration(days: 5)),
        ethicalPolicies: ['sustainability', 'wellbeing'],
        salaryRange: '\$70k - \$90k',
        contactInfo: 'careers@green.tech',
      ),
      JobPost(
        id: '3',
        title: 'Data Analyst',
        company: 'Fair Solutions',
        jobType: 'Part-time',
        datePosted: DateTime.now().subtract(const Duration(days: 1)),
        ethicalPolicies: ['fair_wage'],
        contactInfo: 'jobs@fair.co',
      ),
      JobPost(
        id: '4',
        title: 'Marketing Specialist',
        company: 'Ethical Corp',
        jobType: 'Full-time',
        datePosted: DateTime.now().subtract(const Duration(hours: 10)),
        ethicalPolicies: ['fair_wage', 'diversity'],
        salaryRange: '\$60k - \$75k',
        contactInfo: 'hr@ethical.com',
      ),
      JobPost(
        id: '5',
        title: 'Project Manager',
        company: 'Green Tech',
        jobType: 'Contract',
        datePosted: DateTime.now().subtract(const Duration(days: 7)),
        ethicalPolicies: ['sustainability'],
        contactInfo: 'pm@green.tech',
      ),
      JobPost(
        id: '6',
        title: 'Frontend Intern',
        company: 'Fair Solutions',
        jobType: 'Internship',
        datePosted: DateTime.now().subtract(const Duration(days: 3)),
        ethicalPolicies: ['fair_wage', 'transparency'],
        contactInfo: 'intern@fair.co',
      ),
    ];

    // Simulate filtering/searching
    List<JobPost> filteredJobs = allJobs;
    if (query != null && query.isNotEmpty) {
      filteredJobs =
          filteredJobs
              .where(
                (job) =>
                    job.title.toLowerCase().contains(query.toLowerCase()) ||
                    job.company.toLowerCase().contains(query.toLowerCase()),
              )
              .toList();
    }
    // Filter by ethical policies
    if (policyFilters != null && policyFilters.isNotEmpty) {
      filteredJobs =
          filteredJobs
              .where(
                (job) => policyFilters.every(
                  (filter) => job.ethicalPolicies.contains(filter),
                ),
              )
              .toList();
    }
    // Filter by job type
    if (jobTypeFilters != null && jobTypeFilters.isNotEmpty) {
      filteredJobs =
          filteredJobs
              .where((job) => jobTypeFilters.contains(job.jobType))
              .toList();
    }

    // Simulate potential API error
    // if (query == 'error') { throw Exception('Failed to fetch jobs from API'); }

    return filteredJobs;
    // --- End Placeholder Data ---

    /* --- Actual API Call Example (using http package) ---
    final uri = Uri.parse('YOUR_API_ENDPOINT/jobs');
    final queryParams = <String, dynamic>{}; // Use dynamic for list values
    if (query != null) queryParams['search'] = query;
    if (policyFilters != null && policyFilters.isNotEmpty) queryParams['policies'] = policyFilters; // Pass list directly
    if (jobTypeFilters != null && jobTypeFilters.isNotEmpty) queryParams['jobTypes'] = jobTypeFilters; // Pass list directly

    // Adjust URI encoding based on how your backend expects list parameters
    // Example: using Uri.https with queryParametersAll for lists
    // final finalUri = Uri.https('your.api.domain', '/jobs', queryParams);
    final finalUri = uri.replace(queryParameters: queryParams.map((k, v) => MapEntry(k, v.toString()))); // Simple toString, backend needs to parse

    try {
      final response = await http.get(finalUri, headers: {'Accept': 'application/json'});
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => JobPost.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load jobs: ${response.statusCode} ${response.reasonPhrase}');
      }
    } catch (e) {
      print("API Error fetching jobs: $e");
      throw Exception('Failed to connect to the server.');
    }
    */
  }

  /// Fetches job postings created by a specific employer.
  Future<List<JobPost>> fetchEmployerJobPostings(String employerId) async {
    print('API: Fetching job postings for employer $employerId');
    await Future.delayed(const Duration(seconds: 1)); // Simulate network delay

    // --- Placeholder Data --- (Replace with actual API call)
    List<JobPost> employerJobs = [
      JobPost(
        id: '1',
        title: 'Software Engineer',
        company: 'Ethical Corp',
        jobType: 'Full-time',
        datePosted: DateTime.now().subtract(const Duration(days: 2)),
        ethicalPolicies: ['fair_wage', 'diversity'],
        salaryRange: '\$80k - \$100k',
        contactInfo: 'hr@ethical.com',
      ),
      JobPost(
        id: '4',
        title: 'Marketing Specialist',
        company: 'Ethical Corp',
        jobType: 'Full-time',
        datePosted: DateTime.now().subtract(const Duration(hours: 10)),
        ethicalPolicies: ['fair_wage', 'diversity'],
        salaryRange: '\$60k - \$75k',
        contactInfo: 'hr@ethical.com',
      ),
    ];
    // Filter just in case (though API should do this)
    // employerJobs = employerJobs.where((job) => job.employerId == employerId).toList();
    return employerJobs;
    // --- End Placeholder Data ---

    /* --- Actual API Call Example ---
    final uri = Uri.parse('YOUR_API_ENDPOINT/employers/$employerId/jobs');
    try {
      final response = await http.get(uri, headers: {'Accept': 'application/json'});
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => JobPost.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load employer jobs: ${response.statusCode} ${response.reasonPhrase}');
      }
    } catch (e) {
      print("API Error fetching employer jobs: $e");
      throw Exception('Failed to connect to the server.');
    }
    */
  }

  /// Fetches the current user's job applications.
  Future<List<JobApplication>> fetchMyApplications(String userId) async {
    print('API: Fetching applications for user $userId');
    await Future.delayed(const Duration(seconds: 1)); // Simulate network delay

    // --- Placeholder Data --- (Replace with actual API call)
    final List<JobApplication> myApplications = [
      JobApplication(
        id: 'app1',
        jobId: '1',
        jobTitle: 'Software Engineer',
        companyName: 'Ethical Corp',
        applicantName: 'Current User',
        status: ApplicationStatus.pending,
        dateApplied: DateTime.now().subtract(const Duration(days: 1)),
      ),
      JobApplication(
        id: 'app2',
        jobId: '3',
        jobTitle: 'Data Analyst',
        companyName: 'Fair Solutions',
        applicantName: 'Current User',
        status: ApplicationStatus.approved,
        dateApplied: DateTime.now().subtract(const Duration(days: 4)),
        employerFeedback: 'Good fit for the team!',
      ),
      JobApplication(
        id: 'app3',
        jobId: '5',
        jobTitle: 'Project Manager',
        companyName: 'Green Tech',
        applicantName: 'Current User',
        status: ApplicationStatus.rejected,
        dateApplied: DateTime.now().subtract(const Duration(days: 6)),
        employerFeedback: 'Lacking specific certifications.',
      ),
    ];
    return myApplications;
    // --- End Placeholder Data ---

    /* --- Actual API Call Example ---
    final uri = Uri.parse('YOUR_API_ENDPOINT/users/$userId/applications');
    try {
      // Assume authentication token is handled via interceptors or secure storage
      final response = await http.get(uri, headers: {'Accept': 'application/json'});
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        // Assuming JobApplication has a .fromJson factory
        return data.map((json) => JobApplication.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load applications: ${response.statusCode} ${response.reasonPhrase}');
      }
    } catch (e) {
      print("API Error fetching applications: $e");
      throw Exception('Failed to connect to the server.');
    }
    */
  }

  /// Fetches details for a specific job posting.
  Future<JobPost> getJobDetails(String jobId) async {
    print('API: Fetching details for job $jobId');
    await Future.delayed(const Duration(milliseconds: 500)); // Simulate delay

    // --- Placeholder Data --- (Replace with actual API call)
    // Find the job in the placeholder list (or fetch directly in real API)
    final allJobs = _getPlaceholderJobs(); // Use a helper to avoid repetition
    try {
      final job = allJobs.firstWhere((j) => j.id == jobId);
      // Add a description if missing for the placeholder
      return JobPost(
        id: job.id,
        title: job.title,
        company: job.company,
        jobType: job.jobType,
        datePosted: job.datePosted,
        ethicalPolicies: job.ethicalPolicies,
        salaryRange: job.salaryRange,
        contactInfo: job.contactInfo,
        description:
            job.description.isEmpty
                ? 'This is a detailed description for ${job.title} at ${job.company}. It involves various tasks and requires specific skills. Apply now!'
                : job.description,
      );
    } catch (e) {
      // Simulate not found
      throw Exception('Job with ID $jobId not found.');
    }
    // --- End Placeholder Data ---

    /* --- Actual API Call Example ---
    final uri = Uri.parse('YOUR_API_ENDPOINT/jobs/$jobId');
    try {
      final response = await http.get(uri, headers: {'Accept': 'application/json'});
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        // Assuming JobPost has a .fromJson factory
        return JobPost.fromJson(data);
      } else if (response.statusCode == 404) {
         throw Exception('Job with ID $jobId not found.');
      } else {
        throw Exception('Failed to load job details: ${response.statusCode} ${response.reasonPhrase}');
      }
    } catch (e) {
      print("API Error fetching job details: $e");
      throw Exception('Failed to connect to the server.');
    }
    */
  }

  /// Submits a job application for the user.
  Future<void> applyToJob(String userId, String jobId) async {
    print('API: User $userId applying to job $jobId');
    await Future.delayed(const Duration(seconds: 1)); // Simulate network delay

    // --- Placeholder Logic --- (Replace with actual API call)
    // Simulate success or potential failure
    if (jobId == 'error') {
      // Example failure case
      throw Exception('Failed to submit application for job $jobId');
    }
    // Simulate success
    print('API: Application successful for job $jobId');
    return;
    // --- End Placeholder Logic ---

    /* --- Actual API Call Example ---
    final uri = Uri.parse('YOUR_API_ENDPOINT/applications');
    try {
       final response = await http.post(
         uri,
         headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Accept': 'application/json',
            // Add Authorization header if needed
         },
         body: jsonEncode(<String, String>{
           'userId': userId,
           'jobId': jobId,
           // Include other application details if necessary (e.g., resumeId)
         }),
       );

       if (response.statusCode == 201 || response.statusCode == 200) { // 201 Created or 200 OK
          print('API: Application successful for job $jobId');
          return;
       } else {
         // Try to parse error message from backend if available
         String errorMessage = 'Failed to submit application: ${response.statusCode} ${response.reasonPhrase}';
         try {
            final body = jsonDecode(response.body);
            if (body['message'] != null) {
              errorMessage = body['message'];
            }
         } catch (_) { /* Ignore parsing errors */ }
         throw Exception(errorMessage);
       }
    } catch (e) {
      print("API Error applying to job: $e");
      throw Exception('Failed to connect to the server.');
    }
    */
  }

  // Helper to get placeholder jobs list (to reduce repetition)
  List<JobPost> _getPlaceholderJobs() {
    return [
      JobPost(
        id: '1',
        title: 'Software Engineer',
        company: 'Ethical Corp',
        jobType: 'Full-time',
        datePosted: DateTime.now().subtract(const Duration(days: 2)),
        ethicalPolicies: ['fair_wage', 'diversity'],
        salaryRange: '\$80k - \$100k',
        contactInfo: 'hr@ethical.com',
        description: 'Develop cutting-edge software.',
      ),
      JobPost(
        id: '2',
        title: 'UX Designer',
        company: 'Green Tech',
        jobType: 'Full-time',
        datePosted: DateTime.now().subtract(const Duration(days: 5)),
        ethicalPolicies: ['sustainability', 'wellbeing'],
        salaryRange: '\$70k - \$90k',
        contactInfo: 'careers@green.tech',
        description: 'Design user-friendly interfaces.',
      ),
      JobPost(
        id: '3',
        title: 'Data Analyst',
        company: 'Fair Solutions',
        jobType: 'Part-time',
        datePosted: DateTime.now().subtract(const Duration(days: 1)),
        ethicalPolicies: ['fair_wage'],
        contactInfo: 'jobs@fair.co',
        description: 'Analyze and interpret data.',
      ),
      JobPost(
        id: '4',
        title: 'Marketing Specialist',
        company: 'Ethical Corp',
        jobType: 'Full-time',
        datePosted: DateTime.now().subtract(const Duration(hours: 10)),
        ethicalPolicies: ['fair_wage', 'diversity'],
        salaryRange: '\$60k - \$75k',
        contactInfo: 'hr@ethical.com',
        description: 'Promote products and services.',
      ),
      JobPost(
        id: '5',
        title: 'Project Manager',
        company: 'Green Tech',
        jobType: 'Contract',
        datePosted: DateTime.now().subtract(const Duration(days: 7)),
        ethicalPolicies: ['sustainability'],
        contactInfo: 'pm@green.tech',
        description: 'Manage projects and resources.',
      ),
      JobPost(
        id: '6',
        title: 'Frontend Intern',
        company: 'Fair Solutions',
        jobType: 'Internship',
        datePosted: DateTime.now().subtract(const Duration(days: 3)),
        ethicalPolicies: ['fair_wage', 'transparency'],
        contactInfo: 'intern@fair.co',
        description: 'Gain practical experience.',
      ),
    ];
  }

  /// Fetches applications for a specific job posting.
  Future<List<JobApplication>> getApplicationsForJob(String jobId) async {
    print('API: Fetching applications for job $jobId');
    await Future.delayed(const Duration(milliseconds: 700)); // Simulate delay

    // --- Placeholder Data --- (Replace with actual API call)
    // This would typically filter applications based on jobId on the backend
    final List<JobApplication> allKnownApplications = [
      JobApplication(
        id: 'app1',
        jobId: '1',
        jobTitle: 'Software Engineer',
        companyName: 'Ethical Corp',
        applicantName: 'Alice Smith',
        status: ApplicationStatus.pending,
        dateApplied: DateTime.now().subtract(const Duration(days: 1)),
      ),
      JobApplication(
        id: 'app4',
        jobId: '1',
        jobTitle: 'Software Engineer',
        companyName: 'Ethical Corp',
        applicantName: 'Bob Johnson',
        status: ApplicationStatus.pending,
        dateApplied: DateTime.now().subtract(const Duration(hours: 5)),
      ),
      JobApplication(
        id: 'app5',
        jobId: '4',
        jobTitle: 'Marketing Specialist',
        companyName: 'Ethical Corp',
        applicantName: 'Charlie Brown',
        status: ApplicationStatus.approved,
        dateApplied: DateTime.now().subtract(const Duration(days: 2)),
        employerFeedback: 'Great portfolio!',
      ),
      JobApplication(
        id: 'app6',
        jobId: '4',
        jobTitle: 'Marketing Specialist',
        companyName: 'Ethical Corp',
        applicantName: 'Diana Prince',
        status: ApplicationStatus.rejected,
        dateApplied: DateTime.now().subtract(const Duration(days: 3)),
        employerFeedback: 'Not enough experience.',
      ),
      // Add more placeholders as needed
    ];
    // Filter placeholder data by jobId
    return allKnownApplications.where((app) => app.jobId == jobId).toList();
    // --- End Placeholder Data ---

    /* --- Actual API Call Example ---
    final uri = Uri.parse('YOUR_API_ENDPOINT/jobs/$jobId/applications');
    try {
      // Assume employer authentication is handled
      final response = await http.get(uri, headers: {'Accept': 'application/json'});
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => JobApplication.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load applications for job $jobId: ${response.statusCode} ${response.reasonPhrase}');
      }
    } catch (e) {
      print("API Error fetching job applications: $e");
      throw Exception('Failed to connect to the server.');
    }
    */
  }

  /// Updates the status of a job application (Approve/Reject).
  Future<JobApplication> updateApplicationStatus(
    String applicationId,
    ApplicationStatus newStatus, {
    String? feedback, // Optional feedback
  }) async {
    print(
      'API: Updating application $applicationId to $newStatus with feedback: \"$feedback\"',
    );
    await Future.delayed(const Duration(seconds: 1)); // Simulate network delay

    // --- Placeholder Logic --- (Replace with actual API call)
    // Simulate success: find the application and return an updated version
    // In a real scenario, the backend would update and return the updated application
    final List<JobApplication> allKnownApplications = [
      JobApplication(
        id: 'app1',
        jobId: '1',
        jobTitle: 'Software Engineer',
        companyName: 'Ethical Corp',
        applicantName: 'Alice Smith',
        status: ApplicationStatus.pending,
        dateApplied: DateTime.now().subtract(const Duration(days: 1)),
      ),
      JobApplication(
        id: 'app4',
        jobId: '1',
        jobTitle: 'Software Engineer',
        companyName: 'Ethical Corp',
        applicantName: 'Bob Johnson',
        status: ApplicationStatus.pending,
        dateApplied: DateTime.now().subtract(const Duration(hours: 5)),
      ),
      JobApplication(
        id: 'app5',
        jobId: '4',
        jobTitle: 'Marketing Specialist',
        companyName: 'Ethical Corp',
        applicantName: 'Charlie Brown',
        status: ApplicationStatus.approved,
        dateApplied: DateTime.now().subtract(const Duration(days: 2)),
        employerFeedback: 'Great portfolio!',
      ),
      JobApplication(
        id: 'app6',
        jobId: '4',
        jobTitle: 'Marketing Specialist',
        companyName: 'Ethical Corp',
        applicantName: 'Diana Prince',
        status: ApplicationStatus.rejected,
        dateApplied: DateTime.now().subtract(const Duration(days: 3)),
        employerFeedback: 'Not enough experience.',
      ),
    ];
    try {
      final originalApp = allKnownApplications.firstWhere(
        (app) => app.id == applicationId,
      );
      // Return a copy with the updated status and feedback
      return JobApplication(
        id: originalApp.id,
        jobId: originalApp.jobId,
        jobTitle: originalApp.jobTitle,
        companyName: originalApp.companyName,
        applicantName: originalApp.applicantName,
        dateApplied: originalApp.dateApplied,
        status: newStatus,
        employerFeedback: feedback ?? originalApp.employerFeedback,
      );
    } catch (e) {
      throw Exception(
        'Application with ID $applicationId not found for update.',
      );
    }
    // --- End Placeholder Logic ---

    /* --- Actual API Call Example ---
    final uri = Uri.parse('YOUR_API_ENDPOINT/applications/$applicationId/status');
    try {
      final body = <String, dynamic>{
        'status': newStatus.toString().split('.').last, // e.g., 'approved'
      };
      if (feedback != null && feedback.isNotEmpty) {
        body['feedback'] = feedback;
      }

      final response = await http.patch( // Or PUT
        uri,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Accept': 'application/json',
          // Add Authorization header
        },
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
         print('API: Application $applicationId status updated successfully.');
         final Map<String, dynamic> data = jsonDecode(response.body);
         return JobApplication.fromJson(data); // Return the updated application
      } else {
        String errorMessage = 'Failed to update application status: ${response.statusCode} ${response.reasonPhrase}';
        try {
            final body = jsonDecode(response.body);
            if (body['message'] != null) { errorMessage = body['message']; }
        } catch (_) { /* Ignore parsing errors */ }
        throw Exception(errorMessage);
      }
    } catch (e) {
      print("API Error updating application status: $e");
      throw Exception('Failed to connect to the server.');
    }
    */
  }

  /// Creates a new job posting.
  Future<JobPost> createJobPost({
    required String employerId,
    required String title,
    required String description,
    required String contactInfo,
    required String jobType,
    required List<String> ethicalPolicies,
    String? salaryRange,
    // Assume company name is fetched from employer profile or passed
    required String companyName,
  }) async {
    print('API: Creating job post by $employerId - Title: $title');
    await Future.delayed(const Duration(seconds: 1)); // Simulate network delay

    // --- Placeholder Logic --- (Replace with actual API call)
    // Simulate success: create a new JobPost object with a dummy ID
    if (title.toLowerCase().contains('fail')) {
      // Example failure case
      throw Exception(
        'Backend validation failed: Title cannot contain \'fail\'.',
      );
    }

    final newJob = JobPost(
      // Generate a dummy ID for the placeholder
      id: 'newJob_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      description: description,
      contactInfo: contactInfo,
      jobType: jobType,
      ethicalPolicies: ethicalPolicies,
      salaryRange: salaryRange?.isNotEmpty ?? false ? salaryRange : null,
      company: companyName, // Replace with actual company if needed
      datePosted: DateTime.now(),
    );
    print('API: Job post created successfully (placeholder ID: ${newJob.id})');
    return newJob;
    // --- End Placeholder Logic ---

    /* --- Actual API Call Example ---
    final uri = Uri.parse('YOUR_API_ENDPOINT/jobs');
    try {
      final body = <String, dynamic>{
        'employerId': employerId,
        'title': title,
        'description': description,
        'contactInfo': contactInfo,
        'jobType': jobType,
        'ethicalPolicies': ethicalPolicies, // Send as list
        // Only include salaryRange if provided
        if (salaryRange != null && salaryRange.isNotEmpty) 'salaryRange': salaryRange,
      };

      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Accept': 'application/json',
          // Add Authorization header if needed
        },
        body: jsonEncode(body),
      );

      if (response.statusCode == 201) { // 201 Created
        print('API: Job post created successfully.');
        final Map<String, dynamic> data = jsonDecode(response.body);
        return JobPost.fromJson(data); // Return the created job post from response
      } else {
        String errorMessage = 'Failed to create job post: ${response.statusCode} ${response.reasonPhrase}';
        try {
            final body = jsonDecode(response.body);
            if (body['message'] != null) { errorMessage = body['message']; }
        } catch (_) { /* Ignore parsing errors */ }
        throw Exception(errorMessage);
      }
    } catch (e) {
      print("API Error creating job post: $e");
      throw Exception('Failed to connect to the server.');
    }
    */
  }

  // TODO: Add other API methods as needed (createJobPost, applyToJob, getJobDetails, etc.)
}
