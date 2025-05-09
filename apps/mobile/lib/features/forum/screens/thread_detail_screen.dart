import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/discussion_thread.dart';
import '../../../core/models/comment.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import 'create_thread_screen.dart';
import '../widgets/comment_tile.dart';

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
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("This discussion is no longer available.")),
      );
      Navigator.of(context).pop(); // 👈 go back to forum screen
    }
  }

  Future<void> _postComment() async {
    if (!_commentKey.currentState!.validate()) return;
    try {
      await _api.postComment(_currentThread.id, _commentCtrl.text.trim());
      _commentCtrl.clear();
      await _loadComments();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed to post comment. Discussion might have been deleted.")),
      );
      Navigator.of(context).pop(); // exit screen if thread gone
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
                    const SnackBar(content: Text('Discussion reported')),
                  );
                } catch (e) {
                  messenger.showSnackBar(
                    const SnackBar(content: Text('This discussion no longer exists.')),
                  );
                  navigator.pop();
                }
              } else if (action == 'Edit' && isOwner) {
                final updated = await navigator.push<DiscussionThread>(
                  MaterialPageRoute(
                    builder: (_) => CreateThreadScreen(thread: _currentThread),
                  ),
                );
                if (updated != null) {
                  setState(() {
                    _currentThread = updated;
                  });
                  navigator.pop(updated);
                }
              } else if (action == 'Delete' && isOwner) {
                await _api.deleteDiscussion(_currentThread.id);
                navigator.pop('deleted');
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
              child: ListView.builder(
                key: ValueKey(_comments.map((c) => c.id).join('-')), // 💥 Force rebuild
                itemCount: _comments.length + 2,
                itemBuilder: (ctx, i) {
                  if (i == 0) {
                    return Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 6,
                            children: _currentThread.tags.map((tag) => Chip(label: Text(tag))).toList(),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _currentThread.body,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ),
                    );
                  }
                  if (i == 1) return const Divider();

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
                              );
                            }
                          });
                        },
                        onDelete: (id) async {
                          final success = await _api.deleteComment(id);
                          print('thread_detail_screen result: $success');
                          if (success) {
                            setState(() {
                              _comments.removeWhere((c) => c.id == id);
                            });
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
                      validator: (v) => (v == null || v.trim().isEmpty)
                          ? 'Please enter a comment'
                          : null,
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