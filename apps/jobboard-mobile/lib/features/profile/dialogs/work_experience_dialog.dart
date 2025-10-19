import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/experience.dart';
import '../../../core/providers/profile_provider.dart';
import 'package:intl/intl.dart';
import '../../../generated/l10n/app_localizations.dart';

class WorkExperienceDialog extends StatefulWidget {
  final Experience? experience;

  const WorkExperienceDialog({
    Key? key,
    this.experience,
  }) : super(key: key);

  @override
  State<WorkExperienceDialog> createState() => _WorkExperienceDialogState();
}

class _WorkExperienceDialogState extends State<WorkExperienceDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _companyController;
  late TextEditingController _positionController;
  late TextEditingController _startDateController;
  late TextEditingController _endDateController;
  late TextEditingController _descriptionController;
  bool _isCurrentPosition = false;

  @override
  void initState() {
    super.initState();
    _companyController = TextEditingController(text: widget.experience?.company ?? '');
    _positionController = TextEditingController(text: widget.experience?.position ?? '');
    _startDateController = TextEditingController(
      text: _formatDateForDisplay(widget.experience?.startDate),
    );
    _endDateController = TextEditingController(
      text: _formatDateForDisplay(widget.experience?.endDate),
    );
    _descriptionController = TextEditingController(
      text: widget.experience?.description ?? '',
    );
    _isCurrentPosition = widget.experience?.endDate == null;
  }

  @override
  void dispose() {
    _companyController.dispose();
    _positionController.dispose();
    _startDateController.dispose();
    _endDateController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  String? _formatDateForDisplay(String? isoDate) {
    if (isoDate == null || isoDate.isEmpty) return null;
    try {
      final date = DateTime.parse(isoDate);
      return DateFormat('MM/yyyy').format(date);
    } catch (e) {
      return isoDate;
    }
  }

  String? _formatDateForApi(String? displayDate) {
    if (displayDate == null || displayDate.isEmpty) return null;
    try {
      final parts = displayDate.split('/');
      if (parts.length == 2) {
        final month = int.parse(parts[0]);
        final year = int.parse(parts[1]);
        return DateTime(year, month).toIso8601String().split('T')[0];
      }
      return displayDate;
    } catch (e) {
      return displayDate;
    }
  }

  Future<void> _selectDate(BuildContext context, TextEditingController controller) async {
    final initialDate = DateTime.now();
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(1950),
      lastDate: DateTime.now(),
      builder: (BuildContext context, Widget? child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: const ColorScheme.light(
              primary: Colors.blue,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        controller.text = DateFormat('MM/yyyy').format(picked);
      });
    }
  }

  void _save() {
    if (_formKey.currentState!.validate()) {
      final profileProvider = Provider.of<ProfileProvider>(context, listen: false);

      final experienceData = {
        'company': _companyController.text,
        'position': _positionController.text,
        'startDate': _formatDateForApi(_startDateController.text),
        'endDate': _isCurrentPosition ? null : _formatDateForApi(_endDateController.text),
        'description': _descriptionController.text.isEmpty
            ? null
            : _descriptionController.text,
      };

      if (widget.experience != null) {
        profileProvider.updateWorkExperience(
          widget.experience!.id,
          experienceData,
        );
      } else {
        profileProvider.addWorkExperience(experienceData);
      }

      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.experience == null
          ? AppLocalizations.of(context)!.workExperienceDialog_addTitle
          : AppLocalizations.of(context)!.workExperienceDialog_editTitle),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _companyController,
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(context)!.workExperienceDialog_company,
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return AppLocalizations.of(context)!.workExperienceDialog_companyRequired;
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _positionController,
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(context)!.workExperienceDialog_position,
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return AppLocalizations.of(context)!.workExperienceDialog_positionRequired;
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _startDateController,
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(context)!.workExperienceDialog_startDate,
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.calendar_today),
                    onPressed: () => _selectDate(context, _startDateController),
                  ),
                ),
                readOnly: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return AppLocalizations.of(context)!.workExperienceDialog_startDateRequired;
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Checkbox(
                    value: _isCurrentPosition,
                    onChanged: (value) {
                      setState(() {
                        _isCurrentPosition = value ?? false;
                        if (_isCurrentPosition) {
                          _endDateController.clear();
                        }
                      });
                    },
                    activeColor: Colors.blue,
                  ),
                  Text(AppLocalizations.of(context)!.workExperienceDialog_currentlyWorking),
                ],
              ),
              if (!_isCurrentPosition) ...[
                const SizedBox(height: 16),
                TextFormField(
                  controller: _endDateController,
                  decoration: InputDecoration(
                    labelText: AppLocalizations.of(context)!.workExperienceDialog_endDate,
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.calendar_today),
                      onPressed: () => _selectDate(context, _endDateController),
                    ),
                  ),
                  readOnly: true,
                  validator: (value) {
                    if (!_isCurrentPosition && (value == null || value.isEmpty)) {
                      return AppLocalizations.of(context)!.workExperienceDialog_endDateRequired;
                    }
                    return null;
                  },
                ),
              ],
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(context)!.workExperienceDialog_description,
                ),
                maxLines: 3,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return AppLocalizations.of(context)!.workExperienceDialog_descriptionRequired;
                  }
                  return null;
                },
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          child: Text(AppLocalizations.of(context)!.profileWidgets_cancel),
          onPressed: () => Navigator.of(context).pop(),
          style: TextButton.styleFrom(
            foregroundColor: Colors.blue,
          ),
        ),
        ElevatedButton(
          child: Text(AppLocalizations.of(context)!.workExperienceDialog_save),
          onPressed: _save,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue,
            foregroundColor: Colors.white,
          ),
        ),
      ],
    );
  }
}