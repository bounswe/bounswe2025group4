import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import '../../../core/providers/profile_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/widgets/a11y.dart';

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
  Future<Uint8List?> _fetchImageWithAuth(String url, String token) async {
    try {
      final response = await http.get(Uri.parse(url), headers: {
        'Authorization': 'Bearer $token',
      });

      if (response.statusCode == 200) {
        return response.bodyBytes;
      } else {
        return null;
      }
    } catch (e) {
      return null;
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
        final profilePictureUrl = provider.currentUserProfile?.profile.profilePicture ?? '';
        final token = Provider.of<AuthProvider>(context, listen: false).token ?? '';
        return GestureDetector(
          onTap: widget.isEditable ? () => _pickImage(context) : null,
          child: Stack(
            alignment: Alignment.center,
            children: [
              FutureBuilder<Uint8List?>(
                future: profilePictureUrl.isNotEmpty
                    ? _fetchImageWithAuth(profilePictureUrl, token)
                    : Future.value(null),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return CircleAvatar(
                      radius: widget.size / 2,
                      backgroundColor: Colors.grey[300],
                      child: const CircularProgressIndicator(),
                    );
                  } else if (snapshot.hasData) {
                    return A11y(
                      label: 'User profile picture',
                      child: CircleAvatar(
                        radius: widget.size / 2,
                        backgroundImage: MemoryImage(snapshot.data!),
                      ),
                    );
                  } else {
                    return A11y(
                      label: 'Default profile picture',
                      child: CircleAvatar(
                        radius: widget.size / 2,
                        backgroundColor: Colors.grey[300],
                        child: Icon(Icons.person, size: widget.size / 2, color: Colors.grey[600]),
                      ),
                    );
                  }
                },
              ),

              if (widget.isEditable && profilePictureUrl.isNotEmpty)
                Positioned(
                  bottom: 0,
                  left: 0,
                  child: A11y(
                    label: 'Delete profile picture',
                    child: IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () => _deleteImage(context),
                    ),
                  ),
                ),

              if (widget.isEditable)
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: A11y(
                    label: 'Change profile picture',
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
                ),
            ],
          ),
        );
      },
    );
  }
}