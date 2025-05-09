import 'package:flutter/material.dart';
import '../../../core/models/user.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/image_service.dart';
import 'profile_edit_dialog.dart';

class ProfileHeader extends StatelessWidget {
  final User user;
  final ImageService _imageService;

  ProfileHeader({
    super.key,
    required this.user,
  }) : _imageService = ImageService();

  Future<void> _pickImage(BuildContext context, bool fromCamera) async {
    try {
      final file = await _imageService.pickImage(fromCamera: fromCamera);
      if (file != null) {
        // Upload photo
        final imageUrl = await _imageService.uploadImage(file);
        if (imageUrl != null) {
          Provider.of<AuthProvider>(context, listen: false)
              .updateProfile(user.copyWith(profilePicture: imageUrl));
        } else {
          // Inform user in case of error
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Failed to upload image. Please try again.'),
                backgroundColor: Colors.red,
              ),
            );
          }
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _removeImage(BuildContext context) async {
    if (user.profilePicture != null) {
      // TODO: Delete photo from API
      Provider.of<AuthProvider>(context, listen: false)
          .updateProfile(user.copyWith(profilePicture: null));
    }
  }

  void _showImagePickerDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Profile Picture'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_camera),
              title: const Text('Take Photo'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(context, true);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Choose from Gallery'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(context, false);
              },
            ),
            if (user.profilePicture != null)
              ListTile(
                leading: const Icon(Icons.delete, color: Colors.red),
                title: const Text('Remove Photo', style: TextStyle(color: Colors.red)),
                onTap: () {
                  Navigator.pop(context);
                  _removeImage(context);
                },
              ),
          ],
        ),
      ),
    );
  }

  void _editProfile(BuildContext context) async {
    // Open profile edit dialog
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
                GestureDetector(
                  onTap: () => _showImagePickerDialog(context),
                  child: Stack(
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
                      if (user.isMentor)
                        Positioned(
                          left: 0,
                          bottom: 0,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: Colors.green,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.school,
                              size: 20,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.primary,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.camera_alt,
                            size: 20,
                            color: Theme.of(context).colorScheme.onPrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Row(
                              children: [
                                Text(
                                  user.fullName ?? user.username,
                                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                if (user.isMentor) ...[
                                  const SizedBox(width: 8),
                                  Chip(
                                    label: Text('Mentor', style: TextStyle(color: Colors.white)),
                                    backgroundColor: Colors.green,
                                    avatar: Icon(Icons.school, color: Colors.white, size: 18),
                                  ),
                                ],
                              ],
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