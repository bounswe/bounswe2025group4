import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/profile_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/widgets/a11y.dart';
import '../widgets/work_experience_list.dart';
import '../widgets/education_list.dart';
import '../widgets/badge_list.dart';
import '../../../core/models/mentorship_status.dart';
import '../../../generated/l10n/app_localizations.dart';

class UserProfileView extends StatefulWidget {
  final int userId;

  const UserProfileView({super.key, required this.userId});

  @override
  State<UserProfileView> createState() => _UserProfileViewState();
}

class _UserProfileViewState extends State<UserProfileView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final profileProvider = Provider.of<ProfileProvider>(
        context,
        listen: false,
      );
      profileProvider.fetchUserProfile(widget.userId);
      profileProvider.fetchUserDetails(widget.userId);
    });
  }

  late ProfileProvider _profileProvider;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _profileProvider = Provider.of<ProfileProvider>(context, listen: false);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _profileProvider.clearViewedProfile();
    });
    super.dispose();
  }

  Future<void> _showReportDialog() async {
    final result = await showDialog<Map<String, String>>(
      context: context,
      builder: (BuildContext context) {
        String selectedReason = 'SPAM';
        final descriptionController = TextEditingController();

        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Report Profile'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Reason for reporting:'),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: selectedReason,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'SPAM', child: Text('Spam')),
                        DropdownMenuItem(
                          value: 'FAKE',
                          child: Text('Fake Profile'),
                        ),
                        DropdownMenuItem(
                          value: 'OFFENSIVE',
                          child: Text('Offensive Content'),
                        ),
                        DropdownMenuItem(
                          value: 'HARASSMENT',
                          child: Text('Harassment'),
                        ),
                        DropdownMenuItem(
                          value: 'MISINFORMATION',
                          child: Text('Misinformation'),
                        ),
                        DropdownMenuItem(value: 'OTHER', child: Text('Other')),
                      ],
                      onChanged: (value) {
                        setState(() {
                          selectedReason = value!;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    const Text('Additional details (optional):'),
                    const SizedBox(height: 8),
                    TextField(
                      controller: descriptionController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        hintText: 'Provide more context...',
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop({
                      'reason': selectedReason,
                      'description': descriptionController.text,
                    });
                  },
                  child: const Text('Report'),
                ),
              ],
            );
          },
        );
      },
    );

    if (result != null && mounted) {
      try {
        final api = ApiService(authProvider: context.read<AuthProvider>());
        await api.reportContent(
          entityType: 'PROFILE',
          entityId: widget.userId,
          reasonType: result['reason']!,
          description: result['description'],
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.white),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Thank you for reporting. We will review it soon.',
                    ),
                  ),
                ],
              ),
              backgroundColor: Colors.green,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          );
        }
      } on SocketException {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Row(
                children: [
                  Icon(Icons.wifi_off, color: Colors.white),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text('Failed: Please check your connection.'),
                  ),
                ],
              ),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              action: SnackBarAction(
                label: 'Retry',
                textColor: Colors.white,
                onPressed: () {
                  ApiService(
                    authProvider: context.read<AuthProvider>(),
                  ).reportContent(
                    entityType: 'PROFILE',
                    entityId: widget.userId,
                    reasonType: result['reason']!,
                    description: result['description'],
                  );
                },
              ),
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          // Parse the error message to provide better feedback
          String errorMessage = 'Failed to submit report';

          final errorString = e.toString().toLowerCase();
          if (errorString.contains('already reported') ||
              errorString.contains('duplicate')) {
            errorMessage = 'You have already reported this profile';
          } else if (errorString.contains('unauthorized') ||
              errorString.contains('403')) {
            errorMessage = 'You need to be logged in to report';
          } else if (errorString.contains('400') ||
              errorString.contains('bad request')) {
            errorMessage = 'Invalid report data. Please try again';
          } else if (errorString.contains('not found') ||
              errorString.contains('404')) {
            errorMessage = 'This profile no longer exists';
          } else if (errorString.contains('500') ||
              errorString.contains('server error')) {
            errorMessage = 'Server error. Please try again later';
          }

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.white),
                  const SizedBox(width: 12),
                  Expanded(child: Text(errorMessage)),
                ],
              ),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              duration: const Duration(seconds: 4),
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileProvider = Provider.of<ProfileProvider>(context);
    final userProfile = profileProvider.viewedProfile;
    final user = profileProvider.currentUser;
    final authProvider = context.read<AuthProvider>();
    final currentUserId = authProvider.currentUser?.id;
    final isOwnProfile =
        currentUserId != null && int.tryParse(currentUserId) == widget.userId;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          userProfile?.profile.fullName ??
              AppLocalizations.of(context)!.userProfile_title,
        ),
        actions: [
          if (!isOwnProfile && userProfile != null)
            IconButton(
              icon: const Icon(Icons.flag_outlined),
              tooltip: 'Report Profile',
              onPressed: _showReportDialog,
            ),
        ],
      ),
      body:
          profileProvider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : userProfile == null
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(AppLocalizations.of(context)!.userProfile_loadError),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        profileProvider.fetchUserProfile(widget.userId);
                      },
                      child: Text(
                        AppLocalizations.of(context)!.userProfile_tryAgain,
                      ),
                    ),
                  ],
                ),
              )
              : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        A11y(
                          label: 'User profile picture',
                          child: ClipOval(
                            child: Image.network(
                              userProfile.profile.profilePicture ?? '',
                              key: ValueKey(userProfile.profile.profilePicture),
                              width: 100,
                              height: 100,
                              fit: BoxFit.cover,
                              errorBuilder:
                                  (context, error, stackTrace) => Container(
                                    width: 100,
                                    height: 100,
                                    color: Colors.grey[300],
                                    child: Icon(
                                      Icons.person,
                                      size: 50,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                userProfile.profile.fullName,
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if (user?.mentorshipStatus ==
                                  MentorshipStatus.MENTOR)
                                Padding(
                                  padding: const EdgeInsets.only(top: 4.0),
                                  child: Text(
                                    'Mentor',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                      color: Colors.green[700],
                                    ),
                                  ),
                                ),
                              if (userProfile.profile.occupation != null)
                                Text(
                                  userProfile.profile.occupation!,
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey[700],
                                  ),
                                ),
                              if (userProfile.profile.location != null)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: Row(
                                    children: [
                                      const A11y(
                                        label: 'Location',
                                        child: Icon(
                                          Icons.location_on,
                                          size: 16,
                                          color: Colors.grey,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        userProfile.profile.location!,
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              if (userProfile.profile.bio != null)
                                Padding(
                                  padding: const EdgeInsets.only(top: 16),
                                  child: Text(
                                    userProfile.profile.bio!,
                                    style: const TextStyle(fontSize: 14),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    WorkExperienceList(
                      experiences: userProfile.experience,
                      isEditable: false,
                    ),
                    const SizedBox(height: 24),
                    EducationList(
                      educationHistory: userProfile.education,
                      isEditable: false,
                    ),
                    const SizedBox(height: 24),
                    if (userProfile.profile.skills.isNotEmpty) ...[
                      Text(
                        AppLocalizations.of(context)!.userProfile_skills,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children:
                            userProfile.profile.skills.map((skill) {
                              return Chip(label: Text(skill));
                            }).toList(),
                      ),
                      const SizedBox(height: 24),
                    ],
                    if (userProfile.profile.interests.isNotEmpty) ...[
                      Text(
                        AppLocalizations.of(context)!.userProfile_interests,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children:
                            userProfile.profile.interests.map((interest) {
                              return Chip(label: Text(interest));
                            }).toList(),
                      ),
                      const SizedBox(height: 24),
                    ],
                    BadgeList(badges: userProfile.badges),
                    const SizedBox(height: 50),
                  ],
                ),
              ),
    );
  }
}
