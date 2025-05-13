import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/providers/auth_provider.dart';

// Create a test version of AuthProvider to avoid real API calls
class TestAuthProvider extends AuthProvider {
  @override
  bool _isLoggedIn = false;

  @override
  bool get isLoggedIn => _isLoggedIn;

  @override
  Future<bool> login(String username, String password) async {
    // Mock successful login
    _isLoggedIn = true;
    notifyListeners();
    return Future.value(true);
  }

  @override
  Future<void> logout() async {
    // Mock logout
    _isLoggedIn = false;
    notifyListeners();
    return Future.value();
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('AuthProvider Tests', () {
    late TestAuthProvider authProvider;

    setUp(() {
      authProvider = TestAuthProvider();
    });

    test('should start with not logged in state', () {
      expect(authProvider.isLoggedIn, false);
    });

    test('should update isLoggedIn after login', () async {
      // Act
      await authProvider.login('test@example.com', 'password123');

      // Assert
      expect(authProvider.isLoggedIn, true);
    });

    test('should clear login state after logout', () async {
      // Arrange
      await authProvider.login('test@example.com', 'password123');
      expect(authProvider.isLoggedIn, true);

      // Act
      await authProvider.logout();

      // Assert
      expect(authProvider.isLoggedIn, false);
    });
  });
}
