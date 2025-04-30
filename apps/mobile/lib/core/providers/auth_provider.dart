import 'package:flutter/material.dart';
import '../models/user.dart'; // Adjust import path if needed

class AuthProvider with ChangeNotifier {
  User? _currentUser;
  bool _isLoading = false;
  // Simulate different user roles for testing
  UserRole _simulatedRole =
      UserRole.jobSeeker; // CHANGE THIS TO TEST DIFFERENT ROLES

  User? get currentUser => _currentUser;
  bool get isLoggedIn => _currentUser != null;
  bool get isLoading => _isLoading;
  UserRole get simulatedRole =>
      _simulatedRole; // Temporary getter for role simulation

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

  Future<bool> register(String username, String email, String password) async {
    _isLoading = true;
    notifyListeners();
    print("Attempting registration for: $username, $email"); // Debug print

    // Simulate network delay & registration + email verification
    await Future.delayed(const Duration(seconds: 2));

    // Simulate successful registration
    _currentUser = User(
      id: 'user-456',
      username: username,
      email: email,
      role: _simulatedRole, // Use the simulated role after registration
    );
    _isLoading = false;
    print(
      "Registration successful. User role: ${_currentUser?.role}",
    ); // Debug print
    notifyListeners();
    return true;
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
