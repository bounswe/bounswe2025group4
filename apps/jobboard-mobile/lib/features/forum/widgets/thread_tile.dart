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
    final isDark = Theme.of(ctx).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        widget.onTap();
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isDark ? Colors.grey[850] : Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black26 : Colors.grey.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with author and time
              Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundColor:
                        isDark ? Colors.blue[700] : Colors.blue[100],
                    child: Text(
                      _currentPost.authorUsername[0].toUpperCase(),
                      style: TextStyle(
                        fontSize: 14,
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
                          onTap: () {
                            HapticFeedback.lightImpact();
                            _navigateToUserProfile();
                          },
                          child: Text(
                            _currentPost.authorUsername,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color:
                                  isDark ? Colors.blue[300] : Colors.blue[700],
                            ),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            Text(
                              DateFormatter.formatRelativeTime(
                                _currentPost.createdAt,
                              ),
                              style: TextStyle(
                                fontSize: 12,
                                color:
                                    isDark
                                        ? Colors.grey[400]
                                        : Colors.grey[600],
                              ),
                            ),
                            if (_currentPost.createdAt
                                    .difference(_currentPost.updatedAt)
                                    .abs()
                                    .inSeconds >
                                1) ...[
                              Text(
                                ' • edited',
                                style: TextStyle(
                                  fontSize: 12,
                                  color:
                                      isDark
                                          ? Colors.grey[500]
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
                ],
              ),
              const SizedBox(height: 12),

              // Title
              Text(
                _currentPost.title,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : Colors.black87,
                  height: 1.3,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),

              // Content preview
              Text(
                _currentPost.content,
                style: TextStyle(
                  fontSize: 15,
                  color: isDark ? Colors.grey[300] : Colors.grey[800],
                  height: 1.4,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),

              // Tags
              if (_currentPost.tags.isNotEmpty) ...[
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children:
                      _currentPost.tags
                          .take(3)
                          .map(
                            (tag) => Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color:
                                    isDark
                                        ? Colors.blue[900]!.withOpacity(0.3)
                                        : Colors.blue[50],
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                tag,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color:
                                      isDark
                                          ? Colors.blue[200]
                                          : Colors.blue[700],
                                ),
                              ),
                            ),
                          )
                          .toList(),
                ),
              ],

              const SizedBox(height: 12),

              // Divider
              Divider(
                height: 1,
                color: isDark ? Colors.grey[800] : Colors.grey[200],
              ),

              const SizedBox(height: 12),

              // Interaction row
              Row(
                children: [
                  // Upvote
                  Expanded(
                    child: A11y(
                      label: 'Upvote',
                      child: InkWell(
                        onTap: _isVoting ? null : _handleUpvote,
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.arrow_upward_rounded,
                                size: 18,
                                color: Colors.green[600],
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${_currentPost.upvoteCount}',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.green[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Downvote
                  Expanded(
                    child: A11y(
                      label: 'Downvote',
                      child: InkWell(
                        onTap: _isVoting ? null : _handleDownvote,
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.arrow_downward_rounded,
                                size: 18,
                                color: Colors.red[600],
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${_currentPost.downvoteCount}',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.red[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Comments
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.chat_bubble_outline_rounded,
                            size: 18,
                            color: isDark ? Colors.grey[400] : Colors.grey[600],
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${_currentPost.commentCount}',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color:
                                  isDark ? Colors.grey[400] : Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
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
