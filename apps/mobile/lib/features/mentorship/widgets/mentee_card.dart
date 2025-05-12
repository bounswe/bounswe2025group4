import 'package:flutter/material.dart';
import 'package:mobile/core/models/user.dart';

class MenteeCard extends StatelessWidget {
  final User mentee;
  final VoidCallback onChatTap;

  const MenteeCard({super.key, required this.mentee, required this.onChatTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: ListTile(
        leading: CircleAvatar(child: Text(mentee.username[0].toUpperCase())),
        title: Text(mentee.username),
        subtitle: Text(mentee.jobTitle ?? 'Mentee'),
        trailing: IconButton(
          icon: const Icon(Icons.chat),
          onPressed: onChatTap,
          tooltip: 'Chat with mentee',
        ),
      ),
    );
  }
}
