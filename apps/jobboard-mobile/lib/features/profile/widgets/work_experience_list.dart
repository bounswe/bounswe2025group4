import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/experience.dart';
import '../../../core/providers/profile_provider.dart';
import 'work_experience_item.dart';
import '../dialogs/work_experience_dialog.dart';
import '../../../generated/l10n/app_localizations.dart';

class WorkExperienceList extends StatelessWidget {
  final List<Experience> experiences;
  final bool isEditable;

  const WorkExperienceList({
    Key? key,
    required this.experiences,
    this.isEditable = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              AppLocalizations.of(context)!.profileWidgets_workExperience,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            if (isEditable)
              TextButton.icon(
                icon: const Icon(Icons.add),
                label: Text(AppLocalizations.of(context)!.profileWidgets_add),
                onPressed: () => _showWorkExperienceDialog(context),
              ),
          ],
        ),
        const SizedBox(height: 8),
        if (experiences.isEmpty)
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(AppLocalizations.of(context)!.profileWidgets_noWorkExperience),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: experiences.length,
            itemBuilder: (context, index) {
              final experience = experiences[index];
              return WorkExperienceItem(
                experience: experience,
                isEditable: isEditable,
                onEdit: () => _showWorkExperienceDialog(
                  context,
                  existingExperience: experience,
                ),
                onDelete: () => _confirmDelete(context, experience),
              );
            },
          ),
      ],
    );
  }

  void _showWorkExperienceDialog(
    BuildContext context, {
    Experience? existingExperience,
  }) {
    showDialog(
      context: context,
      builder: (context) => WorkExperienceDialog(
        experience: existingExperience,
      ),
    );
  }

  void _confirmDelete(BuildContext context, Experience experience) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(AppLocalizations.of(context)!.profileWidgets_deleteExperience),
        content: Text(
          AppLocalizations.of(context)!.profileWidgets_confirmDeleteExperience(experience.company)
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
              profileProvider.deleteWorkExperience(experience.id);
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
    );
  }
}
