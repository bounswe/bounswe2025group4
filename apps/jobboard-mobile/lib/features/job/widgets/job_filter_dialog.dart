import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/services/api_service.dart'; // To get available filters
import '../../../core/utils/string_extensions.dart'; // Import shared extension
import '../../../generated/l10n/app_localizations.dart';

class JobFilterDialog extends StatefulWidget {
  final ApiService apiService;
  final Map<String, dynamic> initialFilters;

  const JobFilterDialog({
    super.key,
    required this.apiService,
    required this.initialFilters,
  });

  @override
  State<JobFilterDialog> createState() => _JobFilterDialogState();
}

class _JobFilterDialogState extends State<JobFilterDialog> {
  late Map<String, dynamic> _selectedFilters;
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _companyNameController = TextEditingController();
  final TextEditingController _minSalaryController = TextEditingController();
  final TextEditingController _maxSalaryController = TextEditingController();
  bool _isRemote = false;
  bool _isInclusiveOpportunity = false;
  bool _isPoliciesExpanded = false;

  @override
  void initState() {
    super.initState();
    // Deep copy the initial filters to allow local modification
    _selectedFilters = {
      'title': widget.initialFilters['title'],
      'companyName': widget.initialFilters['companyName'],
      'ethicalTags': List<String>.from(
        widget.initialFilters['ethicalTags'] ?? [],
      ),
      'minSalary': widget.initialFilters['minSalary'],
      'maxSalary': widget.initialFilters['maxSalary'],
      'isRemote': widget.initialFilters['isRemote'],
      'inclusiveOpportunity': widget.initialFilters['inclusiveOpportunity'],
    };

    // Initialize controllers with existing values
    _titleController.text = _selectedFilters['title'] ?? '';
    _companyNameController.text = _selectedFilters['companyName'] ?? '';
    _minSalaryController.text = _selectedFilters['minSalary']?.toString() ?? '';
    _maxSalaryController.text = _selectedFilters['maxSalary']?.toString() ?? '';
    _isRemote = _selectedFilters['isRemote'] ?? false;
    _isInclusiveOpportunity =
        _selectedFilters['inclusiveOpportunity'] ?? false;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _companyNameController.dispose();
    _minSalaryController.dispose();
    _maxSalaryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final availablePolicies = widget.apiService.availableEthicalPolicies;

    return AlertDialog(
      title: Text(AppLocalizations.of(context)!.jobFilter_title),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title filter
            TextField(
              controller: _titleController,
              decoration: InputDecoration(
                labelText: AppLocalizations.of(context)!.jobFilter_jobTitle,
                hintText: AppLocalizations.of(context)!.jobFilter_jobTitleHint,
              ),
              onChanged: (value) {
                _selectedFilters['title'] = value.isEmpty ? null : value;
              },
            ),
            const SizedBox(height: 12),

            // Company name filter
            TextField(
              controller: _companyNameController,
              decoration: InputDecoration(
                labelText: AppLocalizations.of(context)!.jobFilter_companyName,
                hintText:
                    AppLocalizations.of(context)!.jobFilter_companyNameHint,
              ),
              onChanged: (value) {
                _selectedFilters['companyName'] = value.isEmpty ? null : value;
              },
            ),
            const SizedBox(height: 16),

            // Ethical policies filter
            _buildFilterSection(
              title: AppLocalizations.of(context)!.jobFilter_ethicalPolicies,
              availableItems: availablePolicies,
              selectedItems: _selectedFilters['ethicalTags'] as List<String>,
              filterKey: 'ethicalTags',
            ),
            const Divider(),

            // Salary range filters
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _minSalaryController,
                    decoration: InputDecoration(
                      labelText:
                          AppLocalizations.of(context)!.jobFilter_minSalary,
                      hintText:
                          AppLocalizations.of(context)!.jobFilter_minSalaryHint,
                    ),
                    keyboardType: TextInputType.number,
                    onChanged: (value) {
                      _selectedFilters['minSalary'] =
                          value.isEmpty ? null : int.tryParse(value);
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _maxSalaryController,
                    decoration: InputDecoration(
                      labelText:
                          AppLocalizations.of(context)!.jobFilter_maxSalary,
                      hintText:
                          AppLocalizations.of(context)!.jobFilter_maxSalaryHint,
                    ),
                    keyboardType: TextInputType.number,
                    onChanged: (value) {
                      _selectedFilters['maxSalary'] =
                          value.isEmpty ? null : int.tryParse(value);
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Remote option
            SwitchListTile(
              title: Text(AppLocalizations.of(context)!.jobFilter_remoteOnly),
              value: _isRemote,
              onChanged: (value) {
                HapticFeedback.lightImpact();
                setState(() {
                  _isRemote = value;
                  _selectedFilters['isRemote'] = value;
                });
              },
              contentPadding: EdgeInsets.zero,
            ),
            const SizedBox(height: 8),

            // Inclusive Opportunity option
            SwitchListTile(
              title: Text(
                AppLocalizations.of(context)!.jobFilter_inclusiveOpportunity,
              ),
              value: _isInclusiveOpportunity,
              onChanged: (value) {
                HapticFeedback.lightImpact();
                setState(() {
                  _isInclusiveOpportunity = value;
                  _selectedFilters['inclusiveOpportunity'] = value;
                });
              },
              contentPadding: EdgeInsets.zero,
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () {
            HapticFeedback.lightImpact();
            Navigator.of(context).pop();
          }, // Cancel
          child: Text(AppLocalizations.of(context)!.mentorScreen_cancel),
        ),
        TextButton(
          onPressed: () {
            HapticFeedback.lightImpact();
            // Clear all selections
            setState(() {
              _titleController.clear();
              _companyNameController.clear();
              _minSalaryController.clear();
              _maxSalaryController.clear();
              _isRemote = false;
              _isInclusiveOpportunity = false;
              _selectedFilters['title'] = null;
              _selectedFilters['companyName'] = null;
              (_selectedFilters['ethicalTags'] as List<String>).clear();
              _selectedFilters['minSalary'] = null;
              _selectedFilters['maxSalary'] = null;
              _selectedFilters['isRemote'] = null;
              _selectedFilters['inclusiveOpportunity'] = null;
            });
          },
          child: Text(AppLocalizations.of(context)!.jobFilter_clearAll),
        ),
        ElevatedButton(
          onPressed: () {
            HapticFeedback.mediumImpact();
            // Return the selected filters
            Navigator.of(context).pop(_selectedFilters);
          },
          child: Text(AppLocalizations.of(context)!.jobFilter_applyFilters),
        ),
      ],
    );
  }

  Widget _buildFilterSection({
    required String title,
    required List<String> availableItems,
    required List<String> selectedItems,
    required String filterKey,
  }) {
    final isEthicalPolicies = filterKey == 'ethicalTags';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (isEthicalPolicies)
          InkWell(
            onTap: () {
              setState(() {
                _isPoliciesExpanded = !_isPoliciesExpanded;
              });
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        if (selectedItems.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 4.0),
                            child: Text(
                              AppLocalizations.of(
                                context,
                              )!.createJob_policiesSelected(
                                selectedItems.length,
                              ),
                              style: Theme.of(context).textTheme.bodySmall
                                  ?.copyWith(color: Colors.blue),
                            ),
                          ),
                      ],
                    ),
                  ),
                  Icon(
                    _isPoliciesExpanded ? Icons.expand_less : Icons.expand_more,
                    color: Theme.of(context).primaryColor,
                  ),
                ],
              ),
            ),
          )
        else
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Text(title, style: Theme.of(context).textTheme.titleMedium),
          ),
        if (!isEthicalPolicies || _isPoliciesExpanded)
          Wrap(
            spacing: 8.0,
            runSpacing: 4.0,
            children:
                availableItems.map((item) {
                  final isSelected = selectedItems.contains(item);
                  return FilterChip(
                    label: Text(item.formatLocalizedEthicalPolicy(context)),
                    selected: isSelected,
                    onSelected: (selected) {
                      HapticFeedback.lightImpact();
                      setState(() {
                        if (selected) {
                          selectedItems.add(item);
                        } else {
                          selectedItems.remove(item);
                        }
                      });
                    },
                    selectedColor: Colors.blue.withOpacity(
                      0.2,
                    ), // Blue selection to match design
                    checkmarkColor: Colors.blue, // Blue checkmark
                  );
                }).toList(),
          ),
      ],
    );
  }
}
