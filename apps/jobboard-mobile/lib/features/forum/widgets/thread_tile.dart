import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/models/forum_post.dart';
import '../../../core/widgets/a11y.dart';

class ThreadTile extends StatefulWidget {
  final ForumPost post;
  final VoidCallback onTap;
  final VoidCallback? onDelete;

  const ThreadTile({
    super.key,
    required this.post,
    required this.onTap,
    this.onDelete,
  });

  @override
  State<ThreadTile> createState() => _ThreadTileState();
}

class _ThreadTileState extends State<ThreadTile> {
  @override
  Widget build(BuildContext ctx) {

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        widget.onTap();
      },
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
                    style: TextStyle(
                      fontSize: 16,
                      color:
                          Theme.of(ctx).brightness == Brightness.dark
                              ? Colors.grey.shade300
                              : Colors.black87,
                    ),
                    children: [
                      TextSpan(
                        text: 'Creator: ',
                        style: TextStyle(
                          color:
                              Theme.of(ctx).brightness == Brightness.dark
                                  ? Colors.grey.shade300
                                  : Colors.black87,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      TextSpan(
                        text: widget.post.authorUsername,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color:
                              Theme.of(ctx).brightness == Brightness.dark
                                  ? Colors.blue.shade300
                                  : Colors
                                      .blue, // Use blue to match design language
                          decoration: TextDecoration.underline,
                          letterSpacing: 0.3,
                          shadows: [
                            Shadow(
                              color:
                                  Theme.of(ctx).brightness == Brightness.dark
                                      ? Colors.black45
                                      : Colors.black12,
                              offset: Offset(0.5, 0.5),
                              blurRadius: 1,
                            ),
                          ],
                        ),
                        recognizer:
                            TapGestureRecognizer()
                              ..onTap = () {
                                HapticFeedback.lightImpact();
                                // TODO: Navigate to user profile when implemented
                                // Navigator.push(
                                //   context,
                                //   MaterialPageRoute(
                                //     builder: (_) => UserProfileView(
                                //       userId: widget.post.authorId,
                                //     ),
                                //   ),
                                // );
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
                widget.post.title,
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
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
                widget.post.content,
                style: TextStyle(
                  fontSize: 15.5,
                  fontWeight: FontWeight.w500,
                  color:
                      Theme.of(ctx).brightness == Brightness.dark
                          ? Colors.grey.shade300
                          : Colors.black87,
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
                  color:
                      Theme.of(ctx).brightness == Brightness.dark
                          ? Colors.grey.shade400
                          : Colors.grey[700],
                ),
              ),
              Wrap(
                spacing: 6,
                children:
                    widget.post.tags
                        .map(
                          (tag) => Chip(
                            label: Text(
                              tag,
                              style: TextStyle(
                                color:
                                    Theme.of(context).brightness ==
                                            Brightness.dark
                                        ? Colors.blue.shade200
                                        : Colors.blue.shade900,
                              ),
                            ),
                            backgroundColor:
                                Theme.of(context).brightness == Brightness.dark
                                    ? Colors.blue.shade900.withOpacity(0.3)
                                    : Colors.blue.shade50,
                            side: BorderSide.none,
                          ),
                        )
                        .toList(),
              ),
              const SizedBox(height: 12),

              // Timestamp Section
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const A11y(
                        label: 'Created at',
                        child: Icon(Icons.calendar_today, size: 16),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Created: ${widget.post.createdAt.toLocal().toString().split(".").first}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const A11y(
                        label: 'Updated at',
                        child: Icon(Icons.edit, size: 16),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Updated: ${widget.post.updatedAt.toLocal().toString().split(".").first}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Stats row
              Row(
                children: [
                  const A11y(
                    label: 'Comments',
                    child: Icon(Icons.comment, size: 20),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${widget.post.commentCount} comments',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(width: 16),
                  const A11y(
                    label: 'Upvotes',
                    child: Icon(Icons.arrow_upward, size: 20),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${widget.post.upvoteCount}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(width: 16),
                  const A11y(
                    label: 'Downvotes',
                    child: Icon(Icons.arrow_downward, size: 20),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${widget.post.downvoteCount}',
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
