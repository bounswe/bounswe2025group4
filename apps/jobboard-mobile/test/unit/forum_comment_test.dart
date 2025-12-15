import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/models/forum_comment.dart';

void main() {
  group('ForumComment Model Tests', () {
    test('should create ForumComment from JSON correctly', () {
      final json = {
        'id': 1,
        'content': 'This is a test comment',
        'authorId': 123,
        'authorUsername': 'testuser',
        'postId': 456,
        'parentCommentId': null,
        'createdAt': '2024-01-01T10:00:00.000Z',
        'updatedAt': '2024-01-01T10:00:00.000Z',
        'upvoteCount': 5,
        'downvoteCount': 1,
      };

      final comment = ForumComment.fromJson(json);

      expect(comment.id, 1);
      expect(comment.content, 'This is a test comment');
      expect(comment.authorId, 123);
      expect(comment.authorUsername, 'testuser');
      expect(comment.postId, 456);
      expect(comment.parentCommentId, isNull);
      expect(comment.upvoteCount, 5);
      expect(comment.downvoteCount, 1);
    });

    test('should create ForumComment with default vote counts when missing', () {
      final json = {
        'id': 1,
        'content': 'Test comment',
        'authorId': 123,
        'authorUsername': 'testuser',
        'postId': 456,
        'createdAt': '2024-01-01T10:00:00.000Z',
        'updatedAt': '2024-01-01T10:00:00.000Z',
      };

      final comment = ForumComment.fromJson(json);

      expect(comment.upvoteCount, 0);
      expect(comment.downvoteCount, 0);
    });

    test('should handle nested comment with parentCommentId', () {
      final json = {
        'id': 2,
        'content': 'Reply to comment',
        'authorId': 789,
        'authorUsername': 'replier',
        'postId': 456,
        'parentCommentId': 1,
        'createdAt': '2024-01-01T11:00:00.000Z',
        'updatedAt': '2024-01-01T11:00:00.000Z',
        'upvoteCount': 2,
        'downvoteCount': 0,
      };

      final comment = ForumComment.fromJson(json);

      expect(comment.parentCommentId, 1);
      expect(comment.content, 'Reply to comment');
    });

    test('should convert ForumComment to JSON correctly', () {
      final comment = ForumComment(
        id: 1,
        content: 'Test comment',
        authorId: 123,
        authorUsername: 'testuser',
        postId: 456,
        parentCommentId: null,
        createdAt: DateTime.parse('2024-01-01T10:00:00.000Z'),
        updatedAt: DateTime.parse('2024-01-01T10:00:00.000Z'),
        upvoteCount: 3,
        downvoteCount: 1,
      );

      final json = comment.toJson();

      expect(json['id'], 1);
      expect(json['content'], 'Test comment');
      expect(json['authorId'], 123);
      expect(json['authorUsername'], 'testuser');
      expect(json['postId'], 456);
      expect(json.containsKey('parentCommentId'), false);
      expect(json['upvoteCount'], 3);
      expect(json['downvoteCount'], 1);
    });

    test('should include parentCommentId in JSON when present', () {
      final comment = ForumComment(
        id: 2,
        content: 'Reply',
        authorId: 123,
        authorUsername: 'testuser',
        postId: 456,
        parentCommentId: 1,
        createdAt: DateTime.parse('2024-01-01T10:00:00.000Z'),
        updatedAt: DateTime.parse('2024-01-01T10:00:00.000Z'),
        upvoteCount: 0,
        downvoteCount: 0,
      );

      final json = comment.toJson();

      expect(json['parentCommentId'], 1);
    });

    test('should create a copy with updated values using copyWith', () {
      final original = ForumComment(
        id: 1,
        content: 'Original content',
        authorId: 123,
        authorUsername: 'testuser',
        postId: 456,
        parentCommentId: null,
        createdAt: DateTime.parse('2024-01-01T10:00:00.000Z'),
        updatedAt: DateTime.parse('2024-01-01T10:00:00.000Z'),
        upvoteCount: 5,
        downvoteCount: 1,
      );

      final updated = original.copyWith(
        content: 'Updated content',
        upvoteCount: 10,
      );

      expect(updated.content, 'Updated content');
      expect(updated.upvoteCount, 10);
      expect(updated.authorId, 123); // unchanged
      expect(updated.downvoteCount, 1); // unchanged
    });

    test('should parse DateTime fields correctly', () {
      final json = {
        'id': 1,
        'content': 'Test',
        'authorId': 123,
        'authorUsername': 'user',
        'postId': 456,
        'createdAt': '2024-01-15T14:30:00.000Z',
        'updatedAt': '2024-01-15T15:45:00.000Z',
        'upvoteCount': 0,
        'downvoteCount': 0,
      };

      final comment = ForumComment.fromJson(json);

      expect(comment.createdAt.year, 2024);
      expect(comment.createdAt.month, 1);
      expect(comment.createdAt.day, 15);
      expect(comment.updatedAt.hour, 15);
      expect(comment.updatedAt.minute, 45);
    });

    test('should handle zero vote counts', () {
      final comment = ForumComment(
        id: 1,
        content: 'New comment',
        authorId: 123,
        authorUsername: 'user',
        postId: 456,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        upvoteCount: 0,
        downvoteCount: 0,
      );

      expect(comment.upvoteCount, 0);
      expect(comment.downvoteCount, 0);
    });

    test('should handle large vote counts', () {
      final comment = ForumComment(
        id: 1,
        content: 'Popular comment',
        authorId: 123,
        authorUsername: 'user',
        postId: 456,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        upvoteCount: 9999,
        downvoteCount: 123,
      );

      expect(comment.upvoteCount, 9999);
      expect(comment.downvoteCount, 123);
    });
  });
}

