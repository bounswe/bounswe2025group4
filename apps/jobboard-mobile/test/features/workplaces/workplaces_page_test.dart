import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/workplaces/screens/workplaces_page.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/models/user_type.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('WorkplacesPage Tests', () {
    late AuthProvider mockAuthProvider;

    setUp(() {
      mockAuthProvider = AuthProvider();
    });

    testWidgets('should render workplaces page with title', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplacesPage(),
          ),
        ),
      );

      // Wait for the widget to settle
      await tester.pumpAndSettle();

      // Verify the page renders
      expect(find.byType(WorkplacesPage), findsOneWidget);
      expect(find.byType(AppBar), findsOneWidget);
    });

    testWidgets('should show search bar and filter button', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplacesPage(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Check for search field
      expect(find.byType(TextField), findsWidgets);

      // Check for filter button
      expect(find.byIcon(Icons.filter_alt_outlined), findsOneWidget);
    });

    testWidgets('should show refresh button in app bar', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplacesPage(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Check for refresh button
      expect(find.byIcon(Icons.refresh), findsOneWidget);
    });

    testWidgets('should show employer actions when user is employer', (
      WidgetTester tester,
    ) async {
      // Set the current user directly (simulating logged in state)
      await mockAuthProvider.register(
        'testemployer',
        'employer@test.com',
        'password',
        UserType.ROLE_EMPLOYER,
        null,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplacesPage(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Check for employer-specific buttons
      expect(find.byIcon(Icons.business_center), findsOneWidget);
      expect(find.byIcon(Icons.request_page), findsOneWidget);
      expect(find.byIcon(Icons.add), findsOneWidget);
    });

    testWidgets('should not show employer actions when user is not employer', (
      WidgetTester tester,
    ) async {
      // Set the current user directly (simulating logged in state)
      await mockAuthProvider.register(
        'testjobseeker',
        'jobseeker@test.com',
        'password',
        UserType.ROLE_JOBSEEKER,
        null,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplacesPage(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Check that employer-specific buttons are not present
      expect(find.byIcon(Icons.business_center), findsNothing);
      expect(find.byIcon(Icons.request_page), findsNothing);
      expect(find.byIcon(Icons.add), findsNothing);
    });

    testWidgets('should show sort dropdown', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplacesPage(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Check for sort dropdown
      expect(find.byType(DropdownButton<String>), findsOneWidget);
      expect(find.text('Sort by: '), findsOneWidget);
    });

    testWidgets('should toggle filter panel when filter button is tapped', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplacesPage(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Initially, filter panel should not be visible
      expect(find.text('Filters'), findsNothing);

      // Tap the filter button
      await tester.tap(find.byIcon(Icons.filter_alt_outlined));
      await tester.pumpAndSettle();

      // Now filter panel should be visible
      expect(find.text('Filters'), findsOneWidget);
    });

    testWidgets('should show loading indicator when loading', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplacesPage(),
          ),
        ),
      );

      // Before settling, we should see a loading indicator
      await tester.pump();
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('should allow search text input', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplacesPage(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Find the search text field
      final searchField = find.byType(TextField).first;

      // Enter text
      await tester.enterText(searchField, 'Tech Company');
      await tester.pump();

      // Verify text was entered
      expect(find.text('Tech Company'), findsOneWidget);
    });

    testWidgets('should show clear button when search text is entered', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplacesPage(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Find and enter text in the search field
      final searchField = find.byType(TextField).first;
      await tester.enterText(searchField, 'Test');
      await tester.pump();

      // Clear button should now be visible
      expect(find.byIcon(Icons.clear), findsOneWidget);
    });

    testWidgets('should clear search text when clear button is tapped', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplacesPage(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Enter text in search field
      final searchField = find.byType(TextField).first;
      await tester.enterText(searchField, 'Test');
      await tester.pump();

      // Tap clear button
      await tester.tap(find.byIcon(Icons.clear));
      await tester.pumpAndSettle();

      // Clear button should be gone
      expect(find.byIcon(Icons.clear), findsNothing);
    });

    testWidgets('filter panel should show sector and location fields', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplacesPage(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Open filter panel
      await tester.tap(find.byIcon(Icons.filter_alt_outlined));
      await tester.pumpAndSettle();

      // Check for filter fields
      expect(find.text('Sector'), findsOneWidget);
      expect(find.text('Location'), findsOneWidget);
      expect(find.text('Ethical Tags'), findsOneWidget);
      expect(find.text('Minimum Rating'), findsOneWidget);
    });

    testWidgets('filter panel should show apply filters button', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplacesPage(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Open filter panel
      await tester.tap(find.byIcon(Icons.filter_alt_outlined));
      await tester.pumpAndSettle();

      // Check for apply filters button
      expect(find.text('Apply Filters'), findsOneWidget);
    });

    testWidgets('should show rating slider in filter panel', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplacesPage(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Open filter panel
      await tester.tap(find.byIcon(Icons.filter_alt_outlined));
      await tester.pumpAndSettle();

      // Check for rating slider
      expect(find.byType(Slider), findsOneWidget);
    });
  });
}
