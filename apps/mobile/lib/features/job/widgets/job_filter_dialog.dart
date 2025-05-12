import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart'; // To get available filters
import '../../../core/utils/string_extensions.dart'; // Import shared extension

class JobFilterDialog extends StatefulWidget {
  final ApiService apiService;
  final Map<String, List<String>> initialFilters;

  const JobFilterDialog({
    super.key,
    required this.apiService,
    required this.initialFilters,
  });

  @override
  State<JobFilterDialog> createState() => _JobFilterDialogState();
}

class _JobFilterDialogState extends State<JobFilterDialog> {
  late Map<String, List<String>> _selectedFilters;

  @override
  void initState() {
    super.initState();
    // Deep copy the initial filters to allow local modification
    _selectedFilters = {
      'policies': List.from(widget.initialFilters['policies'] ?? []),
      'jobTypes': List.from(widget.initialFilters['jobTypes'] ?? []),
    };
  }

  @override
  Widget build(BuildContext context) {
    final availablePolicies = widget.apiService.availableEthicalPolicies;
    final availableJobTypes = widget.apiService.availableJobTypes;

    return AlertDialog(
      title: const Text('Filter Jobs'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildFilterSection(
              title: 'Ethical Policies',
              availableItems: availablePolicies,
              selectedItems: _selectedFilters['policies']!,
              filterKey: 'policies',
            ),
            const Divider(),
            _buildFilterSection(
              title: 'Job Type',
              availableItems: availableJobTypes,
              selectedItems: _selectedFilters['jobTypes']!,
              filterKey: 'jobTypes',
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(), // Cancel
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: () {
            // Clear all selections
            setState(() {
              _selectedFilters['policies']!.clear();
              _selectedFilters['jobTypes']!.clear();
            });
          },
          child: const Text('Clear All'),
        ),
        ElevatedButton(
          onPressed: () {
            // Return the selected filters
            Navigator.of(context).pop(_selectedFilters);
          },
          child: const Text('Apply Filters'),
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8.0),
          child: Text(title, style: Theme.of(context).textTheme.titleMedium),
        ),
        Wrap(
          spacing: 8.0,
          runSpacing: 4.0,
          children:
              availableItems.map((item) {
                final isSelected = selectedItems.contains(item);
                return FilterChip(
                  label: Text(item.formatFilterName()),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        selectedItems.add(item);
                      } else {
                        selectedItems.remove(item);
                      }
                    });
                  },
                  selectedColor: Colors.teal.shade100,
                  checkmarkColor: Colors.teal.shade800,
                );
              }).toList(),
        ),
      ],
    );
  }
}
