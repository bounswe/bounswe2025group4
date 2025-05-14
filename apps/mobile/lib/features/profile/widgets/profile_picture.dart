import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/profile_provider.dart';

class ProfilePicture extends StatefulWidget {
  final double size;
  final String? imageUrl;
  final bool isEditable;

  const ProfilePicture({
    super.key,
    this.size = 100,
    this.imageUrl,
    this.isEditable = false,
  });

  @override
  State<ProfilePicture> createState() => _ProfilePictureState();
}

class _ProfilePictureState extends State<ProfilePicture> {
  Future<void> _pickImage(BuildContext context) async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      if (!context.mounted) return;
      final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
      await profileProvider.uploadProfilePicture(File(image.path));

      if (!context.mounted) return;
      await profileProvider.fetchMyProfile();

      if (context.mounted) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Profile picture updated')),
            );
          }
        });
        setState(() {});
      }
    }
  }

  Future<void> _deleteImage(BuildContext context) async {
    try {
      final provider = Provider.of<ProfileProvider>(context, listen: false);
      await provider.deleteProfilePicture();

      if (context.mounted) {
        await provider.fetchMyProfile();
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Profile picture deleted')),
            );
          }
        });
        setState(() {});
      }
    } catch (e) {
      if (context.mounted) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Failed to delete profile picture: $e')),
            );
          }
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ProfileProvider>(
      builder: (context, provider, child) {
        final profilePictureUrl = provider.currentUserProfile?.profile.profilePicture;

        return GestureDetector(
          onTap: widget.isEditable ? () => _pickImage(context) : null,
          child: Stack(
            alignment: Alignment.center,
            children: [
              CircleAvatar(
                key: ValueKey(profilePictureUrl),
                radius: widget.size / 2,
                backgroundColor: Colors.grey[300],
                child: (profilePictureUrl == null || profilePictureUrl.isEmpty || profilePictureUrl.contains('placeholder'))
                    ? Icon(
                  Icons.person,
                  size: widget.size / 2,
                  color: Colors.grey[600],
                )
                    : ClipOval(
                  child: Image.network(
                    profilePictureUrl,
                    key: UniqueKey(),
                    width: widget.size,
                    height: widget.size,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Icon(Icons.person),
                  ),
                ),
              ),


              if (widget.isEditable && (profilePictureUrl?.isNotEmpty ?? false))
                Positioned(
                  bottom: 0,
                  left: 0,
                  child: IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: () => _deleteImage(context),
                  ),
                ),


              if (widget.isEditable)
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.blue,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.camera_alt, color: Colors.white, size: 16),
                      onPressed: () => _pickImage(context),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}