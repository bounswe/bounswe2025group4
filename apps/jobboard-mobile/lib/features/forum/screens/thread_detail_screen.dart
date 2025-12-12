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
      setState(() {
        _currentPost = updated;
        _comments = updated.comments;
      });
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
      body: Column(
        children: [
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadPost,
              child: Scrollbar(
                thumbVisibility: true,
                child: ListView.builder(
                  itemCount: _comments.length + 2,
                  itemBuilder: (ctx, i) {
                    if (i == 0) {
                      return Padding(
                        padding: const EdgeInsets.all(16),
                        child: Card(
                          elevation: 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  AppLocalizations.of(
                                    context,
                                  )!.threadDetail_threadDetails,
                                  style: Theme.of(context).textTheme.titleLarge,
                                ),
                                const SizedBox(height: 12),

                                // Creator
                                RichText(
                                  text: TextSpan(
                                    style: const TextStyle(fontSize: 16),
                                    children: [
                                      TextSpan(
                                        text:
                                            AppLocalizations.of(
                                              context,
                                            )!.threadDetail_creator,
                                        style: TextStyle(
                                          color:
                                              Theme.of(context).brightness ==
                                                      Brightness.dark
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
                                              Theme.of(context).brightness ==
                                                      Brightness.dark
                                                  ? Colors.blue.shade300
                                                  : Color(0xFF1565C0),
                                          decoration: TextDecoration.underline,
                                        ),
                                        recognizer:
                                            TapGestureRecognizer()
                                              ..onTap = () {
                                                _navigateToUserProfile(
                                                  _currentPost.authorId,
                                                );
                                              },
                                      ),
                                    ],
                                  ),
                                ),

                                const SizedBox(height: 12),

                                // Content
                                Text(
                                  AppLocalizations.of(
                                    context,
                                  )!.threadDetail_content,
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    color:
                                        Theme.of(context).brightness ==
                                                Brightness.dark
                                            ? Colors.grey.shade400
                                            : Colors.grey[700],
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _currentPost.content,
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                    color:
                                        Theme.of(context).brightness ==
                                                Brightness.dark
                                            ? Colors.grey.shade300
                                            : Colors.black87,
                                    height: 1.4,
                                  ),
                                ),

                                const SizedBox(height: 12),

                                // Tags
                                Text(
                                  AppLocalizations.of(
                                    context,
                                  )!.threadDetail_tags,
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    color:
                                        Theme.of(context).brightness ==
                                                Brightness.dark
                                            ? Colors.grey.shade400
                                            : Colors.grey[700],
                                  ),
                                ),
                                const SizedBox(height: 4),
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
                                                      Theme.of(
                                                                context,
                                                              ).brightness ==
                                                              Brightness.dark
                                                          ? Colors.blue.shade200
                                                          : Colors
                                                              .blue
                                                              .shade900,
                                                ),
                                              ),
                                              backgroundColor:
                                                  Theme.of(
                                                            context,
                                                          ).brightness ==
                                                          Brightness.dark
                                                      ? Colors.blue.shade900
                                                          .withOpacity(0.3)
                                                      : Colors.blue.shade50,
                                              side: BorderSide.none,
                                            ),
                                          )
                                          .toList(),
                                ),

                                const SizedBox(height: 12),

                                // Timestamps
                                Row(
                                  children: [
                                    const A11y(
                                      label: 'Created at',
                                      child: Icon(Icons.access_time, size: 16),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      DateFormatter.formatRelativeTime(
                                        _currentPost.createdAt,
                                      ),
                                      style: TextStyle(color: Colors.grey[600]),
                                    ),
                                    if (_currentPost.createdAt !=
                                        _currentPost.updatedAt) ...[
                                      const SizedBox(width: 12),
                                      const A11y(
                                        label: 'Edited',
                                        child: Icon(Icons.edit, size: 16),
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        '(edited ${DateFormatter.formatRelativeTime(_currentPost.updatedAt)})',
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                          fontStyle: FontStyle.italic,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),

                                const SizedBox(height: 16),

                                // Voting and stats
                                Row(
                                  children: [
                                    // Upvote button
                                    A11y(
                                      label: 'Upvote',
                                      child: Material(
                                        color: Colors.transparent,
                                        child: InkWell(
                                          onTap:
                                              _isVoting ? null : _handleUpvote,
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 12,
                                              vertical: 8,
                                            ),
                                            child: Row(
                                              children: [
                                                Icon(
                                                  Icons.arrow_upward,
                                                  size: 24,
                                                  color: Colors.green[700],
                                                ),
                                                const SizedBox(width: 4),
                                                Text(
                                                  '${_currentPost.upvoteCount}',
                                                  style: TextStyle(
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.bold,
                                                    color: Colors.green[700],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),

                                    // Downvote button
                                    A11y(
                                      label: 'Downvote',
                                      child: Material(
                                        color: Colors.transparent,
                                        child: InkWell(
                                          onTap:
                                              _isVoting
                                                  ? null
                                                  : _handleDownvote,
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 12,
                                              vertical: 8,
                                            ),
                                            child: Row(
                                              children: [
                                                Icon(
                                                  Icons.arrow_downward,
                                                  size: 24,
                                                  color: Colors.red[700],
                                                ),
                                                const SizedBox(width: 4),
                                                Text(
                                                  '${_currentPost.downvoteCount}',
                                                  style: TextStyle(
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.bold,
                                                    color: Colors.red[700],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 16),

                                    // Comments count
                                    const A11y(
                                      label: 'Comments',
                                      child: Icon(
                                        Icons.comment,
                                        size: 20,
                                        color: Colors.grey,
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${_currentPost.commentCount}',
                                      style:
                                          Theme.of(
                                            context,
                                          ).textTheme.bodyMedium,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }

                    if (i == 1) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        child: Text(
                          AppLocalizations.of(context)!.threadDetail_comments,
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                      );
                    }

                    final comment = _comments[i - 2];
                    return Column(
                      key: ValueKey("comment-block-${comment.id}"),
                      children: [
                        CommentTile(
                          key: ValueKey("comment-${comment.id}"),
                          comment: comment,
                          onUpdate: (updatedComment) {
                            setState(() {
                              final index = _comments.indexWhere(
                                (c) => c.id == updatedComment.id,
                              );
                              if (index != -1) {
                                _comments[index] = updatedComment;
                              }
                            });
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
                        ),
                        const Divider(),
                      ],
                    );
                  },
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Form(
              key: _commentKey,
              child: Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _commentCtrl,
                      decoration: InputDecoration(
                        hintText:
                            AppLocalizations.of(
                              context,
                            )!.threadDetail_addComment,
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
                  IconButton(
                    icon: const A11y(
                      label: 'Send comment',
                      child: Icon(Icons.send),
                    ),
                    onPressed: _postComment,
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
