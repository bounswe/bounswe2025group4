import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/models/forum_post.dart';
import '../../../core/widgets/a11y.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../core/services/api_service.dart';
import '../../../core/providers/auth_provider.dart';
import '../screens/user_profile_view_screen.dart';

class ThreadTile extends StatefulWidget {
  final ForumPost post;
  final VoidCallback onTap;
  final VoidCallback? onDelete;
  final Function(ForumPost)? onPostUpdated;

  const ThreadTile({
    super.key,
    required this.post,
    required this.onTap,
    this.onDelete,
    this.onPostUpdated,
  });

  @override
  State<ThreadTile> createState() => _ThreadTileState();
}

class _ThreadTileState extends State<ThreadTile> {
  late ForumPost _currentPost;
  bool _isVoting = false;

  @override
  void initState() {
    super.initState();
    _currentPost = widget.post;
  }

  @override
  void didUpdateWidget(ThreadTile oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.post != widget.post) {
      _currentPost = widget.post;
    }
  }

  Future<void> _handleUpvote() async {
    if (_isVoting) return;
    setState(() => _isVoting = true);

    try {
      final api = ApiService(authProvider: context.read<AuthProvider>());
      await api.upvoteForumPost(_currentPost.id);

      // Refresh the post to get updated vote counts
      final updatedPost = await api.getForumPost(_currentPost.id);
      setState(() {
        _currentPost = updatedPost;
      });
      widget.onPostUpdated?.call(updatedPost);
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
      await api.downvoteForumPost(_currentPost.id);

      // Refresh the post to get updated vote counts
      final updatedPost = await api.getForumPost(_currentPost.id);
      setState(() {
        _currentPost = updatedPost;
      });
      widget.onPostUpdated?.call(updatedPost);
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
        builder: (_) => UserProfileViewScreen(userId: _currentPost.authorId),
      ),
    );
  }

  @override
  Widget build(BuildContext ctx) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        widget.onTap();
      },
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 3,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Creator Section
              Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: RichText(
                  text: TextSpan(
                    style: TextStyle(
                      fontSize: 16,
                      color:
                          Theme.of(ctx).brightness == Brightness.dark
                              ? Colors.grey.shade300
                              : Colors.black87,
                    ),
                    children: [
                      TextSpan(
                        text: 'Creator: ',
                        style: TextStyle(
                          color:
                              Theme.of(ctx).brightness == Brightness.dark
                                  ? Colors.grey.shade300
                                  : Colors.black87,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      TextSpan(
                        text: _currentPost.authorUsername,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color:
                              Theme.of(ctx).brightness == Brightness.dark
                                  ? Colors.blue.shade300
                                  : Colors
                                      .blue, // Use blue to match design language
                          decoration: TextDecoration.underline,
                          letterSpacing: 0.3,
                          shadows: [
                            Shadow(
                              color:
                                  Theme.of(ctx).brightness == Brightness.dark
                                      ? Colors.black45
                                      : Colors.black12,
                              offset: Offset(0.5, 0.5),
                              blurRadius: 1,
                            ),
                          ],
                        ),
                        recognizer:
                            TapGestureRecognizer()
                              ..onTap = () {
                                HapticFeedback.lightImpact();
                                _navigateToUserProfile();
                              },
                      ),
                    ],
                  ),
                ),
              ),
              const Divider(height: 1, thickness: 1),
              const SizedBox(height: 8),

              // Title Section
              Text(
                'Title:',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: Colors.grey[700],
                ),
              ),
              Text(
                _currentPost.title,
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),

              // Content Section
              Text(
                'Content:',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: Colors.grey[700],
                ),
              ),
              Text(
                _currentPost.content,
                style: TextStyle(
                  fontSize: 15.5,
                  fontWeight: FontWeight.w500,
                  color:
                      Theme.of(ctx).brightness == Brightness.dark
                          ? Colors.grey.shade300
                          : Colors.black87,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),

              // Tags Section
              Text(
                'Tags:',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color:
                      Theme.of(ctx).brightness == Brightness.dark
                          ? Colors.grey.shade400
                          : Colors.grey[700],
                ),
              ),
              Wrap(
                spacing: 6,
                children:
                    _currentPost.tags
                        .map(
                          (tag) => Chip(
                            label: Text(
                              tag,
                              style: TextStyle(
                                color:
                                    Theme.of(context).brightness ==
                                            Brightness.dark
                                        ? Colors.blue.shade200
                                        : Colors.blue.shade900,
                              ),
                            ),
                            backgroundColor:
                                Theme.of(context).brightness == Brightness.dark
                                    ? Colors.blue.shade900.withOpacity(0.3)
                                    : Colors.blue.shade50,
                            side: BorderSide.none,
                          ),
                        )
                        .toList(),
              ),
              const SizedBox(height: 12),

              // Timestamp Section
              Row(
                children: [
                  const A11y(
                    label: 'Created at',
                    child: Icon(Icons.access_time, size: 16),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    DateFormatter.formatRelativeTime(_currentPost.createdAt),
                    style: Theme.of(
                      context,
                    ).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
                  ),
                  if (_currentPost.createdAt != _currentPost.updatedAt) ...[
                    const SizedBox(width: 12),
                    const A11y(
                      label: 'Edited',
                      child: Icon(Icons.edit, size: 16),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '(edited ${DateFormatter.formatRelativeTime(_currentPost.updatedAt)})',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 12),

              // Stats and voting row
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
                              size: 20,
                              color: Colors.green[700],
                            ),
                            const SizedBox(width: 2),
                            Text(
                              '${_currentPost.upvoteCount}',
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
                              size: 20,
                              color: Colors.red[700],
                            ),
                            const SizedBox(width: 2),
                            Text(
                              '${_currentPost.downvoteCount}',
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
                  const SizedBox(width: 16),

                  // Comments count
                  const A11y(
                    label: 'Comments',
                    child: Icon(Icons.comment, size: 20, color: Colors.grey),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${_currentPost.commentCount}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
