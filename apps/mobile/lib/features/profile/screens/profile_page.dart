import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/profile_provider.dart';
import '../../auth/screens/welcome_screen.dart';
import '../widgets/profile_picture.dart';
import '../widgets/work_experience_list.dart';
import '../widgets/editable_chip_list.dart';
import '../widgets/badge_list.dart';
import '../widgets/education_list.dart';
import 'edit_profile_page.dart';
import '../../../core/models/mentorship_status.dart';


class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final profileProvider =
      Provider.of<ProfileProvider>(context, listen: false);

      await profileProvider.fetchMyProfile();

      final userId = profileProvider.currentUserProfile?.profile.userId;
      if (userId != null) {
        await profileProvider.fetchUserDetails(userId);
      }
    });
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final profileProvider = Provider.of<ProfileProvider>(context);
    final profile = profileProvider.currentUserProfile;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        automaticallyImplyLeading: false,
        actions: [
          if (!profileProvider.isLoading && profile != null)
            IconButton(
              icon: const Icon(Icons.edit),
              tooltip: 'Edit profile',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const EditProfilePage(),
                  ),
                );
              },
            ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () async {
              await authProvider.logout();
              if (!context.mounted) return;
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const WelcomeScreen()),
                (Route<dynamic> route) => false,
              );
            },
          ),
        ],
      ),
      body: profileProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : profile == null
          ? const Center(child: Text('Failed to load profile'))
          : RefreshIndicator(
        onRefresh: () async {
          await profileProvider.fetchMyProfile();
        },
        child: _buildProfileContent(context, profileProvider, profile),
      ),
    );
  }

  Widget _buildProfileContent(
      BuildContext context,
      ProfileProvider profileProvider,
      fullProfile,
      ) {
    final profile = fullProfile.profile;
    final experiences = fullProfile.experience;
    final badges = fullProfile.badges;

    return Scrollbar(
      thumbVisibility: true,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildProfileHeader(profile),
            const SizedBox(height: 24),

            WorkExperienceList(experiences: experiences, isEditable: true),
            const SizedBox(height: 24),

            EducationList(educationHistory: fullProfile.education, isEditable: true),
            const SizedBox(height: 24),

            EditableChipList(
              items: profile.skills,
              title: 'Skills',
              emptyMessage: 'No skills added yet.',
              addDialogTitle: 'Add Skill',
              addDialogHint: 'Enter a skill',
              onSave: (updatedSkills) {
                profileProvider.updateSkills(updatedSkills);
              },
              isEditable: true,
            ),
            const SizedBox(height: 24),

            EditableChipList(
              items: profile.interests,
              title: 'Interests',
              emptyMessage: 'No interests added yet.',
              addDialogTitle: 'Add Interest',
              addDialogHint: 'Enter an interest',
              onSave: (updatedInterests) {
                profileProvider.updateInterests(updatedInterests);
              },
              isEditable: true,
            ),
            const SizedBox(height: 24),

            BadgeList(badges: badges),
            const SizedBox(height: 50),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(profile) {
    final user = Provider.of<ProfileProvider>(context, listen: false).currentUser;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Consumer<ProfileProvider>(
          builder: (context, provider, _) {
            final imageUrl = provider.currentUserProfile?.profile.profilePicture;
            return ProfilePicture(
              imageUrl: imageUrl,
              size: 100,
              isEditable: true,
            );
          },
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Username: ${user?.username}',
                style: TextStyle(fontSize: 14, color: Colors.grey[700]),
              ),

              Text(
                'Email: ${user?.email}',
                style: TextStyle(fontSize: 14, color: Colors.grey[700]),
              ),
              Text(
                profile.fullName,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (profile.occupation != null && profile.occupation!.isNotEmpty)
                Text(
                  profile.occupation!,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[700],
                  ),
                ),
              if (profile.location != null && profile.location!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 4),
                    Text(
                      profile.location!,
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ],
              if (profile.phone != null && profile.phone!.isNotEmpty) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.phone, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 4),
                    Text(
                      profile.phone!,
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              if (profile.bio != null && profile.bio!.isNotEmpty)
                Text(
                  profile.bio!,
                  style: const TextStyle(fontSize: 14),
                ),

              const SizedBox(height: 12),
              Consumer<ProfileProvider>(
                builder: (context, provider, _) {
                  final user = provider.currentUser;
                  if (user == null) return SizedBox();

                  return DropdownButton<MentorshipStatus>(
                    value: user.mentorshipStatus,
                    items: MentorshipStatus.values
                        .map((status) => DropdownMenuItem(
                      value: status,
                      child: Text(status.name),
                    ))
                        .toList(),
                    onChanged: (value) async {
                      if (value != null) {
                        await provider.updateMentorshipStatus(value);
                        await provider.fetchUserDetails(int.parse(user.id));
                      }
                    },
                    hint: const Text("Change mentorship status"),
                  );
                },
              ),

            ],
          ),
        ),
      ],
    );
  }


}