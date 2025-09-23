import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../../../core/models/discussion_thread.dart';
import '../../../core/models/comment.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import 'create_thread_screen.dart';
import '../widgets/comment_tile.dart';
import '../../profile/screens/user_profile_view.dart';
import 'package:flutter/gestures.dart';

class ThreadDetailScreen extends StatefulWidget {
  final DiscussionThread thread;
  const ThreadDetailScreen({super.key, required this.thread});

  @override
  State<ThreadDetailScreen> createState() => _ThreadDetailScreenState();
}

class _ThreadDetailScreenState extends State<ThreadDetailScreen> {
  final _commentCtrl = TextEditingController();
  final _commentKey = GlobalKey<FormState>();
  late final ApiService _api;
  List<Comment> _comments = [];
  late DiscussionThread _currentThread;

  @override
  void initState() {
    super.initState();
    _api = ApiService(authProvider: context.read<AuthProvider>());
    _currentThread = widget.thread;
    _loadComments();
  }

  Future<void> _loadComments() async {
    try {
      final updated = await _api.fetchComments(_currentThread.id);
      setState(() {
        _comments = updated;
      });
    } on SocketException {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed: Please check your connection and refresh the page.", style: TextStyle(color: Colors.red))),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed: This discussion is no longer available.", style: TextStyle(color: Colors.red))),
      );
      Navigator.of(context).pop();
    }
  }

  Future<void> _postComment() async {
    if (!_commentKey.currentState!.validate()) return;
    try {
      await _api.postComment(_currentThread.id, _commentCtrl.text.trim());
      _commentCtrl.clear();
      await _loadComments();
    } on SocketException {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed: Please check your connection and refresh the page.", style: TextStyle(color: Colors.red))),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed: This discussion is no longer available.", style: TextStyle(color: Colors.red))),
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
    final isOwner = _currentThread.creatorId.toString() == currentUser;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          _currentThread.title,
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
                try {
                  await _api.reportDiscussion(_currentThread.id);
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Discussion reported', style: TextStyle(color: Colors.green))),
                  );
                } on SocketException {
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Failed: Please check your connection and refresh the page.', style: TextStyle(color: Colors.red))),
                  );
                } catch (e) {
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Failed: This discussion is no longer available.', style: TextStyle(color: Colors.red))),
                  );
                }
              } else if (action == 'Edit' && isOwner) {
                try {
                  final updated = await navigator.push<DiscussionThread>(
                    MaterialPageRoute(
                      builder: (_) => CreateThreadScreen(thread: _currentThread),
                    ),
                  );
                  if (updated != null) {
                    setState(() => _currentThread = updated);
                    navigator.pop(updated);
                  }
                } on SocketException {
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Failed: Please check your connection and refresh the page.', style: TextStyle(color: Colors.red))),
                  );
                } catch (e) {
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Failed to create/edit discussion.', style: TextStyle(color: Colors.red))),
                  );
                }
              } else if (action == 'Delete' && isOwner) {
                try {
                  await _api.deleteDiscussion(_currentThread.id);
                  navigator.pop('deleted');
                } on SocketException {
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Failed: Please check your connection and refresh the page.', style: TextStyle(color: Colors.red))),
                  );
                } catch (e) {
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Failed to delete discussion.', style: TextStyle(color: Colors.red))),
                  );
                }
              }
            },
            itemBuilder: (_) => [
              const PopupMenuItem(value: 'Report', child: Text('Report')),
              if (isOwner) ...[
                const PopupMenuItem(value: 'Edit', child: Text('Edit')),
                const PopupMenuItem(value: 'Delete', child: Text('Delete')),
              ],
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadComments,
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
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Thread Details', style: Theme.of(context).textTheme.titleLarge),
                                const SizedBox(height: 12),

                                // Creator
                                RichText(
                                  text: TextSpan(
                                    style: const TextStyle(fontSize: 16),
                                    children: [
                                      const TextSpan(
                                        text: 'Creator: ',
                                        style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w500),
                                      ),
                                      TextSpan(
                                        text: _currentThread.creatorUsername,
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF1565C0),
                                          decoration: TextDecoration.underline,
                                        ),
                                        recognizer: TapGestureRecognizer()
                                          ..onTap = () {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (_) => UserProfileView(
                                                  userId: int.parse(_currentThread.creatorId),
                                                ),
                                              ),
                                            );
                                          },
                                      ),
                                    ],
                                  ),
                                ),

                                const SizedBox(height: 12),

                                // Content
                                Text('Content:', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.grey[700])),
                                const SizedBox(height: 4),
                                Text(
                                  _currentThread.body,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.black87,
                                    height: 1.4,
                                  ),
                                ),

                                const SizedBox(height: 12),

                                // Tags
                                Text('Tags:', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.grey[700])),
                                const SizedBox(height: 4),
                                Wrap(
                                  spacing: 6,
                                  children: _currentThread.tags.map((tag) => Chip(label: Text(tag))).toList(),
                                ),

                                const SizedBox(height: 12),

                                // Timestamps
                                Row(
                                  children: [
                                    const Icon(Icons.calendar_today, size: 16),
                                    const SizedBox(width: 4),
                                    Text('Created: ${_currentThread.createdAt.toLocal().toString().split(".").first}'),
                                  ],
                                ),
                                if (_currentThread.editedAt != null)
                                  Row(
                                    children: [
                                      const Icon(Icons.edit, size: 16),
                                      const SizedBox(width: 4),
                                      Text('Edited: ${_currentThread.editedAt!.toLocal().toString().split(".").first}'),
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
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Text(
                          'Comments',
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
                          onUpdate: (id, newBody) {
                            setState(() {
                              final index = _comments.indexWhere((c) => c.id == id);
                              if (index != -1) {
                                _comments[index] = Comment(
                                  id: id,
                                  body: newBody,
                                  author: _comments[index].author,
                                  reported: _comments[index].reported,
                                  createdAt: _comments[index].createdAt,
                                );
                              }
                            });
                          },
                          onDelete: (id) async {
                            try {
                              final success = await _api.deleteComment(id);
                              if (success) {
                                setState(() {
                                  _comments.removeWhere((c) => c.id == id);
                                });
                              } else {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text("Failed to delete comment.", style: TextStyle(color: Colors.red))),
                                );
                              }
                            } on SocketException {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text("Failed: Please check your connection and refresh the page.", style: TextStyle(color: Colors.red))),
                              );
                            } catch (e) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text("Failed to delete comment.", style: TextStyle(color: Colors.red))),
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
                      decoration: const InputDecoration(hintText: 'Add a comment…'),
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter a comment' : null,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send),
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