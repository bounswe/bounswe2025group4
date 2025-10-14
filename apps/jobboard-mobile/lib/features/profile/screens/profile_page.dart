import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/profile_provider.dart';
import '../../../core/providers/font_size_provider.dart';
import '../../auth/screens/welcome_screen.dart';
import '../../../core/widgets/a11y.dart';
import '../widgets/profile_picture.dart';
import '../widgets/work_experience_list.dart';
import '../widgets/editable_chip_list.dart';
import '../widgets/badge_list.dart';
import '../widgets/education_list.dart';
import 'edit_profile_page.dart';

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
      final profileProvider = Provider.of<ProfileProvider>(
        context,
        listen: false,
      );

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
    final fontSizeProvider = Provider.of<FontSizeProvider>(context);
    final profile = profileProvider.currentUserProfile;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'My Profile',
          style: TextStyle(fontSize: fontSizeProvider.getScaledFontSize(20)),
        ),
        automaticallyImplyLeading: false,
        actions: [
          if (!profileProvider.isLoading && profile != null)
            IconButton(
              icon: const Icon(Icons.edit),
              tooltip: 'Edit profile',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const EditProfilePage()),
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
      body:
          profileProvider.isLoading
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

            _buildFontSizeSelector(),
            const SizedBox(height: 24),

            WorkExperienceList(experiences: experiences, isEditable: true),
            const SizedBox(height: 24),

            EducationList(
              educationHistory: fullProfile.education,
              isEditable: true,
            ),
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
    final user =
        Provider.of<ProfileProvider>(context, listen: false).currentUser;
    final fontSizeProvider = Provider.of<FontSizeProvider>(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Consumer<ProfileProvider>(
          builder: (context, provider, _) {
            final imageUrl =
                provider.currentUserProfile?.profile.profilePicture;
            return A11y(
              label: 'Profile picture. Tap to change.',
              child: ProfilePicture(
                imageUrl: imageUrl,
                size: 100,
                isEditable: true,
              ),
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
                style: TextStyle(
                  fontSize: fontSizeProvider.getScaledFontSize(14),
                  color: Colors.grey[700],
                ),
              ),

              Text(
                'Email: ${user?.email}',
                style: TextStyle(
                  fontSize: fontSizeProvider.getScaledFontSize(14),
                  color: Colors.grey[700],
                ),
              ),
              Text(
                profile.fullName,
                style: TextStyle(
                  fontSize: fontSizeProvider.getScaledFontSize(24),
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (profile.occupation != null && profile.occupation!.isNotEmpty)
                Text(
                  profile.occupation!,
                  style: TextStyle(
                    fontSize: fontSizeProvider.getScaledFontSize(16),
                    color: Colors.grey[700],
                  ),
                ),
              if (profile.location != null && profile.location!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    A11y(
                      label: 'Location',
                      child: Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      profile.location!,
                      style: TextStyle(
                        fontSize: fontSizeProvider.getScaledFontSize(14),
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
              if (profile.phone != null && profile.phone!.isNotEmpty) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    A11y(
                      label: 'Phone',
                      child: Icon(Icons.phone, size: 16, color: Colors.grey[600]),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      profile.phone!,
                      style: TextStyle(
                        fontSize: fontSizeProvider.getScaledFontSize(14),
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              if (profile.bio != null && profile.bio!.isNotEmpty)
                Text(
                  profile.bio!,
                  style: TextStyle(
                    fontSize: fontSizeProvider.getScaledFontSize(14),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFontSizeSelector() {
    return Consumer<FontSizeProvider>(
      builder: (context, fontSizeProvider, _) {
        return Card(
          elevation: 2,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Font Size',
                  style: TextStyle(
                    fontSize: fontSizeProvider.getScaledFontSize(18),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildFontSizeOption(
                        context,
                        fontSizeProvider,
                        FontSizeOption.small,
                        'Small',
                        Icons.text_fields,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildFontSizeOption(
                        context,
                        fontSizeProvider,
                        FontSizeOption.medium,
                        'Medium',
                        Icons.text_fields,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildFontSizeOption(
                        context,
                        fontSizeProvider,
                        FontSizeOption.large,
                        'Large',
                        Icons.text_fields,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFontSizeOption(
    BuildContext context,
    FontSizeProvider fontSizeProvider,
    FontSizeOption option,
    String label,
    IconData icon,
  ) {
    final isSelected = fontSizeProvider.currentFontSize == option;
    final double iconSize =
        option == FontSizeOption.small
            ? 20
            : option == FontSizeOption.medium
            ? 24
            : 28;

    return InkWell(
      onTap: () {
        fontSizeProvider.setFontSize(option);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Font size changed to $label'),
            duration: const Duration(seconds: 1),
          ),
        );
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.blue.withOpacity(0.1) : Colors.transparent,
          border: Border.all(
            color: isSelected ? Colors.blue : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: iconSize,
              color: isSelected ? Colors.blue : Colors.grey.shade600,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: fontSizeProvider.getScaledFontSize(12),
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? Colors.blue : Colors.grey.shade700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
