import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../../../core/models/forum_comment.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/widgets/a11y.dart';

class CommentTile extends StatefulWidget {
  final ForumComment comment;
  final void Function(ForumComment updatedComment)? onUpdate;
  final void Function(int commentId)? onDelete;

  const CommentTile({
    required this.comment,
    this.onUpdate,
    this.onDelete,
    Key? key,
  }) : super(key: key);

  @override
  State<CommentTile> createState() => _CommentTileState();
}

class _CommentTileState extends State<CommentTile> {
  @override
  Widget build(BuildContext ctx) {
    final api = ApiService(authProvider: ctx.read<AuthProvider>());
    final currentUser = ctx.read<AuthProvider>().currentUser?.id;
    final isOwner = widget.comment.authorId.toString() == currentUser;

    return ListTile(
      key: ValueKey(widget.comment.id),
      title: RichText(
        text: TextSpan(
          style: const TextStyle(fontSize: 16),
          children: [
            const TextSpan(
              text: 'Author: ',
              style: TextStyle(
                color: Colors.black87,
                fontWeight: FontWeight.w500,
              ),
            ),
            TextSpan(
              text: widget.comment.authorUsername,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1565C0),
                decoration: TextDecoration.underline,
                letterSpacing: 0.3,
                shadows: [
                  Shadow(
                    color: Colors.black12,
                    offset: Offset(0.5, 0.5),
                    blurRadius: 1,
                  ),
                ],
              ),
              recognizer:
                  TapGestureRecognizer()
                    ..onTap = () {
                      // Disabled for mock data - will be enabled when API is ready
                      // Navigator.push(
                      //   context,
                      //   MaterialPageRoute(
                      //     builder: (_) => UserProfileView(userId: int.parse(widget.comment.author.id)),
                      //   ),
                      // );
                    },
            ),
          ],
        ),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(widget.comment.content),
          const SizedBox(height: 4),
          Wrap(
            spacing: 12,
            runSpacing: 4,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const A11y(
                    label: 'Created at',
                    child: Icon(Icons.calendar_today, size: 14),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Created: ${widget.comment.createdAt.toLocal().toString().split(".").first}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const A11y(
                    label: 'Updated at',
                    child: Icon(Icons.edit, size: 14),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Updated: ${widget.comment.updatedAt.toLocal().toString().split(".").first}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const A11y(
                    label: 'Upvotes',
                    child: Icon(Icons.arrow_upward, size: 14),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${widget.comment.upvoteCount}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const A11y(
                    label: 'Downvotes',
                    child: Icon(Icons.arrow_downward, size: 14),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${widget.comment.downvoteCount}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      trailing: PopupMenuButton<String>(
        onSelected: (action) async {
          final messenger = ScaffoldMessenger.of(ctx);
          if (action == 'Report') {
            // Show "Reported!" dialog for now (mock implementation)
            showDialog(
              context: ctx,
              builder: (BuildContext context) {
                return AlertDialog(
                  title: const Text('Reported!'),
                  content: const Text(
                    'Thank you for reporting this comment. We will review it soon.',
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
            final controller = TextEditingController(
              text: widget.comment.content,
            );
            final edited = await showDialog<String>(
              context: ctx,
              builder:
                  (_) => AlertDialog(
                    title: const Text('Edit Comment'),
                    content: TextField(
                      controller: controller,
                      maxLines: null,
                      decoration: const InputDecoration(
                        hintText: 'Update your comment',
                      ),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed:
                            () => Navigator.pop(ctx, controller.text.trim()),
                        child: const Text('Save'),
                      ),
                    ],
                  ),
            );
            if (edited != null && edited.isNotEmpty) {
              try {
                final updated = await api.updateForumComment(
                  commentId: widget.comment.id,
                  content: edited,
                );
                widget.onUpdate?.call(updated);
              } on SocketException {
                messenger.showSnackBar(
                  const SnackBar(
                    content: Text(
                      'Failed: Please check your connection and refresh the page.',
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
                );
              } catch (e) {
                messenger.showSnackBar(
                  const SnackBar(
                    content: Text(
                      "Failed: This comment is no longer available.",
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
                );
              }
            }
          } else if (action == 'Delete' && isOwner) {
            widget.onDelete?.call(widget.comment.id);
          }
        },
        itemBuilder:
            (_) => [
              const PopupMenuItem(value: 'Report', child: Text('Report')),
              if (isOwner) ...[
                const PopupMenuItem(value: 'Edit', child: Text('Edit')),
                const PopupMenuItem(value: 'Delete', child: Text('Delete')),
              ],
            ],
      ),
    );
  }
}
