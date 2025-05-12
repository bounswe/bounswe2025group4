import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/models/mentor_profile.dart';
import 'package:mobile/core/models/mentorship_request.dart';
import 'package:mobile/core/models/mentor_review.dart';
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

  // Get all available mentors from the API
  Future<void> fetchAvailableMentors() async {
    _isLoadingMentors = true;
    _error = null;
    notifyListeners();

    try {
      _availableMentors = await _apiService.getAllMentorProfiles();
      // Filter only available mentors
      _availableMentors =
          _availableMentors.where((mentor) => mentor.isAvailable).toList();
    } catch (e) {
      _error = e.toString();
      print('Error fetching mentors: $_error');
    } finally {
      _isLoadingMentors = false;
      notifyListeners();
    }
  }

  // Get requests for the current user as a mentor
  Future<void> fetchMentorRequests() async {
    _isLoadingMentorRequests = true;
    _error = null;
    notifyListeners();

    try {
      _mentorRequests = await _apiService.getMentorshipRequestsAsMentor();
      print("Mentor requests: ${_mentorRequests}");
    } catch (e) {
      _error = e.toString();
      print('Error fetching mentor requests: $_error');
    } finally {
      _isLoadingMentorRequests = false;
      notifyListeners();
    }
  }

  // Get requests for the current user as a mentee
  Future<void> fetchMenteeRequests() async {
    _isLoadingMenteeRequests = true;
    _error = null;
    notifyListeners();

    try {
      _menteeRequests = await _apiService.getMentorshipRequestsAsMentee();
    } catch (e) {
      _error = e.toString();
      print('Error fetching mentee requests: $_error');
    } finally {
      _isLoadingMenteeRequests = false;
      notifyListeners();
    }
  }

  // Create a mentorship request
  Future<bool> createMentorshipRequest({
    required int mentorId,
    required String message,
  }) async {
    _error = null;
    notifyListeners();

    try {
      final request = await _apiService.createMentorshipRequest(
        mentorId: mentorId,
        message: message,
      );

      // Add the new request to the list
      _menteeRequests.add(request);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      print('Error creating mentorship request: $_error');
      notifyListeners();
      return false;
    }
  }

  // Update a mentorship request status
  Future<bool> updateRequestStatus({
    required int requestId,
    required MentorshipRequestStatus status,
  }) async {
    _error = null;
    notifyListeners();

    try {
      final updatedRequest = await _apiService.updateMentorshipRequestStatus(
        requestId,
        status,
      );

      // Update the request in both lists
      _updateRequestInLists(updatedRequest);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      print('Error updating request status: $_error');
      notifyListeners();
      return false;
    }
  }

  // Get the current user's mentor profile if it exists
  Future<void> fetchCurrentUserMentorProfile(int userId) async {
    _isLoadingProfile = true;
    _error = null;
    notifyListeners();

    try {
      _currentUserMentorProfile = await _apiService.getMentorProfile(userId);
    } catch (e) {
      // If 404, the user doesn't have a mentor profile yet
      if (e.toString().contains('404')) {
        _currentUserMentorProfile = null;
      } else {
        _error = e.toString();
        print('Error fetching current user mentor profile: $_error');
      }
    } finally {
      _isLoadingProfile = false;
      notifyListeners();
    }
  }

  // Create a mentor profile for the current user
  Future<bool> createMentorProfile({
    required int capacity,
    required bool isAvailable,
  }) async {
    _isLoadingProfile = true;
    _error = null;
    notifyListeners();

    try {
      _currentUserMentorProfile = await _apiService.createMentorProfile(
        capacity: capacity,
        isAvailable: isAvailable,
      );
      _isLoadingProfile = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      print('Error creating mentor profile: $_error');
      _isLoadingProfile = false;
      notifyListeners();
      return false;
    }
  }

  // Update mentor availability
  Future<bool> updateMentorAvailability(bool isAvailable) async {
    if (_currentUserMentorProfile == null) return false;

    _isLoadingProfile = true;
    _error = null;
    notifyListeners();

    try {
      _currentUserMentorProfile = await _apiService.updateMentorAvailability(
        isAvailable,
      );
      _isLoadingProfile = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      print('Error updating mentor availability: $_error');
      _isLoadingProfile = false;
      notifyListeners();
      return false;
    }
  }

  // Update mentor capacity
  Future<bool> updateMentorCapacity(int capacity) async {
    if (_currentUserMentorProfile == null) return false;

    _isLoadingProfile = true;
    _error = null;
    notifyListeners();

    try {
      _currentUserMentorProfile = await _apiService.updateMentorCapacity(
        capacity,
      );
      _isLoadingProfile = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      print('Error updating mentor capacity: $_error');
      _isLoadingProfile = false;
      notifyListeners();
      return false;
    }
  }

  // Create a review for a mentor
  Future<bool> createMentorReview({
    required int mentorId,
    required int rating,
    String? comment,
  }) async {
    _error = null;
    notifyListeners();

    try {
      await _apiService.createMentorReview(
        mentorId: mentorId,
        rating: rating,
        comment: comment,
      );

      // Optionally refresh the mentor profile to get updated rating
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      print('Error creating mentor review: $_error');
      notifyListeners();
      return false;
    }
  }

  // Helper to update request in both lists
  void _updateRequestInLists(MentorshipRequest updatedRequest) {
    // Update in mentor requests list
    final mentorIndex = _mentorRequests.indexWhere(
      (r) => r.id == updatedRequest.id,
    );
    if (mentorIndex != -1) {
      _mentorRequests[mentorIndex] = updatedRequest;
    }

    // Update in mentee requests list
    final menteeIndex = _menteeRequests.indexWhere(
      (r) => r.id == updatedRequest.id,
    );
    if (menteeIndex != -1) {
      _menteeRequests[menteeIndex] = updatedRequest;
    }
  }

  // Clear errors
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
