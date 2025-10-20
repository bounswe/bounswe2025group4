import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import '../../../core/providers/profile_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/widgets/a11y.dart';
import '../../../generated/l10n/app_localizations.dart';

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
              SnackBar(content: Text(AppLocalizations.of(context)!.common_save)),
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
              SnackBar(content: Text(AppLocalizations.of(context)!.common_delete)),
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
              SnackBar(content: Text(AppLocalizations.of(context)!.common_error)),
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
                      child: const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    );
                  } else if (snapshot.hasData) {
                    return A11y(
                      label: widget.isEditable 
                          ? AppLocalizations.of(context)!.editProfile_title
                          : '',
                      child: CircleAvatar(
                        radius: widget.size / 2,
                        backgroundImage: MemoryImage(snapshot.data!),
                      ),
                    );
                  } else {
                    return A11y(
                      label: widget.isEditable 
                          ? AppLocalizations.of(context)!.editProfile_title
                          : '',
                      child: CircleAvatar(
                        radius: widget.size / 2,
                        backgroundColor: Colors.grey[300],
                        child: Icon(Icons.person, size: widget.size / 2, color: Colors.grey[600]),
                      ),
                    );
                  }
                },
              ),

              // Small delete button at bottom-left
              if (widget.isEditable && profilePictureUrl.isNotEmpty)
                Positioned(
                  left: 6,
                  bottom: 6,
                  child: A11y(
                    label: AppLocalizations.of(context)!.common_delete,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.9),
                        shape: BoxShape.circle,
                      ),
                      height: 28,
                      width: 28,
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        iconSize: 16,
                        icon: const Icon(Icons.delete, color: Colors.white),
                        onPressed: () => _deleteImage(context),
                        tooltip: AppLocalizations.of(context)!.common_delete,
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