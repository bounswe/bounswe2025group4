import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/education.dart';
import '../../../core/providers/profile_provider.dart';
import 'education_item.dart';
import '../dialogs/education_dialog.dart';
import '../../../generated/l10n/app_localizations.dart';

class EducationList extends StatelessWidget {
  final List<Education> educationHistory;
  final bool isEditable;

  const EducationList({
    super.key,
    required this.educationHistory,
    this.isEditable = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              AppLocalizations.of(context)!.profileWidgets_education,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            if (isEditable)
              TextButton.icon(
                icon: const Icon(Icons.add),
                label: Text(AppLocalizations.of(context)!.profileWidgets_add),
                onPressed: () => _showEducationDialog(context),
              ),
          ],
        ),
        const SizedBox(height: 8),
        if (educationHistory.isEmpty)
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(AppLocalizations.of(context)!.profileWidgets_noEducation),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: educationHistory.length,
            itemBuilder: (context, index) {
              final education = educationHistory[index];
              return EducationItem(
                education: education,
                isEditable: isEditable,
                onEdit: () => _showEducationDialog(
                  context,
                  existingEducation: education,
                ),
                onDelete: () => _confirmDelete(context, education),
              );
            },
          ),
      ],
    );
  }

  void _showEducationDialog(
    BuildContext context, {
    Education? existingEducation,
  }) {
    showDialog(
      context: context,
      builder: (context) => EducationDialog(
        education: existingEducation,
      ),
    );
  }

  void _confirmDelete(BuildContext context, Education education) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(AppLocalizations.of(context)!.profileWidgets_deleteEducation),
        content: Text(
          AppLocalizations.of(context)!.profileWidgets_confirmDeleteEducation(education.school)
        ),
        actions: [
          TextButton(
            child: Text(AppLocalizations.of(context)!.profileWidgets_cancel),
            onPressed: () => Navigator.of(context).pop(),
          ),
          TextButton(
            child: Text(AppLocalizations.of(context)!.profileWidgets_delete, style: TextStyle(color: Colors.red)),
            onPressed: () {
              final profileProvider = Provider.of<ProfileProvider>(
                context,
                listen: false
              );
              profileProvider.deleteEducation(education.id);
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
    );
  }
}
