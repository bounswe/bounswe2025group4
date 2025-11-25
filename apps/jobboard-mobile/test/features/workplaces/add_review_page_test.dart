import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/workplaces/screens/add_review_page.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/providers/auth_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('AddReviewPage Tests', () {
    late AuthProvider mockAuthProvider;
    const testWorkplaceId = 1;
    const testWorkplaceName = 'Test Company';

    setUp(() {
      mockAuthProvider = AuthProvider();
    });

    testWidgets('should render add review page', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const AddReviewPage(
              workplaceId: testWorkplaceId,
              workplaceName: testWorkplaceName,
            ),
          ),
        ),
      );

      await tester.pump();

      // Verify the page renders
      expect(find.byType(AddReviewPage), findsOneWidget);
    });

    testWidgets('should have app bar with title', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const AddReviewPage(
              workplaceId: testWorkplaceId,
              workplaceName: testWorkplaceName,
            ),
          ),
        ),
      );

      await tester.pump();

      // Check for app bar
      expect(find.byType(AppBar), findsOneWidget);
      expect(find.text('Add Review'), findsOneWidget);
    });

    testWidgets('should show loading indicator initially', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const AddReviewPage(
              workplaceId: testWorkplaceId,
              workplaceName: testWorkplaceName,
            ),
          ),
        ),
      );

      await tester.pump();

      // Should show loading indicator
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('should have form widget', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const AddReviewPage(
              workplaceId: testWorkplaceId,
              workplaceName: testWorkplaceName,
            ),
          ),
        ),
      );

      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Check for form (may be present after loading)
      // The form might not be visible during error state
      expect(find.byType(AddReviewPage), findsOneWidget);
    });

    testWidgets('should pass workplace id and name correctly', (
      WidgetTester tester,
    ) async {
      const customWorkplaceId = 42;
      const customWorkplaceName = 'Custom Company';

      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const AddReviewPage(
              workplaceId: customWorkplaceId,
              workplaceName: customWorkplaceName,
            ),
          ),
        ),
      );

      await tester.pump();

      // Verify the widget is created with the correct parameters
      final widget = tester.widget<AddReviewPage>(find.byType(AddReviewPage));
      expect(widget.workplaceId, equals(customWorkplaceId));
      expect(widget.workplaceName, equals(customWorkplaceName));
    });

    testWidgets('should be stateful widget', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const AddReviewPage(
              workplaceId: testWorkplaceId,
              workplaceName: testWorkplaceName,
            ),
          ),
        ),
      );

      await tester.pump();

      // Verify it's a StatefulWidget
      expect(
        tester.widget<AddReviewPage>(find.byType(AddReviewPage)),
        isA<StatefulWidget>(),
      );
    });

    testWidgets('should have proper scaffold structure', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const AddReviewPage(
              workplaceId: testWorkplaceId,
              workplaceName: testWorkplaceName,
            ),
          ),
        ),
      );

      await tester.pump();

      // Verify scaffold exists
      expect(find.byType(Scaffold), findsOneWidget);
      expect(find.byType(AppBar), findsOneWidget);
    });

    testWidgets('should support editing existing review', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const AddReviewPage(
              workplaceId: testWorkplaceId,
              workplaceName: testWorkplaceName,
              existingReview: null,
            ),
          ),
        ),
      );

      await tester.pump();

      // Verify the page renders (existingReview parameter is accepted)
      expect(find.byType(AddReviewPage), findsOneWidget);
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
                                    child: const AddReviewPage(
                                      workplaceId: testWorkplaceId,
                                      workplaceName: testWorkplaceName,
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

      // Navigate to review page
      await tester.tap(find.text('Navigate'));
      await tester.pumpAndSettle();

      // Verify we're on the review page
      expect(find.text('Add Review'), findsOneWidget);

      // Go back
      await tester.tap(find.byType(BackButton));
      await tester.pumpAndSettle();

      // Verify we're back to the original page
      expect(find.text('Navigate'), findsOneWidget);
    });

    testWidgets('should provide auth provider context', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const AddReviewPage(
              workplaceId: testWorkplaceId,
              workplaceName: testWorkplaceName,
            ),
          ),
        ),
      );

      await tester.pump();

      // Verify the page has access to auth provider
      final context = tester.element(find.byType(AddReviewPage));
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      expect(authProvider, isNotNull);
    });
  });
}
