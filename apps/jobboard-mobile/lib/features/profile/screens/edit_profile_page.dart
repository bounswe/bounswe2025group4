import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/profile_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../widgets/profile_picture.dart';
import '../../../generated/l10n/app_localizations.dart';
import '../../../core/widgets/a11y.dart';

class EditProfilePage extends StatefulWidget {
  const EditProfilePage({super.key});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _bioController;
  late TextEditingController _usernameController;
  late TextEditingController _emailController;

  @override
  void initState() {
    super.initState();
    final profile = Provider.of<ProfileProvider>(context, listen: false)
        .currentUserProfile
        ?.profile;
    _nameController = TextEditingController(text: profile?.fullName);
    _bioController = TextEditingController(text: profile?.bio);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.currentUser;
    _usernameController = TextEditingController(text: user?.username);
    _emailController = TextEditingController(text: user?.email);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _bioController.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _saveProfile() async {
    HapticFeedback.mediumImpact();
    if (_formKey.currentState!.validate()) {
      final profileProvider =
      Provider.of<ProfileProvider>(context, listen: false);
      
      try {
        if (profileProvider.currentUserProfile == null) {
          final nameParts = _nameController.text.trim().split(' ');
          final firstName = nameParts.isNotEmpty ? nameParts.first : '';
          final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';
          
          await profileProvider.createProfile({
            'firstName': firstName,
            'lastName': lastName,
            'bio': _bioController.text,
          });
          
          if (profileProvider.currentUser != null) {
            await profileProvider.updateUser(
              profileProvider.currentUser!.id,
              {
                'username': _usernameController.text,
                'email': _emailController.text,
              },
            );
          }
        } else {
          // Split fullName into firstName and lastName for backend
          final nameParts = _nameController.text.trim().split(' ');
          final firstName = nameParts.isNotEmpty ? nameParts.first : '';
          final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';
          
          await profileProvider.updateProfile({
            'firstName': firstName,
            'lastName': lastName,
            'bio': _bioController.text,
          });
          // Username update disabled - backend endpoint not available
          // if (profileProvider.currentUser != null) {
          //   await profileProvider.updateUser(
          //     profileProvider.currentUser!.id,
          //     {
          //       'username': _usernameController.text,
          //     },
          //   );
          // }
        }
        
        HapticFeedback.heavyImpact();
        Navigator.pop(context);
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error saving profile: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = Provider.of<ProfileProvider>(context)
        .currentUserProfile
        ?.profile;

    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.editProfile_title),
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            tooltip: AppLocalizations.of(context)!.editProfile_saveChanges,
            onPressed: _saveProfile,
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    children: [
                      A11y(
                        label: profile?.profilePicture == null
                            ? 'Default profile picture'
                            : 'User profile picture',
                        child: ProfilePicture(
                          size: 100,
                          imageUrl: profile?.profilePicture,
                          isEditable: true,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Tap to change',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      children: [
                        TextFormField(
                          controller: _usernameController,
                          enabled: false, // Username update not supported by backend
                          decoration: InputDecoration(
                            labelText: AppLocalizations.of(context)!.editProfile_username,
                            hintText: 'Username cannot be changed',
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _emailController,
                          enabled: false, // Email update not supported by backend
                          decoration: InputDecoration(
                            labelText: AppLocalizations.of(context)!.editProfile_email,
                            hintText: 'Email cannot be changed',
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _nameController,
                          decoration: InputDecoration(
                            labelText: AppLocalizations.of(context)!.editProfile_fullName,
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter your name';
                            }
                            // Check if only one word is entered
                            final nameParts = value.trim().split(' ');
                            if (nameParts.length < 2) {
                              return 'Please enter your name and surname';
                            }
                            return null;
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _bioController,
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(context)!.editProfile_bio,
                  alignLabelWithHint: true,
                ),
                maxLines: 3,
              ),
            ],
          ),
        ),
      ),
    );
  }
}