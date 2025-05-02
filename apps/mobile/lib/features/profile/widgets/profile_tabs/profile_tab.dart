import 'package:flutter/material.dart';
import '../../../../core/models/user.dart';
import '../profile_header.dart';
import '../profile_info_card.dart';
import '../badges_grid.dart';

class ProfileTab extends StatelessWidget {
  final User user;

  const ProfileTab({
    super.key,
    required this.user,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        children: [
          ProfileHeader(user: user),
          const SizedBox(height: 16),
          ProfileInfoCard(user: user),
          if (user.badges.isNotEmpty) ...[
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Rozetler',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  BadgesGrid(badges: user.badges),
                ],
              ),
            ),
          ],
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    const Icon(Icons.forum),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Forum Gönderileri',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        Text(
                          '${user.forumPostCount} gönderi',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
} 