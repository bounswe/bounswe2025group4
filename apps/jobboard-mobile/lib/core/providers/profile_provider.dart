import 'dart:io';
import 'package:flutter/foundation.dart';
import '../models/full_profile.dart';
import '../services/api_service.dart';
import '../models/user.dart';
import '../models/mentorship_status.dart';

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

      final profile = await _apiService.getMyProfile();

      _currentUserProfile = profile;

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

      final profile = await _apiService.getUserProfile(userId);
      // imageUrl comes from backend, assign directly
      _viewedProfile = profile;
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

      final updatedProfile = await _apiService.updateProfile(profileData);

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
      
      final uploadResult = await _apiService.uploadProfilePicture(imageFile);

      final pictureUrl = uploadResult['imageUrl'] as String?;

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
      // Deprecated - kept for backward compatibility
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteProfilePicture() async {
    try {
      final userId = _currentUserProfile!.profile.userId;
      
      // Update local state first (for immediate UI update)
      final updated = _currentUserProfile!.profile.copyWith(profilePicture: null);
      _currentUserProfile = FullProfile(
        profile: updated,
        experience: _currentUserProfile!.experience,
        education: _currentUserProfile!.education,
        badges: _currentUserProfile!.badges,
      );
      notifyListeners();
      
      // Then delete from backend
      await _apiService.deleteProfilePicture();
      
    } catch (e) {
      rethrow;
    }
  }

  // Add work experience
  Future<void> addWorkExperience(Map<String, dynamic> experienceData) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final newExperience = await _apiService.createExperience(experienceData);

      if (_currentUserProfile != null) {
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
      } else {
        await fetchMyProfile();
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

      await _apiService.deleteExperience(experienceId);

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

  // Add skill
  Future<void> addSkill(String name, String level) async {
    try {
      await _apiService.addSkill(name, level);
      await fetchMyProfile(); // Refresh profile to get updated skills
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  // Add interest
  Future<void> addInterest(String name) async {
    try {
      await _apiService.addInterest(name);
      await fetchMyProfile(); // Refresh profile to get updated interests
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  // Add education
  Future<void> addEducation(Map<String, dynamic> educationData) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final newEducation = await _apiService.createEducation(educationData);

      if (_currentUserProfile != null) {
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
      } else {
        await fetchMyProfile();
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

      await _apiService.deleteEducation(educationId);

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
      _isLoading = true;
      _error = null;
      notifyListeners();

      final newProfile = await _apiService.createProfile(profileData);
      _currentUserProfile = FullProfile(
        profile: newProfile,
        experience: [],
        education: [],
        badges: [],
      );
      
    } catch (e) {
      _error = e.toString();
      throw Exception('Failed to create profile: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
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

  // Badge methods removed - badges are now automatically awarded by the backend
  // Use BadgeProvider to fetch and display badges

  User? _user;
  User? get currentUser => _user;

  Future<void> fetchUserDetails(int userId) async {
    try {
      _user = await _apiService.fetchUser(userId.toString());
      notifyListeners();
    } catch (e) {
      throw Exception('Failed to fetch user details: $e');
    }
  }

  Future<void> updateUser(String userId, Map<String, dynamic> userData) async {
    try {
      await _apiService.updateUser(userId, userData);
      await fetchUserDetails(int.parse(userId));
      notifyListeners();
    } catch (e) {
      throw Exception('Failed to update user: $e');
    }
  }

  Future<void> updateMentorshipStatus(MentorshipStatus status) async {
    try {
      await _apiService.updateMentorshipStatus(status);
      if (_user != null) {
        await fetchUserDetails(int.parse(_user!.id));
        notifyListeners();
      }
    } catch (e) {
      throw Exception('Failed to update mentorship status: $e');
    }
  }

}