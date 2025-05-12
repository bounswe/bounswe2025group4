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
  String? _username;

  @override
  void initState() {
    super.initState();
    _loadUsername();
  }

  Future<void> _loadUsername() async {
    final api = ApiService(authProvider: context.read<AuthProvider>());
    try {
      final user = await api.fetchUser(widget.thread.creatorId);
      setState(() => _username = user.username);
    } catch (_) {
      setState(() => _username = 'Unknown');
    }
  }

  @override
  Widget build(BuildContext ctx) {
    final api = ApiService(authProvider: ctx.read<AuthProvider>());
    final currentUser = ctx.read<AuthProvider>().currentUser?.id;
    final isOwner = widget.thread.creatorId.toString() == currentUser;

    return GestureDetector(
      onTap: widget.onTap,
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 3,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    child: Text(_username != null ? _username![0].toUpperCase() : '?'),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    _username ?? 'Loading...',
                    style: Theme.of(context).textTheme.labelLarge,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                widget.thread.title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                widget.thread.body,
                style: Theme.of(context).textTheme.bodyMedium,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 6,
                children: widget.thread.tags.map((tag) => Chip(label: Text(tag))).toList(),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Icon(Icons.comment, size: 20),
                  Text('Unknown date', style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

