import 'package:flutter/material.dart';
import '../../../core/models/user.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import 'profile_edit_dialog.dart';

class ProfileHeader extends StatelessWidget {
  final User user;

  const ProfileHeader({
    super.key,
    required this.user,
  });

  void _editProfile(BuildContext context) async {
    // Profile edit dialogu aç
    final updatedUser = await showDialog<User>(
      context: context,
      builder: (context) => ProfileEditDialog(user: user),
    );
    if (updatedUser != null) {
      Provider.of<AuthProvider>(context, listen: false).updateProfile(updatedUser);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundImage: user.profilePicture != null
                      ? NetworkImage(user.profilePicture!)
                      : null,
                  child: user.profilePicture == null
                      ? Text(
                          user.username[0].toUpperCase(),
                          style: Theme.of(context).textTheme.headlineMedium,
                        )
                      : null,
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              user.fullName ?? user.username,
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.edit, size: 22),
                            onPressed: () => _editProfile(context),
                            tooltip: 'Edit Profile',
                          ),
                        ],
                      ),
                      if (user.occupation != null) ...[
                        Text(
                          user.occupation!,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(color: Colors.grey[700]),
                        ),
                      ],
                      if (user.bio != null && user.bio!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          user.bio!,
                          style: Theme.of(context).textTheme.bodyMedium,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _StatCard(title: 'Applications', count: 15, icon: Icons.assignment),
                _StatCard(title: 'Reviews', count: 8, icon: Icons.rate_review),
                _StatCard(title: 'Forum Posts', count: 23, icon: Icons.forum),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final int count;
  final IconData icon;
  const _StatCard({required this.title, required this.count, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 22, color: Theme.of(context).colorScheme.primary),
        const SizedBox(height: 4),
        Text('$count', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
        Text(title, style: Theme.of(context).textTheme.labelSmall?.copyWith(color: Colors.grey[700])),
      ],
    );
  }
} 