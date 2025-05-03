import 'dart:convert';
import 'package:http/http.dart' as http;

import '../models/job_post.dart';
import '../models/job_application.dart';
import '../providers/auth_provider.dart'; // Import AuthProvider
import '../constants/app_constants.dart'; // Import AppConstants

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

/// Service for interacting with the backend API.
class ApiService {
  final http.Client _client;
  final AuthProvider _authProvider; // Store AuthProvider instance

  // Constructor requiring AuthProvider for token access
  ApiService({required AuthProvider authProvider, http.Client? client})
    : _authProvider = authProvider,
      _client = client ?? http.Client();

  // --- Available Filters (Consider fetching from API) ---
  List<String> get availableEthicalPolicies => _availableEthicalPolicies;
  List<String> get availableJobTypes => _availableJobTypes;

  // --- Helper Methods ---

  // Get headers dynamically, including auth token if available
  Map<String, String> _getHeaders() {
    final headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json',
    };
    final token = _authProvider.token;
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
      // Optional: Mask token in logs for security
      // print("Using Auth Token: Bearer ${token.substring(0, 10)}...");
    } else {
      print("Warning: No auth token found for API request.");
    }
    return headers;
  }

  Uri _buildUri(String path, [Map<String, dynamic>? queryParams]) {
    // Filter out null values from queryParams
    final nonNullParams =
        queryParams?..removeWhere((key, value) => value == null);
    // Convert all query param values to String or List<String>
    final stringParams = nonNullParams?.map((key, value) {
      if (value is List) {
        return MapEntry(key, value.map((e) => e.toString()).toList());
      }
      return MapEntry(key, value.toString());
    });
    return Uri.parse(
      '${AppConstants.baseUrl}$path', // Use AppConstants.baseUrl
    ).replace(queryParameters: stringParams);
  }

  Future<dynamic> _handleResponse(http.Response response) async {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) {
        return null; // Handle empty success responses (e.g., DELETE, PUT with no content)
      }
      try {
        return jsonDecode(
          utf8.decode(response.bodyBytes),
        ); // Decode using UTF-8
      } catch (e) {
        print("Error decoding JSON response: ${response.body}");
        throw Exception('Failed to parse server response.');
      }
    } else {
      String errorMessage = 'API Error ${response.statusCode}';
      try {
        // Try to parse error message from backend response
        final errorBody = jsonDecode(utf8.decode(response.bodyBytes));
        errorMessage =
            errorBody['message'] ??
            errorBody['error'] ??
            'Unknown API Error (${response.statusCode})';
      } catch (_) {
        // If parsing fails, use the reason phrase or a generic message
        errorMessage = response.reasonPhrase ?? errorMessage;
      }
      print(
        "API Error: ${response.statusCode} - $errorMessage. Body: ${response.body}",
      );
      // Throw specific error for authentication/authorization issues
      if (response.statusCode == 401) {
        throw Exception(
          'Authentication failed. Please log in again.',
        ); // Unauthorized
      }
      if (response.statusCode == 403) {
        throw Exception('Permission denied.'); // Forbidden
      }
      throw Exception('Error: $errorMessage');
    }
  }

  // --- Job Post Endpoints ---

  /// GET /api/jobs
  /// Fetches job postings based on query and filters.
  Future<List<JobPost>> fetchJobPostings({
    String? query,
    Map<String, List<String>>? filters,
  }) async {
    print('API: Fetching job postings (query: $query, filters: $filters)');
    final queryParams = <String, dynamic>{};
    if (query != null && query.isNotEmpty) {
      queryParams['search'] = query; // Assuming backend uses 'search' param
    }
    if (filters != null) {
      filters.forEach((key, value) {
        if (value.isNotEmpty) {
          queryParams[key] = value;
        }
      });
    }

    final uri = _buildUri('/jobs', queryParams);
    print('API Request: GET $uri');

    try {
      // Use dynamically generated headers
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => JobPost.fromJson(json)).toList();
    } catch (e) {
      print("API Error fetching jobs: $e");
      throw Exception('Failed to load jobs. $e');
    }
  }

  /// GET /api/jobs (filtered by employerId)
  /// Fetches job postings created by a specific employer.
  /// Assumes filtering is done via query parameter.
  Future<List<JobPost>> fetchEmployerJobPostings(String employerId) async {
    print('API: Fetching job postings for employer $employerId');
    final uri = _buildUri('/jobs', {'employerId': employerId});
    print('API Request: GET $uri');

    try {
      // Use dynamically generated headers
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => JobPost.fromJson(json)).toList();
    } catch (e) {
      print("API Error fetching employer jobs: $e");
      throw Exception('Failed to load your job postings. $e');
    }
  }

  /// GET /api/jobs/{id}
  /// Fetches details for a specific job post.
  Future<JobPost> getJobDetails(String jobId) async {
    print('API: Fetching job details for $jobId');
    final uri = _buildUri('/jobs/$jobId');
    print('API Request: GET $uri');

    try {
      // Use dynamically generated headers
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return JobPost.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      print("API Error fetching job details: $e");
      throw Exception('Failed to load job details. $e');
    }
  }

  /// POST /api/jobs
  /// Creates a new job post.
  Future<JobPost> createJobPost({
    // Required fields based on JobPostDto & UI
    required String employerId,
    required String title,
    required String description,
    required String company,
    required String location,
    required bool remote,
    required String ethicalTags,

    // Optional fields from UI
    String? contactInfo,
    String? jobType,
    String? salaryRange,
  }) async {
    print('API: Creating new job post');

    final uri = _buildUri('/jobs');
    print('API Request: POST $uri');

    // Construct the body based on JobPostDto structure + potentially employerId
    final body = jsonEncode({
      'employerId': employerId,
      'title': title,
      'description': description,
      'company': company,
      'location': location,
      'remote': remote,
      'ethicalTags': ethicalTags,
      // TODO: Confirm if optional fields should be sent if null or omitted
      // if (contactInfo != null) 'contactInfo': contactInfo,
      // if (jobType != null) 'jobType': jobType,
      // if (salaryRange != null) 'salaryRange': salaryRange,
    });

    try {
      // Use dynamically generated headers
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      // Assuming the API returns the created JobPost object
      return JobPost.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      print("API Error creating job post: $e");
      throw Exception('Failed to create job post. $e');
    }
  }

  /// PUT /api/jobs/{id}
  /// Updates an existing job post.
  Future<JobPost> updateJobPost(String jobId, JobPost jobPost) async {
    print('API: Updating job post $jobId');
    final uri = _buildUri('/jobs/$jobId');
    print('API Request: PUT $uri');
    final body = jsonEncode(
      jobPost.toJsonForUpdate(),
    ); // Use the dedicated toJson

    try {
      // Use dynamically generated headers
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      // Assuming the API returns the updated JobPost object
      return JobPost.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      print("API Error updating job post: $e");
      throw Exception('Failed to update job post. $e');
    }
  }

  /// DELETE /api/jobs/{id}
  /// Deletes a job post.
  Future<void> deleteJobPost(String jobId) async {
    print('API: Deleting job post $jobId');
    final uri = _buildUri('/jobs/$jobId');
    print('API Request: DELETE $uri');

    try {
      // Use dynamically generated headers
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response); // Checks for success status code
    } catch (e) {
      print("API Error deleting job post: $e");
      throw Exception('Failed to delete job post. $e');
    }
  }

  // --- Job Application Endpoints ---
  // Assuming endpoints like /api/applications...

  /// POST /api/applications (Assumed Endpoint)
  /// Applies the user to a job.
  Future<void> applyToJob(String userId, String jobId) async {
    print('API: User $userId applying to job $jobId');
    // TODO: Confirm actual endpoint and request body structure
    final uri = _buildUri('/applications');
    final body = jsonEncode({
      'userId': userId,
      'jobId': jobId,
      // Add any other required fields for application creation
    });
    print('API Request: POST $uri');

    try {
      // Use dynamically generated headers
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      await _handleResponse(response); // Check for 201 Created or similar
    } catch (e) {
      print("API Error applying to job: $e");
      throw Exception('Failed to submit application. $e');
    }
  }

  /// GET /api/applications?jobId={jobId} (Assumed Endpoint)
  /// Gets applications for a specific job.
  Future<List<JobApplication>> getApplicationsForJob(String jobId) async {
    print('API: Fetching applications for job $jobId');
    // TODO: Confirm actual endpoint
    final uri = _buildUri('/applications', {'jobId': jobId});
    print('API Request: GET $uri');

    try {
      // Use dynamically generated headers
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      // TODO: Implement JobApplication.fromJson if needed
      // For now, returning mock data structure until JobApplication.fromJson is ready
      return data.map((json) => JobApplication.fromJson(json)).toList();
      // return _generateMockApplications(jobId: jobId, count: 5); // Placeholder
    } catch (e) {
      print("API Error fetching job applications: $e");
      throw Exception('Failed to load job applications. $e');
    }
  }

  /// GET /api/applications?userId={userId} (Assumed Endpoint)
  /// Fetches the current user's job applications.
  Future<List<JobApplication>> fetchMyApplications(String userId) async {
    print('API: Fetching applications for user $userId');
    // TODO: Confirm actual endpoint
    final uri = _buildUri('/applications', {'userId': userId});
    print('API Request: GET $uri');

    try {
      // Use dynamically generated headers
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      // TODO: Implement JobApplication.fromJson if needed
      return data.map((json) => JobApplication.fromJson(json)).toList();
      // return _generateMockApplications(applicantId: userId, count: 3); // Placeholder
    } catch (e) {
      print("API Error fetching my applications: $e");
      throw Exception('Failed to load your applications. $e');
    }
  }

  /// PUT /api/applications/{applicationId} (Assumed Endpoint)
  /// Updates the status of a job application.
  Future<JobApplication> updateApplicationStatus(
    String applicationId,
    ApplicationStatus newStatus, {
    String? feedback, // Optional feedback
  }) async {
    print(
      'API: Updating application $applicationId to $newStatus (Feedback: $feedback)',
    );
    // TODO: Confirm actual endpoint and request body structure
    final uri = _buildUri('/applications/$applicationId');
    final body = jsonEncode({
      'status': newStatus.name, // Send enum name as string
      if (feedback != null) 'employerFeedback': feedback,
    });
    print('API Request: PUT $uri');

    try {
      // Use dynamically generated headers
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      // TODO: Implement JobApplication.fromJson if needed
      // Assuming API returns the updated application
      return JobApplication.fromJson(data as Map<String, dynamic>);
      // return _updateMockApplicationStatus(applicationId, newStatus, feedback); // Placeholder
    } catch (e) {
      print("API Error updating application status: $e");
      throw Exception('Failed to update application status. $e');
    }
  }

  // --- User Endpoints (Example) ---
  // TODO: Implement User API calls based on provided specs if needed elsewhere

  // --- Cleanup ---
  void dispose() {
    _client.close(); // Close the client when the service is disposed
  }
}

// Removed placeholder models and mock generation functions
// --- Placeholder Models (Ensure these match your actual models) ---
/* // Moved to separate files
enum ApplicationStatus { pending, approved, rejected }

class JobPost {
  // ... (ensure fields match JobPost.dart)
  JobPost.fromJson(Map<String, dynamic> json) { /* ... implementation needed ... */ }
}

class JobApplication {
  final String id;
  final String jobId;
  final String jobTitle;
  final String companyName;
  final String applicantName;
  final ApplicationStatus status;
  final DateTime dateApplied;
  final String? employerFeedback;

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

 // TODO: Implement fromJson properly based on API response structure
 factory JobApplication.fromJson(Map<String, dynamic> json) {
    print("Attempting to parse JobApplication from JSON: $json"); // Debug print
    // Basic implementation - ADJUST BASED ON ACTUAL API RESPONSE
    return JobApplication(
      id: json['id']?.toString() ?? (throw Exception('Missing required field: id')),
      jobId: json['jobId']?.toString() ?? (throw Exception('Missing required field: jobId')),
      // These might need to be fetched separately or included in the application data by the API
      jobTitle: json['jobTitle'] ?? 'N/A', // Placeholder if not directly available
      companyName: json['companyName'] ?? 'N/A', // Placeholder if not directly available
      applicantName: json['applicantName'] ?? 'N/A', // Placeholder if not directly available
      status: ApplicationStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => ApplicationStatus.pending, // Default if status is invalid/missing
      ),
      dateApplied: DateTime.tryParse(json['dateApplied'] ?? '') ?? DateTime.now(), // Handle potential parse errors
      employerFeedback: json['employerFeedback'],
    );
  }
}
*/

// TODO: Add a similar class/methods for User API calls (GET/PUT/DELETE /api/users) if needed by the UI directly.
