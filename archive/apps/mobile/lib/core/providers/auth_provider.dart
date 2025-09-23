import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart'; // For simple token storage
import '../models/user.dart'; // Keep existing User model for now
import '../models/user_type.dart'; // Use UserType consistently
import '../models/mentorship_status.dart'; // Import MentorshipStatus enum
import '../models/register_request_dto.dart';
import '../models/auth_response_dto.dart';
import '../../features/auth/services/auth_service.dart'; // Import the real service
import '../services/api_service.dart'; // Import the API service

// Remove MentorshipPreference if not used in registration API, or keep if needed for UI flow
// enum MentorshipPreference { mentor, mentee, none }

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  User? _currentUser;
  String? _token; // Store the auth token
  bool _isLoading = false;

  // --- Onboarding State (If mentorship preference is part of the flow but not API) ---
  UserType? _onboardingUserType; // Changed from UserRole
  MentorshipStatus? _onboardingMentorshipStatus;
  int? _onboardingMaxMenteeCount;
  // --- End Onboarding State ---

  User? get currentUser => _currentUser;
  bool get isLoggedIn => _token != null && _currentUser != null;
  bool get isLoading => _isLoading;
  String? get token => _token; // Allow access to token if needed

  UserType? get onboardingUserType => _onboardingUserType; // Changed getter
  MentorshipStatus? get onboardingMentorshipStatus =>
      _onboardingMentorshipStatus;
  int? get onboardingMaxMenteeCount => _onboardingMaxMenteeCount;

  // --- Initialization ---
  AuthProvider() {
    _tryAutoLogin(); // Attempt to load token on provider init
  }

  // --- Onboarding Setters ---
  void setOnboardingUserType(UserType type) {
    // Changed parameter type
    _onboardingUserType = type;
    print("Onboarding type set to: $_onboardingUserType");
    notifyListeners();
  }

  void setOnboardingMentorshipStatus(MentorshipStatus status) {
    _onboardingMentorshipStatus = status;
    print("Onboarding mentorship status set to: $_onboardingMentorshipStatus");
    notifyListeners();
  }

  void setOnboardingMaxMenteeCount(int count) {
    _onboardingMaxMenteeCount = count;
    print("Onboarding max mentee count set to: $_onboardingMaxMenteeCount");
    notifyListeners();
  }

  // --- Authentication Methods ---

  Future<void> _tryAutoLogin() async {
    _isLoading = true;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      final storedToken = prefs.getString('authToken');
      final storedId = prefs.getString('userId');
      final storedUsername = prefs.getString('username');
      final storedEmail = prefs.getString('email');
      final storedUserTypeName = prefs.getString('userType');
      final storedCompanyName = prefs.getString('companyName');
      final storedBio = prefs.getString('bio');
      final storedEmployerId = prefs.getString('employerId');
      final storedMentorshipStatusName = prefs.getString('mentorshipStatus');
      final storedMaxMenteeCount = prefs.getInt('maxMenteeCount');

      if (storedToken != null &&
          storedId != null &&
          storedUsername != null &&
          storedUserTypeName != null) {
        final userType = UserType.values.byName(storedUserTypeName);
        _token = storedToken;

        // Reconstruct User from stored minimal data
        // Convert stored mentorshipStatus string to enum value if available
        MentorshipStatus? mentorshipStatus;
        if (storedMentorshipStatusName != null) {
          try {
            mentorshipStatus = MentorshipStatus.values.byName(
              storedMentorshipStatusName,
            );
          } catch (e) {
            print("Error parsing stored mentorshipStatus: $e");
          }
        }

        _currentUser = User(
          id: storedId,
          username: storedUsername,
          email: storedEmail ?? '', // Use stored email or empty
          role: userType,
          company: storedCompanyName,
          bio: storedBio,
          employerId:
              storedEmployerId, // May be null if not employer or not fetched
          mentorshipStatus: mentorshipStatus,
          maxMenteeCount: storedMaxMenteeCount,
        );
        print("Auto-login successful for $storedUsername (ID: $storedId)");
      } else {
        print("No stored token/user data found for auto-login.");
      }
    } catch (e) {
      print("Error during auto-login: $e");
      _token = null;
      _currentUser = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final authResponse = await _authService.login(username, password);
      String? tempToken = authResponse.token;

      // Store initial data first
      await _storeInitialAuthData(authResponse);

      print(
        "Login successful (initial). User: ${authResponse.username}, Role: ${authResponse.userType}",
      );

      // Now, fetch and update full details
      if (_currentUser?.id != null && tempToken != null) {
        try {
          print("Fetching full user details after login...");
          final userDetails = await _authService.getUserDetails(
            _currentUser!.id, // Use the ID we got from login response
            tempToken, // Token is non-null here
          );
          print("User details: $userDetails");
          await _updateAndPersistUserDetails(userDetails);
          print("Successfully updated full user details.");
        } catch (e) {
          print(
            "Warning: Failed to fetch/update full user details after login: $e",
          );
          // Continue even if detail fetch fails
        }
      }

      _isLoading = false;
      notifyListeners(); // Notify after all updates (initial + details)
      return true; // Return true after everything
    } catch (e) {
      print("Login failed: $e");
      _token = null;
      _currentUser = null;
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(
    String username,
    String email,
    String password,
    UserType userType,
    String? bio, {
    MentorshipStatus? mentorshipStatus,
    int? maxMenteeCount,
  }) async {
    _isLoading = true;
    notifyListeners();
    String? tempToken;
    try {
      final requestDto = RegisterRequestDto(
        username: username,
        email: email,
        password: password,
        bio: bio,
        userType: userType,
        mentorshipStatus: mentorshipStatus,
        maxMenteeCount: maxMenteeCount,
      );
      print('RegisterRequestDto: ' + requestDto.toJson().toString());

      final authResponse = await _authService.register(requestDto);
      tempToken = authResponse.token;

      // Store initial data first
      await _storeInitialAuthData(authResponse);

      print(
        "Registration successful (initial). User: ${authResponse.username}, Role: ${authResponse.userType}",
      );

      // Now, fetch and update full details
      if (_currentUser?.id != null && tempToken != null) {
        try {
          print("Fetching full user details after registration...");
          final userDetails = await _authService.getUserDetails(
            _currentUser!.id, // Use the ID we got from register response
            tempToken, // Token is non-null here
          );
          await _updateAndPersistUserDetails(userDetails);
          print("Successfully updated full user details.");

          // If user is a mentor, create mentor profile
          if (userDetails.mentorshipStatus == MentorshipStatus.MENTOR) {
            print("Creating mentor profile for new mentor user...");
            try {
              final apiService = ApiService(authProvider: this);
              await apiService.createMentorProfile(
                capacity:
                    maxMenteeCount ??
                    1, // Use provided maxMenteeCount or default to 1
                isAvailable: true, // Start as available by default
              );
              print("Successfully created mentor profile.");
            } catch (e) {
              print("Error creating mentor profile: $e");
              // Don't continue if mentor profile creation fails
              _isLoading = false;
              notifyListeners();
              throw Exception('Failed to create mentor profile: $e');
            }
          }
        } catch (e) {
          print("Error during registration process: $e");
          // Now we should handle the error and not continue
          _isLoading = false;
          _token = null; // Clear token since registration is incomplete
          _currentUser = null; // Clear user since registration is incomplete
          notifyListeners();
          throw Exception('Registration failed: $e');
        }
      }

      _isLoading = false;
      _onboardingUserType = null;
      _onboardingMentorshipStatus = null;
      _onboardingMaxMenteeCount = null;
      notifyListeners(); // Notify after all updates
      return true; // Return true after everything
    } catch (e) {
      print("Registration failed: $e");
      _token = null;
      _currentUser = null;
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();
    _token = null;
    _currentUser = null;
    try {
      final prefs = await SharedPreferences.getInstance();
      // Keep removing all stored fields for consistency
      await prefs.remove('authToken');
      await prefs.remove('userId');
      await prefs.remove('username');
      await prefs.remove('email');
      await prefs.remove('userType');
      await prefs.remove('companyName');
      await prefs.remove('bio');
      await prefs.remove('employerId');
      await prefs.remove('mentorshipStatus');
      await prefs.remove('maxMenteeCount');
      print("Logged out and cleared stored user data.");
    } catch (e) {
      print("Error clearing data on logout: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // --- Helper Methods ---
  // Updated to accept AuthResponseDto
  Future<void> _storeAuthData(AuthResponseDto authResponse) async {
    _token = authResponse.token;
    // Create User object from the limited data in AuthResponseDto
    // Other fields like email, bio, companyName, employerId will be null/empty initially
    // unless the backend adds them to AuthResponseDto as well.
    _currentUser = User(
      id: authResponse.userId, // Use ID from DTO
      username: authResponse.username,
      email: '', // Not available in DTO
      role: authResponse.userType,
      company: null, // Not available in DTO
      bio: null, // Not available in DTO
      employerId: null, // Not available in DTO
    );

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('authToken', _token!);
      await prefs.setString('userId', _currentUser!.id);
      await prefs.setString('username', _currentUser!.username);
      await prefs.setString('userType', _currentUser!.role.name);
      // Remove storing fields not present in the initial _currentUser
      await prefs.remove('email');
      await prefs.remove('companyName');
      await prefs.remove('bio');
      await prefs.remove('employerId');
    } catch (e) {
      print("Error saving auth data: $e");
    }
  }

  // Stores only the initial data from AuthResponseDto
  Future<void> _storeInitialAuthData(AuthResponseDto authResponse) async {
    _token = authResponse.token;
    _currentUser = User(
      id: authResponse.userId,
      username: authResponse.username,
      email: '', // Default empty
      role: authResponse.userType,
      company: null,
      bio: null,
      employerId: null,
      mentorshipStatus: null, // Will be updated when full details are fetched
      maxMenteeCount: null, // Will be updated when full details are fetched
    );

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('authToken', _token!);
      await prefs.setString('userId', _currentUser!.id);
      await prefs.setString('username', _currentUser!.username);
      await prefs.setString('userType', _currentUser!.role.name);
      // Clear potentially stale detailed fields
      await prefs.remove('email');
      await prefs.remove('companyName');
      await prefs.remove('bio');
      await prefs.remove('employerId');
      await prefs.remove('mentorshipStatus');
      await prefs.remove('maxMenteeCount');
    } catch (e) {
      print("Error saving initial auth data: $e");
    }
  }

  // Updates _currentUser and persists the additional details
  Future<void> _updateAndPersistUserDetails(User fullDetails) async {
    // Ensure the core ID and username match before updating
    // This prevents potential race conditions if user logs out quickly
    if (_currentUser != null && _currentUser!.id == fullDetails.id) {
      _currentUser = fullDetails; // Update the in-memory user object

      try {
        final prefs = await SharedPreferences.getInstance();
        // Persist the newly fetched details
        await prefs.setString('email', _currentUser!.email);
        if (_currentUser!.company != null) {
          await prefs.setString('companyName', _currentUser!.company!);
        } else {
          await prefs.remove('companyName');
        }
        if (_currentUser!.bio != null) {
          await prefs.setString('bio', _currentUser!.bio!);
        } else {
          await prefs.remove('bio');
        }
        if (_currentUser!.employerId != null) {
          await prefs.setString('employerId', _currentUser!.employerId!);
        } else {
          await prefs.remove('employerId');
        }

        // Store mentorship status and max mentee count
        if (_currentUser!.mentorshipStatus != null) {
          await prefs.setString(
            'mentorshipStatus',
            _currentUser!.mentorshipStatus!.name,
          );
        } else {
          await prefs.remove('mentorshipStatus');
        }

        if (_currentUser!.maxMenteeCount != null) {
          await prefs.setInt('maxMenteeCount', _currentUser!.maxMenteeCount!);
        } else {
          await prefs.remove('maxMenteeCount');
        }

        print("Persisted updated user details including mentorship data.");
      } catch (e) {
        print("Error saving updated user details: $e");
      }
    } else {
      print("User changed during detail fetch, aborting update.");
    }
  }
}
