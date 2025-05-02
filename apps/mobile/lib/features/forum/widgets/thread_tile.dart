import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/models/discussion_thread.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../screens/create_thread_screen.dart';

class ThreadTile extends StatefulWidget {
  final DiscussionThread thread;
  final VoidCallback onTap;
  const ThreadTile({super.key, required this.thread, required this.onTap});

  @override
  State<ThreadTile> createState() => _ThreadTileState();
}

class _ThreadTileState extends State<ThreadTile> {
  late bool _hasLiked;
  late int  _likeCount;

  @override
  void initState() {
    super.initState();
    _hasLiked  = false; // TODO: fetch real like status
    _likeCount = widget.thread.likeCount;
  }

  @override
  Widget build(BuildContext ctx) {
    final api = ApiService();
    final currentUser = ctx.read<AuthProvider>().currentUser?.id;
    final isOwner     = widget.thread.authorId == currentUser;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: InkWell(
        onTap: widget.onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title
              Text(
                widget.thread.title,
                style: Theme.of(ctx).textTheme.titleMedium,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),

              // Body snippet (first 100 chars)
              Text(
                widget.thread.body.length > 100
                    ? '${widget.thread.body.substring(0, 100)}...'
                    : widget.thread.body,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),

              // Tags
              Wrap(
                spacing: 8,
                children:
                widget.thread.tags.map((t) => Chip(label: Text(t))).toList(),
              ),
              const SizedBox(height: 8),

              // Actions row
              Row(
                children: [
                  // Like toggle
                  IconButton(
                    icon: Icon(
                      _hasLiked ? Icons.thumb_up : Icons.thumb_up_outlined,
                      color: _hasLiked ? Colors.blue : null,
                    ),
                    onPressed: () async {
                      if (_hasLiked) {
                        await api.unlikeDiscussion(widget.thread.id);
                        setState(() {
                          _hasLiked = false;
                          _likeCount--;
                        });
                      } else {
                        await api.likeDiscussion(widget.thread.id);
                        setState(() {
                          _hasLiked = true;
                          _likeCount++;
                        });
                      }
                    },
                  ),
                  Text(' $_likeCount'),
                  const SizedBox(width: 16),

                  // Comment count
                  const Icon(Icons.comment),
                  Text(' ${widget.thread.commentCount}'),
                  const Spacer(),

                  // Created at
                  Flexible(
                    child: Text(
                      DateFormat.yMd().add_jm().format(widget.thread.createdAt.toLocal()),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),

                  // Report / Edit / Delete menu
                  PopupMenuButton<String>(
                    onSelected: (action) async {
                      final messenger = ScaffoldMessenger.of(ctx);
                      final navigator = Navigator.of(ctx);
                      if (action == 'Report') {
                        await api.reportDiscussion(widget.thread.id);
                        messenger.showSnackBar(
                          const SnackBar(content: Text('Discussion reported')),
                        );
                      } else if (action == 'Edit' && isOwner) {
                        final edited = await navigator.push<bool>(
                          MaterialPageRoute(
                            builder: (_) => CreateThreadScreen(thread: widget.thread),
                          ),
                        );
                        if (edited == true) {
                          // Optionally refresh or update state here
                          setState(() {
                            // no-op or refresh if needed
                          });
                        }
                      } else if (action == 'Delete' && isOwner) {
                        await api.deleteDiscussion(widget.thread.id);
                      }
                    },
                    itemBuilder: (_) => [
                      const PopupMenuItem(
                          value: 'Report', child: Text('Report')),
                      if (isOwner) ...[
                        const PopupMenuItem(
                            value: 'Edit', child: Text('Edit')),
                        const PopupMenuItem(
                            value: 'Delete', child: Text('Delete')),
                      ],
                    ],
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