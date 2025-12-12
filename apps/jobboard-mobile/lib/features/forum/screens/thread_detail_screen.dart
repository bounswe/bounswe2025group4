import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../../../core/models/forum_post.dart';
import '../../../core/models/forum_comment.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import 'create_thread_screen.dart';
import '../widgets/comment_tile.dart';
import 'package:flutter/gestures.dart';
import '../../../generated/l10n/app_localizations.dart';
import '../../../core/widgets/a11y.dart';
import '../../../core/utils/date_formatter.dart';
import 'user_profile_view_screen.dart';

class ThreadDetailScreen extends StatefulWidget {
  final ForumPost post;
  const ThreadDetailScreen({super.key, required this.post});

  @override
  State<ThreadDetailScreen> createState() => _ThreadDetailScreenState();
}

class _ThreadDetailScreenState extends State<ThreadDetailScreen> {
  final _commentCtrl = TextEditingController();
  final _commentKey = GlobalKey<FormState>();
  late final ApiService _api;
  List<ForumComment> _comments = [];
  late ForumPost _currentPost;
  bool _isVoting = false;

  @override
  void initState() {
    super.initState();
    _api = ApiService(authProvider: context.read<AuthProvider>());
    _currentPost = widget.post;
    _comments = widget.post.comments; // Initialize with existing comments
    _loadPost();
  }

  Future<void> _handleUpvote() async {
    if (_isVoting) return;
    setState(() => _isVoting = true);

    try {
      await _api.upvoteForumPost(_currentPost.id);
      await _loadPost();
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
      await _api.downvoteForumPost(_currentPost.id);
      await _loadPost();
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

  void _navigateToUserProfile(int userId) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => UserProfileViewScreen(userId: userId)),
    );
  }

  Future<void> _loadPost() async {
    try {
      final updated = await _api.getForumPost(_currentPost.id);
      if (mounted) {
        setState(() {
          _currentPost = updated;
          _comments = updated.comments;
        });
      }
    } on SocketException {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context)!.threadDetail_connectionError,
            style: const TextStyle(color: Colors.red),
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context)!.threadDetail_unavailable,
            style: const TextStyle(color: Colors.red),
          ),
        ),
      );
      Navigator.of(context).pop();
    }
  }

  Future<void> _postComment() async {
    if (!_commentKey.currentState!.validate()) return;
    try {
      final newComment = await _api.createForumComment(
        postId: _currentPost.id,
        content: _commentCtrl.text.trim(),
      );
      setState(() {
        _comments.add(newComment);
      });
      _commentCtrl.clear();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Comment added successfully!',
            style: TextStyle(color: Colors.green),
          ),
        ),
      );
    } on SocketException {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context)!.threadDetail_connectionError,
            style: const TextStyle(color: Colors.red),
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context)!.threadDetail_unavailable,
            style: const TextStyle(color: Colors.red),
          ),
        ),
      );
    }
  }

  @override
  void dispose() {
    _commentCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = context.read<AuthProvider>().currentUser?.id;
    final isOwner = _currentPost.authorId.toString() == currentUser;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          _currentPost.title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          PopupMenuButton<String>(
            onSelected: (action) async {
              if (!mounted) return;
              final navigator = Navigator.of(context);
              final messenger = ScaffoldMessenger.of(context);

              if (action == 'Report') {
                // Show "Reported!" dialog for now (mock implementation)
                showDialog(
                  context: context,
                  builder: (BuildContext context) {
                    return AlertDialog(
                      title: const Text('Reported!'),
                      content: const Text(
                        'Thank you for reporting this discussion. We will review it soon.',
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
                try {
                  final updated = await navigator.push<ForumPost>(
                    MaterialPageRoute(
                      builder: (_) => CreateThreadScreen(post: _currentPost),
                    ),
                  );
                  if (updated != null) {
                    setState(() => _currentPost = updated);
                    navigator.pop(updated);
                  }
                } on SocketException {
                  messenger.showSnackBar(
                    SnackBar(
                      content: Text(
                        AppLocalizations.of(
                          context,
                        )!.threadDetail_connectionError,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                  );
                } catch (e) {
                  messenger.showSnackBar(
                    SnackBar(
                      content: Text(
                        AppLocalizations.of(context)!.createThread_generalError,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                  );
                }
              } else if (action == 'Delete' && isOwner) {
                try {
                  await _api.deleteForumPost(_currentPost.id);
                  navigator.pop('deleted');
                } on SocketException {
                  messenger.showSnackBar(
                    SnackBar(
                      content: Text(
                        AppLocalizations.of(
                          context,
                        )!.threadDetail_connectionError,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                  );
                } catch (e) {
                  messenger.showSnackBar(
                    SnackBar(
                      content: Text(
                        AppLocalizations.of(context)!.threadDetail_deleteError,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                  );
                }
              }
            },
            itemBuilder:
                (_) => [
                  PopupMenuItem(
                    value: 'Report',
                    child: Text(
                      AppLocalizations.of(context)!.threadDetail_report,
                    ),
                  ),
                  if (isOwner) ...[
                    PopupMenuItem(
                      value: 'Edit',
                      child: Text(
                        AppLocalizations.of(context)!.threadDetail_edit,
                      ),
                    ),
                    PopupMenuItem(
                      value: 'Delete',
                      child: Text(
                        AppLocalizations.of(context)!.threadDetail_delete,
                      ),
                    ),
                  ],
                ],
          ),
        ],
      ),
      backgroundColor:
          Theme.of(context).brightness == Brightness.dark
              ? Colors.black
              : Colors.grey[50],
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _comments.length + 2,
              padding: const EdgeInsets.only(bottom: 80),
              itemBuilder: (ctx, i) {
                final isDark = Theme.of(ctx).brightness == Brightness.dark;

                if (i == 0) {
                  return Container(
                    margin: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[850] : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color:
                              isDark
                                  ? Colors.black26
                                  : Colors.grey.withOpacity(0.1),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Author header
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 20,
                                backgroundColor:
                                    isDark
                                        ? Colors.blue[700]
                                        : Colors.blue[100],
                                child: Text(
                                  _currentPost.authorUsername[0].toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color:
                                        isDark
                                            ? Colors.white
                                            : Colors.blue[900],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    GestureDetector(
                                      onTap:
                                          () => _navigateToUserProfile(
                                            _currentPost.authorId,
                                          ),
                                      child: Text(
                                        _currentPost.authorUsername,
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600,
                                          color:
                                              isDark
                                                  ? Colors.blue[300]
                                                  : Colors.blue[700],
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
                                            fontSize: 13,
                                            color:
                                                isDark
                                                    ? Colors.grey[400]
                                                    : Colors.grey[600],
                                          ),
                                        ),
                                        if (_currentPost.createdAt
                                                .difference(
                                                  _currentPost.updatedAt,
                                                )
                                                .abs()
                                                .inSeconds >
                                            1) ...[
                                          Text(
                                            ' • edited',
                                            style: TextStyle(
                                              fontSize: 13,
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
                          const SizedBox(height: 20),

                          // Content
                          Text(
                            _currentPost.content,
                            style: TextStyle(
                              fontSize: 16,
                              color:
                                  isDark ? Colors.grey[200] : Colors.grey[800],
                              height: 1.5,
                            ),
                          ),

                          // Tags
                          if (_currentPost.tags.isNotEmpty) ...[
                            const SizedBox(height: 16),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children:
                                  _currentPost.tags
                                      .map(
                                        (tag) => Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 12,
                                            vertical: 6,
                                          ),
                                          decoration: BoxDecoration(
                                            color:
                                                isDark
                                                    ? Colors.blue[900]!
                                                        .withOpacity(0.3)
                                                    : Colors.blue[50],
                                            borderRadius: BorderRadius.circular(
                                              16,
                                            ),
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

                          const SizedBox(height: 16),

                          // Divider
                          Divider(
                            height: 1,
                            color: isDark ? Colors.grey[800] : Colors.grey[200],
                          ),

                          const SizedBox(height: 16),

                          // Voting and stats
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
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 10,
                                      ),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.arrow_upward_rounded,
                                            size: 20,
                                            color: Colors.green[600],
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            '${_currentPost.upvoteCount}',
                                            style: TextStyle(
                                              fontSize: 15,
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
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 10,
                                      ),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.arrow_downward_rounded,
                                            size: 20,
                                            color: Colors.red[600],
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            '${_currentPost.downvoteCount}',
                                            style: TextStyle(
                                              fontSize: 15,
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
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 10,
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.chat_bubble_outline_rounded,
                                        size: 20,
                                        color:
                                            isDark
                                                ? Colors.grey[400]
                                                : Colors.grey[600],
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        '${_currentPost.commentCount}',
                                        style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w600,
                                          color:
                                              isDark
                                                  ? Colors.grey[400]
                                                  : Colors.grey[600],
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
                  );
                }

                if (i == 1) {
                  return Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                    child: Row(
                      children: [
                        Text(
                          AppLocalizations.of(context)!.threadDetail_comments,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: isDark ? Colors.grey[800] : Colors.grey[200],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${_comments.length}',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color:
                                  isDark ? Colors.grey[400] : Colors.grey[700],
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }

                final comment = _comments[i - 2];
                return CommentTile(
                  key: ValueKey("comment-${comment.id}"),
                  comment: comment,
                  onUpdate: (updatedComment) {
                    // Reload the entire post to get updated vote counts for all comments
                    _loadPost();
                  },
                  onDelete: (id) async {
                    try {
                      await _api.deleteForumComment(id);
                      setState(() {
                        _comments.removeWhere((c) => c.id == id);
                      });
                    } on SocketException {
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            AppLocalizations.of(
                              context,
                            )!.threadDetail_connectionError,
                            style: const TextStyle(color: Colors.red),
                          ),
                        ),
                      );
                    } catch (e) {
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            AppLocalizations.of(
                              context,
                            )!.threadDetail_deleteCommentError,
                            style: const TextStyle(color: Colors.red),
                          ),
                        ),
                      );
                    }
                  },
                );
              },
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color:
                  Theme.of(context).brightness == Brightness.dark
                      ? Colors.grey[900]
                      : Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: 12,
              bottom: MediaQuery.of(context).padding.bottom + 12,
            ),
            child: Form(
              key: _commentKey,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _commentCtrl,
                      maxLines: null,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: InputDecoration(
                        hintText:
                            AppLocalizations.of(
                              context,
                            )!.threadDetail_addComment,
                        filled: true,
                        fillColor:
                            Theme.of(context).brightness == Brightness.dark
                                ? Colors.grey[850]
                                : Colors.grey[100],
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 12,
                        ),
                      ),
                      validator:
                          (v) =>
                              (v == null || v.trim().isEmpty)
                                  ? AppLocalizations.of(
                                    context,
                                  )!.threadDetail_commentRequired
                                  : null,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.blue,
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const A11y(
                        label: 'Send comment',
                        child: Icon(
                          Icons.send_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                      onPressed: _postComment,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
