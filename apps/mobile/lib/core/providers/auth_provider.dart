import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart'; // For simple token storage
import '../models/user.dart'; // Keep existing User model for now
import '../models/user_type.dart'; // Use UserType consistently
import '../models/register_request_dto.dart';
import '../models/auth_response_dto.dart';
import '../../features/auth/services/auth_service.dart'; // Import the real service

// Remove MentorshipPreference if not used in registration API, or keep if needed for UI flow
// enum MentorshipPreference { mentor, mentee, none }

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  User? _currentUser;
  String? _token; // Store the auth token
  bool _isLoading = false;

  // --- Onboarding State (If mentorship preference is part of the flow but not API) ---
  UserType? _onboardingUserType; // Changed from UserRole
  // MentorshipPreference? _onboardingMentorshipPreference;
  // --- End Onboarding State ---

  User? get currentUser => _currentUser;
  bool get isLoggedIn => _token != null && _currentUser != null;
  bool get isLoading => _isLoading;
  String? get token => _token; // Allow access to token if needed

  UserType? get onboardingUserType => _onboardingUserType; // Changed getter
  // MentorshipPreference? get onboardingMentorshipPreference =>
  //     _onboardingMentorshipPreference;

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

  // void setOnboardingMentorshipPreference(MentorshipPreference preference) {
  //   _onboardingMentorshipPreference = preference;
  //   print(
  //     "Onboarding mentorship preference set to: $_onboardingMentorshipPreference",
  //   );
  //   notifyListeners();
  // }

  // --- Authentication Methods ---

  Future<void> _tryAutoLogin() async {
    _isLoading = true;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      final storedToken = prefs.getString('authToken');
      final storedUsername = prefs.getString('username');
      final storedUserTypeName = prefs.getString('userType'); // Stored as name

      if (storedToken != null &&
          storedUsername != null &&
          storedUserTypeName != null) {
        // Find UserType by its name
        final userType = UserType.values.byName(storedUserTypeName);
        _token = storedToken;
        _currentUser = User(
          id: 'unknown', // Fetch properly later
          username: storedUsername,
          email: 'unknown', // Fetch properly later
          role: userType,
        ); // Use UserType here
        print("Auto-login successful for $storedUsername");
      } else {
        print("No stored token found for auto-login.");
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
      await _storeAuthData(authResponse);
      print(
        "Login successful. User: ${authResponse.username}, Role: ${authResponse.userType}",
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      print("Login failed: $e");
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(
    String username,
    String email,
    String password,
    UserType userType, // Changed parameter type
    // MentorshipPreference mentorshipPreference,
    String? bio,
  ) async {
    _isLoading = true;
    notifyListeners();
    try {
      final requestDto = RegisterRequestDto(
        username: username,
        email: email,
        password: password,
        bio: bio,
        userType: userType, // Pass UserType directly
      );

      final authResponse = await _authService.register(requestDto);
      await _storeAuthData(authResponse);
      print(
        "Registration successful. User: ${authResponse.username}, Role: ${authResponse.userType}",
      );
      _isLoading = false;
      _onboardingUserType = null; // Clear onboarding state
      // _onboardingMentorshipPreference = null;
      notifyListeners();
      return true;
    } catch (e) {
      print("Registration failed: $e");
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
      await prefs.remove('authToken');
      await prefs.remove('username');
      await prefs.remove('userType');
      print("Logged out and cleared token.");
    } catch (e) {
      print("Error clearing token on logout: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // --- Helper Methods ---
  Future<void> _storeAuthData(AuthResponseDto authResponse) async {
    _token = authResponse.token;
    _currentUser = User(
      id: 'unknown',
      username: authResponse.username,
      email: 'unknown',
      role: authResponse.userType, // Use UserType here
    );

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('authToken', _token!);
      await prefs.setString('username', _currentUser!.username);
      await prefs.setString(
        'userType',
        _currentUser!.role.name,
      ); // Store enum name
    } catch (e) {
      print("Error saving token: $e");
    }
  }

  // Remove the simulation methods
  // void setSimulatedRole(UserRole role) { ... }
}
