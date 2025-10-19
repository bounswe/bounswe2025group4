import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../generated/l10n/app_localizations.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/profile_provider.dart';
import '../../../core/providers/font_size_provider.dart';
import '../../../core/providers/locale_provider.dart';
import '../../auth/screens/welcome_screen.dart';
import '../../../core/widgets/a11y.dart';
import '../../auth/screens/welcome_screen.dart' show ThemeToggleSwitch;
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
          AppLocalizations.of(context)!.profilePage_title,
          style: TextStyle(fontSize: fontSizeProvider.getScaledFontSize(20)),
        ),
        automaticallyImplyLeading: false,
        actions: [
          if (!profileProvider.isLoading && profile != null)
            IconButton(
              icon: const Icon(Icons.edit),
              tooltip: AppLocalizations.of(context)!.profilePage_editProfile,
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const EditProfilePage()),
                );
              },
            ),
            IconButton(
              icon: const Icon(Icons.logout),
              tooltip: AppLocalizations.of(context)!.profilePage_logout,
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
              ? Center(child: Text(AppLocalizations.of(context)!.profilePage_failedToLoad))
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

            _buildLanguageSelector(),
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
              title: AppLocalizations.of(context)!.profilePage_skills,
              emptyMessage: AppLocalizations.of(context)!.profilePage_noSkills,
              addDialogTitle: AppLocalizations.of(context)!.profilePage_addSkill,
              addDialogHint: AppLocalizations.of(context)!.profilePage_enterSkill,
              onSave: (updatedSkills) {
                // For now, we'll need to implement individual skill management
                // This requires UI changes to support add/edit/delete individual skills
                // For now, we'll just refresh the profile
                profileProvider.fetchMyProfile();
              },
              isEditable: true,
            ),
            const SizedBox(height: 24),

            EditableChipList(
              items: profile.interests,
              title: AppLocalizations.of(context)!.profilePage_interests,
              emptyMessage: AppLocalizations.of(context)!.profilePage_noInterests,
              addDialogTitle: AppLocalizations.of(context)!.profilePage_addInterest,
              addDialogHint: AppLocalizations.of(context)!.profilePage_enterInterest,
              onSave: (updatedInterests) {
                // For now, we'll need to implement individual interest management
                // This requires UI changes to support add/edit/delete individual interests
                // For now, we'll just refresh the profile
                profileProvider.fetchMyProfile();
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
                AppLocalizations.of(context)!.profilePage_username(user?.username ?? ''),
                style: TextStyle(
                  fontSize: fontSizeProvider.getScaledFontSize(14),
                  color: Colors.grey[700],
                ),
              ),

              Row(
                children: [
                  Expanded(
                    child: Text(
                      AppLocalizations.of(context)!.profilePage_email(user?.email ?? ''),
                      style: TextStyle(
                        fontSize: fontSizeProvider.getScaledFontSize(14),
                        color: Colors.grey[700],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Reuse the same theme toggle used on the welcome screen
                  const ThemeToggleSwitch(),
                ],
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
                  AppLocalizations.of(context)!.profilePage_fontSize,
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
                        AppLocalizations.of(context)!.profilePage_small,
                        Icons.text_fields,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildFontSizeOption(
                        context,
                        fontSizeProvider,
                        FontSizeOption.medium,
                        AppLocalizations.of(context)!.profilePage_medium,
                        Icons.text_fields,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildFontSizeOption(
                        context,
                        fontSizeProvider,
                        FontSizeOption.large,
                        AppLocalizations.of(context)!.profilePage_large,
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
            content: Text(AppLocalizations.of(context)!.profilePage_fontSizeChanged(label)),
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

  Widget _buildLanguageSelector() {
    return Consumer<LocaleProvider>(
      builder: (context, localeProvider, _) {
        return Card(
          elevation: 2,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.language, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      AppLocalizations.of(context)!.profilePage_language,
                      style: TextStyle(
                        fontSize: Provider.of<FontSizeProvider>(context).getScaledFontSize(18),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ...LocaleProvider.supportedLocales.map((locale) {
                  final isSelected = localeProvider.locale.languageCode == locale.languageCode;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: InkWell(
                      onTap: () async {
                        await localeProvider.setLocale(locale);
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              AppLocalizations.of(context)!.profilePage_languageChanged(
                                localeProvider.getLocaleDisplayName(locale),
                              ),
                            ),
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                        decoration: BoxDecoration(
                          color: isSelected ? Colors.blue.withOpacity(0.1) : Colors.transparent,
                          border: Border.all(
                            color: isSelected ? Colors.blue : Colors.grey.shade300,
                            width: isSelected ? 2 : 1,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                localeProvider.getLocaleDisplayName(locale),
                                style: TextStyle(
                                  fontSize: Provider.of<FontSizeProvider>(context).getScaledFontSize(16),
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  color: isSelected ? Colors.blue : Colors.grey.shade700,
                                ),
                              ),
                            ),
                            if (isSelected)
                              const Icon(
                                Icons.check_circle,
                                color: Colors.blue,
                                size: 20,
                              ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ],
            ),
          ),
        );
      },
    );
  }
}
