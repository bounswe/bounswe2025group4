import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../../../core/models/comment.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';

class CommentTile extends StatefulWidget {
  final Comment comment;
  final void Function(int commentId, String newBody)? onUpdate;
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
    final isOwner = widget.comment.author.id == currentUser;

    return ListTile(
      key: ValueKey(widget.comment.id),
      leading: CircleAvatar(
        child: Text(
          widget.comment.author.username.isNotEmpty
              ? widget.comment.author.username[0]
              : '?',
        ),
      ),
      title: Text(
        widget.comment.author.username.isNotEmpty
            ? widget.comment.author.username
            : 'Unknown',
      ),
      subtitle: Text(widget.comment.body),
      trailing: PopupMenuButton<String>(
        onSelected: (action) async {
          final messenger = ScaffoldMessenger.of(ctx);
          if (action == 'Report') {
            try {
              await api.reportComment(widget.comment.id);
              messenger.showSnackBar(
                const SnackBar(content: Text('Comment reported', style: TextStyle(color: Colors.green))),
              );
            } on SocketException {
              messenger.showSnackBar(
                const SnackBar(content: Text('Failed: Please check your connection and refresh the page.', style: TextStyle(color: Colors.red))),
              );
            } catch (e) {
              messenger.showSnackBar(
                const SnackBar(content: Text('Failed: This comment is no longer available.', style: TextStyle(color: Colors.red))),
              );
            }
          } else if (action == 'Edit' && isOwner) {
            final controller = TextEditingController(text: widget.comment.body);
            final edited = await showDialog<String>(
              context: ctx,
              builder: (_) => AlertDialog(
                title: const Text('Edit Comment'),
                content: TextField(
                  controller: controller,
                  maxLines: null,
                  decoration: const InputDecoration(hintText: 'Update your comment'),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(ctx, controller.text.trim()),
                    child: const Text('Save'),
                  ),
                ],
              ),
            );
            if (edited != null && edited.isNotEmpty) {
              try {
                await api.editComment(widget.comment.id, edited);
                widget.onUpdate?.call(widget.comment.id, edited);
              } on SocketException {
                messenger.showSnackBar(
                  const SnackBar(content: Text('Failed: Please check your connection and refresh the page.', style: TextStyle(color: Colors.red))),
                );
              } catch (e) {
                messenger.showSnackBar(
                  const SnackBar(content: Text("Failed: This discussion is no longer available.", style: TextStyle(color: Colors.red))),
                );
              }
            }
          } else if (action == 'Delete' && isOwner) {
            widget.onDelete?.call(widget.comment.id);
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
    );
  }
}