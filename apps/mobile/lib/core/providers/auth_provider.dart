import 'package:flutter/material.dart';
import '../models/user.dart'; // Adjust import path if needed

class AuthProvider with ChangeNotifier {
  User? _currentUser;
  bool _isLoading = false;
  String? _error;

  User? get currentUser => _currentUser;
  bool get isLoggedIn => _currentUser != null;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // --- Simulation Methods (Replace with actual API calls later) ---

  Future<void> login({String? username, String? password}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: Implement actual login
      await Future.delayed(const Duration(seconds: 1)); // Simulate network delay
      _currentUser = User(
        id: '1',
        username: 'johnsmith',
        email: 'john.smith@example.com',
        role: UserRole.student,
        fullName: 'John Smith',
        occupation: 'Student',
        bio: 'Hi! I am a passionate computer engineering student who loves building mobile apps.',
        location: 'London, UK',
        phone: '+44 1234 567890',
        skills: ['Flutter', 'Dart', 'Firebase', 'UI/UX'],
        interests: ['Mobile Development', 'Open Source', 'Design'],
        education: [
          Education(
            school: 'University College London',
            degree: 'BSc',
            field: 'Computer Engineering',
            startDate: '2021-09',
            endDate: null,
          ),
        ],
        experience: [
          Experience(
            company: 'Tech Solutions Ltd.',
            position: 'Software Engineering Intern',
            description: 'Worked on Flutter mobile app development and UI improvements.',
            startDate: '2023-06',
            endDate: '2023-08',
          ),
        ],
        badges: [
          UserBadge(
            name: 'Flutter Master',
            description: 'Completed 10+ projects with Flutter',
            icon: '0xe123', // MaterialIcons code point
            earnedAt: DateTime.now().subtract(const Duration(days: 30)),
          ),
        ],
        forumPostCount: 42,
      );
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> getCurrentUser() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: Implement actual user fetch
      await Future.delayed(const Duration(seconds: 1)); // Simulate network delay
      // For now, just reuse the current user
      if (_currentUser == null) {
        throw Exception('User not found');
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> register(String username, String email, String password) async {
    _isLoading = true;
    notifyListeners();

    // Simulate network delay & registration + email verification
    await Future.delayed(const Duration(seconds: 2));

    // Simulate successful registration
    _currentUser = User(
      id: 'user-456',
      username: username,
      email: email,
      role: UserRole.student,
    );
    _isLoading = false;
    notifyListeners();
    return true;
  }

  void logout() {
    _currentUser = null;
    notifyListeners();
  }

  // --- End Simulation Methods ---

  // Add methods for password reset, delete account later

  Future<void> updateProfile(User updatedUser) async {
    _currentUser = updatedUser;
    notifyListeners();
  }
}
