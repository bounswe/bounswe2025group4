import 'package:flutter/material.dart';
import '../../../core/models/user.dart';
import 'package:provider/provider.dart';
import 'profile_edit_dialog.dart';
import '../../../core/providers/auth_provider.dart';

class ProfileInfoCard extends StatelessWidget {
  final User user;

  const ProfileInfoCard({
    super.key,
    required this.user,
  });

  void _editProfile(BuildContext context) async {
    final updatedUser = await showDialog<User>(
      context: context,
      builder: (context) => ProfileEditDialog(user: user),
    );
    if (updatedUser != null) {
      Provider.of<AuthProvider>(context, listen: false).updateProfile(updatedUser);
    }
  }

  void _editListDialog(BuildContext context, String title, List<String> items, Function(List<String>) onSave) async {
    final controller = TextEditingController(text: items.join(", "));
    String? errorText;
    await showDialog<List<String>>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text('Edit $title'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: controller,
                decoration: const InputDecoration(hintText: 'Comma separated'),
              ),
              if (errorText != null) ...[
                const SizedBox(height: 10),
                Text(errorText!, style: const TextStyle(color: Colors.red)),
              ],
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            FilledButton(
              onPressed: () {
                final values = controller.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
                if (values.isEmpty) {
                  setState(() { errorText = 'Please enter at least one value.'; });
                  return;
                }
                Navigator.pop(context, values);
                onSave(values);
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        elevation: 3,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'About',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit, size: 20),
                    onPressed: () => _editProfile(context),
                    tooltip: 'Edit',
                  ),
                ],
              ),
              if (user.bio != null && user.bio!.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(
                  user.bio!,
                  style: Theme.of(context).textTheme.bodyLarge,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 18),
              ],
              if (user.location != null) ...[
                _buildInfoRow(
                  context,
                  Icons.location_on,
                  user.location!,
                ),
                const SizedBox(height: 8),
              ],
              if (user.email.isNotEmpty)
                _buildInfoRow(
                  context,
                  Icons.email,
                  user.email,
                ),
              if (user.phone != null) ...[
                const SizedBox(height: 8),
                _buildInfoRow(
                  context,
                  Icons.phone,
                  user.phone!,
                ),
              ],
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Skills',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit, size: 20),
                    onPressed: () => _editListDialog(context, 'Skills', user.skills, (newSkills) {
                      Provider.of<AuthProvider>(context, listen: false).updateProfile(user.copyWith(skills: newSkills));
                    }),
                    tooltip: 'Edit',
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: user.skills
                    .map((skill) => Chip(
                          label: Text(skill),
                        ))
                    .toList(),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Interests',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit, size: 20),
                    onPressed: () => _editListDialog(context, 'Interests', user.interests, (newInterests) {
                      Provider.of<AuthProvider>(context, listen: false).updateProfile(user.copyWith(interests: newInterests));
                    }),
                    tooltip: 'Edit',
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: user.interests
                    .map((interest) => Chip(
                          label: Text(interest),
                        ))
                    .toList(),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Text(
                    'Are you a mentor?',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(width: 10),
                  user.isMentor
                      ? Chip(
                          label: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Icon(Icons.school, color: Colors.green, size: 18),
                              SizedBox(width: 4),
                              Text('Yes', style: TextStyle(color: Colors.green)),
                            ],
                          ),
                          backgroundColor: Colors.green.withOpacity(0.1),
                          shape: StadiumBorder(),
                        )
                      : Chip(
                          label: const Text('No', style: TextStyle(color: Colors.red)),
                          backgroundColor: Colors.red.withOpacity(0.1),
                          shape: const StadiumBorder(),
                        ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, IconData icon, String text) {
    return Row(
      children: [
        Icon(
          icon,
          size: 20,
          color: Theme.of(context).colorScheme.secondary,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
      ],
    );
  }
} 