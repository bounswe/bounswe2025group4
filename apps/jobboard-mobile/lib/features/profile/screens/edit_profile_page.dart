import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/profile_provider.dart';
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
  late TextEditingController _locationController;
  late TextEditingController _phoneController;
  late TextEditingController _occupationController;
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
    _locationController = TextEditingController(text: profile?.location);
    _phoneController = TextEditingController(text: profile?.phone);
    _occupationController =
        TextEditingController(text: profile?.occupation);
    final user = Provider.of<ProfileProvider>(context, listen: false).currentUser;
    _usernameController = TextEditingController(text: user?.username);
    _emailController = TextEditingController(text: user?.email);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _bioController.dispose();
    _locationController.dispose();
    _phoneController.dispose();
    _occupationController.dispose();
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
          await profileProvider.updateProfile({
            'fullName': _nameController.text,
            'bio': _bioController.text,
            'location': _locationController.text,
            'phone': _phoneController.text,
            'occupation': _occupationController.text,
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
                  A11y(
                    label: profile?.profilePicture == null
                        ? 'Default profile picture'
                        : 'User profile picture',
                    child: ProfilePicture(
                      size: 100,
                      imageUrl: profile?.profilePicture,
                      isEditable: false,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      children: [
                        TextFormField(
                          controller: _usernameController,
                          decoration: InputDecoration(labelText: AppLocalizations.of(context)!.editProfile_username),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _emailController,
                          decoration: InputDecoration(labelText: AppLocalizations.of(context)!.editProfile_email),
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
                            return null;
                          },
                        ),
                        TextFormField(
                          controller: _occupationController,
                          decoration: InputDecoration(
                            labelText: AppLocalizations.of(context)!.editProfile_occupation,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _locationController,
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(context)!.editProfile_location,
                  prefixIcon: const Icon(Icons.location_on),
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _phoneController,
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(context)!.editProfile_phone,
                  prefixIcon: const Icon(Icons.phone),
                ),
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