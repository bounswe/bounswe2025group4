import 'package:flutter/material.dart';
import '../../../../core/models/user.dart';
import 'package:provider/provider.dart';
import '../../../../core/providers/auth_provider.dart';

class ExperienceTab extends StatelessWidget {
  final User user;

  const ExperienceTab({
    super.key,
    required this.user,
  });

  String _formatDate(String? date) {
    if (date == null) return 'Present';
    final parts = date.split('-');
    if (parts.length != 2) return date;
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    final month = int.tryParse(parts[1]);
    if (month == null || month < 1 || month > 12) return date;
    return '${months[month - 1]} ${parts[0]}';
  }

  void _editEducationDialog(BuildContext context, {Education? education, required Function(Education) onSave}) {
    final schoolController = TextEditingController(text: education?.school ?? '');
    final degreeController = TextEditingController(text: education?.degree ?? '');
    final fieldController = TextEditingController(text: education?.field ?? '');
    final startDateController = TextEditingController(text: education?.startDate ?? '');
    final endDateController = TextEditingController(text: education?.endDate ?? '');
    String? errorText;
    void trySave(StateSetter setState) {
      if (schoolController.text.trim().isEmpty ||
          degreeController.text.trim().isEmpty ||
          fieldController.text.trim().isEmpty ||
          startDateController.text.trim().isEmpty) {
        setState(() { errorText = 'Please fill all required fields.'; });
        return;
      }
      Navigator.pop(context, Education(
        school: schoolController.text,
        degree: degreeController.text,
        field: fieldController.text,
        startDate: startDateController.text,
        endDate: endDateController.text.isEmpty ? null : endDateController.text,
      ));
    }
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text(education == null ? 'Add Education' : 'Edit Education'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: schoolController, decoration: const InputDecoration(labelText: 'School *')),
                TextField(controller: degreeController, decoration: const InputDecoration(labelText: 'Degree *')),
                TextField(controller: fieldController, decoration: const InputDecoration(labelText: 'Field *')),
                TextField(controller: startDateController, decoration: const InputDecoration(labelText: 'Start Date (YYYY-MM) *')),
                TextField(controller: endDateController, decoration: const InputDecoration(labelText: 'End Date (YYYY-MM, optional)')),
                if (errorText != null) ...[
                  const SizedBox(height: 10),
                  Text(errorText!, style: const TextStyle(color: Colors.red)),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            FilledButton(
              onPressed: () => trySave(setState),
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    ).then((result) {
      if (result != null) onSave(result);
    });
  }

  void _editExperienceDialog(BuildContext context, {Experience? experience, required Function(Experience) onSave}) {
    final companyController = TextEditingController(text: experience?.company ?? '');
    final positionController = TextEditingController(text: experience?.position ?? '');
    final descriptionController = TextEditingController(text: experience?.description ?? '');
    final startDateController = TextEditingController(text: experience?.startDate ?? '');
    final endDateController = TextEditingController(text: experience?.endDate ?? '');
    String? errorText;
    void trySave(StateSetter setState) {
      if (companyController.text.trim().isEmpty ||
          positionController.text.trim().isEmpty ||
          descriptionController.text.trim().isEmpty ||
          startDateController.text.trim().isEmpty) {
        setState(() { errorText = 'Please fill all required fields.'; });
        return;
      }
      Navigator.pop(context, Experience(
        company: companyController.text,
        position: positionController.text,
        description: descriptionController.text,
        startDate: startDateController.text,
        endDate: endDateController.text.isEmpty ? null : endDateController.text,
      ));
    }
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text(experience == null ? 'Add Experience' : 'Edit Experience'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: companyController, decoration: const InputDecoration(labelText: 'Company *')),
                TextField(controller: positionController, decoration: const InputDecoration(labelText: 'Position *')),
                TextField(controller: descriptionController, decoration: const InputDecoration(labelText: 'Description *')),
                TextField(controller: startDateController, decoration: const InputDecoration(labelText: 'Start Date (YYYY-MM) *')),
                TextField(controller: endDateController, decoration: const InputDecoration(labelText: 'End Date (YYYY-MM, optional)')),
                if (errorText != null) ...[
                  const SizedBox(height: 10),
                  Text(errorText!, style: const TextStyle(color: Colors.red)),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            FilledButton(
              onPressed: () => trySave(setState),
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    ).then((result) {
      if (result != null) onSave(result);
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Education',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.add),
                  tooltip: 'Add Education',
                  onPressed: () => _editEducationDialog(context, onSave: (newEdu) {
                    final newList = List<Education>.from(user.education)..add(newEdu);
                    authProvider.updateProfile(user.copyWith(education: newList));
                  }),
                ),
              ],
            ),
            const SizedBox(height: 14),
            if (user.education.isNotEmpty)
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: user.education.length,
                itemBuilder: (context, index) {
                  final education = user.education[index];
                  return Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 2,
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Stack(
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                education.school,
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '${education.degree} - ${education.field}',
                                style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w500),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${_formatDate(education.startDate)} - ${_formatDate(education.endDate)}',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Theme.of(context).colorScheme.secondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Positioned(
                          right: 0,
                          top: 0,
                          child: Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit, size: 18),
                                tooltip: 'Edit',
                                onPressed: () => _editEducationDialog(context, education: education, onSave: (updatedEdu) {
                                  final newList = List<Education>.from(user.education);
                                  newList[index] = updatedEdu;
                                  authProvider.updateProfile(user.copyWith(education: newList));
                                }),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete, size: 18),
                                tooltip: 'Delete',
                                onPressed: () {
                                  final newList = List<Education>.from(user.education)..removeAt(index);
                                  authProvider.updateProfile(user.copyWith(education: newList));
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            if (user.education.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Text(
                    'No education information added yet.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(context).colorScheme.secondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            const SizedBox(height: 28),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Experience',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.add),
                  tooltip: 'Add Experience',
                  onPressed: () => _editExperienceDialog(context, onSave: (newExp) {
                    final newList = List<Experience>.from(user.experience)..add(newExp);
                    authProvider.updateProfile(user.copyWith(experience: newList));
                  }),
                ),
              ],
            ),
            const SizedBox(height: 14),
            if (user.experience.isNotEmpty)
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: user.experience.length,
                itemBuilder: (context, index) {
                  final experience = user.experience[index];
                  return Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 2,
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Stack(
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                experience.position,
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                experience.company,
                                style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w500),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${_formatDate(experience.startDate)} - ${_formatDate(experience.endDate)}',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Theme.of(context).colorScheme.secondary,
                                ),
                              ),
                              if (experience.description.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Text(
                                  experience.description,
                                  style: Theme.of(context).textTheme.bodyMedium,
                                  maxLines: 3,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ],
                          ),
                        ),
                        Positioned(
                          right: 0,
                          top: 0,
                          child: Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit, size: 18),
                                tooltip: 'Edit',
                                onPressed: () => _editExperienceDialog(context, experience: experience, onSave: (updatedExp) {
                                  final newList = List<Experience>.from(user.experience);
                                  newList[index] = updatedExp;
                                  authProvider.updateProfile(user.copyWith(experience: newList));
                                }),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete, size: 18),
                                tooltip: 'Delete',
                                onPressed: () {
                                  final newList = List<Experience>.from(user.experience)..removeAt(index);
                                  authProvider.updateProfile(user.copyWith(experience: newList));
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            if (user.experience.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Text(
                    'No experience information added yet.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Theme.of(context).colorScheme.secondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
} 