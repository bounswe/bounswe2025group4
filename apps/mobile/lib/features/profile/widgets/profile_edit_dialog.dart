import 'package:flutter/material.dart';
import '../../../core/models/user.dart';

class ProfileEditDialog extends StatefulWidget {
  final User user;

  const ProfileEditDialog({
    super.key,
    required this.user,
  });

  @override
  State<ProfileEditDialog> createState() => _ProfileEditDialogState();
}

class _ProfileEditDialogState extends State<ProfileEditDialog> {
  late final TextEditingController _fullNameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _locationController;
  late final TextEditingController _occupationController;
  late final TextEditingController _bioController;

  @override
  void initState() {
    super.initState();
    _fullNameController = TextEditingController(text: widget.user.fullName);
    _phoneController = TextEditingController(text: widget.user.phone);
    _locationController = TextEditingController(text: widget.user.location);
    _occupationController = TextEditingController(text: widget.user.occupation);
    _bioController = TextEditingController(text: widget.user.bio);
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _locationController.dispose();
    _occupationController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    String? errorText;
    void trySave() {
      if (_fullNameController.text.trim().isEmpty ||
          _phoneController.text.trim().isEmpty ||
          _locationController.text.trim().isEmpty ||
          _occupationController.text.trim().isEmpty ||
          _bioController.text.trim().isEmpty) {
        errorText = 'Please fill all fields.';
        (context as Element).markNeedsBuild();
        return;
      }
      final updatedUser = widget.user.copyWith(
        fullName: _fullNameController.text,
        phone: _phoneController.text,
        location: _locationController.text,
        occupation: _occupationController.text,
        bio: _bioController.text,
      );
      Navigator.pop(context, updatedUser);
    }
    return StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: const Text('Edit Profile'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _fullNameController,
                decoration: const InputDecoration(
                  labelText: 'Full Name',
                  icon: Icon(Icons.person),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _phoneController,
                decoration: const InputDecoration(
                  labelText: 'Phone',
                  icon: Icon(Icons.phone),
                ),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _locationController,
                decoration: const InputDecoration(
                  labelText: 'Location',
                  icon: Icon(Icons.location_on),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _occupationController,
                decoration: const InputDecoration(
                  labelText: 'Occupation',
                  icon: Icon(Icons.work),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _bioController,
                decoration: const InputDecoration(
                  labelText: 'About',
                  icon: Icon(Icons.description),
                ),
                maxLines: 3,
              ),
              if (errorText != null) ...[
                const SizedBox(height: 12),
                Text(errorText!, style: const TextStyle(color: Colors.red)),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              setState(trySave);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
} 