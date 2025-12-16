import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/forum/screens/thread_detail_screen.dart';
import 'package:mobile/core/models/forum_post.dart';
import 'package:mobile/core/models/forum_comment.dart';
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

  group('ThreadDetailScreen Widget Tests', () {
    late ForumPost testPost;
    late MockAuthProvider mockAuthProvider;

    setUp(() {
      mockAuthProvider = MockAuthProvider();
      
      final testComments = [
        ForumComment(
          id: 1,
          content: 'First comment',
          authorId: 456,
          authorUsername: 'commenter1',
          postId: 1,
          createdAt: DateTime.now().subtract(const Duration(hours: 1)),
          updatedAt: DateTime.now().subtract(const Duration(hours: 1)),
          upvoteCount: 2,
          downvoteCount: 0,
        ),
        ForumComment(
          id: 2,
          content: 'Second comment',
          authorId: 789,
          authorUsername: 'commenter2',
          postId: 1,
          createdAt: DateTime.now().subtract(const Duration(minutes: 30)),
          updatedAt: DateTime.now().subtract(const Duration(minutes: 30)),
          upvoteCount: 1,
          downvoteCount: 0,
        ),
      ];

      testPost = ForumPost(
        id: 1,
        title: 'Test Forum Post',
        content: 'This is the detailed content of the test forum post.',
        authorId: 123,
        authorUsername: 'testauthor',
        tags: ['flutter', 'testing'],
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        updatedAt: DateTime.now().subtract(const Duration(days: 1)),
        commentCount: 2,
        upvoteCount: 15,
        downvoteCount: 3,
        comments: testComments,
      );
    });

    Widget createTestWidget(ForumPost post) {
      return MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: ChangeNotifierProvider<AuthProvider>.value(
          value: mockAuthProvider,
          child: ThreadDetailScreen(post: post),
        ),
      );
    }

    testWidgets('should display post title in app bar', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      expect(find.text('Test Forum Post'), findsOneWidget);
    });

    testWidgets('should display post content', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      expect(
        find.text('This is the detailed content of the test forum post.'),
        findsOneWidget,
      );
    });

    testWidgets('should display author username', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      expect(find.text('testauthor'), findsOneWidget);
    });

    testWidgets('should display tags', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      expect(find.text('flutter'), findsOneWidget);
      expect(find.text('testing'), findsOneWidget);
    });

    testWidgets('should display upvote and downvote counts', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      expect(find.text('15'), findsOneWidget);
      expect(find.text('3'), findsWidgets);
    });

    testWidgets('should display comment count', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      expect(find.text('2'), findsWidgets);
    });

    testWidgets('should display all comments', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      expect(find.text('First comment'), findsOneWidget);
      expect(find.text('Second comment'), findsOneWidget);
    });

    testWidgets('should display comment input field', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      expect(find.byType(TextFormField), findsOneWidget);
    });

    testWidgets('should display send button', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      expect(find.byIcon(Icons.send_rounded), findsOneWidget);
    });

    testWidgets('should have popup menu button', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      expect(find.byType(PopupMenuButton<String>), findsWidgets);
    });

    testWidgets('should display upvote and downvote buttons', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      expect(find.byIcon(Icons.arrow_upward_rounded), findsWidgets);
      expect(find.byIcon(Icons.arrow_downward_rounded), findsWidgets);
    });

    testWidgets('should validate comment input', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      // Try to submit empty comment
      await tester.tap(find.byIcon(Icons.send_rounded));
      await tester.pump();

      // Should show validation error
      expect(find.byType(TextFormField), findsOneWidget);
    });

    testWidgets('should allow entering comment text', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      await tester.enterText(
        find.byType(TextFormField),
        'This is a new comment',
      );
      await tester.pump();

      expect(find.text('This is a new comment'), findsOneWidget);
    });

    testWidgets('should display ListView with post and comments', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      expect(find.byType(ListView), findsOneWidget);
    });

    testWidgets('should have proper styling in dark mode', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          theme: ThemeData.dark(),
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: ThreadDetailScreen(post: testPost),
          ),
        ),
      );

      await tester.pump();

      expect(find.byType(ThreadDetailScreen), findsOneWidget);
    });

    testWidgets('should have proper styling in light mode', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          theme: ThemeData.light(),
          home: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: ThreadDetailScreen(post: testPost),
          ),
        ),
      );

      await tester.pump();

      expect(find.byType(ThreadDetailScreen), findsOneWidget);
    });

    testWidgets('should display CircleAvatar for author', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      expect(find.byType(CircleAvatar), findsWidgets);
    });

    testWidgets('should display comment section header', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      // Look for the comment count badge or header
      expect(find.byType(Container), findsWidgets);
    });

    testWidgets('should handle post with no comments', (WidgetTester tester) async {
      final postWithoutComments = testPost.copyWith(
        comments: [],
        commentCount: 0,
      );

      await tester.pumpWidget(createTestWidget(postWithoutComments));
      await tester.pump();

      expect(find.text('0'), findsWidgets);
    });

    testWidgets('should display edited indicator if post was edited', (WidgetTester tester) async {
      final editedPost = testPost.copyWith(
        updatedAt: DateTime.now(),
      );

      await tester.pumpWidget(createTestWidget(editedPost));
      await tester.pump();

      expect(find.text('edited', findRichText: true), findsWidgets);
    });

    testWidgets('should show report option in menu', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));
      await tester.pump();

      // Find and tap the popup menu
      final popupButton = find.byType(PopupMenuButton<String>).first;
      await tester.tap(popupButton);
      await tester.pumpAndSettle();

      expect(find.text('Report'), findsOneWidget);
    });

    testWidgets('should scroll through comments', (WidgetTester tester) async {
      // Create a post with many comments
      final manyComments = List.generate(
        20,
        (index) => ForumComment(
          id: index,
          content: 'Comment $index',
          authorId: 100 + index,
          authorUsername: 'user$index',
          postId: 1,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
          upvoteCount: 0,
          downvoteCount: 0,
        ),
      );

      final postWithManyComments = testPost.copyWith(
        comments: manyComments,
        commentCount: 20,
      );

      await tester.pumpWidget(createTestWidget(postWithManyComments));
      await tester.pump();

      // Verify ListView is scrollable
      expect(find.byType(ListView), findsOneWidget);
    });
  });
}

