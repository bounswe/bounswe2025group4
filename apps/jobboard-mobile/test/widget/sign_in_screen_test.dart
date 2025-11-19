import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/auth/screens/sign_in_screen.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/providers/profile_provider.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:provider/provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:mobile/generated/l10n/app_localizations.dart';

// Mock providers for testing
class MockAuthProvider extends AuthProvider {
  bool _mockLoginSuccess = true;
  bool _mockHasPendingOtp = false;

  void setLoginSuccess(bool value) {
    _mockLoginSuccess = value;
  }

  void setHasPendingOtp(bool value) {
    _mockHasPendingOtp = value;
  }

  @override
  Future<bool> login(String username, String password) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 100));
    return _mockLoginSuccess;
  }

  @override
  bool get hasPendingOtp => _mockHasPendingOtp;
}

class MockProfileProvider extends ProfileProvider {
  MockProfileProvider() : super(apiService: MockApiService());

  @override
  Future<void> fetchMyProfile() async {
    await Future.delayed(const Duration(milliseconds: 50));
  }

  @override
  void clearCurrentUserProfile() {
    // Mock implementation
  }
}

class MockApiService extends ApiService {
  MockApiService() : super(authProvider: AuthProvider());
}

void main() {
  late MockAuthProvider mockAuthProvider;
  late MockProfileProvider mockProfileProvider;

  setUp(() {
    mockAuthProvider = MockAuthProvider();
    mockProfileProvider = MockProfileProvider();
  });

  // Helper function to wrap widget with necessary providers
  Widget createTestWidget(Widget child) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthProvider>.value(value: mockAuthProvider),
        ChangeNotifierProvider<ProfileProvider>.value(value: mockProfileProvider),
      ],
      child: MaterialApp(
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('en'),
          Locale('tr'),
          Locale('ar'),
        ],
        locale: const Locale('en'),
        home: child,
      ),
    );
  }

  group('SignInScreen Widget Tests', () {
    testWidgets('should render sign in screen with all required elements',
        (WidgetTester tester) async {
      // Arrange & Act
      await tester.pumpWidget(createTestWidget(const SignInScreen()));
      await tester.pumpAndSettle();

      // Assert - Check for key UI elements
      expect(find.byType(TextFormField), findsNWidgets(2)); // Username and password fields
      expect(find.byType(ElevatedButton), findsWidgets); // Sign in button and others
      expect(find.text('Sign In'), findsOneWidget); // App bar title

      // Check for username and password fields by finding text fields
      final textFields = find.byType(TextFormField);
      expect(textFields, findsNWidgets(2));
    });

    testWidgets('should show validation error when username is empty',
        (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(createTestWidget(const SignInScreen()));
      await tester.pumpAndSettle();

      // Act - Find and tap the sign-in button without entering credentials
      final signInButton = find.widgetWithText(ElevatedButton, 'Log In');
      expect(signInButton, findsOneWidget);
      await tester.tap(signInButton);
      await tester.pumpAndSettle();

      // Assert - Should show validation error
      expect(find.text('Please enter your username or email'), findsOneWidget);
    });

    testWidgets('should show validation error when password is empty',
        (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(createTestWidget(const SignInScreen()));
      await tester.pumpAndSettle();

      // Act - Enter username but not password
      final usernameField = find.byType(TextFormField).first;
      await tester.enterText(usernameField, 'testuser');

      final signInButton = find.widgetWithText(ElevatedButton, 'Log In');
      await tester.tap(signInButton);
      await tester.pumpAndSettle();

      // Assert - Should show password validation error
      expect(find.text('Please enter your password'), findsOneWidget);
    });

    testWidgets('should have password visibility toggle icon',
        (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(createTestWidget(const SignInScreen()));
      await tester.pumpAndSettle();

      // Assert - Check for visibility toggle icon (initially showing visibility_off)
      expect(find.byIcon(Icons.visibility_off), findsOneWidget);

      // Act - Tap the visibility toggle
      await tester.tap(find.byIcon(Icons.visibility_off));
      await tester.pumpAndSettle();

      // Assert - Icon should change to visibility
      expect(find.byIcon(Icons.visibility), findsOneWidget);

      // Act - Tap again to toggle back
      await tester.tap(find.byIcon(Icons.visibility));
      await tester.pumpAndSettle();

      // Assert - Should be back to visibility_off
      expect(find.byIcon(Icons.visibility_off), findsOneWidget);
    });

    testWidgets('should call login when form is valid and button is pressed',
        (WidgetTester tester) async {
      // Arrange
      mockAuthProvider.setLoginSuccess(true);
      await tester.pumpWidget(createTestWidget(const SignInScreen()));
      await tester.pumpAndSettle();

      // Act - Enter valid credentials
      final usernameField = find.byType(TextFormField).first;
      final passwordField = find.byType(TextFormField).last;

      await tester.enterText(usernameField, 'testuser');
      await tester.enterText(passwordField, 'password123');
      await tester.pumpAndSettle();

      // Tap sign in button
      final signInButton = find.widgetWithText(ElevatedButton, 'Log In');
      await tester.tap(signInButton);
      await tester.pumpAndSettle();

      // Assert - Should attempt navigation (MainScaffold)
      // Since we can't test actual navigation easily, we verify no error is shown
      expect(find.text('Please enter your username or email'), findsNothing);
      expect(find.text('Please enter your password'), findsNothing);
    });

    testWidgets('should show error snackbar when login fails',
        (WidgetTester tester) async {
      // Arrange
      mockAuthProvider.setLoginSuccess(false);
      await tester.pumpWidget(createTestWidget(const SignInScreen()));
      await tester.pumpAndSettle();

      // Act - Enter credentials and tap sign in
      final usernameField = find.byType(TextFormField).first;
      final passwordField = find.byType(TextFormField).last;

      await tester.enterText(usernameField, 'wronguser');
      await tester.enterText(passwordField, 'wrongpassword');
      await tester.pumpAndSettle();

      final signInButton = find.widgetWithText(ElevatedButton, 'Log In');
      await tester.tap(signInButton);
      await tester.pumpAndSettle();

      // Assert - Should show error message in SnackBar
      expect(
        find.text('Login failed. Please check your credentials.'),
        findsOneWidget,
      );
    });

    testWidgets('should have "Forgot Password?" text button',
        (WidgetTester tester) async {
      // Arrange & Act
      await tester.pumpWidget(createTestWidget(const SignInScreen()));
      await tester.pumpAndSettle();

      // Assert - Check for forgot password button
      expect(find.text('Forgot Password?'), findsOneWidget);
      expect(find.byType(TextButton), findsWidgets);
    });

    testWidgets('should have "Sign Up" navigation option',
        (WidgetTester tester) async {
      // Arrange & Act
      await tester.pumpWidget(createTestWidget(const SignInScreen()));
      await tester.pumpAndSettle();

      // Assert - Check for sign up text
      expect(
        find.textContaining("Don't have an account?", findRichText: true),
        findsOneWidget,
      );
    });

    testWidgets('should have back button in app bar',
        (WidgetTester tester) async {
      // Arrange & Act
      await tester.pumpWidget(createTestWidget(const SignInScreen()));
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(AppBar), findsOneWidget);
      expect(find.byIcon(Icons.arrow_back), findsOneWidget);
    });
  });
}
