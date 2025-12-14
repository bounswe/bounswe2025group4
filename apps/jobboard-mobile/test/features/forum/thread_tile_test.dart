import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/forum/widgets/thread_tile.dart';
import 'package:mobile/core/models/forum_post.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:provider/provider.dart';

class MockAuthProvider extends AuthProvider {
  @override
  bool get isLoggedIn => true;

  @override
  String get token => 'test-token';
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('ThreadTile Widget Tests', () {
    late ForumPost testPost;
    late MockAuthProvider mockAuthProvider;

    setUp(() {
      mockAuthProvider = MockAuthProvider();
      testPost = ForumPost(
        id: 1,
        title: 'Test Forum Post Title',
        content:
            'This is a test forum post content that should be displayed in the tile.',
        authorId: 123,
        authorUsername: 'testuser',
        tags: ['flutter', 'testing', 'mobile'],
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
        updatedAt: DateTime.now().subtract(const Duration(hours: 2)),
        commentCount: 5,
        upvoteCount: 10,
        downvoteCount: 2,
        comments: [],
      );
    });

    Widget createTestWidget(ForumPost post, {VoidCallback? onTap}) {
      return MaterialApp(
        home: Scaffold(
          body: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: ThreadTile(post: post, onTap: onTap ?? () {}),
          ),
        ),
      );
    }

    testWidgets('should display post title', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));

      expect(find.text('Test Forum Post Title'), findsOneWidget);
    });

    testWidgets('should display post content preview', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget(testPost));

      expect(
        find.textContaining('This is a test forum post content'),
        findsOneWidget,
      );
    });

    testWidgets('should display author username', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));

      expect(find.text('testuser'), findsOneWidget);
    });

    testWidgets('should display author avatar with first letter', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget(testPost));

      expect(find.byType(CircleAvatar), findsOneWidget);
      expect(find.text('T'), findsOneWidget); // First letter of 'testuser'
    });

    testWidgets('should display tags (up to 3)', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));

      expect(find.text('flutter'), findsOneWidget);
      expect(find.text('testing'), findsOneWidget);
      expect(find.text('mobile'), findsOneWidget);
    });

    testWidgets('should display upvote count', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));

      expect(find.text('10'), findsOneWidget);
      expect(find.byIcon(Icons.arrow_upward_rounded), findsOneWidget);
    });

    testWidgets('should display downvote count', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));

      expect(find.text('2'), findsOneWidget);
      expect(find.byIcon(Icons.arrow_downward_rounded), findsOneWidget);
    });

    testWidgets('should display comment count', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));

      expect(find.text('5'), findsOneWidget);
      expect(find.byIcon(Icons.chat_bubble_outline_rounded), findsOneWidget);
    });

    testWidgets('should call onTap when tapped', (WidgetTester tester) async {
      bool wasTapped = false;

      await tester.pumpWidget(
        createTestWidget(
          testPost,
          onTap: () {
            wasTapped = true;
          },
        ),
      );

      await tester.tap(find.byType(ThreadTile));
      await tester.pump();

      expect(wasTapped, isTrue);
    });

    testWidgets('should display edited indicator when post is edited', (
      WidgetTester tester,
    ) async {
      final editedPost = testPost.copyWith(
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
        updatedAt: DateTime.now().subtract(const Duration(hours: 1)),
      );

      await tester.pumpWidget(createTestWidget(editedPost));

      // The edited indicator should appear when updatedAt is significantly different from createdAt
      expect(find.text('edited', findRichText: true), findsOneWidget);
    });

    testWidgets('should not display tags when post has no tags', (
      WidgetTester tester,
    ) async {
      final postWithoutTags = testPost.copyWith(tags: []);

      await tester.pumpWidget(createTestWidget(postWithoutTags));

      expect(find.text('flutter'), findsNothing);
      expect(find.text('testing'), findsNothing);
    });

    testWidgets('should display relative time', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testPost));

      // Should find some time-related text (e.g., "2 hours ago")
      expect(find.textContaining('hour', findRichText: true), findsOneWidget);
    });

    testWidgets('should have proper styling in dark mode', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.dark(),
          home: Scaffold(
            body: ChangeNotifierProvider<AuthProvider>.value(
              value: mockAuthProvider,
              child: ThreadTile(post: testPost, onTap: () {}),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify the widget renders without errors in dark mode
      expect(find.byType(ThreadTile), findsOneWidget);
    });

    testWidgets('should have proper styling in light mode', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.light(),
          home: Scaffold(
            body: ChangeNotifierProvider<AuthProvider>.value(
              value: mockAuthProvider,
              child: ThreadTile(post: testPost, onTap: () {}),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify the widget renders without errors in light mode
      expect(find.byType(ThreadTile), findsOneWidget);
    });

    testWidgets('should truncate long content', (WidgetTester tester) async {
      final longPost = testPost.copyWith(
        content: 'This is a very long content ' * 50,
      );

      await tester.pumpWidget(createTestWidget(longPost));

      // The Text widget should have maxLines property
      final textWidget = tester.widget<Text>(
        find.textContaining('This is a very long content').first,
      );
      expect(textWidget.maxLines, 3);
      expect(textWidget.overflow, TextOverflow.ellipsis);
    });

    testWidgets('should display divider between content and actions', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(createTestWidget(testPost));

      expect(find.byType(Divider), findsOneWidget);
    });

    testWidgets('should handle zero vote counts', (WidgetTester tester) async {
      final postWithZeroVotes = testPost.copyWith(
        upvoteCount: 0,
        downvoteCount: 0,
        commentCount: 0,
      );

      await tester.pumpWidget(createTestWidget(postWithZeroVotes));

      expect(
        find.text('0'),
        findsNWidgets(3),
      ); // upvote, downvote, and comment count
    });

    testWidgets('should handle large vote counts', (WidgetTester tester) async {
      final popularPost = testPost.copyWith(
        upvoteCount: 9999,
        downvoteCount: 123,
        commentCount: 456,
      );

      await tester.pumpWidget(createTestWidget(popularPost));

      expect(find.text('9999'), findsOneWidget);
      expect(find.text('123'), findsOneWidget);
      expect(find.text('456'), findsOneWidget);
    });
  });
}
