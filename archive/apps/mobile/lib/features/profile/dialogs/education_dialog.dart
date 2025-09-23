import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/education.dart';
import '../../../core/providers/profile_provider.dart';
import 'package:intl/intl.dart';

class EducationDialog extends StatefulWidget {
  final Education? education;

  const EducationDialog({
    Key? key,
    this.education,
  }) : super(key: key);

  @override
  State<EducationDialog> createState() => _EducationDialogState();
}

class _EducationDialogState extends State<EducationDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _schoolController;
  late TextEditingController _degreeController;
  late TextEditingController _fieldController;
  late TextEditingController _startDateController;
  late TextEditingController _endDateController;
  bool _isCurrent = false;

  @override
  void initState() {
    super.initState();
    _schoolController = TextEditingController(text: widget.education?.school ?? '');
    _degreeController = TextEditingController(text: widget.education?.degree ?? '');
    _fieldController = TextEditingController(text: widget.education?.field ?? '');
    _startDateController = TextEditingController(
      text: _formatDateForDisplay(widget.education?.startDate),
    );
    _endDateController = TextEditingController(
      text: _formatDateForDisplay(widget.education?.endDate),
    );
    _isCurrent = widget.education?.endDate == null;
  }

  @override
  void dispose() {
    _schoolController.dispose();
    _degreeController.dispose();
    _fieldController.dispose();
    _startDateController.dispose();
    _endDateController.dispose();
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

      final educationData = {
        'school': _schoolController.text,
        'degree': _degreeController.text,
        'field': _fieldController.text,
        'startDate': _formatDateForApi(_startDateController.text),
        'endDate': _isCurrent ? null : _formatDateForApi(_endDateController.text),
      };



      if (widget.education != null) {
        profileProvider.updateEducation(
          widget.education!.id,
          educationData,
        );
      } else {
        profileProvider.addEducation(educationData);
      }

      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.education == null
          ? 'Add Education'
          : 'Edit Education'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _schoolController,
                decoration: const InputDecoration(
                  labelText: 'School/University',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a school name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _degreeController,
                decoration: const InputDecoration(
                  labelText: 'Degree',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a degree';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _fieldController,
                decoration: const InputDecoration(
                  labelText: 'Field of Study',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a field of study';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _startDateController,
                decoration: InputDecoration(
                  labelText: 'Start Date (MM/YYYY)',
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.calendar_today),
                    onPressed: () => _selectDate(context, _startDateController),
                  ),
                ),
                readOnly: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a start date';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Checkbox(
                    value: _isCurrent,
                    onChanged: (value) {
                      setState(() {
                        _isCurrent = value ?? false;
                        if (_isCurrent) {
                          _endDateController.clear();
                        }
                      });
                    },
                  ),
                  const Text('I am currently studying here'),
                ],
              ),
              if (!_isCurrent) ...[
                const SizedBox(height: 16),
                TextFormField(
                  controller: _endDateController,
                  decoration: InputDecoration(
                    labelText: 'End Date (MM/YYYY)',
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.calendar_today),
                      onPressed: () => _selectDate(context, _endDateController),
                    ),
                  ),
                  readOnly: true,
                  validator: (value) {
                    if (!_isCurrent && (value == null || value.isEmpty)) {
                      return 'Please enter an end date';
                    }
                    return null;
                  },
                ),
              ],
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          child: const Text('Cancel'),
          onPressed: () => Navigator.of(context).pop(),
        ),
        ElevatedButton(
          child: const Text('Save'),
          onPressed: _save,
        ),
      ],
    );
  }
}
