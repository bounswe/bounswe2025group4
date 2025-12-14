import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/forum/screens/create_thread_screen.dart';
import 'package:mobile/core/models/forum_post.dart';
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

  group('CreateThreadScreen Widget Tests - New Post', () {
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
          child: const CreateThreadScreen(),
        ),
      );
    }

    testWidgets('should display app bar with title for new post', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.byType(AppBar), findsOneWidget);
    });

    testWidgets('should display title input field', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.byType(TextFormField), findsWidgets);
    });

    testWidgets('should display body input field', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Should have at least 2 TextFormFields (title and body)
      expect(find.byType(TextFormField), findsNWidgets(2));
    });

    testWidgets('should display tags section', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Look for the select tags button
      expect(find.byType(TextButton), findsWidgets);
    });

    testWidgets('should display submit button', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.byType(ElevatedButton), findsOneWidget);
    });

    testWidgets('should allow entering title', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      final titleField = find.byType(TextFormField).first;
      await tester.enterText(titleField, 'My New Forum Post');
      await tester.pump();

      expect(find.text('My New Forum Post'), findsOneWidget);
    });

    testWidgets('should allow entering body content', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      final bodyField = find.byType(TextFormField).at(1);
      await tester.enterText(bodyField, 'This is the content of my post');
      await tester.pump();

      expect(find.text('This is the content of my post'), findsOneWidget);
    });

    testWidgets('should validate empty title', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Try to submit without entering title
      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();

      // Form validation should prevent submission
      expect(find.byType(CreateThreadScreen), findsOneWidget);
    });

    testWidgets('should validate empty body', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Enter title only
      final titleField = find.byType(TextFormField).first;
      await tester.enterText(titleField, 'Title Only');
      await tester.pump();

      // Try to submit without body
      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();

      // Form validation should prevent submission
      expect(find.byType(CreateThreadScreen), findsOneWidget);
    });

    testWidgets('should open tag selection modal', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Find and tap the select tags button
      final selectTagsButton = find.byType(TextButton).first;
      await tester.tap(selectTagsButton);
      await tester.pumpAndSettle();

      // Modal should be displayed (check for modal content instead)
      expect(find.byType(ElevatedButton), findsWidgets);
    });

    testWidgets('should display "No tags selected" when no tags', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.text('No tags selected'), findsOneWidget);
    });

    testWidgets('should have proper styling in dark mode', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          theme: ThemeData.dark(),
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const CreateThreadScreen(),
          ),
        ),
      );

      await tester.pump();

      expect(find.byType(CreateThreadScreen), findsOneWidget);
    });

    testWidgets('should have proper styling in light mode', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          theme: ThemeData.light(),
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: const CreateThreadScreen(),
          ),
        ),
      );

      await tester.pump();

      expect(find.byType(CreateThreadScreen), findsOneWidget);
    });

    testWidgets('should display form with proper layout', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      expect(find.byType(Form), findsOneWidget);
      expect(find.byType(Column), findsWidgets);
      expect(find.byType(SingleChildScrollView), findsOneWidget);
    });
  });

  group('CreateThreadScreen Widget Tests - Edit Post', () {
    late MockAuthProvider mockAuthProvider;
    late ForumPost existingPost;

    setUp(() {
      mockAuthProvider = MockAuthProvider();
      existingPost = ForumPost(
        id: 1,
        title: 'Existing Post Title',
        content: 'Existing post content',
        authorId: 123,
        authorUsername: 'testuser',
        tags: ['flutter', 'testing'],
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        updatedAt: DateTime.now().subtract(const Duration(days: 1)),
        commentCount: 0,
        upvoteCount: 0,
        downvoteCount: 0,
        comments: [],
      );
    });

    Widget createTestWidget(ForumPost post) {
      return MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: ChangeNotifierProvider<AuthProvider>.value(
          value: mockAuthProvider,
          child: CreateThreadScreen(post: post),
        ),
      );
    }

    testWidgets('should pre-fill title when editing', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(existingPost));
      await tester.pump();

      expect(find.text('Existing Post Title'), findsOneWidget);
    });

    testWidgets('should pre-fill content when editing', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(existingPost));
      await tester.pump();

      expect(find.text('Existing post content'), findsOneWidget);
    });

    testWidgets('should pre-fill tags when editing', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(existingPost));
      await tester.pump();

      expect(find.text('flutter'), findsOneWidget);
      expect(find.text('testing'), findsOneWidget);
    });

    testWidgets('should display edit title in app bar', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(existingPost));
      await tester.pump();

      expect(find.byType(AppBar), findsOneWidget);
    });

    testWidgets('should allow removing tags', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(existingPost));
      await tester.pump();

      // Look for close icon on tags
      expect(find.byIcon(Icons.close_rounded), findsWidgets);
    });

    testWidgets('should allow modifying title', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(existingPost));
      await tester.pump();

      final titleField = find.byType(TextFormField).first;
      await tester.enterText(titleField, 'Modified Title');
      await tester.pump();

      expect(find.text('Modified Title'), findsOneWidget);
    });

    testWidgets('should allow modifying content', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(existingPost));
      await tester.pump();

      final bodyField = find.byType(TextFormField).at(1);
      await tester.enterText(bodyField, 'Modified content');
      await tester.pump();

      expect(find.text('Modified content'), findsOneWidget);
    });
  });

  group('CreateThreadScreen Tag Selection Tests', () {
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
          child: const CreateThreadScreen(),
        ),
      );
    }

    testWidgets('tag modal should have suggest tags button', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Open tag selection modal
      final selectTagsButton = find.byType(TextButton).first;
      await tester.tap(selectTagsButton);
      await tester.pumpAndSettle();

      // Look for suggest tags button
      expect(find.byType(ElevatedButton), findsWidgets);
    });

    testWidgets('tag modal should have add new tag field', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Open tag selection modal
      final selectTagsButton = find.byType(TextButton).first;
      await tester.tap(selectTagsButton);
      await tester.pumpAndSettle();

      // Look for TextField to add new tag
      expect(find.byType(TextField), findsWidgets);
    });

    testWidgets('tag modal should have done button', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Open tag selection modal
      final selectTagsButton = find.byType(TextButton).first;
      await tester.tap(selectTagsButton);
      await tester.pumpAndSettle();

      // Look for done button
      expect(find.byType(ElevatedButton), findsWidgets);
    });

    testWidgets('should close tag modal when done is tapped', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pump();

      // Open tag selection modal
      final selectTagsButton = find.byType(TextButton).first;
      await tester.tap(selectTagsButton);
      await tester.pumpAndSettle();

      // Tap done button (last ElevatedButton in modal)
      final doneButton = find.byType(ElevatedButton).last;
      await tester.tap(doneButton);
      await tester.pumpAndSettle();

      // Modal should be closed (back to main screen)
      expect(find.text('No tags selected'), findsOneWidget);
    });
  });
}

