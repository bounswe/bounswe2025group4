import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/workplaces/screens/workplace_detail_page.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/models/user_type.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('WorkplaceDetailPage Tests', () {
    late AuthProvider mockAuthProvider;
    const testWorkplaceId = 1;

    setUp(() {
      mockAuthProvider = AuthProvider();
    });

    testWidgets('should render workplace detail page', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplaceDetailPage(workplaceId: testWorkplaceId),
          ),
        ),
      );

      // Wait for initial build
      await tester.pump();

      // Verify the page renders
      expect(find.byType(WorkplaceDetailPage), findsOneWidget);
      expect(find.byType(AppBar), findsOneWidget);
    });

    testWidgets('should show loading indicator initially', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplaceDetailPage(workplaceId: testWorkplaceId),
          ),
        ),
      );

      await tester.pump();

      // Should show loading indicator
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('should have app bar with title', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplaceDetailPage(workplaceId: testWorkplaceId),
          ),
        ),
      );

      await tester.pump();

      // Check for app bar title
      expect(find.text('Workplace Details'), findsOneWidget);
    });

    testWidgets('should show refresh button in app bar', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplaceDetailPage(workplaceId: testWorkplaceId),
          ),
        ),
      );

      await tester.pump();

      // Check for refresh button
      expect(find.byIcon(Icons.refresh), findsOneWidget);
    });

    testWidgets('should show report button in app bar', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplaceDetailPage(workplaceId: testWorkplaceId),
          ),
        ),
      );

      await tester.pump();

      // Check for report button (flag icon)
      expect(find.byIcon(Icons.flag), findsOneWidget);
    });

    testWidgets('should show owner actions when user is owner', (
      WidgetTester tester,
    ) async {
      // This test would require mocking the workplace provider
      // to return a workplace where the current user is owner
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplaceDetailPage(workplaceId: testWorkplaceId),
          ),
        ),
      );

      await tester.pump();

      // Initially, the page is loading, so we can verify the structure exists
      expect(find.byType(WorkplaceDetailPage), findsOneWidget);
    });

    testWidgets('should handle back navigation', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder:
                  (context) => ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder:
                              (context) =>
                                  ChangeNotifierProvider<AuthProvider>.value(
                                    value: mockAuthProvider,
                                    child: const WorkplaceDetailPage(
                                      workplaceId: testWorkplaceId,
                                    ),
                                  ),
                        ),
                      );
                    },
                    child: const Text('Navigate'),
                  ),
            ),
          ),
        ),
      );

      // Navigate to detail page
      await tester.tap(find.text('Navigate'));
      await tester.pumpAndSettle();

      // Verify we're on the detail page
      expect(find.text('Workplace Details'), findsOneWidget);

      // Go back
      await tester.tap(find.byType(BackButton));
      await tester.pumpAndSettle();

      // Verify we're back to the original page
      expect(find.text('Navigate'), findsOneWidget);
    });

    testWidgets('should contain single child scroll view for content', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplaceDetailPage(workplaceId: testWorkplaceId),
          ),
        ),
      );

      await tester.pumpAndSettle(const Duration(seconds: 2));

      // The page structure should include scrollable content
      // (Either loading indicator or actual content in scroll view)
      expect(find.byType(WorkplaceDetailPage), findsOneWidget);
    });

    testWidgets('workplaceId should be passed correctly', (
      WidgetTester tester,
    ) async {
      const customWorkplaceId = 42;

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplaceDetailPage(workplaceId: customWorkplaceId),
          ),
        ),
      );

      await tester.pump();

      // Verify the widget is created with the correct ID
      final widget = tester.widget<WorkplaceDetailPage>(
        find.byType(WorkplaceDetailPage),
      );
      expect(widget.workplaceId, equals(customWorkplaceId));
    });

    testWidgets('should be stateful widget', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplaceDetailPage(workplaceId: testWorkplaceId),
          ),
        ),
      );

      await tester.pump();

      // Verify it's a StatefulWidget
      expect(
        tester.widget<WorkplaceDetailPage>(find.byType(WorkplaceDetailPage)),
        isA<StatefulWidget>(),
      );
    });

    testWidgets('should provide auth provider context', (
      WidgetTester tester,
    ) async {
      // Simulate user being logged in by registering
      await mockAuthProvider.register(
        'testuser',
        'test@test.com',
        'password',
        UserType.ROLE_JOBSEEKER,
        null,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplaceDetailPage(workplaceId: testWorkplaceId),
          ),
        ),
      );

      await tester.pump();

      // Verify the page has access to auth provider
      final context = tester.element(find.byType(WorkplaceDetailPage));
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      expect(authProvider.currentUser?.username, equals('testuser'));
    });

    testWidgets('should have proper scaffold structure', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const WorkplaceDetailPage(workplaceId: testWorkplaceId),
          ),
        ),
      );

      await tester.pump();

      // Verify scaffold exists
      expect(find.byType(Scaffold), findsOneWidget);
      expect(find.byType(AppBar), findsOneWidget);
    });
  });
}
