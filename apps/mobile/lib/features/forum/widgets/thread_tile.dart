import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/discussion_thread.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../screens/create_thread_screen.dart';

class ThreadTile extends StatefulWidget {
  final DiscussionThread thread;
  final VoidCallback onTap;
  final VoidCallback? onDelete;
  final ValueChanged<DiscussionThread>? onEdit;

  const ThreadTile({
    super.key,
    required this.thread,
    required this.onTap,
    this.onDelete,
    this.onEdit,
  });

  @override
  State<ThreadTile> createState() => _ThreadTileState();
}

class _ThreadTileState extends State<ThreadTile> {
  @override
  Widget build(BuildContext ctx) {
    final api = ApiService(authProvider: ctx.read<AuthProvider>());
    final currentUser = ctx.read<AuthProvider>().currentUser?.id;
    final isOwner = widget.thread.creatorId.toString() == currentUser;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: InkWell(
        onTap: widget.onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.thread.title,
                style: Theme.of(ctx).textTheme.titleMedium,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              Text(
                widget.thread.body.length > 100
                    ? '${widget.thread.body.substring(0, 100)}...'
                    : widget.thread.body,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: widget.thread.tags.map((t) => Chip(label: Text(t))).toList(),
              ),
              const SizedBox(height: 8),
              Row(
                children: const [
                  Icon(Icons.comment),
                  Text(' ?'),
                  Spacer(),
                  Flexible(
                    child: Text(
                      'Unknown date',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  const Spacer(),
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
                        final updatedThread = await navigator.push<DiscussionThread>(
                          MaterialPageRoute(
                            builder: (_) => CreateThreadScreen(thread: widget.thread),
                          ),
                        );
                        if (updatedThread != null && widget.onEdit != null) {
                          widget.onEdit!(updatedThread);
                        }
                      } else if (action == 'Delete' && isOwner) {
                        await api.deleteDiscussion(widget.thread.id);
                        widget.onDelete?.call();
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
            ],
          ),
        ),
      ),
    );
  }
}