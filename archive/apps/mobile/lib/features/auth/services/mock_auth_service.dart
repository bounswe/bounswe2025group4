import 'package:flutter/foundation.dart';

class MockAuthService extends ChangeNotifier {
  bool _isLoggedIn = false;
  String? _currentUser;

  bool get isLoggedIn => _isLoggedIn;
  String? get currentUser => _currentUser;

  // Mock user data
  final Map<String, String> _users = {
    'test@example.com': 'password123',
    'user@example.com': 'password123',
  };

  Future<bool> signIn(String email, String password) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    if (_users.containsKey(email) && _users[email] == password) {
      _isLoggedIn = true;
      _currentUser = email;
      notifyListeners();
      return true;
    }
    return false;
  }

  Future<bool> signUp(String email, String password) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    if (_users.containsKey(email)) {
      return false; // Email already exists
    }

    _users[email] = password;
    _isLoggedIn = true;
    _currentUser = email;
    notifyListeners();
    return true;
  }

  void signOut() {
    _isLoggedIn = false;
    _currentUser = null;
    notifyListeners();
  }
} 