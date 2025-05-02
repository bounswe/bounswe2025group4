import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/discussion_thread.dart';
import '../../../core/models/comment.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../widgets/comment_tile.dart';
import 'create_thread_screen.dart';

class ThreadDetailScreen extends StatefulWidget {
  final DiscussionThread thread;
  const ThreadDetailScreen({super.key, required this.thread});

  @override
  State<ThreadDetailScreen> createState() => _ThreadDetailScreenState();
}

class _ThreadDetailScreenState extends State<ThreadDetailScreen> {
  final _commentCtrl = TextEditingController();
  final _commentKey = GlobalKey<FormState>();

  bool _isLoadingComments = false;
  List<Comment> _comments = [];

  @override
  void initState() {
    super.initState();
    _loadComments();
  }

  Future<void> _loadComments() async {
    setState(() => _isLoadingComments = true);
    _comments = await ApiService().fetchComments(widget.thread.id);
    setState(() => _isLoadingComments = false);
  }

  Future<void> _postComment() async {
    if (!_commentKey.currentState!.validate()) return;
    final newComment = await ApiService()
        .postComment(widget.thread.id, _commentCtrl.text.trim());
    setState(() {
      _comments.add(newComment);
      _commentCtrl.clear();
    });
  }

  @override
  void dispose() {
    _commentCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = context.read<AuthProvider>().currentUser?.id;
    final isOwner = widget.thread.authorId == currentUser;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.thread.title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          PopupMenuButton<String>(
            onSelected: (action) async {
              final navigator = Navigator.of(context);
              final messenger = ScaffoldMessenger.of(context);
              if (action == 'Report') {
                await ApiService().reportDiscussion(widget.thread.id);
                messenger.showSnackBar(
                    const SnackBar(content: Text('Discussion reported')));
              } else if (action == 'Edit' && isOwner) {
                final saved = await navigator.push<bool>(
                  MaterialPageRoute(
                    builder: (_) =>
                        CreateThreadScreen(thread: widget.thread),
                  ),
                );
                if (saved == true) {
                  _loadComments();
                }
              } else if (action == 'Delete' && isOwner) {
                await ApiService().deleteDiscussion(widget.thread.id);
                navigator.pop();
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
            child: _isLoadingComments
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    padding: EdgeInsets.zero,
                    itemCount: _comments.length + 2,
                    itemBuilder: (ctx, i) {
                      if (i == 0) {
                        return Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Text(
                            widget.thread.body,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        );
                      }
                      if (i == 1) return const Divider();
                      return CommentTile(_comments[i - 2]);
                    },
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
                      decoration:
                          const InputDecoration(hintText: 'Add a comment…'),
                      validator: (v) =>
                          (v == null || v.trim().isEmpty)
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