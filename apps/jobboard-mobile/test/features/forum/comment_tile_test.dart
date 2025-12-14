import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/forum/widgets/comment_tile.dart';
import 'package:mobile/core/models/forum_comment.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:provider/provider.dart';

class MockAuthProvider extends AuthProvider {
  String? _userId;
  
  @override
  bool get isLoggedIn => true;

  @override
  String get token => 'test-token';
  
  void setUserId(String id) {
    _userId = id;
  }
  
  String? get userId => _userId;
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('CommentTile Widget Tests', () {
    late ForumComment testComment;
    late MockAuthProvider mockAuthProvider;

    setUp(() {
      mockAuthProvider = MockAuthProvider();
      testComment = ForumComment(
        id: 1,
        content: 'This is a test comment on the forum post.',
        authorId: 123,
        authorUsername: 'commenter',
        postId: 456,
        parentCommentId: null,
        createdAt: DateTime.now().subtract(const Duration(minutes: 30)),
        updatedAt: DateTime.now().subtract(const Duration(minutes: 30)),
        upvoteCount: 3,
        downvoteCount: 1,
      );
    });

    Widget createTestWidget(ForumComment comment) {
      return MaterialApp(
        home: Scaffold(
          body: ChangeNotifierProvider<AuthProvider>.value(
            value: mockAuthProvider,
            child: CommentTile(comment: comment),
          ),
        ),
      );
    }

    testWidgets('should display comment content', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testComment));

      expect(
        find.text('This is a test comment on the forum post.'),
        findsOneWidget,
      );
    });

    testWidgets('should display author username', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testComment));

      expect(find.text('commenter'), findsOneWidget);
    });

    testWidgets('should display author avatar with first letter', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testComment));

      expect(find.byType(CircleAvatar), findsOneWidget);
      expect(find.text('C'), findsOneWidget); // First letter of 'commenter'
    });

    testWidgets('should display upvote count and icon', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testComment));

      expect(find.text('3'), findsOneWidget);
      expect(find.byIcon(Icons.arrow_upward_rounded), findsOneWidget);
    });

    testWidgets('should display downvote count and icon', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testComment));

      expect(find.text('1'), findsOneWidget);
      expect(find.byIcon(Icons.arrow_downward_rounded), findsOneWidget);
    });

    testWidgets('should display relative time', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testComment));

      // Should find some time-related text (e.g., "30 minutes ago")
      expect(
        find.textContaining('minute', findRichText: true),
        findsOneWidget,
      );
    });

    testWidgets('should display edited indicator when comment is edited', (WidgetTester tester) async {
      final editedComment = testComment.copyWith(
        updatedAt: DateTime.now(),
      );

      await tester.pumpWidget(createTestWidget(editedComment));

      expect(find.text('edited', findRichText: true), findsOneWidget);
    });

    testWidgets('should display popup menu button', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testComment));

      expect(find.byType(PopupMenuButton<String>), findsOneWidget);
      expect(find.byIcon(Icons.more_horiz), findsOneWidget);
    });

    testWidgets('should show report option in popup menu', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testComment));

      // Tap the popup menu button
      await tester.tap(find.byIcon(Icons.more_horiz));
      await tester.pumpAndSettle();

      expect(find.text('Report'), findsOneWidget);
    });

    testWidgets('should show edit and delete options for owner', (WidgetTester tester) async {
      mockAuthProvider.setUserId('123');
      
      await tester.pumpWidget(createTestWidget(testComment));

      // Tap the popup menu button
      await tester.tap(find.byIcon(Icons.more_horiz));
      await tester.pumpAndSettle();

      expect(find.text('Report'), findsOneWidget);
      // Edit and Delete should appear for owner
      expect(find.text('Edit'), findsOneWidget);
      expect(find.text('Delete'), findsOneWidget);
    });

    testWidgets('should handle zero vote counts', (WidgetTester tester) async {
      final commentWithZeroVotes = testComment.copyWith(
        upvoteCount: 0,
        downvoteCount: 0,
      );

      await tester.pumpWidget(createTestWidget(commentWithZeroVotes));

      expect(find.text('0'), findsNWidgets(2)); // upvote and downvote count
    });

    testWidgets('should have proper styling in dark mode', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.dark(),
          home: Scaffold(
            body: ChangeNotifierProvider<AuthProvider>.value(
              value: mockAuthProvider,
              child: CommentTile(comment: testComment),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.byType(CommentTile), findsOneWidget);
    });

    testWidgets('should have proper styling in light mode', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.light(),
          home: Scaffold(
            body: ChangeNotifierProvider<AuthProvider>.value(
              value: mockAuthProvider,
              child: CommentTile(comment: testComment),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.byType(CommentTile), findsOneWidget);
    });

    testWidgets('should display long content properly', (WidgetTester tester) async {
      final longComment = testComment.copyWith(
        content: 'This is a very long comment content ' * 20,
      );

      await tester.pumpWidget(createTestWidget(longComment));

      expect(
        find.textContaining('This is a very long comment content'),
        findsOneWidget,
      );
    });

    testWidgets('should handle reply comment with parentCommentId', (WidgetTester tester) async {
      final replyComment = testComment.copyWith(
        parentCommentId: 999,
        content: 'This is a reply to another comment',
      );

      await tester.pumpWidget(createTestWidget(replyComment));

      expect(find.text('This is a reply to another comment'), findsOneWidget);
    });

    testWidgets('should open report dialog when report is selected', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testComment));

      // Open popup menu
      await tester.tap(find.byIcon(Icons.more_horiz));
      await tester.pumpAndSettle();

      // Tap Report
      await tester.tap(find.text('Report'));
      await tester.pumpAndSettle();

      // Check if dialog appears
      expect(find.text('Report Comment'), findsOneWidget);
      expect(find.byType(AlertDialog), findsOneWidget);
    });

    testWidgets('report dialog should have reason dropdown', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testComment));

      // Open popup menu
      await tester.tap(find.byIcon(Icons.more_horiz));
      await tester.pumpAndSettle();

      // Tap Report
      await tester.tap(find.text('Report'));
      await tester.pumpAndSettle();

      // Check for dropdown
      expect(find.byType(DropdownButtonFormField<String>), findsOneWidget);
    });

    testWidgets('report dialog should have cancel and report buttons', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testComment));

      // Open popup menu
      await tester.tap(find.byIcon(Icons.more_horiz));
      await tester.pumpAndSettle();

      // Tap Report
      await tester.tap(find.text('Report'));
      await tester.pumpAndSettle();

      // Check for buttons
      expect(find.text('Cancel'), findsOneWidget);
      expect(find.text('Report'), findsNWidgets(2)); // One in menu, one in dialog
    });

    testWidgets('should close report dialog when cancel is tapped', (WidgetTester tester) async {
      await tester.pumpWidget(createTestWidget(testComment));

      // Open popup menu
      await tester.tap(find.byIcon(Icons.more_horiz));
      await tester.pumpAndSettle();

      // Tap Report
      await tester.tap(find.text('Report'));
      await tester.pumpAndSettle();

      // Tap Cancel
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();

      // Dialog should be closed
      expect(find.byType(AlertDialog), findsNothing);
    });
  });
}

