import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/discussion_thread.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../../profile/screens/user_profile_view.dart';

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
              // Creator Section
              Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: RichText(
                  text: TextSpan(
                    style: const TextStyle(fontSize: 16),
                    children: [
                      const TextSpan(
                        text: 'Creator: ',
                        style: TextStyle(
                          color: Colors.black87,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      TextSpan(
                        text: widget.thread.creatorUsername,
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
                                builder: (_) => UserProfileView(
                                  userId: int.parse(widget.thread.creatorId),
                                ),
                              ),
                            );
                          },
                      ),
                    ],
                  ),
                ),
              ),
              const Divider(height: 1, thickness: 1),
              const SizedBox(height: 8),

              // Title Section
              Text(
                'Title:',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: Colors.grey[700],
                ),
              ),
              Text(
                widget.thread.title,
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),

              // Content Section
              Text(
                'Content:',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: Colors.grey[700],
                ),
              ),
              Text(
                widget.thread.body,
                style: const TextStyle(
                  fontSize: 15.5,
                  fontWeight: FontWeight.w500,
                  color: Colors.black87,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),

              // Tags Section
              Text(
                'Tags:',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: Colors.grey[700],
                ),
              ),
              Wrap(
                spacing: 6,
                children:
                widget.thread.tags.map((tag) => Chip(label: Text(tag))).toList(),
              ),
              const SizedBox(height: 12),

              // Timestamp Section
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.calendar_today, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        'Created: ${widget.thread.createdAt.toLocal().toString().split(".").first}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                  if (widget.thread.editedAt != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.edit, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          'Edited: ${widget.thread.editedAt!.toLocal().toString().split(".").first}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 12),

              // Comments count
              Row(
                children: [
                  const Icon(Icons.comment, size: 20),
                  const SizedBox(width: 4),
                  Text(
                    '${widget.thread.commentCount} comments',
                    style: Theme.of(context).textTheme.bodySmall,
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