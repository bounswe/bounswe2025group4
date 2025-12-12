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

      // Notify parent to reload the post (which includes updated comments)
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

      // Notify parent to reload the post (which includes updated comments)
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
    final isDark = Theme.of(ctx).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[850] : Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black26 : Colors.grey.withOpacity(0.08),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Author header
            Row(
              children: [
                CircleAvatar(
                  radius: 14,
                  backgroundColor: isDark ? Colors.blue[700] : Colors.blue[100],
                  child: Text(
                    _currentComment.authorUsername[0].toUpperCase(),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.blue[900],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      GestureDetector(
                        onTap: _navigateToUserProfile,
                        child: Text(
                          _currentComment.authorUsername,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.blue[300] : Colors.blue[700],
                          ),
                        ),
                      ),
                      Row(
                        children: [
                          Text(
                            DateFormatter.formatRelativeTime(
                              _currentComment.createdAt,
                            ),
                            style: TextStyle(
                              fontSize: 12,
                              color:
                                  isDark ? Colors.grey[500] : Colors.grey[600],
                            ),
                          ),
                          if (_currentComment.createdAt
                                  .difference(_currentComment.updatedAt)
                                  .abs()
                                  .inSeconds >
                              1) ...[
                            Text(
                              ' • edited',
                              style: TextStyle(
                                fontSize: 12,
                                color:
                                    isDark
                                        ? Colors.grey[600]
                                        : Colors.grey[500],
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
                PopupMenuButton<String>(
                  icon: Icon(
                    Icons.more_horiz,
                    color: isDark ? Colors.grey[500] : Colors.grey[600],
                    size: 20,
                  ),
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
            const SizedBox(height: 12),

            // Content
            Text(
              _currentComment.content,
              style: TextStyle(
                fontSize: 15,
                color: isDark ? Colors.grey[300] : Colors.grey[800],
                height: 1.4,
              ),
            ),
            const SizedBox(height: 12),

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
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.arrow_upward_rounded,
                            size: 16,
                            color: Colors.green[600],
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${_currentComment.upvoteCount}',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Colors.green[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),

                // Downvote button
                A11y(
                  label: 'Downvote',
                  child: InkWell(
                    onTap: _isVoting ? null : _handleDownvote,
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.arrow_downward_rounded,
                            size: 16,
                            color: Colors.red[600],
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${_currentComment.downvoteCount}',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Colors.red[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
