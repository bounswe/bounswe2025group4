import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/comment.dart';
import '../../../core/services/api_service.dart';
import '../../../core/providers/auth_provider.dart';

class CommentTile extends StatelessWidget {
  final Comment comment;
  const CommentTile(this.comment, {super.key});

  @override
  Widget build(BuildContext ctx) {
    final api         = ApiService();
    final currentUser = ctx.read<AuthProvider>().currentUser?.id;
    final isOwner     = comment.authorId == currentUser;

    return ListTile(
      leading: CircleAvatar(
        child: Text(
          comment.authorName.isNotEmpty ? comment.authorName[0] : '?',
        ),
      ),
      title: Text(comment.authorName),
      subtitle: Text(comment.body),
      trailing: PopupMenuButton<String>(
        onSelected: (action) async {
          final messenger = ScaffoldMessenger.of(ctx);
          if (action == 'Report') {
            await api.reportComment(comment.id);
            messenger.showSnackBar(
              const SnackBar(content: Text('Comment reported')),
            );
          } else if (action == 'Edit' && isOwner) {
            final controller = TextEditingController(text: comment.body);
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
              await api.editComment(comment.id, edited);
            }
          } else if (action == 'Delete' && isOwner) {
            await api.deleteComment(comment.id);
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