import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../../../core/models/forum_comment.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/widgets/a11y.dart';
import '../../../core/utils/date_formatter.dart';
import '../screens/user_profile_view_screen.dart';

class CommentTile extends StatefulWidget {
  final ForumComment comment;
  final void Function(ForumComment updatedComment)? onUpdate;
  final void Function(int commentId)? onDelete;

  const CommentTile({
    required this.comment,
    this.onUpdate,
    this.onDelete,
    Key? key,
  }) : super(key: key);

  @override
  State<CommentTile> createState() => _CommentTileState();
}

class _CommentTileState extends State<CommentTile> {
  late ForumComment _currentComment;
  bool _isVoting = false;

  @override
  void initState() {
    super.initState();
    _currentComment = widget.comment;
  }

  @override
  void didUpdateWidget(CommentTile oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.comment != widget.comment) {
      _currentComment = widget.comment;
    }
  }

  Future<void> _handleUpvote() async {
    if (_isVoting) return;
    setState(() => _isVoting = true);

    try {
      final api = ApiService(authProvider: context.read<AuthProvider>());
      await api.upvoteForumComment(_currentComment.id);

      // Update the comment with new vote counts
      // Since we don't have a getComment endpoint, we'll just increment locally
      setState(() {
        _currentComment = ForumComment(
          id: _currentComment.id,
          content: _currentComment.content,
          authorId: _currentComment.authorId,
          authorUsername: _currentComment.authorUsername,
          postId: _currentComment.postId,
          parentCommentId: _currentComment.parentCommentId,
          createdAt: _currentComment.createdAt,
          updatedAt: _currentComment.updatedAt,
          upvoteCount: _currentComment.upvoteCount + 1,
          downvoteCount: _currentComment.downvoteCount,
        );
      });
      widget.onUpdate?.call(_currentComment);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to upvote: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isVoting = false);
      }
    }
  }

  Future<void> _handleDownvote() async {
    if (_isVoting) return;
    setState(() => _isVoting = true);

    try {
      final api = ApiService(authProvider: context.read<AuthProvider>());
      await api.downvoteForumComment(_currentComment.id);

      // Update the comment with new vote counts
      setState(() {
        _currentComment = ForumComment(
          id: _currentComment.id,
          content: _currentComment.content,
          authorId: _currentComment.authorId,
          authorUsername: _currentComment.authorUsername,
          postId: _currentComment.postId,
          parentCommentId: _currentComment.parentCommentId,
          createdAt: _currentComment.createdAt,
          updatedAt: _currentComment.updatedAt,
          upvoteCount: _currentComment.upvoteCount,
          downvoteCount: _currentComment.downvoteCount + 1,
        );
      });
      widget.onUpdate?.call(_currentComment);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to downvote: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isVoting = false);
      }
    }
  }

  void _navigateToUserProfile() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => UserProfileViewScreen(userId: _currentComment.authorId),
      ),
    );
  }

  @override
  Widget build(BuildContext ctx) {
    final api = ApiService(authProvider: ctx.read<AuthProvider>());
    final currentUser = ctx.read<AuthProvider>().currentUser?.id;
    final isOwner = _currentComment.authorId.toString() == currentUser;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Author section
            RichText(
              text: TextSpan(
                style: TextStyle(
                  fontSize: 16,
                  color:
                      Theme.of(ctx).brightness == Brightness.dark
                          ? Colors.grey.shade300
                          : Colors.black87,
                ),
                children: [
                  const TextSpan(
                    text: 'Author: ',
                    style: TextStyle(fontWeight: FontWeight.w500),
                  ),
                  TextSpan(
                    text: _currentComment.authorUsername,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color:
                          Theme.of(ctx).brightness == Brightness.dark
                              ? Colors.blue.shade300
                              : const Color(0xFF1565C0),
                      decoration: TextDecoration.underline,
                      letterSpacing: 0.3,
                      shadows: [
                        Shadow(
                          color:
                              Theme.of(ctx).brightness == Brightness.dark
                                  ? Colors.black45
                                  : Colors.black12,
                          offset: const Offset(0.5, 0.5),
                          blurRadius: 1,
                        ),
                      ],
                    ),
                    recognizer:
                        TapGestureRecognizer()..onTap = _navigateToUserProfile,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),

            // Content
            Text(_currentComment.content, style: const TextStyle(fontSize: 15)),
            const SizedBox(height: 8),

            // Timestamp
            Row(
              children: [
                const A11y(
                  label: 'Created at',
                  child: Icon(Icons.access_time, size: 14),
                ),
                const SizedBox(width: 4),
                Text(
                  DateFormatter.formatRelativeTime(_currentComment.createdAt),
                  style: Theme.of(
                    context,
                  ).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
                ),
                if (_currentComment.createdAt != _currentComment.updatedAt) ...[
                  const SizedBox(width: 8),
                  const A11y(
                    label: 'Edited',
                    child: Icon(Icons.edit, size: 14),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '(edited ${DateFormatter.formatRelativeTime(_currentComment.updatedAt)})',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 8),

            // Voting row
            Row(
              children: [
                // Upvote button
                A11y(
                  label: 'Upvote',
                  child: InkWell(
                    onTap: _isVoting ? null : _handleUpvote,
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.all(4),
                      child: Row(
                        children: [
                          Icon(
                            Icons.arrow_upward,
                            size: 18,
                            color: Colors.green[700],
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '${_currentComment.upvoteCount}',
                            style: Theme.of(
                              context,
                            ).textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.green[700],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // Downvote button
                A11y(
                  label: 'Downvote',
                  child: InkWell(
                    onTap: _isVoting ? null : _handleDownvote,
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.all(4),
                      child: Row(
                        children: [
                          Icon(
                            Icons.arrow_downward,
                            size: 18,
                            color: Colors.red[700],
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '${_currentComment.downvoteCount}',
                            style: Theme.of(
                              context,
                            ).textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.red[700],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const Spacer(),
                // Menu button
                PopupMenuButton<String>(
                  onSelected: (action) async {
                    final messenger = ScaffoldMessenger.of(ctx);
                    if (action == 'Report') {
                      // Show "Reported!" dialog for now (mock implementation)
                      showDialog(
                        context: ctx,
                        builder: (BuildContext context) {
                          return AlertDialog(
                            title: const Text('Reported!'),
                            content: const Text(
                              'Thank you for reporting this comment. We will review it soon.',
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.of(context).pop(),
                                child: const Text('OK'),
                              ),
                            ],
                          );
                        },
                      );
                    } else if (action == 'Edit' && isOwner) {
                      final controller = TextEditingController(
                        text: _currentComment.content,
                      );
                      final edited = await showDialog<String>(
                        context: ctx,
                        builder:
                            (_) => AlertDialog(
                              title: const Text('Edit Comment'),
                              content: TextField(
                                controller: controller,
                                maxLines: null,
                                decoration: const InputDecoration(
                                  hintText: 'Update your comment',
                                ),
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(ctx),
                                  child: const Text('Cancel'),
                                ),
                                TextButton(
                                  onPressed:
                                      () => Navigator.pop(
                                        ctx,
                                        controller.text.trim(),
                                      ),
                                  child: const Text('Save'),
                                ),
                              ],
                            ),
                      );
                      if (edited != null && edited.isNotEmpty) {
                        try {
                          final updated = await api.updateForumComment(
                            commentId: _currentComment.id,
                            content: edited,
                          );
                          setState(() {
                            _currentComment = updated;
                          });
                          widget.onUpdate?.call(updated);
                        } on SocketException {
                          messenger.showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Failed: Please check your connection and refresh the page.',
                                style: TextStyle(color: Colors.red),
                              ),
                            ),
                          );
                        } catch (e) {
                          messenger.showSnackBar(
                            const SnackBar(
                              content: Text(
                                "Failed: This comment is no longer available.",
                                style: TextStyle(color: Colors.red),
                              ),
                            ),
                          );
                        }
                      }
                    } else if (action == 'Delete' && isOwner) {
                      widget.onDelete?.call(_currentComment.id);
                    }
                  },
                  itemBuilder:
                      (_) => [
                        const PopupMenuItem(
                          value: 'Report',
                          child: Text('Report'),
                        ),
                        if (isOwner) ...[
                          const PopupMenuItem(
                            value: 'Edit',
                            child: Text('Edit'),
                          ),
                          const PopupMenuItem(
                            value: 'Delete',
                            child: Text('Delete'),
                          ),
                        ],
                      ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
