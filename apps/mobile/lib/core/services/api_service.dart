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

  /// POST /api/applications
  /// Applies the user to a job.
  Future<void> applyToJob(String userId, String jobId) async {
    print('API: User $userId applying to job $jobId');
    final uri = _buildUri('/applications');
    final body = jsonEncode({
      // Match DTO: jobSeekerId, jobPostingId
      'jobSeekerId': userId,
      'jobPostingId': jobId,
      // submissionDate is likely handled by backend
      // status defaults to PENDING on backend
    });
    print('API Request: POST $uri, Body: $body');

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

  /// GET /api/applications/{jobId}
  /// Gets applications for a specific job.
  Future<List<JobApplication>> getApplicationsForJob(String jobId) async {
    print('API: Fetching applications for job $jobId');
    // Endpoint updated: GET /api/applications/{jobId}
    final uri = _buildUri('/applications/$jobId');
    print('API Request: GET $uri');

    try {
      // Use dynamically generated headers
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      // Ensure JobApplication.fromJson is implemented correctly
      return data.map((json) => JobApplication.fromJson(json)).toList();
    } catch (e) {
      print("API Error fetching job applications: $e");
      throw Exception('Failed to load job applications. $e');
    }
  }

  /// GET /api/applications?userId={userId}
  /// Fetches the current user's job applications.
  Future<List<JobApplication>> fetchMyApplications(String userId) async {
    print('API: Fetching applications for user $userId');
    // Endpoint confirmed: GET /api/applications?userId={userId} (Based on backend error)
    final uri = _buildUri('/applications', {
      'userId': userId,
    }); // Use userId based on backend requirement
    print('API Request: GET $uri');

    try {
      // Use dynamically generated headers
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      // Ensure JobApplication.fromJson is implemented correctly
      return data.map((json) => JobApplication.fromJson(json)).toList();
    } catch (e) {
      print("API Error fetching my applications: $e");
      throw Exception('Failed to load your applications. $e');
    }
  }

  /// PUT /api/applications/{applicationId} (Assumed Endpoint) -> Confirmed
  /// Updates the status of a job application.
  Future<JobApplication> updateApplicationStatus(
    String applicationId,
    ApplicationStatus newStatus, {
    required String jobPostingId,
    required String jobSeekerId,
    String? feedback,
  }) async {
    print(
      'API: Updating application $applicationId for job $jobPostingId by seeker $jobSeekerId to $newStatus (Feedback: $feedback)',
    );
    // Endpoint confirmed: PUT /api/applications/{applicationId}
    final uri = _buildUri('/applications/$applicationId');
    final body = jsonEncode({
      'jobPostingId': jobPostingId,
      'jobSeekerId': jobSeekerId,
      'status': newStatus.name.toUpperCase(),
      if (feedback != null) 'feedback': feedback,
    });
    print('API Request: PUT $uri, Body: $body');

    try {
      // Use dynamically generated headers
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      // Ensure JobApplication.fromJson is implemented correctly
      return JobApplication.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      print("API Error updating application status: $e");
      throw Exception('Failed to update application status. $e');
    }
  }

  /// DELETE /api/applications/{applicationId}
  /// Deletes a job application.
  Future<void> deleteApplication(String applicationId) async {
    print('API: Deleting application $applicationId');
    final uri = _buildUri('/applications/$applicationId');
    print('API Request: DELETE $uri');

    try {
      // Use dynamically generated headers
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(
        response,
      ); // Checks for success status code (e.g., 204 No Content)
    } catch (e) {
      print("API Error deleting application: $e");
      throw Exception('Failed to delete application. $e');
    }
  }

  void dispose() {
    _client.close();
  }
}
