// lib/core/providers/mentor_provider.dart
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/models/full_profile.dart';
import 'package:mobile/core/models/mentor_profile.dart';
import 'package:mobile/core/models/mentorship_request.dart';
import 'package:mobile/core/services/api_service.dart';

class MentorProvider with ChangeNotifier {
  ApiService _apiService;

  // Data collections
  List<MentorProfile> _availableMentors = [];
  List<MentorshipRequest> _mentorRequests = [];
  List<MentorshipRequest> _menteeRequests = [];
  MentorProfile? _currentUserMentorProfile;
  MentorshipRequest? _currentRequest;
  FullProfile? _otherProfile;


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
  MentorshipRequest? get currentRequest => _currentRequest;
  FullProfile? get otherProfile => _otherProfile;
  MentorProfile? get currentUserMentorProfile => _currentUserMentorProfile;
  bool get isLoadingMentors => _isLoadingMentors;
  bool get isLoadingMentorRequests => _isLoadingMentorRequests;
  bool get isLoadingMenteeRequests => _isLoadingMenteeRequests;
  bool get isLoadingProfile => _isLoadingProfile;
  String? get error => _error;

  void updateApiService(ApiService newApiService) {
    _apiService = newApiService;
  }

  // FETCH ALL AVAILABLE MENTORS
  Future<void> fetchAvailableMentors() async {
    _isLoadingMentors = true;
    _error = null;
    notifyListeners();
    print("Fetching available mentors...");
    try {
      _availableMentors = await _apiService.getAllMentors();
      // Filter only available mentors based on derived getter
      //_availableMentors =
      //    _availableMentors.where((mentor) => mentor.isAvailable).toList();
      print("There are {${_availableMentors.length}} available mentors");
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching mentors: $_error');
    } finally {
      _isLoadingMentors = false;
      notifyListeners();
    }
  }

  Future<void> fetchMentorshipRequest(String requestId) async {
    _error = null;
    _currentRequest = null;
    notifyListeners();
    print("Fetching the mentorship request...");
    try {
      _currentRequest = await _apiService.getMentorshipRequest(requestId);
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching request: $_error');
    } finally {
      notifyListeners();
    }
  }


  Future<void> getUserProfile(int userId) async {
    _otherProfile = null;
    _error = null;
    notifyListeners();
    print("Fetching the user's profile");
    try {
      _otherProfile = await _apiService.getUserProfile(userId);

    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching user profile: $_error');
    } finally {
      notifyListeners();
    }
  }

  // REQUESTS WHERE CURRENT USER IS A MENTOR
  Future<void> fetchMentorRequests(String mentorId) async {
    _isLoadingMentorRequests = true;
    _error = null;
    notifyListeners();

    try {
      final rawRequests =
      await _apiService.getMentorshipRequestsAsMentor(mentorId);

      for (final r in rawRequests) {

        if (r.requesterId != null && r.requesterUsername == null) {
          r.requesterUsername =
          await _apiService.getUsernameForUser(r.requesterId!);
        }

        if (r.status == MentorshipRequestStatus.ACCEPTED &&
            r.requesterId != null &&
            (r.conversationId == null || r.resumeReviewId == null)) {

          final info = await resolveMentorshipInfoViaMentee(
            menteeId: r.requesterId!,
            mentorId: mentorId,
            mentorshipRequestId: r.id,
          );

          if (info != null) {
            r.conversationId = info.conversationId;
            r.resumeReviewId = info.resumeReviewId;
          }
        }

      }

      _mentorRequests = rawRequests;
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching mentor requests: $_error');
    } finally {
      _isLoadingMentorRequests = false;
      notifyListeners();
    }
  }


  // REQUESTS WHERE CURRENT USER IS A MENTEE
  Future<void> fetchMenteeRequests(String menteeId) async {
    _isLoadingMenteeRequests = true;
    _error = null;
    notifyListeners();

    try {
      _menteeRequests = await _apiService.getMentorshipRequestsAsMentee(
        menteeId,
      );
    } catch (e) {
      _error = e.toString();
      debugPrint('Error fetching mentee requests: $_error');
    } finally {
      _isLoadingMenteeRequests = false;
      notifyListeners();
    }
  }

  Future<MentorshipLinkInfo?> resolveMentorshipInfoViaMentee({
    required String menteeId,
    required String mentorId,
    required String mentorshipRequestId,
  }) async {
    try {
      final menteeRequests =
      await _apiService.getMentorshipRequestsAsMentee(menteeId);

      for (final r in menteeRequests) {
        final sameMentor = r.mentorId.toString() == mentorId;
        final sameRequest =
            r.id.toString() == mentorshipRequestId.toString();

        if (sameMentor && sameRequest) {
          return MentorshipLinkInfo(
            conversationId: r.conversationId,
            resumeReviewId: r.resumeReviewId,
          );
        }
      }
      return null;
    } catch (e) {
      debugPrint('Failed to resolve mentorship info: $e');
      return null;
    }
  }



  // CREATE MENTORSHIP REQUEST
  Future<bool> createMentorshipRequest({
    required int mentorId,
    required String motivation
  }) async {
    try {
      final request = await _apiService.createMentorshipRequest(
        mentorId: mentorId,
        motivation: motivation
      );

      // Add the new request to the mentee requests list (current user is mentee)
      _menteeRequests.add(request);
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Error creating mentorship request: ${e.toString()}');
      throw Exception('Failed to create mentorship request: ${e.toString()}');
    }
  }

  // RESPOND TO A REQUEST (ACCEPT/REJECT)

  Future<bool> respondToRequest({
    required String requestId,
    required bool accept,
    String? responseMessage,
  }) async {
    _error = null;
    notifyListeners();

    try {
      final updatedRequest = await _apiService.respondToMentorshipRequest(
        requestId: requestId,
        accept: accept,
        responseMessage: responseMessage,
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

  // CURRENT USER'S MENTOR PROFILE
  Future<void> fetchCurrentUserMentorProfile(String userId) async {
    _isLoadingProfile = true;
    _error = null;
    notifyListeners();

    try {
      _currentUserMentorProfile = await _apiService.getMentorProfile(userId);
    } catch (e) {
      // If backend returns 404 -> user is not a mentor yet
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

  // CREATE MENTOR PROFILE
  Future<bool> createMentorProfile({
    required String userId,
    required List<String> expertise,
    required int maxMentees,
  }) async {
    _isLoadingProfile = true;
    _error = null;
    notifyListeners();

    try {
      _currentUserMentorProfile = await _apiService.createMentorProfile(
        userId: userId,
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

  // UPDATE MENTOR PROFILE
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

  //DELETE MENTOR PROFILE
  Future<bool> deleteMentorProfile(String userId) async {
    _isLoadingProfile = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.deleteMentorProfile(userId);
      _currentUserMentorProfile = null;
      _isLoadingProfile = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      debugPrint('Error deleting mentor profile: $_error');
      _isLoadingProfile = false;
      notifyListeners();
      return false;
    }
  }
  //CREATE RATING FOR RESUME REVIEW
  Future<bool> createMentorRating({
    required int resumeReviewId,
    required int rating,
    String? comment,
  }) async {
    _error = null;
    notifyListeners();

    try {
      debugPrint(
        'Creating mentor rating for review $resumeReviewId with rating $rating and comment $comment',
      );
      await _apiService.createMentorRating(
        resumeReviewId: resumeReviewId,
        rating: rating,
        comment: comment,
      );

      // refresh mentee/mentor requests or mentor profile here.
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      debugPrint('Error creating mentor rating: $_error');
      notifyListeners();
      return false;
    }
  }

  Future<bool> completeMentorship(int resumeReviewId) async {
    try {
      await _apiService.completeResumeReview(resumeReviewId);
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> cancelMentorship(int resumeReviewId) async {
    try {
      await _apiService.closeResumeReview(resumeReviewId);
      return true;
    } catch (e) {
      _error = e.toString();
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

class MentorshipLinkInfo {
  final int? conversationId;
  final int? resumeReviewId;

  MentorshipLinkInfo({this.conversationId, this.resumeReviewId});
}
