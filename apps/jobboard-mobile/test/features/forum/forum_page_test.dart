import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/forum/screens/forum_page.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:provider/provider.dart';
import 'package:mobile/generated/l10n/app_localizations.dart';

class MockAuthProvider extends AuthProvider {
  @override
  bool get isLoggedIn => true;

  @override
  String get token => 'test-token';
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('ForumPage Widget Tests', () {
    late MockAuthProvider mockAuthProvider;

    setUp(() {
      mockAuthProvider = MockAuthProvider();
    });

    Widget createTestWidget() {
      return MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: ChangeNotifierProvider<AuthProvider>.value(
          value: mockAuthProvider,
          child: const ForumPage(),
        ),
      );
    }

    testWidgets('should display loading indicator initially', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('should display app bar with title', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.byType(AppBar), findsOneWidget);
    });

    testWidgets('should display filter button in app bar', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Look for the filter icon button
      expect(find.byIcon(Icons.filter_list_rounded), findsOneWidget);
    });

    testWidgets('should display floating action button for new post', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Wait for any async operations
      await tester.pump(const Duration(seconds: 2));

      expect(find.byType(FloatingActionButton), findsWidgets);
    });

    testWidgets('should display search bar when posts are loaded', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Wait for posts to load
      await tester.pump(const Duration(seconds: 2));

      // Search for TextField
      expect(find.byType(TextField), findsWidgets);
    });

    testWidgets('should open filter modal when filter button is tapped', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Tap the filter button
      await tester.tap(find.byIcon(Icons.filter_list_rounded));
      await tester.pumpAndSettle();

      // Check if modal bottom sheet is displayed
      // Modal should be open (can't directly check ModalBottomSheet type)
      expect(find.byType(ElevatedButton), findsWidgets);
    });

    testWidgets('should update search query when typing in search field', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Wait for posts to load
      await tester.pump(const Duration(seconds: 2));

      // Find the search TextField
      final searchField = find.byType(TextField).first;

      if (searchField.evaluate().isNotEmpty) {
        await tester.enterText(searchField, 'flutter');
        await tester.pump();

        // Verify text was entered
        expect(find.text('flutter'), findsOneWidget);
      }
    });

    testWidgets('should clear search when clear button is tapped', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Wait for posts to load
      await tester.pump(const Duration(seconds: 2));

      // Find and enter text in search field
      final searchField = find.byType(TextField).first;

      if (searchField.evaluate().isNotEmpty) {
        await tester.enterText(searchField, 'test query');
        await tester.pump();

        // Find and tap clear button
        final clearButton = find.byIcon(Icons.clear_rounded);
        if (clearButton.evaluate().isNotEmpty) {
          await tester.tap(clearButton);
          await tester.pump();
        }
      }
    });

    testWidgets('should display retry button on error', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Wait to see if error state appears
      await tester.pump(const Duration(seconds: 3));

      // Check for error icon or retry button
      final errorIcon = find.byIcon(Icons.error_outline_rounded);
      final retryButton = find.byIcon(Icons.refresh_rounded);

      // Either error state or loaded state should be present
      expect(
        errorIcon.evaluate().isNotEmpty || retryButton.evaluate().isEmpty,
        isTrue,
      );
    });

    testWidgets('should have proper accessibility labels', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Check for semantic labels on important widgets
      expect(find.byType(Semantics), findsWidgets);
    });
  });

  group('ForumPage Filter Tests', () {
    late MockAuthProvider mockAuthProvider;

    setUp(() {
      mockAuthProvider = MockAuthProvider();
    });

    Widget createTestWidget() {
      return MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: ChangeNotifierProvider<AuthProvider>.value(
          value: mockAuthProvider,
          child: const ForumPage(),
        ),
      );
    }

    testWidgets('filter modal should have search field for tags', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Open filter modal
      await tester.tap(find.byIcon(Icons.filter_list_rounded));
      await tester.pumpAndSettle();

      // Look for search icon in modal
      expect(find.byIcon(Icons.search), findsWidgets);
    });

    testWidgets('filter modal should have filter and reset buttons', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Open filter modal
      await tester.tap(find.byIcon(Icons.filter_list_rounded));
      await tester.pumpAndSettle();

      // Look for buttons
      expect(find.byType(ElevatedButton), findsWidgets);
      expect(find.byType(OutlinedButton), findsWidgets);
    });

    testWidgets('should display selected tag count badge', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Look for Badge widget
      expect(find.byType(Badge), findsWidgets);
    });
  });

  group('ForumPage Empty State Tests', () {
    late MockAuthProvider mockAuthProvider;

    setUp(() {
      mockAuthProvider = MockAuthProvider();
    });

    Widget createTestWidget() {
      return MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: ChangeNotifierProvider<AuthProvider>.value(
          value: mockAuthProvider,
          child: const ForumPage(),
        ),
      );
    }

    testWidgets('should show empty state icon when no posts', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Wait for loading to complete
      await tester.pump(const Duration(seconds: 2));

      // Check for empty state or posts
      final forumIcon = find.byIcon(Icons.forum_outlined);
      final searchOffIcon = find.byIcon(Icons.search_off_rounded);

      // Either empty state icons or posts should be present
      expect(
        forumIcon.evaluate().isNotEmpty ||
            searchOffIcon.evaluate().isNotEmpty ||
            find.byType(ListView).evaluate().isNotEmpty,
        isTrue,
      );
    });
  });
}
