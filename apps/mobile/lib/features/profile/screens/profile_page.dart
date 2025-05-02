import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../widgets/profile_tabs/index.dart';
import '../widgets/profile_header.dart';
import '../widgets/profile_info_card.dart';
import '../widgets/badges_grid.dart';
import '../widgets/badge_edit_dialog.dart';
import '../../../core/models/user.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          if (authProvider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (authProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'An error occurred: ${authProvider.error}',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(context).colorScheme.error,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: authProvider.getCurrentUser,
                    child: const Text('Try Again'),
                  ),
                ],
              ),
            );
          }

          final user = authProvider.currentUser;
          if (user == null) {
            return const Center(
              child: Text('User not found'),
            );
          }

          return RefreshIndicator(
            onRefresh: () => authProvider.getCurrentUser(),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Align(
                alignment: Alignment.topCenter,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 700),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Profil başlığı ve sayaçlar
                      ProfileHeader(user: user),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Card(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 2,
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Badges', style: Theme.of(context).textTheme.titleMedium),
                                    IconButton(
                                      icon: const Icon(Icons.edit, size: 20),
                                      onPressed: () async {
                                        final updatedBadges = await showDialog<List<UserBadge>>(
                                          context: context,
                                          builder: (context) => BadgeEditDialog(badges: user.badges),
                                        );
                                        if (updatedBadges != null) {
                                          Provider.of<AuthProvider>(context, listen: false)
                                            .updateProfile(user.copyWith(badges: updatedBadges));
                                        }
                                      },
                                      tooltip: 'Edit badges',
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                BadgesGrid(
                                  badges: user.badges,
                                  onEdit: () async {
                                    final updatedBadges = await showDialog<List<UserBadge>>(
                                      context: context,
                                      builder: (context) => BadgeEditDialog(badges: user.badges),
                                    );
                                    if (updatedBadges != null) {
                                      Provider.of<AuthProvider>(context, listen: false)
                                        .updateProfile(user.copyWith(badges: updatedBadges));
                                    }
                                  },
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Hakkında, yetenekler, ilgi alanları
                      ProfileInfoCard(user: user),
                      const SizedBox(height: 16),
                      // Deneyim ve Eğitim
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: ExperienceTab(user: user),
                      ),
                      const SizedBox(height: 16),
                      // Başvurular
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: ApplicationsTab(user: user),
                      ),
                      const SizedBox(height: 16),
                      // Aktivite
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: ActivityTab(user: user),
                      ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
