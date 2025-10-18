import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../../../core/models/comment.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../../profile/screens/user_profile_view.dart';
import '../../../core/widgets/a11y.dart';

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
              text: widget.comment.author.username,
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
              recognizer: TapGestureRecognizer()
                ..onTap = () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => UserProfileView(userId: int.parse(widget.comment.author.id)),
                    ),
                  );
                },
            ),
          ],
        ),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(widget.comment.body),
          const SizedBox(height: 4),
          Wrap(
            spacing: 12,
            runSpacing: 4,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const A11y(label: 'Created at', child: Icon(Icons.calendar_today, size: 14)),
                  const SizedBox(width: 4),
                  Text(
                    'Created: ${widget.comment.createdAt.toLocal().toString().split(".").first}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
              if (widget.comment.editedAt != null)
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const A11y(label: 'Edited at', child: Icon(Icons.edit, size: 14)),
                    const SizedBox(width: 4),
                    Text(
                      'Edited: ${widget.comment.editedAt!.toLocal().toString().split(".").first}',
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