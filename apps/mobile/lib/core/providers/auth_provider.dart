import 'package:flutter/material.dart';
import '../models/user.dart'; // Adjust import path if needed

// Enum for mentorship preference
enum MentorshipPreference { mentor, mentee, none }

class AuthProvider with ChangeNotifier {
  User? _currentUser;
  bool _isLoading = false;
  // --- Onboarding State ---
  UserRole? _onboardingUserRole; // Role selected during onboarding
  MentorshipPreference? _onboardingMentorshipPreference; // Mentorship choice
  // --- End Onboarding State ---

  // --- Simulation / Current State (to be replaced by real API state) ---
  // Simulate different user roles for testing - Keep separate from onboarding
  UserRole _simulatedRole = UserRole.jobSeeker;
  // --- End Simulation ---

  User? get currentUser => _currentUser;
  bool get isLoggedIn => _currentUser != null;
  bool get isLoading => _isLoading;

  // Getters for onboarding state
  UserRole? get onboardingUserRole => _onboardingUserRole;
  MentorshipPreference? get onboardingMentorshipPreference =>
      _onboardingMentorshipPreference;

  UserRole get simulatedRole => _simulatedRole;

  // Setters for onboarding state
  void setOnboardingUserRole(UserRole role) {
    _onboardingUserRole = role;
    print("Onboarding role set to: $_onboardingUserRole");
    notifyListeners();
  }

  void setOnboardingMentorshipPreference(MentorshipPreference preference) {
    _onboardingMentorshipPreference = preference;
    print(
      "Onboarding mentorship preference set to: $_onboardingMentorshipPreference",
    );
    notifyListeners();
  }

  // --- Simulation Methods (Replace with actual API calls later) ---

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();
    print("Attempting login for: $username"); // Debug print

    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    // Simulate successful login
    _currentUser = User(
      id: 'user-123',
      username: username,
      email: '$username@example.com',
      role: _simulatedRole, // Use the simulated role
    );
    _isLoading = false;
    print("Login successful. User role: ${_currentUser?.role}"); // Debug print
    notifyListeners();
    return true;

    // Simulate failed login:
    // _isLoading = false;
    // notifyListeners();
    // return false;
  }

  Future<bool> register(
    String username,
    String email,
    String password,
    // Add onboarding parameters
    UserRole userRole,
    MentorshipPreference mentorshipPreference,
  ) async {
    _isLoading = true;
    notifyListeners();
    print(
      "Attempting registration for: $username, $email, Role: $userRole, Mentorship: $mentorshipPreference",
    ); // Debug print

    // TODO: Implement actual API call here
    // final response = await http.post(
    //   Uri.parse('YOUR_API_ENDPOINT/register'),
    //   headers: {'Content-Type': 'application/json'},
    //   body: jsonEncode({
    //     'username': username,
    //     'email': email,
    //     'password': password,
    //     'role': userRole.toString().split('.').last, // e.g., 'jobSeeker'
    //     'mentorshipPreference': mentorshipPreference.toString().split('.').last, // e.g., 'mentor'
    //   }),
    // );

    // // Handle response (check status code, parse data, etc.)
    // if (response.statusCode == 201) { // Assuming 201 Created for success
    // Simulate network delay & registration + email verification
    await Future.delayed(const Duration(seconds: 2));

    // Simulate successful registration using the provided role
    _currentUser = User(
      id: 'user-456', // Simulate ID from backend
      username: username,
      email: email,
      role: userRole, // Use the role determined during onboarding
      // TODO: Add mentorship preference to User model if needed later
    );
    _isLoading = false;
    print(
      "Registration successful. User role: ${_currentUser?.role}",
    ); // Debug print
    notifyListeners();
    return true;
    // } else {
    //   // Handle registration failure
    //   _isLoading = false;
    //   print("Registration failed: ${response.body}");
    //   notifyListeners();
    //   return false;
    // }
  }

  Future<void> logout() async {
    print("Logging out"); // Debug print
    // Simulate logout process
    await Future.delayed(const Duration(milliseconds: 500));
    _currentUser = null;
    notifyListeners();
  }

  // Method to change the simulated role for testing UI easily
  void setSimulatedRole(UserRole role) {
    _simulatedRole = role;
    // If logged in, update current user's role immediately for testing
    if (_currentUser != null) {
      _currentUser = User(
        id: _currentUser!.id,
        username: _currentUser!.username,
        email: _currentUser!.email,
        role: _simulatedRole,
      );
    }
    print("Simulated role set to: $_simulatedRole"); // Debug print
    notifyListeners(); // Notify listeners about the role change
  }

  // --- End Simulation Methods ---

  // Add methods for password reset, delete account later
}
