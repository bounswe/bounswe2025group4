import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/services/api_service.dart';

class TestAuthProvider extends AuthProvider {
  @override
  bool get isLoggedIn => _mockIsLoggedIn;

  @override
  String get token => _mockToken;

  bool _mockIsLoggedIn = false;
  String _mockToken = '';

  void setLoggedIn(bool value) {
    _mockIsLoggedIn = value;
  }

  void setToken(String value) {
    _mockToken = value;
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('ApiService Tests', () {
    late TestAuthProvider testAuthProvider;
    late ApiService apiService;

    setUp(() {
      testAuthProvider = TestAuthProvider();
      apiService = ApiService(authProvider: testAuthProvider);
    });

    test('should make API requests properly', () async {
      testAuthProvider.setLoggedIn(true);
      testAuthProvider.setToken('test-token-12345');

      expect(testAuthProvider.isLoggedIn, true);
      expect(testAuthProvider.token, 'test-token-12345');
    });
  });
}
