import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

import '../models/job_post.dart';
import '../models/job_application.dart';
import '../models/forum_post.dart';
import '../models/forum_comment.dart';
import '../models/user.dart';
import '../models/mentor_profile.dart';
import '../models/mentorship_request.dart';
import '../models/mentor_review.dart';
import '../models/full_profile.dart';
import '../models/profile.dart';
import '../models/experience.dart';
import '../models/education.dart';
import '../models/badge.dart';
import '../providers/auth_provider.dart'; // Import AuthProvider
import '../constants/app_constants.dart'; // Imp// ort AppConstants
import '../models/mentorship_status.dart';
import '../models/workplace.dart';
import '../models/workplace_review.dart';
import '../models/workplace_reply.dart';
import '../models/workplace_employer.dart';
import '../models/paginated_workplace_response.dart';
import '../models/delete_response.dart';
import '../models/workplace_image_response.dart';
import '../models/workplace_rating.dart';
import '../models/employer_workplace_item.dart';
import '../models/employer_request.dart';
import '../models/paginated_employer_request_response.dart';
import '../models/employer_request_action_response.dart';
import '../models/paginated_workplace_review_response.dart';

const List<String> _availableEthicalPolicies = [
  'salary_transparency',
  'equal_pay_policy',
  'living_wage_employer',
  'comprehensive_health_insurance',
  'performance_based_bonus',
  'retirement_plan_support',
  'flexible_hours',
  'remote_friendly',
  'no_after_hours_work_culture',
  'mental_health_support',
  'generous_paid_time_off',
  'paid_parental_leave',
  'inclusive_hiring_practices',
  'diverse_leadership',
  'lgbtq_friendly_workplace',
  'disability_inclusive_workplace',
  'supports_women_in_leadership',
  'mentorship_program',
  'learning_development_budget',
  'transparent_promotion_paths',
  'internal_mobility',
  'sustainability_focused',
  'ethical_supply_chain',
  'community_volunteering',
  'certified_b_corporation',
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

  // --- Helper Methods ---

  // Format ethical tag from snake_case to proper Title Case
  // Handles special cases like LGBTQ+, B-Corporation, etc.
  String _formatEthicalTag(String tag) {
    // Special case mappings
    final specialCases = {
      'lgbtq_friendly_workplace': 'LGBTQ+ Friendly Workplace',
      'certified_b_corporation': 'Certified B-Corporation',
      'no_after_hours_work_culture': 'No After-Hours Work Culture',
      'remote_friendly': 'Remote-Friendly',
      'performance_based_bonus': 'Performance-Based Bonus',
      'learning_development_budget': 'Learning & Development Budget',
      'sustainability_focused': 'Sustainability-Focused',
      'disability_inclusive_workplace': 'Disability-Inclusive Workplace',
    };

    // Check if it's a special case
    if (specialCases.containsKey(tag)) {
      return specialCases[tag]!;
    }

    // Default: Convert snake_case to Title Case
    return tag
        .split('_')
        .map((word) => word[0].toUpperCase() + word.substring(1).toLowerCase())
        .join(' ');
  }

  // Get headers dynamically, including auth token if available
  Map<String, String> _getHeaders() {
    final headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json',
    };
    final token = _authProvider.token;
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    } else {}
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
    bool? isRemote,
    List<String>? ethicalTags,
    int? minSalary,
    int? maxSalary,
    bool? inclusiveOpportunity,
    bool? nonProfit,
  }) async {
    final queryParams = <String, dynamic>{};

    // Add search query if provided
    if (query != null && query.isNotEmpty) {
      queryParams['title'] = query;
    }

    // Add specific filters if provided
    if (title != null) queryParams['title'] = title;
    if (company != null) queryParams['companyName'] = company;
    if (location != null) queryParams['location'] = location;
    if (isRemote != null) queryParams['isRemote'] = isRemote;
    if (ethicalTags != null && ethicalTags.isNotEmpty) {
      queryParams['ethicalTags'] = ethicalTags;
    }
    if (minSalary != null) queryParams['minSalary'] = minSalary;
    if (maxSalary != null) queryParams['maxSalary'] = maxSalary;
    if (inclusiveOpportunity != null) {
      queryParams['inclusiveOpportunity'] = inclusiveOpportunity;
    }
    if (nonProfit != null) {
      queryParams['nonProfit'] = nonProfit;
    }

    final uri = _buildUri('/jobs', queryParams);

    try {
      // Use dynamically generated headers
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => JobPost.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load jobs. $e');
    }
  }

  /// GET /api/jobs/employer/{employerId}
  /// Fetches job postings created by a specific employer.
  Future<List<JobPost>> fetchEmployerJobPostings(String employerId) async {
    final uri = _buildUri('/jobs/employer/$employerId');

    try {
      // Use dynamically generated headers
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => JobPost.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load your job postings. $e');
    }
  }

  /// GET /api/jobs/{id}
  /// Fetches details for a specific job post.
  Future<JobPost> getJobDetails(String jobId) async {
    final uri = _buildUri('/jobs/$jobId');

    try {
      // Use dynamically generated headers
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return JobPost.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to load job details. $e');
    }
  }

  /// POST /api/jobs
  /// Creates a new job post.
  /// Note: employerId is determined from the auth token, not sent in request body.
  Future<JobPost> createJobPost({
    // Required fields based on backend API
    required int workplaceId,
    required String title,
    required String description,
    required bool remote,
    required bool inclusiveOpportunity,

    // Optional fields
    bool? nonProfit,
    String? contactInformation,
    int? minSalary,
    int? maxSalary,
  }) async {
    final uri = _buildUri('/jobs');

    // Construct the body based on backend API specification
    final body = jsonEncode({
      'workplaceId': workplaceId,
      'title': title,
      'description': description,
      'remote': remote,
      'inclusiveOpportunity': inclusiveOpportunity,
      // Optional fields, only include if not null
      if (nonProfit != null) 'nonProfit': nonProfit,
      if (contactInformation != null) 'contact': contactInformation,
      if (minSalary != null) 'minSalary': minSalary,
      if (maxSalary != null) 'maxSalary': maxSalary,
    });

    try {
      // Use dynamically generated headers (includes auth token)
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      // Backend returns the created JobPost object with id, employerId, and postedDate
      return JobPost.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to create job post. $e');
    }
  }

  /// PUT /api/jobs/{id}
  /// Updates an existing job post.
  Future<JobPost> updateJobPost(String jobId, JobPost jobPost) async {
    final uri = _buildUri('/jobs/$jobId');

    // Get workplaceId from the jobPost's workplace
    if (jobPost.workplace == null) {
      throw Exception(
        'Cannot update job post: workplace information is missing',
      );
    }

    final body = jsonEncode(jobPost.toJsonForUpdate(jobPost.workplace!.id));

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
      throw Exception('Failed to update job post. $e');
    }
  }

  /// DELETE /api/jobs/{id}
  /// Deletes a job post.
  Future<void> deleteJobPost(String jobId) async {
    final uri = _buildUri('/jobs/$jobId');

    try {
      // Use dynamically generated headers
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response); // Checks for success status code
    } catch (e) {
      throw Exception('Failed to delete job post. $e');
    }
  }

  // --- Job Application Endpoints ---

  /// POST /api/applications
  /// Applies to a job post.
  /// Note: jobSeekerId is determined from the auth token.
  Future<JobApplication> applyToJob(
    String jobPostId, {
    String? specialNeeds,
    String? coverLetter,
  }) async {
    final uri = _buildUri('/applications');
    final body = jsonEncode({
      'jobPostId': int.parse(jobPostId), // Convert to int for backend
      if (specialNeeds != null && specialNeeds.isNotEmpty)
        'specialNeeds': specialNeeds,
      if (coverLetter != null && coverLetter.isNotEmpty)
        'coverLetter': coverLetter,
    });

    try {
      // Use dynamically generated headers (includes auth token)
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      // Backend returns the created JobApplication object
      return JobApplication.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to submit application. $e');
    }
  }

  /// POST /api/applications/{id}/cv
  /// Uploads a CV file for a specific application.
  /// Returns the CV URL and upload timestamp.
  Future<Map<String, dynamic>> uploadCV(
    String applicationId,
    String filePath,
  ) async {
    final uri = _buildUri('/applications/$applicationId/cv');

    try {
      // Verify file exists
      final file = File(filePath);
      if (!await file.exists()) {
        throw Exception('File not found: $filePath');
      }

      // Create multipart request
      final request = http.MultipartRequest('POST', uri);

      // Remove Content-Type from headers to let multipart handle it
      final headers = Map<String, String>.from(_getHeaders());
      headers.remove('Content-Type');
      request.headers.addAll(headers);

      // Determine content type based on file extension
      String? contentType;
      final extension = filePath.toLowerCase().split('.').last;
      switch (extension) {
        case 'pdf':
          contentType = 'application/pdf';
          break;
        case 'doc':
          contentType = 'application/msword';
          break;
        case 'docx':
          contentType =
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        default:
          throw Exception(
            'Unsupported file type: .$extension. Only PDF, DOC, and DOCX are allowed.',
          );
      }

      // Add the file with proper content type
      final multipartFile = await http.MultipartFile.fromPath(
        'file', // Field name expected by backend
        filePath,
        contentType: MediaType.parse(contentType),
      );
      request.files.add(multipartFile);

      // Send the request
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      // Handle the response
      final dynamic data = await _handleResponse(response);
      return data as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to upload CV. $e');
    }
  }

  /// GET /api/applications/{id}/cv
  /// Downloads the CV file for a specific application.
  /// Returns the CV file bytes.
  Future<List<int>> getCV(String applicationId) async {
    final uri = _buildUri('/applications/$applicationId/cv');

    try {
      final response = await _client.get(uri, headers: _getHeaders());

      if (response.statusCode == 200) {
        return response.bodyBytes;
      } else if (response.statusCode == 404) {
        throw Exception('CV not found for this application.');
      } else {
        throw Exception('Failed to download CV: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to download CV. $e');
    }
  }

  /// DELETE /api/applications/{id}/cv
  /// Deletes the CV file for a specific application.
  Future<void> deleteCV(String applicationId) async {
    final uri = _buildUri('/applications/$applicationId/cv');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception('Failed to delete CV: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to delete CV. $e');
    }
  }

  /// GET /api/applications
  /// Gets applications filtered by query parameters.
  /// Can filter by jobSeekerId and/or jobPostId.
  Future<List<JobApplication>> getApplicationsForJob(String jobPostId) async {
    final uri = _buildUri('/applications', {'jobPostId': jobPostId});

    try {
      // Use dynamically generated headers
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => JobApplication.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load job applications. $e');
    }
  }

  /// GET /api/applications?jobSeekerId={jobSeekerId}
  /// Fetches applications for a specific job seeker.
  Future<List<JobApplication>> fetchMyApplications(String jobSeekerId) async {
    final uri = _buildUri('/applications', {'jobSeekerId': jobSeekerId});

    try {
      // Use dynamically generated headers
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => JobApplication.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load your applications. $e');
    }
  }

  /// GET /api/applications/{id}
  /// Fetches a specific job application by ID.
  Future<JobApplication> getApplicationById(String applicationId) async {
    final uri = _buildUri('/applications/$applicationId');

    try {
      // Use dynamically generated headers
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return JobApplication.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to load application details. $e');
    }
  }

  /// PUT /api/applications/{applicationId}
  /// Updates the status of a job application.
  Future<JobApplication> updateApplicationStatus(
    String applicationId,
    ApplicationStatus newStatus, {
    required String jobPostingId,
    required String jobSeekerId,
    String? feedback,
  }) async {
    // Endpoint confirmed: PUT /api/applications/{applicationId}
    final uri = _buildUri('/applications/$applicationId');
    final body = jsonEncode({
      'jobPostingId': jobPostingId,
      'jobSeekerId': jobSeekerId,
      'status': newStatus.name.toUpperCase(),
      if (feedback != null) 'feedback': feedback,
    });

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
      throw Exception('Failed to update application status. $e');
    }
  }

  /// PUT /api/applications/{id}/approve
  /// Approves a job application with optional feedback.
  Future<JobApplication> approveApplication(
    String applicationId, {
    String? feedback,
  }) async {
    final uri = _buildUri('/applications/$applicationId/approve');
    final body = jsonEncode({if (feedback != null) 'feedback': feedback});

    try {
      // Use dynamically generated headers
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      return JobApplication.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to approve application. $e');
    }
  }

  /// PUT /api/applications/{id}/reject
  /// Rejects a job application with optional feedback.
  Future<JobApplication> rejectApplication(
    String applicationId, {
    String? feedback,
  }) async {
    final uri = _buildUri('/applications/$applicationId/reject');
    final body = jsonEncode({if (feedback != null) 'feedback': feedback});

    try {
      // Use dynamically generated headers
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      return JobApplication.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to reject application. $e');
    }
  }

  /// DELETE /api/applications/{applicationId}
  /// Deletes a job application.
  Future<void> deleteApplication(String applicationId) async {
    final uri = _buildUri('/applications/$applicationId');

    try {
      // Use dynamically generated headers
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(
        response,
      ); // Checks for success status code (e.g., 204 No Content)
    } catch (e) {
      throw Exception('Failed to delete application. $e');
    }
  }

  // ─────────────────────────────────────────────────
  // Forum / Discussion Endpoints
  // ─────────────────────────────────────────────────

  /// GET /api/forum/posts
  /// Fetches all forum posts
  Future<List<ForumPost>> fetchForumPosts() async {
    final uri = _buildUri('/forum/posts');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final data = await _handleResponse(response);

      return (data as List)
          .map((e) => ForumPost.fromJson(e as Map<String, dynamic>))
          .toList();
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to fetch forum posts. $e');
    }
  }

  /// POST /api/forum/posts
  /// Creates a new forum post
  Future<ForumPost> createForumPost({
    required String title,
    required String content,
    required List<String> tags,
  }) async {
    final uri = _buildUri('/forum/posts');
    final payload = jsonEncode({
      'title': title,
      'content': content,
      'tags': tags,
    });

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: payload,
      );
      final data = await _handleResponse(response);
      return ForumPost.fromJson(data);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to create forum post. $e');
    }
  }

  /// GET /api/forum/posts/{id}
  /// Fetches a specific forum post by ID
  Future<ForumPost> getForumPost(int postId) async {
    final uri = _buildUri('/forum/posts/$postId');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final data = await _handleResponse(response);
      return ForumPost.fromJson(data);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to fetch forum post. $e');
    }
  }

  /// PUT /api/forum/posts/{id}
  /// Updates a forum post
  Future<ForumPost> updateForumPost({
    required int postId,
    required String title,
    required String content,
    required List<String> tags,
  }) async {
    final uri = _buildUri('/forum/posts/$postId');
    final payload = jsonEncode({
      'title': title,
      'content': content,
      'tags': tags,
    });

    try {
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: payload,
      );
      final data = await _handleResponse(response);
      return ForumPost.fromJson(data);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to update forum post. $e');
    }
  }

  /// DELETE /api/forum/posts/{id}
  /// Deletes a forum post
  Future<void> deleteForumPost(int postId) async {
    final uri = _buildUri('/forum/posts/$postId');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to delete forum post. $e');
    }
  }

  /// POST /api/forum/posts/{id}/upvote
  /// Upvotes a forum post
  Future<void> upvoteForumPost(int postId) async {
    final uri = _buildUri('/forum/posts/$postId/upvote');

    try {
      final response = await _client.post(uri, headers: _getHeaders());
      await _handleResponse(response);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to upvote forum post. $e');
    }
  }

  /// DELETE /api/forum/posts/{id}/upvote
  /// Removes upvote from a forum post
  Future<void> removeUpvoteForumPost(int postId) async {
    final uri = _buildUri('/forum/posts/$postId/upvote');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to remove upvote from forum post. $e');
    }
  }

  /// POST /api/forum/posts/{id}/downvote
  /// Downvotes a forum post
  Future<void> downvoteForumPost(int postId) async {
    final uri = _buildUri('/forum/posts/$postId/downvote');

    try {
      final response = await _client.post(uri, headers: _getHeaders());
      await _handleResponse(response);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to downvote forum post. $e');
    }
  }

  /// DELETE /api/forum/posts/{id}/downvote
  /// Removes downvote from a forum post
  Future<void> removeDownvoteForumPost(int postId) async {
    final uri = _buildUri('/forum/posts/$postId/downvote');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to remove downvote from forum post. $e');
    }
  }

  /// POST /api/forum/posts/{id}/comments
  /// Creates a comment on a forum post
  Future<ForumComment> createForumComment({
    required int postId,
    required String content,
    int? parentCommentId,
  }) async {
    final uri = _buildUri('/forum/posts/$postId/comments');
    final payload = jsonEncode({
      'content': content,
      if (parentCommentId != null) 'parentCommentId': parentCommentId,
    });

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: payload,
      );
      final data = await _handleResponse(response);
      return ForumComment.fromJson(data);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to create forum comment. $e');
    }
  }

  /// PUT /api/forum/comments/{commentId}
  /// Updates a forum comment
  Future<ForumComment> updateForumComment({
    required int commentId,
    required String content,
  }) async {
    final uri = _buildUri('/forum/comments/$commentId');
    final payload = jsonEncode({'content': content});

    try {
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: payload,
      );
      final data = await _handleResponse(response);
      return ForumComment.fromJson(data);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to update forum comment. $e');
    }
  }

  /// DELETE /api/forum/comments/{commentId}
  /// Deletes a forum comment
  Future<void> deleteForumComment(int commentId) async {
    final uri = _buildUri('/forum/comments/$commentId');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to delete forum comment. $e');
    }
  }

  /// POST /api/forum/comments/{commentId}/upvote
  /// Upvotes a forum comment
  Future<void> upvoteForumComment(int commentId) async {
    final uri = _buildUri('/forum/comments/$commentId/upvote');

    try {
      final response = await _client.post(uri, headers: _getHeaders());
      await _handleResponse(response);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to upvote forum comment. $e');
    }
  }

  /// DELETE /api/forum/comments/{commentId}/upvote
  /// Removes upvote from a forum comment
  Future<void> removeUpvoteForumComment(int commentId) async {
    final uri = _buildUri('/forum/comments/$commentId/upvote');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to remove upvote from forum comment. $e');
    }
  }

  /// POST /api/forum/comments/{commentId}/downvote
  /// Downvotes a forum comment
  Future<void> downvoteForumComment(int commentId) async {
    final uri = _buildUri('/forum/comments/$commentId/downvote');

    try {
      final response = await _client.post(uri, headers: _getHeaders());
      await _handleResponse(response);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to downvote forum comment. $e');
    }
  }

  /// DELETE /api/forum/comments/{commentId}/downvote
  /// Removes downvote from a forum comment
  Future<void> removeDownvoteForumComment(int commentId) async {
    final uri = _buildUri('/forum/comments/$commentId/downvote');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to remove downvote from forum comment. $e');
    }
  }

  /// GET /api/profile/{id}
  /// Fetches user details by user ID (uses profile endpoint)
  Future<User> fetchUser(String userId) async {
    final uri = _buildUri('/profile/$userId');
    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final data = await _handleResponse(response);
      // The profile endpoint returns a profile object, we need to extract user data
      // If the response has a 'profile' field, use that, otherwise use the data directly
      final userData = data['profile'] ?? data;
      return User.fromJson(userData);
    } on SocketException {
      rethrow;
    } catch (e) {
      throw Exception('Failed to fetch user $userId: $e');
    }
  }

  /// PUT /api/profile (updates current user's profile)
  /// Note: This method is kept for compatibility but uses the profile endpoint
  Future<void> updateUser(String userId, Map<String, dynamic> userData) async {
    // Use the profile update endpoint instead
    final uri = _buildUri('/profile');

    try {
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(userData),
      );

      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to update user: $e');
    }
  }

  // --- Mentor Profile Endpoints ---

  /// PUT /api/mentorship/mentor
  /// Creates a mentor profile for the current user.
  Future<MentorProfile> createMentorProfile({
    required String userId,
    required List<String> expertise,
    required int maxMentees,
  }) async {
    final uri = _buildUri('/mentorship/mentor');

    final mentorData = {'expertise': expertise, 'maxMentees': maxMentees};
    print("mentorData: $mentorData");

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(mentorData),
      );
      print('Response: ${response}');
      print('Response Body: ${response.body}');

      final dynamic data = await _handleResponse(response);
      return MentorProfile.fromJson(data);
    } catch (e) {
      throw Exception('Failed to create mentor profile. $e');
    }
  }

  /// GET /api/mentorship/mentor/{userId}
  /// Gets a mentor profile by user ID.
  Future<MentorProfile> getMentorProfile(String userId) async {
    final uri = _buildUri('/mentorship/mentor/$userId');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return MentorProfile.fromJson(data);
    } catch (e) {
      throw Exception('Failed to get mentor profile. $e');
    }
  }

  /// GET /api/mentorship
  /// Gets all mentor profiles.
  Future<List<MentorProfile>> getAllMentors() async {
    final uri = _buildUri('/mentorship');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => MentorProfile.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get mentor profiles. $e');
    }
  }

  /// PUT /api/mentorship/mentor/{userId}
  /// Updates mentor profile (expertise + max mentees).
  Future<MentorProfile> updateMentorProfile({
    required String userId,
    required List<String> expertise,
    required int maxMentees,
  }) async {
    final uri = _buildUri('/mentorship/mentor/$userId');

    final payload = {'expertise': expertise, 'maxMentees': maxMentees};

    try {
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(payload),
      );
      final dynamic data = await _handleResponse(response);
      return MentorProfile.fromJson(data);
    } catch (e) {
      throw Exception('Failed to update mentor profile. $e');
    }
  }

  /// DELETE /api/mentorship/mentor/{userId}
  /// Deletes mentor profile for given user.
  Future<MentorProfile> deleteMentorProfile(String userId) async {
    final uri = _buildUri('/mentorship/mentor/$userId');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return MentorProfile.fromJson(data);
    } catch (e) {
      throw Exception('Failed to delete mentor profile. $e');
    }
  }

  /// POST /api/mentorship/requests
  /// Creates a mentorship request.
  Future<MentorshipRequest> createMentorshipRequest({
    required int mentorId,
  }) async {
    final uri = _buildUri('/mentorship/requests');

    final requestData = {'mentorId': mentorId};

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(requestData),
      );
      final dynamic data = await _handleResponse(response);
      return MentorshipRequest.fromJson(data);
    } catch (e) {
      throw Exception('Failed to create mentorship request. $e');
    }
  }

  /// GET /api/mentorship/mentor/{mentorId}/requests
  /// Gets all mentorship requests where the given user is the mentor.
  Future<List<MentorshipRequest>> getMentorshipRequestsAsMentor(
    String mentorId,
  ) async {
    final uri = _buildUri('/mentorship/mentor/$mentorId/requests');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => MentorshipRequest.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get mentorship requests as mentor. $e');
    }
  }

  /// GET /api/mentorship/mentee/{menteeId}/requests
  /// Gets all mentorship requests where the given user is the mentee.
  Future<List<MentorshipRequest>> getMentorshipRequestsAsMentee(
    String menteeId,
  ) async {
    final uri = _buildUri('/mentorship/mentee/$menteeId/requests');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => MentorshipRequest.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get mentorship requests as mentee. $e');
    }
  }

  /// GET /api/mentorship/requests/{requestId}
  /// Gets a specific mentorship request.
  Future<MentorshipRequest> getMentorshipRequest(String requestId) async {
    final uri = _buildUri('/mentorship/requests/$requestId');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return MentorshipRequest.fromJson(data);
    } catch (e) {
      throw Exception('Failed to get mentorship request. $e');
    }
  }

  /// PATCH /api/mentorship/requests/{requestId}/respond
  /// Respond to a mentorship request (accept or reject).
  Future<MentorshipRequest> respondToMentorshipRequest({
    required String requestId,
    required bool accept,
  }) async {
    final uri = _buildUri('/mentorship/requests/$requestId/respond');

    final payload = {'accept': accept};

    try {
      final response = await _client.patch(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(payload),
      );
      final dynamic data = await _handleResponse(response);
      return MentorshipRequest.fromJson(data);
    } catch (e) {
      throw Exception('Failed to respond to mentorship request. $e');
    }
  }

  // --- Mentor Review Endpoints ---

  /// POST /api/mentorship/ratings
  /// Rates a resume review / mentorship session.
  Future<void> createMentorRating({
    required int resumeReviewId,
    required int rating,
    String? comment,
  }) async {
    final uri = _buildUri('/mentorship/ratings');

    final reviewData = {
      'resumeReviewId': resumeReviewId,
      'rating': rating,
      if (comment != null && comment.isNotEmpty) 'comment': comment,
    };

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(reviewData),
      );
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to create mentor rating. $e');
    }
  }

  /// (Optional for later) PATCH /api/mentorship/review/{resumeReviewId}/complete
  Future<void> completeResumeReview(int resumeReviewId) async {
    final uri = _buildUri('/mentorship/review/$resumeReviewId/complete');
    try {
      final response = await _client.patch(uri, headers: _getHeaders());
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to complete resume review. $e');
    }
  }

  /// (Optional for later) PATCH /api/mentorship/review/{resumeReviewId}/close
  Future<void> closeResumeReview(int resumeReviewId) async {
    final uri = _buildUri('/mentorship/review/$resumeReviewId/close');
    try {
      final response = await _client.patch(uri, headers: _getHeaders());
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to close resume review. $e');
    }
  }

  /// GET /api/mentor/{mentorId}/reviews
  /// Gets all reviews for a specific mentor.
  Future<List<MentorReview>> getMentorReviews(int mentorId) async {
    final uri = _buildUri('/mentorship/mentor/$mentorId/reviews');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => MentorReview.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to get mentor reviews. $e');
    }
  }

  /// GET /api/mentor/review/{reviewId}
  /// Gets a specific mentor review.
  Future<MentorReview> getMentorReview(int reviewId) async {
    final uri = _buildUri('/mentorship/mentor/reviews/$reviewId');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return MentorReview.fromJson(data);
    } catch (e) {
      throw Exception('Failed to get mentor review. $e');
    }
  }

  Future<String?> getUsernameForUser(String userId) async {
    try {
      final profile = await getUserProfile(int.parse(userId));

      final full = profile.profile.fullName;

      return full.isNotEmpty ? full : null;
    } catch (_) {
      return null;
    }
  }

  // --- Profile Endpoints ---

  /// GET /api/profile
  /// Fetches the current user's profile data
  Future<FullProfile> getMyProfile() async {
    final uri = _buildUri('/profile');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final data = await _handleResponse(response);
      return FullProfile.fromJson(data);
    } catch (e) {
      throw Exception('Failed to load profile data. $e');
    }
  }

  /// GET /api/profile/{userId}
  /// Fetches a user profile by ID
  Future<FullProfile> getUserProfile(int userId) async {
    final uri = _buildUri('/profile/$userId');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final data = await _handleResponse(response);
      return FullProfile.fromJson(data);
    } catch (e) {
      throw Exception('Failed to load user profile. $e');
    }
  }

  /// PUT /api/profile
  /// Updates the current user's profile
  Future<Profile> updateProfile(Map<String, dynamic> profileData) async {
    final uri = _buildUri('/profile');

    print('ProfileProvider: Updating profile with data: $profileData');

    try {
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(profileData),
      );
      final data = await _handleResponse(response);
      print('ProfileProvider: Update response: $data');
      return Profile.fromJson(data);
    } catch (e) {
      throw Exception('Failed to update profile. $e');
    }
  }

  /// POST /api/profile/image
  /// Uploads a profile picture using multipart form data
  Future<Map<String, dynamic>> uploadProfilePicture(File imageFile) async {
    try {
      final uri = _buildUri('/profile/image');

      final request = http.MultipartRequest('POST', uri);

      // Add only auth header for multipart, remove Content-Type
      final token = _authProvider.token;
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      final fileStream = http.ByteStream(imageFile.openRead());
      final fileLength = await imageFile.length();
      final multipartFile = http.MultipartFile(
        'file',
        fileStream,
        fileLength,
        filename: 'profile_image.jpg',
        contentType: MediaType('image', 'jpeg'),
      );

      request.files.add(multipartFile);

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = await _handleResponse(response);
        return data as Map<String, dynamic>;
      } else {
        throw Exception('Failed to upload: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to upload profile picture: $e');
    }
  }

  /// GET /api/profile/image
  /// Fetches the profile picture as a direct image URL (used by Image.network)
  Future<String> getProfilePicture() async {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final url = '${AppConstants.baseUrl}/profile/image?t=$timestamp';
    return url;
  }

  /// DELETE /api/profile/image
  /// Deletes the user's profile picture
  Future<void> deleteProfilePicture() async {
    final uri = _buildUri('/profile/image');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());

      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to delete profile picture. $e');
    }
  }

  /// POST /api/profile/skill
  /// Adds a new skill to the current user's profile
  Future<Map<String, dynamic>> addSkill(String name, String level) async {
    final uri = _buildUri('/profile/skill');

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: jsonEncode({'name': name, 'level': level}),
      );
      final data = await _handleResponse(response);
      return data as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to add skill. $e');
    }
  }

  /// PUT /api/profile/skill/{skillId}
  /// Updates an existing skill
  Future<Map<String, dynamic>> updateSkill(
    int skillId,
    String name,
    String level,
  ) async {
    final uri = _buildUri('/profile/skill/$skillId');

    try {
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: jsonEncode({'name': name, 'level': level}),
      );
      final data = await _handleResponse(response);
      return data as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to update skill. $e');
    }
  }

  /// DELETE /api/profile/skill/{skillId}
  /// Deletes a skill from the current user's profile
  Future<void> deleteSkill(int skillId) async {
    final uri = _buildUri('/profile/skill/$skillId');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to delete skill. $e');
    }
  }

  /// POST /api/profile/interest
  /// Adds a new interest to the current user's profile
  Future<Map<String, dynamic>> addInterest(String name) async {
    final uri = _buildUri('/profile/interest');

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: jsonEncode({'name': name}),
      );
      final data = await _handleResponse(response);
      return data as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to add interest. $e');
    }
  }

  /// PUT /api/profile/interest/{interestId}
  /// Updates an existing interest
  Future<Map<String, dynamic>> updateInterest(
    int interestId,
    String name,
  ) async {
    final uri = _buildUri('/profile/interest/$interestId');

    try {
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: jsonEncode({'name': name}),
      );
      final data = await _handleResponse(response);
      return data as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to update interest. $e');
    }
  }

  /// DELETE /api/profile/interest/{interestId}
  /// Deletes an interest from the current user's profile
  Future<void> deleteInterest(int interestId) async {
    final uri = _buildUri('/profile/interest/$interestId');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to delete interest. $e');
    }
  }

  // --- Experience Endpoints ---

  /// POST /api/profile/experience
  /// Creates a new work experience entry
  Future<Experience> createExperience(
    Map<String, dynamic> experienceData,
  ) async {
    final uri = _buildUri('/profile/experience');

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(experienceData),
      );
      final data = await _handleResponse(response);
      return Experience.fromJson(data);
    } catch (e) {
      throw Exception('Failed to create experience. $e');
    }
  }

  /// PUT /api/profile/experience/{experienceId}
  /// Updates an existing work experience entry
  Future<Experience> updateExperience(
    int experienceId,
    Map<String, dynamic> experienceData,
  ) async {
    final uri = _buildUri('/profile/experience/$experienceId');

    try {
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(experienceData),
      );
      final data = await _handleResponse(response);
      return Experience.fromJson(data);
    } catch (e) {
      throw Exception('Failed to update experience. $e');
    }
  }

  /// DELETE /api/profile/experience/{experienceId}
  /// Deletes a work experience entry
  Future<void> deleteExperience(int experienceId) async {
    final uri = _buildUri('/profile/experience/$experienceId');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to delete experience. $e');
    }
  }

  /// POST /api/profile/education
  /// Creates a new education entry
  Future<Education> createEducation(Map<String, dynamic> educationData) async {
    final uri = _buildUri('/profile/education');

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(educationData),
      );
      final data = await _handleResponse(response);
      return Education.fromJson(data);
    } catch (e) {
      throw Exception('Failed to create education entry. $e');
    }
  }

  /// PUT /api/profile/education/{educationId}
  /// Updates an existing education entry
  Future<Education> updateEducation(
    int educationId,
    Map<String, dynamic> educationData,
  ) async {
    final uri = _buildUri('/profile/education/$educationId');

    try {
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(educationData),
      );
      final data = await _handleResponse(response);
      return Education.fromJson(data);
    } catch (e) {
      throw Exception('Failed to update education entry. $e');
    }
  }

  /// DELETE /api/profile/education/{educationId}
  /// Deletes an education entry
  Future<void> deleteEducation(int educationId) async {
    final uri = _buildUri('/profile/education/$educationId');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to delete education entry. $e');
    }
  }

  /// POST /api/profile
  /// Creates a new user profile
  Future<Profile> createProfile(Map<String, dynamic> profileData) async {
    final uri = _buildUri('/profile');

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(profileData),
      );
      final data = await _handleResponse(response);
      return Profile.fromJson(data);
    } catch (e) {
      throw Exception('Failed to create profile. $e');
    }
  }

  /// GET /api/profile/{userId}/badges
  /// Fetches a user's badges
  Future<List<Badge>> getUserBadges(int userId) async {
    final uri = _buildUri('/profile/$userId/badges');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => Badge.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load badges. $e');
    }
  }

  /// POST /api/profile/{userId}/badges
  /// Adds a badge to a user
  Future<void> addBadgeToUser(int userId, int badgeId) async {
    final uri = _buildUri('/profile/$userId/badges');

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: jsonEncode({'badgeId': badgeId}),
      );
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to add badge. $e');
    }
  }

  /// DELETE /api/profile/{userId}/badges/{badgeId}
  /// Removes a badge from a user
  Future<void> removeBadgeFromUser(int userId, int badgeId) async {
    final uri = _buildUri('/profile/$userId/badges/$badgeId');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to remove badge. $e');
    }
  }

  Future<void> updateMentorshipStatus(MentorshipStatus status) async {
    final url = Uri.parse('${AppConstants.baseUrl}/users/mentorship-status');
    final token = _authProvider.token;

    final headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };

    final body = jsonEncode({'mentorshipStatus': status.name});

    final response = await _client.put(url, headers: headers, body: body);

    if (response.statusCode != 200) {
      throw Exception('Failed to update mentorship status');
    }
  }

  // ─────────────────────────────────────────────────
  // Workplace Endpoints
  // ─────────────────────────────────────────────────

  /// POST /api/workplace
  /// Creates a new workplace (employer only)
  Future<Workplace> createWorkplace({
    required String companyName,
    required String sector,
    required String location,
    required String shortDescription,
    required String detailedDescription,
    required List<String> ethicalTags,
    String? website,
  }) async {
    final uri = _buildUri('/workplace');

    final body = jsonEncode({
      'companyName': companyName,
      'sector': sector,
      'location': location,
      'shortDescription': shortDescription,
      'detailedDescription': detailedDescription,
      'ethicalTags': ethicalTags.map((tag) => _formatEthicalTag(tag)).toList(),
      if (website != null && website.isNotEmpty) 'website': website,
    });

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      return Workplace.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to create workplace. $e');
    }
  }

  /// GET /api/workplace
  /// Fetches all workplaces with optional filters and pagination
  Future<PaginatedWorkplaceResponse> fetchWorkplaces({
    String? search,
    String? sector,
    String? location,
    String? ethicalTag,
    double? minRating,
    String? sort,
    int? page,
    int? size,
  }) async {
    final queryParams = <String, dynamic>{};

    if (search != null && search.isNotEmpty) {
      queryParams['search'] = search;
    }
    if (sector != null && sector.isNotEmpty) {
      queryParams['sector'] = sector;
    }
    if (location != null && location.isNotEmpty) {
      queryParams['location'] = location;
    }
    if (ethicalTag != null && ethicalTag.isNotEmpty) {
      queryParams['ethicalTag'] = ethicalTag;
      print('[API] Adding ethicalTag to query: $ethicalTag');
    }
    if (minRating != null) {
      queryParams['minRating'] = minRating;
    }
    if (sort != null && sort.isNotEmpty) {
      queryParams['sortBy'] = sort;
    }
    if (page != null) {
      queryParams['page'] = page;
    }
    if (size != null) {
      queryParams['size'] = size;
    }

    final uri = _buildUri('/workplace', queryParams);
    print('[API] Request URI: $uri');
    print('[API] Query params: $queryParams');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      print('[API] Response body: ${response.body}');
      print('[API] Response status: ${response.statusCode}');
      final dynamic data = await _handleResponse(response);
      final result = PaginatedWorkplaceResponse.fromJson(
        data as Map<String, dynamic>,
      );
      print('[API] Returned ${result.content.length} workplaces');
      return result;
    } catch (e) {
      print('[API] Error fetching workplaces: $e');
      throw Exception('Failed to load workplaces. $e');
    }
  }

  /// GET /api/workplace/{id}
  /// Fetches a specific workplace by ID
  Future<Workplace> getWorkplaceById(
    int workplaceId, {
    bool includeReviews = false,
    int? reviewsLimit,
  }) async {
    final queryParams = <String, dynamic>{};

    if (includeReviews) {
      queryParams['includeReviews'] = includeReviews;
    }
    if (reviewsLimit != null) {
      queryParams['reviewsLimit'] = reviewsLimit;
    }

    final uri = _buildUri('/workplace/$workplaceId', queryParams);

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return Workplace.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to load workplace details. $e');
    }
  }

  /// GET /api/jobs/workplace/{workplaceId}
  /// Fetches all job postings for a specific workplace
  Future<List<JobPost>> getJobsByWorkplaceId(int workplaceId) async {
    final uri = _buildUri('/jobs/workplace/$workplaceId');

    print('[API] Fetching jobs for workplace: $workplaceId');
    print('[API] Request URI: $uri');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      print('[API] Response status: ${response.statusCode}');
      final List<dynamic> data = await _handleResponse(response);
      final jobs = data.map((json) => JobPost.fromJson(json)).toList();
      print('[API] Returned ${jobs.length} jobs for workplace $workplaceId');
      return jobs;
    } catch (e) {
      print('[API] Error fetching workplace jobs: $e');
      throw Exception('Failed to load workplace jobs. $e');
    }
  }

  /// PUT /api/workplace/{id}
  /// Updates a workplace (owner/manager only)
  Future<Workplace> updateWorkplace({
    required int workplaceId,
    required String companyName,
    required String sector,
    required String location,
    required String shortDescription,
    required String detailedDescription,
    required List<String> ethicalTags,
    String? website,
  }) async {
    final uri = _buildUri('/workplace/$workplaceId');

    final body = jsonEncode({
      'companyName': companyName,
      'sector': sector,
      'location': location,
      'shortDescription': shortDescription,
      'detailedDescription': detailedDescription,
      'ethicalTags': ethicalTags.map((tag) => _formatEthicalTag(tag)).toList(),
      if (website != null && website.isNotEmpty) 'website': website,
    });

    try {
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      return Workplace.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to update workplace. $e');
    }
  }

  /// DELETE /api/workplace/{id}
  /// Deletes a workplace (owner only)
  Future<DeleteResponse> deleteWorkplace(int workplaceId) async {
    final uri = _buildUri('/workplace/$workplaceId');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return DeleteResponse.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to delete workplace. $e');
    }
  }

  /// POST /api/workplace/{id}/image
  /// Uploads a workplace image (owner/manager only)
  Future<WorkplaceImageResponse> uploadWorkplaceImage(
    int workplaceId,
    File imageFile,
  ) async {
    try {
      final uri = _buildUri('/workplace/$workplaceId/image');

      final request = http.MultipartRequest('POST', uri);

      // Add only auth header for multipart, remove Content-Type
      final token = _authProvider.token;
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      final fileStream = http.ByteStream(imageFile.openRead());
      final fileLength = await imageFile.length();

      // Determine file extension and content type
      final fileName = imageFile.path.split('/').last;
      final extension = fileName.split('.').last.toLowerCase();

      String contentTypeString;
      switch (extension) {
        case 'jpg':
        case 'jpeg':
          contentTypeString = 'image/jpeg';
          break;
        case 'png':
          contentTypeString = 'image/png';
          break;
        case 'gif':
          contentTypeString = 'image/gif';
          break;
        case 'webp':
          contentTypeString = 'image/webp';
          break;
        default:
          contentTypeString = 'image/jpeg';
      }

      final multipartFile = http.MultipartFile(
        'file',
        fileStream,
        fileLength,
        filename: fileName,
        contentType: MediaType.parse(contentTypeString),
      );

      request.files.add(multipartFile);

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = await _handleResponse(response);
        return WorkplaceImageResponse.fromJson(data as Map<String, dynamic>);
      } else {
        throw Exception('Failed to upload: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to upload workplace image: $e');
    }
  }

  /// DELETE /api/workplace/{id}/image
  /// Deletes a workplace image (owner/manager only)
  Future<DeleteResponse> deleteWorkplaceImage(int workplaceId) async {
    final uri = _buildUri('/workplace/$workplaceId/image');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return DeleteResponse.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to delete workplace image. $e');
    }
  }

  /// GET /api/workplace/{id}/rating
  /// Gets the rating information for a workplace
  Future<WorkplaceRating> getWorkplaceRating(int workplaceId) async {
    final uri = _buildUri('/workplace/$workplaceId/rating');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return WorkplaceRating.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to load workplace rating. $e');
    }
  }

  // ─────────────────────────────────────────────────
  // Workplace Review Endpoints
  // ─────────────────────────────────────────────────

  /// GET /api/workplace/{workplaceId}/review
  /// Fetches reviews for a workplace with filters and pagination
  Future<PaginatedWorkplaceReviewResponse> getWorkplaceReviews(
    int workplaceId, {
    String? ratingFilter,
    bool? hasComment,
    String? policy,
    int? policyMin,
    String? sortBy,
    int? page,
    int? size,
  }) async {
    final queryParams = <String, dynamic>{};

    if (ratingFilter != null && ratingFilter.isNotEmpty) {
      queryParams['ratingFilter'] = ratingFilter;
    }
    if (hasComment != null) queryParams['hasComment'] = hasComment;
    if (policy != null && policy.isNotEmpty) queryParams['policy'] = policy;
    if (policyMin != null) queryParams['policyMin'] = policyMin;
    if (sortBy != null && sortBy.isNotEmpty) queryParams['sortBy'] = sortBy;
    if (page != null) queryParams['page'] = page;
    if (size != null) queryParams['size'] = size;

    final uri = _buildUri('/workplace/$workplaceId/review', queryParams);

    // Debug: Log request details
    print('[API] GET Workplace Reviews Request:');
    print('[API]   URI: $uri');
    print('[API]   Query Params: $queryParams');

    try {
      final response = await _client.get(uri, headers: _getHeaders());

      // Debug: Log response details
      print('[API] GET Workplace Reviews Response:');
      print('[API]   Status Code: ${response.statusCode}');
      print('[API]   Response Body Length: ${response.body.length} characters');

      final dynamic data = await _handleResponse(response);
      final result = PaginatedWorkplaceReviewResponse.fromJson(
        data as Map<String, dynamic>,
      );

      // Debug: Log parsed results
      print('[API]   Total Reviews: ${result.totalElements}');
      print('[API]   Returned Reviews: ${result.content.length}');
      print('[API]   Reviews in response:');
      for (var review in result.content) {
        print(
          '[API]     - Review #${review.id}: Rating ${review.overallRating}, Title: "${review.title}"',
        );
      }

      return result;
    } catch (e) {
      print('[API] ERROR loading reviews: $e');
      throw Exception('Failed to load reviews. $e');
    }
  }

  /// GET /api/workplace/{workplaceId}/review/{reviewId}
  /// Fetches a single review
  Future<WorkplaceReview> getWorkplaceReviewById(
    int workplaceId,
    int reviewId,
  ) async {
    final uri = _buildUri('/workplace/$workplaceId/review/$reviewId');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return WorkplaceReview.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to load review. $e');
    }
  }

  /// POST /api/workplace/{workplaceId}/review
  /// Creates a review for a workplace
  Future<WorkplaceReview> createWorkplaceReview({
    required int workplaceId,
    required String title,
    required String content,
    required Map<String, int> ethicalPolicyRatings,
    required bool anonymous,
  }) async {
    final uri = _buildUri('/workplace/$workplaceId/review');

    final body = jsonEncode({
      'title': title,
      'content': content,
      'ethicalPolicyRatings': ethicalPolicyRatings,
      'anonymous': anonymous,
    });

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      return WorkplaceReview.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to create review. $e');
    }
  }

  /// PUT /api/workplace/{workplaceId}/review/{reviewId}
  /// Updates a review (author only)
  Future<WorkplaceReview> updateWorkplaceReview({
    required int workplaceId,
    required int reviewId,
    String? title,
    String? content,
    bool? anonymous,
    Map<String, int>? ethicalPolicyRatings,
  }) async {
    final uri = _buildUri('/workplace/$workplaceId/review/$reviewId');

    final body = jsonEncode({
      if (title != null) 'title': title,
      if (content != null) 'content': content,
      if (anonymous != null) 'anonymous': anonymous,
      if (ethicalPolicyRatings != null)
        'ethicalPolicyRatings': ethicalPolicyRatings,
    });

    try {
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      return WorkplaceReview.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to update review. $e');
    }
  }

  /// DELETE /api/workplace/{workplaceId}/review/{reviewId}
  /// Deletes a review (author only)
  Future<void> deleteWorkplaceReview(int workplaceId, int reviewId) async {
    final uri = _buildUri('/workplace/$workplaceId/review/$reviewId');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to delete review. $e');
    }
  }

  /// POST /api/workplace/review/{reviewId}/helpful
  /// Marks a review as helpful
  Future<void> markReviewHelpful(int reviewId) async {
    final uri = _buildUri('/workplace/review/$reviewId/helpful');

    try {
      final response = await _client.post(uri, headers: _getHeaders());
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to mark review as helpful. $e');
    }
  }

  /// GET /api/workplace/{workplaceId}/review/{reviewId}/reply
  /// Gets a reply to a review
  Future<WorkplaceReply> getWorkplaceReviewReply({
    required int workplaceId,
    required int reviewId,
  }) async {
    final uri = _buildUri('/workplace/$workplaceId/review/$reviewId/reply');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return WorkplaceReply.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to get reply. $e');
    }
  }

  /// POST /api/workplace/{workplaceId}/review/{reviewId}/reply
  /// Creates a reply to a review (employer only)
  Future<WorkplaceReply> replyToWorkplaceReview({
    required int workplaceId,
    required int reviewId,
    required String content,
  }) async {
    final uri = _buildUri('/workplace/$workplaceId/review/$reviewId/reply');

    final body = jsonEncode({'content': content});

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      return WorkplaceReply.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to reply to review. $e');
    }
  }

  /// PUT /api/workplace/{workplaceId}/review/{reviewId}/reply
  /// Updates a reply to a review (employer only)
  Future<WorkplaceReply> updateWorkplaceReply({
    required int workplaceId,
    required int reviewId,
    required String content,
  }) async {
    final uri = _buildUri('/workplace/$workplaceId/review/$reviewId/reply');

    final body = jsonEncode({'content': content});

    try {
      final response = await _client.put(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      return WorkplaceReply.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to update reply. $e');
    }
  }

  /// DELETE /api/workplace/{workplaceId}/review/{reviewId}/reply
  /// Deletes a reply to a review (employer only)
  Future<void> deleteWorkplaceReply({
    required int workplaceId,
    required int reviewId,
  }) async {
    final uri = _buildUri('/workplace/$workplaceId/review/$reviewId/reply');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to delete reply. $e');
    }
  }

  /// POST /api/workplace/{id}/report
  /// Reports a workplace
  Future<void> reportWorkplace({
    required int workplaceId,
    required String reasonType,
    required String description,
  }) async {
    final uri = _buildUri('/workplace/$workplaceId/report');

    final body = jsonEncode({
      'reasonType': reasonType,
      'description': description,
    });

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to report workplace. $e');
    }
  }

  /// POST /api/workplace/{id}/review/{reviewId}/report
  /// Reports a workplace review
  Future<void> reportWorkplaceReview({
    required int workplaceId,
    required int reviewId,
    required String reasonType,
    required String description,
  }) async {
    final uri = _buildUri('/workplace/$workplaceId/review/$reviewId/report');

    final body = jsonEncode({
      'reasonType': reasonType,
      'description': description,
    });

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to report review. $e');
    }
  }

  // ─────────────────────────────────────────────────
  // Workplace Employer Management Endpoints
  // ─────────────────────────────────────────────────

  /// POST /api/workplace/{workplaceId}/manager
  /// Adds a manager to a workplace (owner only)
  Future<WorkplaceEmployer> addWorkplaceManager({
    required int workplaceId,
    required int userId,
  }) async {
    final uri = _buildUri('/workplace/$workplaceId/manager');

    final body = jsonEncode({'userId': userId});

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      return WorkplaceEmployer.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to add manager. $e');
    }
  }

  /// DELETE /api/workplace/{workplaceId}/employer/{userId}
  /// Removes an employer from a workplace (owner only)
  Future<void> removeWorkplaceEmployer({
    required int workplaceId,
    required int userId,
  }) async {
    final uri = _buildUri('/workplace/$workplaceId/employer/$userId');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to remove employer. $e');
    }
  }

  /// POST /api/workplace/{workplaceId}/request-manager
  /// Sends a request to become a manager (job seeker/employer)
  Future<void> requestManagerRole(int workplaceId) async {
    final uri = _buildUri('/workplace/$workplaceId/request-manager');

    try {
      final response = await _client.post(uri, headers: _getHeaders());
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to send manager request. $e');
    }
  }

  /// GET /api/workplace/{workplaceId}/manager-requests
  /// Gets all pending manager requests for a workplace (owner only)
  Future<List<Map<String, dynamic>>> getManagerRequests(int workplaceId) async {
    final uri = _buildUri('/workplace/$workplaceId/manager-requests');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((e) => e as Map<String, dynamic>).toList();
    } catch (e) {
      throw Exception('Failed to load manager requests. $e');
    }
  }

  /// POST /api/workplace/{workplaceId}/manager-request/{requestId}/approve
  /// Approves a manager request (owner only)
  Future<void> approveManagerRequest({
    required int workplaceId,
    required int requestId,
  }) async {
    final uri = _buildUri(
      '/workplace/$workplaceId/manager-request/$requestId/approve',
    );

    try {
      final response = await _client.post(uri, headers: _getHeaders());
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to approve manager request. $e');
    }
  }

  /// POST /api/workplace/{workplaceId}/manager-request/{requestId}/reject
  /// Rejects a manager request (owner only)
  Future<void> rejectManagerRequest({
    required int workplaceId,
    required int requestId,
  }) async {
    final uri = _buildUri(
      '/workplace/$workplaceId/manager-request/$requestId/reject',
    );

    try {
      final response = await _client.post(uri, headers: _getHeaders());
      await _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to reject manager request. $e');
    }
  }

  /// GET /api/workplace/my-workplaces
  /// Gets all workplaces where the current user is an employer
  Future<List<Workplace>> getMyWorkplaces() async {
    final uri = _buildUri('/workplace/my-workplaces');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => Workplace.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load my workplaces. $e');
    }
  }

  /// GET /api/workplace/employers/me
  /// Lists workplaces where current user is OWNER or MANAGER
  Future<List<EmployerWorkplaceItem>> getMyEmployerWorkplaces() async {
    final uri = _buildUri('/workplace/employers/me');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => EmployerWorkplaceItem.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load employer workplaces. $e');
    }
  }

  /// GET /api/workplace/{workplaceId}/employers
  /// Lists all employers of a workplace
  Future<List<WorkplaceEmployer>> getWorkplaceEmployers(int workplaceId) async {
    final uri = _buildUri('/workplace/$workplaceId/employers');

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final List<dynamic> data = await _handleResponse(response);
      return data.map((json) => WorkplaceEmployer.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load workplace employers. $e');
    }
  }

  /// GET /api/workplace/{id}/employers/request
  /// Gets employer requests for a workplace (paginated)
  Future<PaginatedEmployerRequestResponse> getEmployerRequests(
    int workplaceId, {
    int page = 0,
    int size = 10,
  }) async {
    final queryParams = <String, dynamic>{'page': page, 'size': size};

    final uri = _buildUri(
      '/workplace/$workplaceId/employers/request',
      queryParams,
    );

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return PaginatedEmployerRequestResponse.fromJson(
        data as Map<String, dynamic>,
      );
    } catch (e) {
      throw Exception('Failed to load employer requests. $e');
    }
  }

  /// POST /api/workplace/{id}/employers/request
  /// Creates an employer request for a workplace
  Future<EmployerRequest> createEmployerRequest(
    int workplaceId, {
    String? note,
  }) async {
    final uri = _buildUri('/workplace/$workplaceId/employers/request');

    final body = jsonEncode({
      if (note != null && note.isNotEmpty) 'note': note,
    });

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      return EmployerRequest.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to create employer request. $e');
    }
  }

  /// GET /api/workplace/{id}/employers/request/{requestId}
  /// Gets a specific employer request
  Future<EmployerRequest> getEmployerRequest(
    int workplaceId,
    int requestId,
  ) async {
    final uri = _buildUri(
      '/workplace/$workplaceId/employers/request/$requestId',
    );

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return EmployerRequest.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to load employer request. $e');
    }
  }

  /// POST /api/workplace/{id}/employers/request/{requestId}
  /// Approves or rejects an employer request (owner only)
  Future<EmployerRequestActionResponse> handleEmployerRequest(
    int workplaceId,
    int requestId, {
    required String action, // "approve" or "reject"
  }) async {
    final uri = _buildUri(
      '/workplace/$workplaceId/employers/request/$requestId',
    );

    final body = jsonEncode({'action': action});

    try {
      final response = await _client.post(
        uri,
        headers: _getHeaders(),
        body: body,
      );
      final dynamic data = await _handleResponse(response);
      return EmployerRequestActionResponse.fromJson(
        data as Map<String, dynamic>,
      );
    } catch (e) {
      throw Exception('Failed to handle employer request. $e');
    }
  }

  /// DELETE /api/workplace/{id}/employers/{employerId}
  /// Removes an employer from a workplace (owner only)
  Future<DeleteResponse> removeEmployerFromWorkplace(
    int workplaceId,
    int employerId,
  ) async {
    final uri = _buildUri('/workplace/$workplaceId/employers/$employerId');

    try {
      final response = await _client.delete(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return DeleteResponse.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to remove employer. $e');
    }
  }

  /// GET /api/workplace/employers/requests/me
  /// Gets the current user's employer requests (paginated)
  Future<PaginatedEmployerRequestResponse> getMyEmployerRequests({
    int page = 0,
    int size = 10,
  }) async {
    final queryParams = <String, dynamic>{'page': page, 'size': size};

    final uri = _buildUri('/workplace/employers/requests/me', queryParams);

    try {
      final response = await _client.get(uri, headers: _getHeaders());
      final dynamic data = await _handleResponse(response);
      return PaginatedEmployerRequestResponse.fromJson(
        data as Map<String, dynamic>,
      );
    } catch (e) {
      throw Exception('Failed to load my employer requests. $e');
    }
  }

  void dispose() {
    _client.close();
  }
}
