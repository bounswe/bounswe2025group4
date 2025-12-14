import 'dart:io';
import 'package:flutter/foundation.dart';
import '../models/workplace.dart';
import '../models/workplace_review.dart';
import '../models/workplace_reply.dart';
import '../models/workplace_employer.dart';
import '../models/workplace_list_item.dart';
import '../models/paginated_workplace_response.dart';
import '../models/delete_response.dart';
import '../models/workplace_image_response.dart';
import '../models/workplace_rating.dart';
import '../models/employer_workplace_item.dart';
import '../models/employer_request.dart';
import '../models/paginated_employer_request_response.dart';
import '../models/employer_request_action_response.dart';
import '../services/api_service.dart';

/// Provider for managing workplace-related state and operations
class WorkplaceProvider with ChangeNotifier {
  final ApiService _apiService;

  WorkplaceProvider({required ApiService apiService})
    : _apiService = apiService;

  // State
  List<WorkplaceListItem> _workplaces = [];
  PaginatedWorkplaceResponse? _paginatedResponse;
  Workplace? _currentWorkplace;
  List<WorkplaceReview> _currentReviews = [];
  List<Workplace> _myWorkplaces = [];
  PaginatedEmployerRequestResponse? _myEmployerRequests;
  bool _isLoading = false;
  String? _error;

  // Getters
  List<WorkplaceListItem> get workplaces => _workplaces;
  PaginatedWorkplaceResponse? get paginatedResponse => _paginatedResponse;
  Workplace? get currentWorkplace => _currentWorkplace;
  List<WorkplaceReview> get currentReviews => _currentReviews;
  List<Workplace> get myWorkplaces => _myWorkplaces;
  PaginatedEmployerRequestResponse? get myEmployerRequests =>
      _myEmployerRequests;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Helper method to set loading state
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Helper method to set error
  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  // ─────────────────────────────────────────────────
  // Workplace Management
  // ─────────────────────────────────────────────────

  /// Fetches all workplaces with optional filters and pagination
  Future<void> fetchWorkplaces({
    String? search,
    String? sector,
    String? location,
    String? ethicalTag,
    double? minRating,
    String? sort,
    int? page,
    int? size,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      _paginatedResponse = await _apiService.fetchWorkplaces(
        search: search,
        sector: sector,
        location: location,
        ethicalTag: ethicalTag,
        minRating: minRating,
        sort: sort,
        page: page,
        size: size,
      );
      _workplaces = _paginatedResponse!.content;
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  /// Fetches a specific workplace by ID
  Future<void> fetchWorkplaceById(
    int workplaceId, {
    bool includeReviews = false,
    int? reviewsLimit,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      _currentWorkplace = await _apiService.getWorkplaceById(
        workplaceId,
        includeReviews: includeReviews,
        reviewsLimit: reviewsLimit,
      );

      // If reviews are included, update the current reviews list
      if (includeReviews && _currentWorkplace != null) {
        _currentReviews = _currentWorkplace!.recentReviews;
      }

      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  /// Creates a new workplace
  Future<Workplace?> createWorkplace({
    required String companyName,
    required String sector,
    required String location,
    required String shortDescription,
    required String detailedDescription,
    required List<String> ethicalTags,
    String? website,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final workplace = await _apiService.createWorkplace(
        companyName: companyName,
        sector: sector,
        location: location,
        shortDescription: shortDescription,
        detailedDescription: detailedDescription,
        ethicalTags: ethicalTags,
        website: website,
      );

      // Add to my workplaces
      _myWorkplaces.add(workplace);
      notifyListeners();

      return workplace;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Updates a workplace
  Future<bool> updateWorkplace({
    required int workplaceId,
    required String companyName,
    required String sector,
    required String location,
    required String shortDescription,
    required String detailedDescription,
    required List<String> ethicalTags,
    String? website,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final updatedWorkplace = await _apiService.updateWorkplace(
        workplaceId: workplaceId,
        companyName: companyName,
        sector: sector,
        location: location,
        shortDescription: shortDescription,
        detailedDescription: detailedDescription,
        ethicalTags: ethicalTags,
        website: website,
      );

      // Update current workplace if it matches
      if (_currentWorkplace?.id == workplaceId) {
        _currentWorkplace = updatedWorkplace;
      }

      // Update in my workplaces list
      final index = _myWorkplaces.indexWhere((w) => w.id == workplaceId);
      if (index != -1) {
        _myWorkplaces[index] = updatedWorkplace;
      }

      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Deletes a workplace
  Future<DeleteResponse?> deleteWorkplace(int workplaceId) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiService.deleteWorkplace(workplaceId);

      // Remove from my workplaces
      _myWorkplaces.removeWhere((w) => w.id == workplaceId);

      // Clear current workplace if it matches
      if (_currentWorkplace?.id == workplaceId) {
        _currentWorkplace = null;
      }

      notifyListeners();
      return response;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Fetches workplaces where the current user is an employer
  Future<void> fetchMyWorkplaces() async {
    _setLoading(true);
    _setError(null);

    try {
      _myWorkplaces = await _apiService.getMyWorkplaces();
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  /// Uploads a workplace image
  Future<WorkplaceImageResponse?> uploadWorkplaceImage(
    int workplaceId,
    File imageFile,
  ) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiService.uploadWorkplaceImage(
        workplaceId,
        imageFile,
      );

      // Refresh the workplace to get updated image URL
      await fetchWorkplaceById(workplaceId, includeReviews: false);

      return response;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Deletes a workplace image
  Future<DeleteResponse?> deleteWorkplaceImage(int workplaceId) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiService.deleteWorkplaceImage(workplaceId);

      // Refresh the workplace
      await fetchWorkplaceById(workplaceId, includeReviews: false);

      return response;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Gets the rating information for a workplace
  Future<WorkplaceRating?> getWorkplaceRating(int workplaceId) async {
    _setLoading(true);
    _setError(null);

    try {
      final rating = await _apiService.getWorkplaceRating(workplaceId);
      return rating;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────
  // Review Management
  // ─────────────────────────────────────────────────

  /// Fetches reviews for a workplace with pagination and filters
  /// sortBy can be: 'ratingAsc' or 'ratingDesc'
  /// ratingFilter format: '<min>,<max>' (e.g., '1,3' for ratings 1-3)
  Future<void> fetchWorkplaceReviews(
    int workplaceId, {
    String? ratingFilter,
    bool? hasComment,
    String? policy,
    int? policyMin,
    String? sortBy,
    int? page,
    int? size,
  }) async {
    _setLoading(true);
    _setError(null);

    // Debug: Log provider call
    print('[WorkplaceProvider] fetchWorkplaceReviews called:');
    print('[WorkplaceProvider]   workplaceId: $workplaceId');
    print('[WorkplaceProvider]   ratingFilter: $ratingFilter');
    print('[WorkplaceProvider]   sortBy: $sortBy');
    print('[WorkplaceProvider]   hasComment: $hasComment');
    print('[WorkplaceProvider]   policy: $policy');
    print('[WorkplaceProvider]   policyMin: $policyMin');
    print('[WorkplaceProvider]   page: $page');
    print('[WorkplaceProvider]   size: $size');

    try {
      final response = await _apiService.getWorkplaceReviews(
        workplaceId,
        ratingFilter: ratingFilter,
        hasComment: hasComment,
        policy: policy,
        policyMin: policyMin,
        sortBy: sortBy,
        page: page,
        size: size,
      );
      _currentReviews = response.content;

      // Debug: Log result
      print('[WorkplaceProvider] Reviews fetched successfully:');
      print('[WorkplaceProvider]   Count: ${_currentReviews.length}');

      notifyListeners();
    } catch (e) {
      print('[WorkplaceProvider] ERROR fetching reviews: $e');
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  /// Fetches a single review
  Future<WorkplaceReview?> fetchWorkplaceReviewById(
    int workplaceId,
    int reviewId,
  ) async {
    _setLoading(true);
    _setError(null);

    try {
      final review = await _apiService.getWorkplaceReviewById(
        workplaceId,
        reviewId,
      );
      return review;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Creates a review for a workplace
  Future<WorkplaceReview?> createReview({
    required int workplaceId,
    required String title,
    required String content,
    required Map<String, int> ethicalPolicyRatings,
    required bool anonymous,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final review = await _apiService.createWorkplaceReview(
        workplaceId: workplaceId,
        title: title,
        content: content,
        ethicalPolicyRatings: ethicalPolicyRatings,
        anonymous: anonymous,
      );

      // Add to current reviews
      _currentReviews.insert(0, review);
      notifyListeners();

      return review;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Updates a review
  Future<bool> updateReview({
    required int workplaceId,
    required int reviewId,
    String? title,
    String? content,
    bool? anonymous,
    Map<String, int>? ethicalPolicyRatings,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final updatedReview = await _apiService.updateWorkplaceReview(
        workplaceId: workplaceId,
        reviewId: reviewId,
        title: title,
        content: content,
        anonymous: anonymous,
        ethicalPolicyRatings: ethicalPolicyRatings,
      );

      // Update in current reviews list
      final index = _currentReviews.indexWhere((r) => r.id == reviewId);
      if (index != -1) {
        _currentReviews[index] = updatedReview;
        notifyListeners();
      }

      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Deletes a review
  Future<bool> deleteReview(int workplaceId, int reviewId) async {
    _setLoading(true);
    _setError(null);

    try {
      await _apiService.deleteWorkplaceReview(workplaceId, reviewId);

      // Remove from current reviews
      _currentReviews.removeWhere((r) => r.id == reviewId);
      notifyListeners();

      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Reports any type of content (workplace, review, etc.)
  Future<bool> reportContent({
    required String entityType,
    required int entityId,
    required String reasonType,
    required String description,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      await _apiService.reportContent(
        entityType: entityType,
        entityId: entityId,
        reasonType: reasonType,
        description: description,
      );
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Marks a review as helpful
  Future<bool> markReviewHelpful(int reviewId) async {
    _setError(null);

    try {
      await _apiService.markReviewHelpful(reviewId);

      // Update the helpful count in the local review
      final index = _currentReviews.indexWhere((r) => r.id == reviewId);
      if (index != -1) {
        // Note: You might need to refresh the review to get the updated count
        // For now, we'll just increment it locally
        final review = _currentReviews[index];
        _currentReviews[index] = WorkplaceReview(
          id: review.id,
          workplaceId: review.workplaceId,
          userId: review.userId,
          username: review.username,
          nameSurname: review.nameSurname,
          title: review.title,
          content: review.content,
          anonymous: review.anonymous,
          helpfulCount: review.helpfulCount + 1,
          overallRating: review.overallRating,
          ethicalPolicyRatings: review.ethicalPolicyRatings,
          reply: review.reply,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        );
        notifyListeners();
      }

      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    }
  }

  /// Gets a reply to a review
  Future<WorkplaceReply?> getReply({
    required int workplaceId,
    required int reviewId,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final reply = await _apiService.getWorkplaceReviewReply(
        workplaceId: workplaceId,
        reviewId: reviewId,
      );
      return reply;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Replies to a review
  Future<WorkplaceReply?> replyToReview({
    required int workplaceId,
    required int reviewId,
    required String content,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final reply = await _apiService.replyToWorkplaceReview(
        workplaceId: workplaceId,
        reviewId: reviewId,
        content: content,
      );

      // Update the review with the reply
      final index = _currentReviews.indexWhere((r) => r.id == reviewId);
      if (index != -1) {
        final review = _currentReviews[index];
        _currentReviews[index] = WorkplaceReview(
          id: review.id,
          workplaceId: review.workplaceId,
          userId: review.userId,
          username: review.username,
          nameSurname: review.nameSurname,
          title: review.title,
          content: review.content,
          anonymous: review.anonymous,
          helpfulCount: review.helpfulCount,
          overallRating: review.overallRating,
          ethicalPolicyRatings: review.ethicalPolicyRatings,
          reply: reply,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        );
        notifyListeners();
      }

      return reply;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Updates a reply
  Future<bool> updateReply({
    required int workplaceId,
    required int reviewId,
    required String content,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final updatedReply = await _apiService.updateWorkplaceReply(
        workplaceId: workplaceId,
        reviewId: reviewId,
        content: content,
      );

      // Update the reply in the corresponding review
      final index = _currentReviews.indexWhere((r) => r.id == reviewId);
      if (index != -1) {
        final review = _currentReviews[index];
        _currentReviews[index] = WorkplaceReview(
          id: review.id,
          workplaceId: review.workplaceId,
          userId: review.userId,
          username: review.username,
          nameSurname: review.nameSurname,
          title: review.title,
          content: review.content,
          anonymous: review.anonymous,
          helpfulCount: review.helpfulCount,
          overallRating: review.overallRating,
          ethicalPolicyRatings: review.ethicalPolicyRatings,
          reply: updatedReply,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        );
        notifyListeners();
      }

      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Deletes a reply
  Future<bool> deleteReply({
    required int workplaceId,
    required int reviewId,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      await _apiService.deleteWorkplaceReply(
        workplaceId: workplaceId,
        reviewId: reviewId,
      );

      // Remove the reply from the corresponding review
      final index = _currentReviews.indexWhere((r) => r.id == reviewId);
      if (index != -1) {
        final review = _currentReviews[index];
        _currentReviews[index] = WorkplaceReview(
          id: review.id,
          workplaceId: review.workplaceId,
          userId: review.userId,
          username: review.username,
          nameSurname: review.nameSurname,
          title: review.title,
          content: review.content,
          anonymous: review.anonymous,
          helpfulCount: review.helpfulCount,
          overallRating: review.overallRating,
          ethicalPolicyRatings: review.ethicalPolicyRatings,
          reply: null,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        );
        notifyListeners();
      }

      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────
  // Employer Management
  // ─────────────────────────────────────────────────

  /// Adds a manager to a workplace
  Future<WorkplaceEmployer?> addManager({
    required int workplaceId,
    required int userId,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final manager = await _apiService.addWorkplaceManager(
        workplaceId: workplaceId,
        userId: userId,
      );

      // Refresh the workplace to get updated employers list
      await fetchWorkplaceById(workplaceId, includeReviews: false);

      return manager;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Removes an employer from a workplace
  Future<bool> removeEmployer({
    required int workplaceId,
    required int userId,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      await _apiService.removeWorkplaceEmployer(
        workplaceId: workplaceId,
        userId: userId,
      );

      // Refresh the workplace to get updated employers list
      await fetchWorkplaceById(workplaceId, includeReviews: false);

      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Sends a request to become a manager
  Future<bool> requestManagerRole(int workplaceId) async {
    _setLoading(true);
    _setError(null);

    try {
      await _apiService.requestManagerRole(workplaceId);
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Gets pending manager requests for a workplace
  Future<List<Map<String, dynamic>>> getManagerRequests(int workplaceId) async {
    _setLoading(true);
    _setError(null);

    try {
      final requests = await _apiService.getManagerRequests(workplaceId);
      return requests;
    } catch (e) {
      _setError(e.toString());
      return [];
    } finally {
      _setLoading(false);
    }
  }

  /// Approves a manager request
  Future<bool> approveManagerRequest({
    required int workplaceId,
    required int requestId,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      await _apiService.approveManagerRequest(
        workplaceId: workplaceId,
        requestId: requestId,
      );

      // Refresh the workplace to get updated employers list
      await fetchWorkplaceById(workplaceId, includeReviews: false);

      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Rejects a manager request
  Future<bool> rejectManagerRequest({
    required int workplaceId,
    required int requestId,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      await _apiService.rejectManagerRequest(
        workplaceId: workplaceId,
        requestId: requestId,
      );
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Clears the error message
  void clearError() {
    _error = null;
    notifyListeners();
  }

  /// Clears the current workplace
  void clearCurrentWorkplace() {
    _currentWorkplace = null;
    _currentReviews = [];
    notifyListeners();
  }

  // ─────────────────────────────────────────────────
  // New Employer Management Endpoints
  // ─────────────────────────────────────────────────

  /// Gets workplaces where current user is OWNER or MANAGER
  Future<List<EmployerWorkplaceItem>> getMyEmployerWorkplaces() async {
    _setLoading(true);
    _setError(null);

    try {
      final workplaces = await _apiService.getMyEmployerWorkplaces();
      return workplaces;
    } catch (e) {
      _setError(e.toString());
      return [];
    } finally {
      _setLoading(false);
    }
  }

  /// Gets all employers of a workplace
  Future<List<WorkplaceEmployer>> getWorkplaceEmployers(int workplaceId) async {
    _setLoading(true);
    _setError(null);

    try {
      final employers = await _apiService.getWorkplaceEmployers(workplaceId);
      return employers;
    } catch (e) {
      _setError(e.toString());
      return [];
    } finally {
      _setLoading(false);
    }
  }

  /// Gets employer requests for a workplace (paginated)
  Future<PaginatedEmployerRequestResponse?> getEmployerRequests(
    int workplaceId, {
    int page = 0,
    int size = 10,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiService.getEmployerRequests(
        workplaceId,
        page: page,
        size: size,
      );
      return response;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Creates an employer request for a workplace
  Future<EmployerRequest?> createEmployerRequest(
    int workplaceId, {
    String? note,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final request = await _apiService.createEmployerRequest(
        workplaceId,
        note: note,
      );
      return request;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Gets a specific employer request
  Future<EmployerRequest?> getEmployerRequest(
    int workplaceId,
    int requestId,
  ) async {
    _setLoading(true);
    _setError(null);

    try {
      final request = await _apiService.getEmployerRequest(
        workplaceId,
        requestId,
      );
      return request;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Handles an employer request (approve or reject)
  Future<EmployerRequestActionResponse?> handleEmployerRequest(
    int workplaceId,
    int requestId, {
    required String action,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiService.handleEmployerRequest(
        workplaceId,
        requestId,
        action: action,
      );
      return response;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Removes an employer from a workplace
  Future<DeleteResponse?> removeEmployerFromWorkplace(
    int workplaceId,
    int employerId,
  ) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiService.removeEmployerFromWorkplace(
        workplaceId,
        employerId,
      );
      return response;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Gets the current user's employer requests (paginated)
  Future<void> fetchMyEmployerRequests({int page = 0, int size = 10}) async {
    _setLoading(true);
    _setError(null);

    try {
      _myEmployerRequests = await _apiService.getMyEmployerRequests(
        page: page,
        size: size,
      );
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }
}
