import 'dart:convert';
import 'package:http/http.dart' as http;
import 'dart:io';

import '../models/job_post.dart';
import '../models/job_application.dart';
import '../models/discussion_thread.dart';
import '../models/comment.dart';
import '../models/user.dart';
import '../models/mentor_profile.dart';
import '../models/mentorship_request.dart';
import '../models/mentor_review.dart';
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
    String? title,
    String? company,
    String? location,
    bool? remote,
    String? ethicalTags,
    double? minSalary,
    double? maxSalary,
    Map<String, dynamic>? additionalFilters,
  }) async {
    print('API: Fetching job postings');
    final queryParams = <String, dynamic>{};

    // Add search query if provided
    if (query != null && query.isNotEmpty) {
      queryParams['title'] = query;
    }

    // Add specific filters if provided
    if (title != null) queryParams['title'] = title;
    if (company != null) queryParams['company'] = company;
    if (location != null) queryParams['location'] = location;
    if (remote != null) queryParams['remote'] = remote;
    if (ethicalTags != null) queryParams['ethicalTags'] = ethicalTags;
    if (minSalary != null) queryParams['minSalary'] = minSalary;
    if (maxSalary != null) queryParams['maxSalary'] = maxSalary;

    // Add any additional filters
    if (additionalFilters != null) {
      queryParams.addAll(additionalFilters);
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
    final uri = _buildUri('/jobs/employer/$employerId');
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

  // ─────────────────────────────────────────────────
  // Forum / Discussion Endpoints
  // ─────────────────────────────────────────────────
  /// GET /api/threads
  Future<List<DiscussionThread>> fetchDiscussionThreads() async {
    final uri = _buildUri('/threads');
    print('API Request: GET $uri');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final data = await _handleResponse(response);

      return (data as List)
          .map((e) => DiscussionThread.fromJson(e as Map<String, dynamic>))
          .toList();
    } on SocketException {
      rethrow;
    } catch (e) {
      print("API Error fetching discussion threads: $e");
      throw Exception('Failed to fetch discussion threads. $e');
    }
  }

  /// POST /api/threads
  Future<DiscussionThread> createDiscussionThread(
      String title,
      String body,
      List<String> tags,
      ) async {
    final uri = _buildUri('/threads');
    final payload = jsonEncode({'title': title, 'body': body, 'tags': tags});

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: payload,
      );
      final data = await _handleResponse(response);
      return DiscussionThread.fromJson(data);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to create discussion thread. $e');
    }
  }

  /// GET /api/threads/{threadId}/comments
  Future<List<Comment>> fetchComments(int threadId) async {
    final uri = _buildUri('/threads/$threadId/comments');
    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final data = await _handleResponse(response);
      return (data as List)
          .map((e) => Comment.fromJson(e as Map<String, dynamic>))
          .toList();
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to fetch comments: $e');
    }
  }

  /// POST /api/threads/{threadId}/comments
  Future<Comment> postComment(int threadId, String body) async {
    final uri = _buildUri('/threads/$threadId/comments');
    final payload = jsonEncode({'body': body});
    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: payload,
      );
      final data = await _handleResponse(response);
      return Comment.fromJson(data);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to post comment: $e');
    }
  }

  /// PATCH /api/comments/{commentId}
  Future<Comment> editComment(int commentId, String body) async {
    final uri = _buildUri('/comments/$commentId');
    final payload = jsonEncode({'body': body});
    try {
      final response = await _client.patch(
        uri,
        headers: _getHeaders(),
        body: payload,
      );
      final data = await _handleResponse(response);
      return Comment.fromJson(data);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to edit comment: $e');
    }
  }




  /// PATCH /api/threads/{threadId}
  Future<DiscussionThread> editDiscussion(
      int threadId,
      String title,
      String body,
      List<String> tags,
      ) async {
    final uri = _buildUri('/threads/$threadId');
    final payload = jsonEncode({'title': title, 'body': body, 'tags': tags});

    try {
      final response = await _client.patch(
        uri,
        headers: _getHeaders(),
        body: payload,
      );
      final data = await _handleResponse(response);
      return DiscussionThread.fromJson(data);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to edit discussion thread. $e');
    }
  }

  /// GET /api/threads/tags
  Future<List<String>> fetchDiscussionTags() async {
    final uri = _buildUri('/threads/tags');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final data = await _handleResponse(response);
      return List<String>.from(data);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to fetch discussion tags: $e');
    }
  }

  /// POST /api/tags
  Future<String> createOrFindTag(String tagName) async {
    final uri = _buildUri('/threads/tags');
    final payload = jsonEncode({'name': tagName.trim()});
    try {
      final response = await _client.post(uri, headers: _getHeaders(), body: payload);
      final data = await _handleResponse(response);
      return data['name']; // returns normalized tag name
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to create or find tag. $e');
    }
  }




  /// DELETE /api/comments/{commentId}
  Future<bool> deleteComment(int commentId) async {
    final uri = _buildUri('/comments/$commentId');
    print('API Request: DELETE $uri');
    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
      print('Comment $commentId deleted successfully');
      return true;
    } on SocketException {
      print('SocketException while deleting comment $commentId');
      rethrow;
    } catch (e) {
      print('Failed to delete comment $commentId: $e');
      return false;
    }
  }

  /// POST /api/comments/{commentId}/report
  Future<void> reportComment(int commentId) async {
    final uri = _buildUri('/comments/$commentId/report');
    try {
      final response = await _client.post(uri, headers: _getHeaders());
      await _handleResponse(response);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to report comment: $e');
    }
  }

  /// DELETE /api/threads/{threadId}
  Future<void> deleteDiscussion(int threadId) async {
    final uri = _buildUri('/threads/$threadId');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to delete discussion thread: $e');
    }
  }

  /// POST /api/threads/{threadId}/report

  Future<void> reportDiscussion(int threadId) async {
    final uri = _buildUri('/threads/$threadId/report');
    try {
      final response = await _client.post(uri, headers: _getHeaders());
      await _handleResponse(response);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to report discussion: $e');
    }
  }

  /// GET /api/users/{id}
  Future<User> fetchUser(String userId) async {
    final uri = _buildUri('/users/$userId');
    print('API Request: GET $uri');
    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final data = await _handleResponse(response);
      return User.fromJson(data);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to fetch user $userId: $e');
    }
  }

  // --- Mentor Profile Endpoints ---

  /// POST /api/mentor/profile
  /// Creates a mentor profile for the current user.
  Future<MentorProfile> createMentorProfile({
    required int capacity,
    required bool isAvailable,
  }) async {
    print('API: Creating mentor profile');
    final uri = _buildUri('/mentor/profile');

    final mentorData = {'capacity': capacity, 'isAvailable': isAvailable};

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(mentorData),
      );
      final dynamic data = await _handleResponse(response);
      return MentorProfile.fromJson(data);
    } catch (e) {
      print("API Error creating mentor profile: $e");
      throw Exception('Failed to create mentor profile. $e');
    }
  }

  /// GET /api/mentor/profile/{userId}
  /// Gets a mentor profile by user ID.
  Future<MentorProfile> getMentorProfile(int userId) async {
    print('API: Getting mentor profile for mentor $userId');
    final uri = _buildUri('/mentor/profile/$userId');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return MentorProfile.fromJson(data);
    } catch (e) {
      print("API Error getting mentor profile: $e");
      throw Exception('Failed to get mentor profile. $e');
    }
  }

  /// GET /api/mentor/profiles
  /// Gets all mentor profiles.
  Future<List<MentorProfile>> getAllMentorProfiles() async {
    print('API: Getting all mentor profiles');
    final uri = _buildUri('/mentor/profiles');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      print('uri: ${uri}');
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => MentorProfile.fromJson(json)).toList();
    } catch (e) {
      print("API Error getting all mentor profiles: $e");
      throw Exception('Failed to get mentor profiles. $e');
    }
  }

  /// PATCH /api/mentor/profile/capacity
  /// Updates mentor capacity.
  Future<MentorProfile> updateMentorCapacity(int capacity) async {
    print('API: Updating mentor capacity to $capacity');
    final uri = _buildUri('/mentor/profile/capacity', {'capacity': capacity});

    try {
      final response = await _client.patch(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return MentorProfile.fromJson(data);
    } catch (e) {
      print("API Error updating mentor capacity: $e");
      throw Exception('Failed to update mentor capacity. $e');
    }
  }

  /// PATCH /api/mentor/profile/availability
  /// Updates mentor availability.
  Future<MentorProfile> updateMentorAvailability(bool isAvailable) async {
    print('API: Updating mentor availability to $isAvailable');
    final uri = _buildUri('/mentor/profile/availability', {
      'isAvailable': isAvailable,
    });

    try {
      final response = await _client.patch(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return MentorProfile.fromJson(data);
    } catch (e) {
      print("API Error updating mentor availability: $e");
      throw Exception('Failed to update mentor availability. $e');
    }
  }

  // --- Mentorship Request Endpoints ---

  /// POST /api/mentor/request
  /// Creates a mentorship request.
  Future<MentorshipRequest> createMentorshipRequest({
    required int mentorId,
    required String message,
  }) async {
    print('API: Creating mentorship request to mentor $mentorId');
    final uri = _buildUri('/mentor/request');

    final requestData = {'mentorId': mentorId, 'message': message};

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(requestData),
      );
      final dynamic data = await _handleResponse(response);
      return MentorshipRequest.fromJson(data);
    } catch (e) {
      print("API Error creating mentorship request: $e");
      throw Exception('Failed to create mentorship request. $e');
    }
  }

  /// GET /api/mentor/requests/mentor
  /// Gets all mentorship requests where the current user is the mentor.
  Future<List<MentorshipRequest>> getMentorshipRequestsAsMentor() async {
    print('API: Getting mentorship requests as mentor');
    final uri = _buildUri('/mentor/requests/mentor');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      print(data);
      return data.map((json) => MentorshipRequest.fromJson(json)).toList();
    } catch (e) {
      print("API Error getting mentorship requests as mentor: $e");
      throw Exception('Failed to get mentorship requests. $e');
    }
  }

  /// GET /api/mentor/requests/mentee
  /// Gets all mentorship requests where the current user is the mentee.
  Future<List<MentorshipRequest>> getMentorshipRequestsAsMentee() async {
    print('API: Getting mentorship requests as mentee');
    final uri = _buildUri('/mentor/requests/mentee');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => MentorshipRequest.fromJson(json)).toList();
    } catch (e) {
      print("API Error getting mentorship requests as mentee: $e");
      throw Exception('Failed to get mentorship requests. $e');
    }
  }

  /// GET /api/mentor/request/{requestId}
  /// Gets a specific mentorship request.
  Future<MentorshipRequest> getMentorshipRequest(int requestId) async {
    print('API: Getting mentorship request $requestId');
    final uri = _buildUri('/mentor/request/$requestId');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return MentorshipRequest.fromJson(data);
    } catch (e) {
      print("API Error getting mentorship request: $e");
      throw Exception('Failed to get mentorship request. $e');
    }
  }

  /// PATCH /api/mentor/request/{requestId}/status
  /// Updates mentorship request status.
  Future<MentorshipRequest> updateMentorshipRequestStatus(
    int requestId,
    MentorshipRequestStatus status,
  ) async {
    print('API: Updating mentorship request $requestId status to $status');
    final uri = _buildUri('/mentor/request/$requestId/status');

    final statusData = {'status': status.toString().split('.').last};

    try {
      final response = await _client.patch(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(statusData),
      );
      final dynamic data = await _handleResponse(response);
      return MentorshipRequest.fromJson(data);
    } catch (e) {
      print("API Error updating mentorship request status: $e");
      throw Exception('Failed to update mentorship request status. $e');
    }
  }

  // --- Mentor Review Endpoints ---

  /// POST /api/mentor/review
  /// Creates a mentor review.
  Future<MentorReview> createMentorReview({
    required String userId,
    required int rating,
    String? comment,
  }) async {
    print('API: Creating review for mentor $userId');
    final uri = _buildUri('/mentor/review');

    final reviewData = {
      'mentorId': userId,
      'rating': rating,
      if (comment != null) 'comment': comment,
    };

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(reviewData),
      );
      final dynamic data = await _handleResponse(response);
      return MentorReview.fromJson(data);
    } catch (e) {
      print("API Error creating mentor review: $e");
      throw Exception('Failed to create mentor review. $e');
    }
  }

  /// GET /api/mentor/{mentorId}/reviews
  /// Gets all reviews for a specific mentor.
  Future<List<MentorReview>> getMentorReviews(int mentorId) async {
    print('API: Getting reviews for mentor $mentorId');
    final uri = _buildUri('/mentor/$mentorId/reviews');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => MentorReview.fromJson(json)).toList();
    } catch (e) {
      print("API Error getting mentor reviews: $e");
      throw Exception('Failed to get mentor reviews. $e');
    }
  }

  /// GET /api/mentor/review/{reviewId}
  /// Gets a specific mentor review.
  Future<MentorReview> getMentorReview(int reviewId) async {
    print('API: Getting mentor review $reviewId');
    final uri = _buildUri('/mentor/review/$reviewId');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return MentorReview.fromJson(data);
    } catch (e) {
      print("API Error getting mentor review: $e");
      throw Exception('Failed to get mentor review. $e');
    }
  }

  void dispose() {
    _client.close();
  }
}
