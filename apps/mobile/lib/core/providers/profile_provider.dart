import 'dart:io';
import 'package:flutter/foundation.dart';
import '../models/full_profile.dart';
import '../services/api_service.dart';
import '../models/user.dart';
import '../models/mentorship_status.dart';
import 'dart:io';

class ProfileProvider extends ChangeNotifier {
  late ApiService _apiService;

  FullProfile? _currentUserProfile;
  FullProfile? _viewedProfile;
  bool _isLoading = false;
  String? _error;

  ProfileProvider({required ApiService apiService}) {
    _apiService = apiService;
  }
  // Getters
  FullProfile? get currentUserProfile => _currentUserProfile;
  FullProfile? get viewedProfile => _viewedProfile;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasProfile => _currentUserProfile != null;

  void clearCurrentUserProfile() {
    _currentUserProfile = null;
    notifyListeners();
  }

  // Fetch current user profile
  Future<void> fetchMyProfile() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      print('DEBUG(fetchMyProfile): calling getMyProfile()');
      final profile = await _apiService.getMyProfile();
      print('DEBUG(fetchMyProfile): received profile: ${profile.profile}');
      print('DEBUG(fetchMyProfile): userId = ${profile.profile.userId}');
      final userId = profile.profile.userId;

      final pictureUrl = await _apiService.getProfilePicture(userId);
      print('DEBUG(fetchMyProfile): fetched picture URL: $pictureUrl');

      final updatedProfile = profile.profile.copyWith(
        profilePicture: pictureUrl,
      );

      _currentUserProfile = FullProfile(
        profile: updatedProfile,
        experience: profile.experience,
        education: profile.education,
        badges: profile.badges,
      );
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch profile by user ID
  Future<void> fetchUserProfile(int userId) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final profile = await _apiService.getUserProfile(userId); // başka kişinin profili
      final pictureUrl = await _apiService.getProfilePicture(userId); // doğru foto

      final updatedProfile = profile.profile.copyWith(profilePicture: pictureUrl);
      _viewedProfile = FullProfile(
        profile: updatedProfile,
        experience: profile.experience,
        education: profile.education,
        badges: profile.badges,
      );
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update profile basics
  Future<void> updateProfile(Map<String, dynamic> profileData) async {
    if (_currentUserProfile == null) return;

    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final updatedProfile = await _apiService.updateProfile(
        _currentUserProfile!.profile.userId,
        profileData,
      );

      _currentUserProfile = FullProfile(
        profile: updatedProfile,
        experience: _currentUserProfile!.experience,
        education: _currentUserProfile!.education,
        badges: _currentUserProfile!.badges,
      );

      if (_viewedProfile?.profile.userId == _currentUserProfile?.profile.userId) {
        _viewedProfile = _currentUserProfile;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Upload profile picture
  Future<void> uploadProfilePicture(File imageFile) async {
    if (_currentUserProfile == null) return;

    try {
      final userId = _currentUserProfile!.profile.userId;
      await _apiService.uploadProfilePicture(userId, imageFile);


      final pictureUrl = await _apiService.getProfilePicture(userId);


      final updatedProfile = _currentUserProfile!.profile.copyWith(profilePicture: pictureUrl);
      _currentUserProfile = FullProfile(
        profile: updatedProfile,
        experience: _currentUserProfile!.experience,
        education: _currentUserProfile!.education,
        badges: _currentUserProfile!.badges,
      );
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> fetchProfilePicture(int userId) async {
    try {
      final url = await _apiService.getProfilePicture(userId);
      if (_currentUserProfile != null && _currentUserProfile!.profile.userId == userId) {
        final updatedProfile = _currentUserProfile!.profile.copyWith(profilePicture: url);
        _currentUserProfile = _currentUserProfile!.copyWith(profile: updatedProfile);
        notifyListeners();
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteProfilePicture() async {
    try {
      final userId = _currentUserProfile!.profile.userId;
      await _apiService.deleteProfilePicture(userId);

      await fetchMyProfile();

      final pictureUrl = _apiService.getProfilePicture(userId);

      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  // Add work experience
  Future<void> addWorkExperience(Map<String, dynamic> experienceData) async {
    if (_currentUserProfile == null) return;

    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final newExperience = await _apiService.createExperience(
        _currentUserProfile!.profile.userId,
        experienceData,
      );

      final updatedExperiences = [..._currentUserProfile!.experience, newExperience];
      _currentUserProfile = FullProfile(
        profile: _currentUserProfile!.profile,
        experience: updatedExperiences,
        education: _currentUserProfile!.education,
        badges: _currentUserProfile!.badges,
      );

      if (_viewedProfile?.profile.userId == _currentUserProfile?.profile.userId) {
        _viewedProfile = _currentUserProfile;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update work experience
  Future<void> updateWorkExperience(
    int experienceId,
    Map<String, dynamic> experienceData
  ) async {
    if (_currentUserProfile == null) return;

    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final updatedExperience = await _apiService.updateExperience(
        _currentUserProfile!.profile.userId,
        experienceId,
        experienceData,
      );

      final updatedExperiences = _currentUserProfile!.experience.map((e) {
        return e.id == experienceId ? updatedExperience : e;
      }).toList();

      _currentUserProfile = FullProfile(
        profile: _currentUserProfile!.profile,
        experience: updatedExperiences,
        education: _currentUserProfile!.education,
        badges: _currentUserProfile!.badges,
      );

      if (_viewedProfile?.profile.userId == _currentUserProfile?.profile.userId) {
        _viewedProfile = _currentUserProfile;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Delete work experience
  Future<void> deleteWorkExperience(int experienceId) async {
    if (_currentUserProfile == null) return;

    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      await _apiService.deleteExperience(
        _currentUserProfile!.profile.userId,
        experienceId,
      );

      final updatedExperiences = _currentUserProfile!.experience
          .where((e) => e.id != experienceId)
          .toList();

      _currentUserProfile = FullProfile(
        profile: _currentUserProfile!.profile,
        experience: updatedExperiences,
        education: _currentUserProfile!.education,
        badges: _currentUserProfile!.badges,
      );

      if (_viewedProfile?.profile.userId == _currentUserProfile?.profile.userId) {
        _viewedProfile = _currentUserProfile;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update skills
  Future<void> updateSkills(List<String> updatedSkills) async {
    if (_currentUserProfile == null) return;

    final updatedProfile = _currentUserProfile!.profile.copyWith(
      skills: updatedSkills,
    );
    _currentUserProfile = FullProfile(
      profile: updatedProfile,
      experience: _currentUserProfile!.experience,
      education: _currentUserProfile!.education,
      badges: _currentUserProfile!.badges,
    );

    notifyListeners();

    try {
      await _apiService.updateSkills(
        _currentUserProfile!.profile.userId,
        updatedSkills,
      );
    } catch (e) {
      _error = e.toString();
    }
  }

  // Update interests
  Future<void> updateInterests(List<String> updatedInterests) async {
    if (_currentUserProfile == null) return;

    final updatedProfile = _currentUserProfile!.profile.copyWith(
      interests: updatedInterests,
    );
    _currentUserProfile = FullProfile(
      profile: updatedProfile,
      experience: _currentUserProfile!.experience,
      education: _currentUserProfile!.education,
      badges: _currentUserProfile!.badges,
    );

    notifyListeners();

    try {
      await _apiService.updateInterests(
        _currentUserProfile!.profile.userId,
        updatedInterests,
      );
    } catch (e) {
      _error = e.toString();
    }
  }

  // Add education
  Future<void> addEducation(Map<String, dynamic> educationData) async {
    if (_currentUserProfile == null) return;

    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final newEducation = await _apiService.createEducation(
        _currentUserProfile!.profile.userId,
        educationData,
      );

      final updatedEducation = [..._currentUserProfile!.education, newEducation];
      _currentUserProfile = FullProfile(
        profile: _currentUserProfile!.profile,
        experience: _currentUserProfile!.experience,
        education: updatedEducation,
        badges: _currentUserProfile!.badges,
      );

      if (_viewedProfile?.profile.userId == _currentUserProfile?.profile.userId) {
        _viewedProfile = _currentUserProfile;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update education
  Future<void> updateEducation(
    int educationId,
    Map<String, dynamic> educationData
  ) async {
    if (_currentUserProfile == null) return;

    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final updatedEducation = await _apiService.updateEducation(
        _currentUserProfile!.profile.userId,
        educationId,
        educationData,
      );

      final updatedList = _currentUserProfile!.education.map((e) {
        return e.id == educationId ? updatedEducation : e;
      }).toList();

      _currentUserProfile = FullProfile(
        profile: _currentUserProfile!.profile,
        experience: _currentUserProfile!.experience,
        education: updatedList,
        badges: _currentUserProfile!.badges,
      );

      if (_viewedProfile?.profile.userId == _currentUserProfile?.profile.userId) {
        _viewedProfile = _currentUserProfile;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Delete education
  Future<void> deleteEducation(int educationId) async {
    if (_currentUserProfile == null) return;

    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      await _apiService.deleteEducation(
        _currentUserProfile!.profile.userId,
        educationId,
      );

      final updatedEducation = _currentUserProfile!.education
          .where((e) => e.id != educationId)
          .toList();

      _currentUserProfile = FullProfile(
        profile: _currentUserProfile!.profile,
        experience: _currentUserProfile!.experience,
        education: updatedEducation,
        badges: _currentUserProfile!.badges,
      );

      if (_viewedProfile?.profile.userId == _currentUserProfile?.profile.userId) {
        _viewedProfile = _currentUserProfile;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void updateApiService(ApiService apiService) {
    _apiService = apiService;
  }

  // Clear viewed profile
  void clearViewedProfile() {
    _viewedProfile = null;
    notifyListeners();
  }
  // Create profile
  Future<void> createProfile(Map<String, dynamic> profileData) async {
    try {
      final newProfile = await _apiService.createProfile(profileData);
      _currentUserProfile = FullProfile(
        profile: newProfile,
        experience: [],
        education: [],
        badges: [],
      );
      notifyListeners();
    } catch (e) {
      throw Exception('Failed to create profile: $e');
    }
  }

  Future<void> fetchBadges(int userId) async {
    if (_currentUserProfile == null) return;
    try {
      _currentUserProfile = FullProfile(
        profile: _currentUserProfile!.profile,
        experience: _currentUserProfile!.experience,
        education: _currentUserProfile!.education,
        badges: await _apiService.getUserBadges(userId),
      );
      notifyListeners();
    } catch (e) {
      throw Exception('Failed to fetch badges: $e');
    }
  }

  Future<void> addBadge(int userId, int badgeId) async {
    if (_currentUserProfile == null) return;
    try {
      await _apiService.addBadgeToUser(userId, badgeId);
      await fetchBadges(userId);
    } catch (e) {
      throw Exception('Failed to add badge: $e');
    }
  }

  Future<void> removeBadge(int userId, int badgeId) async {
    try {
      await _apiService.removeBadgeFromUser(userId, badgeId);
      await fetchBadges(userId);
    } catch (e) {
      throw Exception('Failed to remove badge: $e');
    }
  }

  User? _user;
  User? get currentUser => _user;

  Future<void> fetchUserDetails(int userId) async {
    try {
      _user = await _apiService.fetchUser(userId.toString());
      notifyListeners();
    } catch (e) {
      print("Error fetching user data: $e");
    }
  }

  Future<void> updateUser(String userId, Map<String, dynamic> userData) async {
    try {
      await _apiService.updateUser(userId, userData); // API çağrısı yap
      await fetchUserDetails(int.parse(userId));      // local user bilgisini güncelle
      notifyListeners();                              // UI'yı güncelle
    } catch (e) {
      print("Error updating user data: $e");
    }
  }

  Future<void> updateMentorshipStatus(MentorshipStatus status) async {
    try {
      await _apiService.updateMentorshipStatus(status); // API çağrısı
      await fetchUserDetails(int.parse(_user!.id)); // local user'ı güncelle
      notifyListeners(); // UI'yı güncelle
    } catch (e) {
      print("Failed to update mentorship status: $e");
    }
  }

}