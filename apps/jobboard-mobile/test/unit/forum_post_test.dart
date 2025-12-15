import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/models/forum_post.dart';

void main() {
  group('ForumPost Model Tests', () {
    test('should create ForumPost from JSON correctly', () {
      final json = {
        'id': 1,
        'title': 'Test Post',
        'content': 'This is a test post content',
        'authorId': 123,
        'authorUsername': 'testuser',
        'tags': ['flutter', 'testing'],
        'createdAt': '2024-01-01T10:00:00.000Z',
        'updatedAt': '2024-01-01T10:00:00.000Z',
        'commentCount': 5,
        'upvoteCount': 10,
        'downvoteCount': 2,
        'comments': [],
      };

      final post = ForumPost.fromJson(json);

      expect(post.id, 1);
      expect(post.title, 'Test Post');
      expect(post.content, 'This is a test post content');
      expect(post.authorId, 123);
      expect(post.authorUsername, 'testuser');
      expect(post.tags, ['flutter', 'testing']);
      expect(post.commentCount, 5);
      expect(post.upvoteCount, 10);
      expect(post.downvoteCount, 2);
      expect(post.comments, isEmpty);
    });

    test(
      'should create ForumPost with default values when optional fields are missing',
      () {
        final json = {
          'id': 1,
          'title': 'Test Post',
          'content': 'Content',
          'authorId': 123,
          'authorUsername': 'testuser',
          'createdAt': '2024-01-01T10:00:00.000Z',
          'updatedAt': '2024-01-01T10:00:00.000Z',
        };

        final post = ForumPost.fromJson(json);

        expect(post.tags, isEmpty);
        expect(post.commentCount, 0);
        expect(post.upvoteCount, 0);
        expect(post.downvoteCount, 0);
        expect(post.comments, isEmpty);
      },
    );

    test('should convert ForumPost to JSON correctly', () {
      final post = ForumPost(
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        authorId: 123,
        authorUsername: 'testuser',
        tags: ['flutter'],
        createdAt: DateTime.parse('2024-01-01T10:00:00.000Z'),
        updatedAt: DateTime.parse('2024-01-01T10:00:00.000Z'),
        commentCount: 3,
        upvoteCount: 5,
        downvoteCount: 1,
        comments: [],
      );

      final json = post.toJson();

      expect(json['id'], 1);
      expect(json['title'], 'Test Post');
      expect(json['content'], 'Test content');
      expect(json['authorId'], 123);
      expect(json['authorUsername'], 'testuser');
      expect(json['tags'], ['flutter']);
      expect(json['commentCount'], 3);
      expect(json['upvoteCount'], 5);
      expect(json['downvoteCount'], 1);
    });

    test('should create a copy with updated values using copyWith', () {
      final original = ForumPost(
        id: 1,
        title: 'Original Title',
        content: 'Original content',
        authorId: 123,
        authorUsername: 'testuser',
        tags: ['flutter'],
        createdAt: DateTime.parse('2024-01-01T10:00:00.000Z'),
        updatedAt: DateTime.parse('2024-01-01T10:00:00.000Z'),
        commentCount: 3,
        upvoteCount: 5,
        downvoteCount: 1,
        comments: [],
      );

      final updated = original.copyWith(
        title: 'Updated Title',
        upvoteCount: 10,
      );

      expect(updated.title, 'Updated Title');
      expect(updated.upvoteCount, 10);
      expect(updated.content, 'Original content'); // unchanged
      expect(updated.id, 1); // unchanged
    });

    test('should parse ForumPost with nested comments', () {
      final json = {
        'id': 1,
        'title': 'Test Post',
        'content': 'Content',
        'authorId': 123,
        'authorUsername': 'testuser',
        'tags': [],
        'createdAt': '2024-01-01T10:00:00.000Z',
        'updatedAt': '2024-01-01T10:00:00.000Z',
        'commentCount': 1,
        'upvoteCount': 0,
        'downvoteCount': 0,
        'comments': [
          {
            'id': 1,
            'content': 'Test comment',
            'authorId': 456,
            'authorUsername': 'commenter',
            'postId': 1,
            'createdAt': '2024-01-01T11:00:00.000Z',
            'updatedAt': '2024-01-01T11:00:00.000Z',
            'upvoteCount': 2,
            'downvoteCount': 0,
          },
        ],
      };

      final post = ForumPost.fromJson(json);

      expect(post.comments.length, 1);
      expect(post.comments[0].content, 'Test comment');
      expect(post.comments[0].authorUsername, 'commenter');
    });

    test('should handle empty tags list', () {
      final post = ForumPost(
        id: 1,
        title: 'Test',
        content: 'Content',
        authorId: 123,
        authorUsername: 'user',
        tags: [],
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        commentCount: 0,
        upvoteCount: 0,
        downvoteCount: 0,
        comments: [],
      );

      expect(post.tags, isEmpty);
      expect(post.tags, isA<List<String>>());
    });

    test('should handle multiple tags', () {
      final post = ForumPost(
        id: 1,
        title: 'Test',
        content: 'Content',
        authorId: 123,
        authorUsername: 'user',
        tags: ['flutter', 'dart', 'mobile', 'testing'],
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        commentCount: 0,
        upvoteCount: 0,
        downvoteCount: 0,
        comments: [],
      );

      expect(post.tags.length, 4);
      expect(post.tags, contains('flutter'));
      expect(post.tags, contains('testing'));
    });
  });
}
