import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/profile_provider.dart';
import '../widgets/profile_picture.dart';
import '../../../core/widgets/a11y.dart';
import '../widgets/work_experience_list.dart';
import '../widgets/education_list.dart';
import '../widgets/badge_list.dart';
import '../../../core/models/mentorship_status.dart';

class UserProfileView extends StatefulWidget {
  final int userId;

  const UserProfileView({
    super.key,
    required this.userId,
  });

  @override
  State<UserProfileView> createState() => _UserProfileViewState();
}

class _UserProfileViewState extends State<UserProfileView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
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

  @override
  Widget build(BuildContext context) {
    final profileProvider = Provider.of<ProfileProvider>(context);
    final userProfile = profileProvider.viewedProfile;
    final user = profileProvider.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: Text(userProfile?.profile.fullName ?? 'User Profile'),
      ),
      body: profileProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : userProfile == null
          ? Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Failed to load user profile'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                profileProvider.fetchUserProfile(widget.userId);
              },
              child: const Text('Try Again'),
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
                      errorBuilder: (context, error, stackTrace) => Container(
                        width: 100,
                        height: 100,
                        color: Colors.grey[300],
                        child: Icon(Icons.person, size: 50, color: Colors.grey[600]),
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
                      if (user?.mentorshipStatus == MentorshipStatus.MENTOR)                        Padding(
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
                              const A11y(label: 'Location', child: Icon(Icons.location_on, size: 16, color: Colors.grey)),
                              const SizedBox(width: 4),
                              Text(
                                userProfile.profile.location!,
                                style: TextStyle(color: Colors.grey[600]),
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
                'Skills',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: userProfile.profile.skills.map((skill) {
                  return Chip(label: Text(skill));
                }).toList(),
              ),
              const SizedBox(height: 24),
            ],
            if (userProfile.profile.interests.isNotEmpty) ...[
              Text(
                'Interests',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: userProfile.profile.interests.map((interest) {
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