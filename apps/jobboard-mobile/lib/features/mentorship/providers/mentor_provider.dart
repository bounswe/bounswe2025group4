import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/models/mentor_profile.dart';
import 'package:mobile/core/models/mentorship_request.dart';
// import 'package:mobile/core/models/mentor_review.dart'; // Not strictly used in provider state
import 'package:mobile/core/services/api_service.dart';

class MentorProvider with ChangeNotifier {
  final ApiService _apiService;

  // Data collections
  List<MentorProfile> _availableMentors = [];
  List<MentorshipRequest> _mentorRequests = [];
  List<MentorshipRequest> _menteeRequests = [];
  MentorProfile? _currentUserMentorProfile;

  // Loading states
  bool _isLoadingMentors = false;
  bool _isLoadingMentorRequests = false;
  bool _isLoadingMenteeRequests = false;
  bool _isLoadingProfile = false;
  String? _error;

  MentorProvider({required ApiService apiService}) : _apiService = apiService;

  // Getters
  List<MentorProfile> get availableMentors => _availableMentors;
  List<MentorshipRequest> get mentorRequests => _mentorRequests;
  List<MentorshipRequest> get menteeRequests => _menteeRequests;
  MentorProfile? get currentUserMentorProfile => _currentUserMentorProfile;
  bool get isLoadingMentors => _isLoadingMentors;
  bool get isLoadingMentorRequests => _isLoadingMentorRequests;
  bool get isLoadingMenteeRequests => _isLoadingMenteeRequests;
  bool get isLoadingProfile => _isLoadingProfile;
  String? get error => _error;

  // Get all available mentors
  Future<void> fetchAvailableMentors() async {
    _isLoadingMentors = true;
    _error = null;
    notifyListeners();

    try {
      _availableMentors = await _apiService.getAllMentorProfiles();
      // Filter locally based on calculated property
      _availableMentors =
          _availableMentors.where((mentor) => mentor.isAvailable).toList();
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching mentors: $_error');
    } finally {
      _isLoadingMentors = false;
      notifyListeners();
    }
  }

  // Get requests where current user is Mentor
  Future<void> fetchMentorRequests(String currentUserId) async {
    _isLoadingMentorRequests = true;
    _error = null;
    notifyListeners();

    try {
      _mentorRequests = await _apiService.getRequestsForMentor(currentUserId);
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching mentor requests: $_error');
    } finally {
      _isLoadingMentorRequests = false;
      notifyListeners();
    }
  }

  // Get requests where current user is Mentee
  Future<void> fetchMenteeRequests(String currentUserId) async {
    _isLoadingMenteeRequests = true;
    _error = null;
    notifyListeners();

    try {
      _menteeRequests = await _apiService.getRequestsByMentee(currentUserId);
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching mentee requests: $_error');
    } finally {
      _isLoadingMenteeRequests = false;
      notifyListeners();
    }
  }

  // Create a mentorship request
  // Note: 'message' param removed as per new API spec
  Future<bool> createMentorshipRequest({
    required String mentorId,
  }) async {
    try {
      final request = await _apiService.createMentorshipRequest(
        mentorId: mentorId,
      );

      // Add to list
      _menteeRequests.add(request);
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Error creating mentorship request: ${e.toString()}');
      throw Exception('Failed to create mentorship request: ${e.toString()}');
    }
  }

  // Accept or Reject a request
  Future<bool> respondToRequest({
    required String requestId,
    required bool accept,
  }) async {
    _error = null;
    notifyListeners();

    try {
      final updatedRequest = await _apiService.respondToMentorshipRequest(
        requestId,
        accept: accept,
      );

      _updateRequestInLists(updatedRequest);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      debugPrint('Error responding to request: $_error');
      notifyListeners();
      return false;
    }
  }

  // Fetch current user's mentor profile
  Future<void> fetchCurrentUserMentorProfile(String userId) async {
    _isLoadingProfile = true;
    _error = null;
    notifyListeners();

    try {
      _currentUserMentorProfile = await _apiService.getMentorProfile(userId);
    } catch (e) {
      if (e.toString().contains('404')) {
        _currentUserMentorProfile = null;
      } else {
        _error = e.toString();
        debugPrint('Error fetching current user mentor profile: $_error');
      }
    } finally {
      _isLoadingProfile = false;
      notifyListeners();
    }
  }

  // Create Mentor Profile
  // 'isAvailable' is no longer a direct setting, it depends on capacity
  Future<bool> createMentorProfile({
    required List<String> expertise,
    required int maxMentees,
  }) async {
    _isLoadingProfile = true;
    _error = null;
    notifyListeners();

    try {
      _currentUserMentorProfile = await _apiService.createMentorProfile(
        expertise: expertise,
        maxMentees: maxMentees,
      );
      _isLoadingProfile = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      debugPrint('Error creating mentor profile: $_error');
      _isLoadingProfile = false;
      notifyListeners();
      return false;
    }
  }

  // Update Mentor Profile (Capacity/Expertise)
  Future<bool> updateMentorProfile({
    required String userId,
    required List<String> expertise,
    required int maxMentees,
  }) async {
    if (_currentUserMentorProfile == null) return false;

    _isLoadingProfile = true;
    _error = null;
    notifyListeners();

    try {
      _currentUserMentorProfile = await _apiService.updateMentorProfile(
        userId: userId,
        expertise: expertise,
        maxMentees: maxMentees,
      );
      _isLoadingProfile = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      debugPrint('Error updating mentor profile: $_error');
      _isLoadingProfile = false;
      notifyListeners();
      return false;
    }
  }

  // Create a Rating
  Future<bool> createRating({
    required int resumeReviewId,
    required int rating,
    String? comment,
  }) async {
    _error = null;
    notifyListeners();

    try {
      await _apiService.createMentorshipRating(
        resumeReviewId: resumeReviewId,
        rating: rating,
        comment: comment,
      );
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      debugPrint('Error creating rating: $_error');
      notifyListeners();
      return false;
    }
  }

  void _updateRequestInLists(MentorshipRequest updatedRequest) {
    final mentorIndex = _mentorRequests.indexWhere(
          (r) => r.id == updatedRequest.id,
    );
    if (mentorIndex != -1) {
      _mentorRequests[mentorIndex] = updatedRequest;
    }

    final menteeIndex = _menteeRequests.indexWhere(
          (r) => r.id == updatedRequest.id,
    );
    if (menteeIndex != -1) {
      _menteeRequests[menteeIndex] = updatedRequest;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}