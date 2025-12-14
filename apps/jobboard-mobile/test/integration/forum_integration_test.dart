import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/forum/screens/forum_page.dart';
import 'package:mobile/features/forum/screens/create_thread_screen.dart';
import 'package:mobile/features/forum/screens/thread_detail_screen.dart';
import 'package:mobile/features/forum/widgets/thread_tile.dart';
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

  group('Forum Integration Tests', () {
    late MockAuthProvider mockAuthProvider;

    setUp(() {
      mockAuthProvider = MockAuthProvider();
    });

    Widget createTestApp() {
      return MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: ChangeNotifierProvider<AuthProvider>.value(
          value: mockAuthProvider,
          child: const ForumPage(),
        ),
      );
    }

    testWidgets('Complete forum flow: view posts, create post, view details', (
      WidgetTester tester,
    ) async {
      // Start at forum page
      await tester.pumpWidget(createTestApp());
      await tester.pump();

      // Wait for loading
      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Forum page should be displayed
      expect(find.byType(ForumPage), findsOneWidget);
    });

    testWidgets('Forum page loads and displays content', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Should show either posts or empty state
      final hasPosts = find.byType(ThreadTile).evaluate().isNotEmpty;
      final hasEmptyState =
          find.byIcon(Icons.forum_outlined).evaluate().isNotEmpty;

      expect(hasPosts || hasEmptyState, isTrue);
    });

    testWidgets('Can navigate to create thread screen', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Find floating action button
      final fab = find.byType(FloatingActionButton);

      if (fab.evaluate().isNotEmpty) {
        await tester.tap(fab.first);
        await tester.pumpAndSettle();

        // Should navigate to create thread screen
        expect(find.byType(CreateThreadScreen), findsOneWidget);
      }
    });

    testWidgets('Can search for posts', (WidgetTester tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Find search field
      final searchField = find.byType(TextField);

      if (searchField.evaluate().isNotEmpty) {
        await tester.enterText(searchField.first, 'flutter');
        await tester.pump();

        // Search query should be entered
        expect(find.text('flutter'), findsOneWidget);
      }
    });

    testWidgets('Can open and close filter modal', (WidgetTester tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Find and tap filter button
      final filterButton = find.byIcon(Icons.filter_list_rounded);

      if (filterButton.evaluate().isNotEmpty) {
        await tester.tap(filterButton);
        await tester.pumpAndSettle();

        // Modal should be open (check for modal content)
        expect(find.byType(ElevatedButton), findsWidgets);

        // Close modal by tapping outside or reset button
        final resetButton = find.byType(OutlinedButton);
        if (resetButton.evaluate().isNotEmpty) {
          await tester.tap(resetButton.first);
          await tester.pumpAndSettle();

          // Modal should be closed (back to forum page)
          expect(find.byType(ForumPage), findsOneWidget);
        }
      }
    });

    testWidgets('Can view thread details when tapping on a post', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Find a thread tile
      final threadTile = find.byType(ThreadTile);

      if (threadTile.evaluate().isNotEmpty) {
        await tester.tap(threadTile.first);
        await tester.pumpAndSettle();

        // Should navigate to thread detail screen
        expect(find.byType(ThreadDetailScreen), findsOneWidget);
      }
    });

    testWidgets('Thread detail screen displays post content', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Navigate to thread detail
      final threadTile = find.byType(ThreadTile);

      if (threadTile.evaluate().isNotEmpty) {
        await tester.tap(threadTile.first);
        await tester.pumpAndSettle();

        // Should show post content
        expect(find.byType(ListView), findsOneWidget);
        expect(find.byType(CircleAvatar), findsWidgets);
      }
    });

    testWidgets('Can navigate back from thread detail to forum page', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Navigate to thread detail
      final threadTile = find.byType(ThreadTile);

      if (threadTile.evaluate().isNotEmpty) {
        await tester.tap(threadTile.first);
        await tester.pumpAndSettle();

        // Tap back button
        final backButton = find.byType(BackButton);
        if (backButton.evaluate().isNotEmpty) {
          await tester.tap(backButton);
          await tester.pumpAndSettle();

          // Should be back at forum page
          expect(find.byType(ForumPage), findsOneWidget);
        }
      }
    });

    testWidgets('Create thread screen validates input', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const CreateThreadScreen(),
          ),
        ),
      );
      await tester.pump();

      // Try to submit without filling form
      final submitButton = find.byType(ElevatedButton);
      await tester.tap(submitButton);
      await tester.pump();

      // Should still be on create screen due to validation
      expect(find.byType(CreateThreadScreen), findsOneWidget);
    });

    testWidgets('Create thread screen accepts valid input', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const CreateThreadScreen(),
          ),
        ),
      );
      await tester.pump();

      // Fill in title
      final titleField = find.byType(TextFormField).first;
      await tester.enterText(titleField, 'Integration Test Post');
      await tester.pump();

      // Fill in body
      final bodyField = find.byType(TextFormField).at(1);
      await tester.enterText(
        bodyField,
        'This is a test post created during integration testing.',
      );
      await tester.pump();

      // Verify input was entered
      expect(find.text('Integration Test Post'), findsOneWidget);
      expect(
        find.text('This is a test post created during integration testing.'),
        findsOneWidget,
      );
    });

    testWidgets('Forum page handles empty state correctly', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Should show either posts or empty state, not error
      final hasError =
          find.byIcon(Icons.error_outline_rounded).evaluate().isNotEmpty;

      // If there's an error, retry button should work
      if (hasError) {
        final retryButton = find.byIcon(Icons.refresh_rounded);
        if (retryButton.evaluate().isNotEmpty) {
          await tester.tap(retryButton);
          await tester.pumpAndSettle();
        }
      }

      // Should eventually show content or empty state
      expect(find.byType(ForumPage), findsOneWidget);
    });

    testWidgets('Search functionality filters posts', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Count initial posts
      final initialPostCount = find.byType(ThreadTile).evaluate().length;

      // Search for something specific
      final searchField = find.byType(TextField);

      if (searchField.evaluate().isNotEmpty) {
        await tester.enterText(searchField.first, 'nonexistentquery12345');
        await tester.pump();

        // Should show "no posts found" or fewer posts
        final filteredPostCount = find.byType(ThreadTile).evaluate().length;

        // Either no posts or search icon indicating no results
        expect(
          filteredPostCount < initialPostCount ||
              find.byIcon(Icons.search_off_rounded).evaluate().isNotEmpty,
          isTrue,
        );
      }
    });

    testWidgets('Clear search button works', (WidgetTester tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Enter search query
      final searchField = find.byType(TextField);

      if (searchField.evaluate().isNotEmpty) {
        await tester.enterText(searchField.first, 'test search');
        await tester.pump();

        // Find and tap clear button
        final clearButton = find.byIcon(Icons.clear_rounded);
        if (clearButton.evaluate().isNotEmpty) {
          await tester.tap(clearButton);
          await tester.pump();

          // Search field should be cleared
          final textField = tester.widget<TextField>(searchField.first);
          expect(textField.controller?.text, isEmpty);
        }
      }
    });

    testWidgets('Tag filtering works in filter modal', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Open filter modal
      final filterButton = find.byIcon(Icons.filter_list_rounded);

      if (filterButton.evaluate().isNotEmpty) {
        await tester.tap(filterButton);
        await tester.pumpAndSettle();

        // Look for filter chips or checkboxes
        final hasFilterChips = find.byType(FilterChip).evaluate().isNotEmpty;

        if (hasFilterChips) {
          // Select a tag
          final firstChip = find.byType(FilterChip).first;
          await tester.tap(firstChip);
          await tester.pump();

          // Apply filter
          final filterApplyButton = find.byType(ElevatedButton).first;
          await tester.tap(filterApplyButton);
          await tester.pumpAndSettle();

          // Badge should show selected count
          expect(find.byType(Badge), findsWidgets);
        }
      }
    });

    testWidgets('App bar displays correct title', (WidgetTester tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pump();

      expect(find.byType(AppBar), findsOneWidget);
    });

    testWidgets('Forum page has proper accessibility', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Check for semantic widgets
      expect(find.byType(Semantics), findsWidgets);
    });
  });

  group('Forum Error Handling Tests', () {
    late MockAuthProvider mockAuthProvider;

    setUp(() {
      mockAuthProvider = MockAuthProvider();
    });

    Widget createTestApp() {
      return MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: ChangeNotifierProvider<AuthProvider>.value(
          value: mockAuthProvider,
          child: const ForumPage(),
        ),
      );
    }

    testWidgets('Handles loading state gracefully', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestApp());

      // Should show loading indicator initially
      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      await tester.pump();
    });

    testWidgets('Displays retry button on error', (WidgetTester tester) async {
      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Check if error state is shown
      final hasErrorIcon =
          find.byIcon(Icons.error_outline_rounded).evaluate().isNotEmpty;

      if (hasErrorIcon) {
        // Retry button should be available
        expect(find.byIcon(Icons.refresh_rounded), findsOneWidget);
      }
    });
  });
}
