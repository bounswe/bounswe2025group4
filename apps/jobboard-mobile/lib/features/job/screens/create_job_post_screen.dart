import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/models/user_type.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/utils/string_extensions.dart';
import '../../../generated/l10n/app_localizations.dart';

class CreateJobPostScreen extends StatefulWidget {
  const CreateJobPostScreen({super.key});

  @override
  State<CreateJobPostScreen> createState() => _CreateJobPostScreenState();
}

class _CreateJobPostScreenState extends State<CreateJobPostScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _contactInfoController = TextEditingController();
  final _minSalaryController = TextEditingController();
  final _maxSalaryController = TextEditingController();
  final _companyController = TextEditingController();
  final _locationController = TextEditingController();

  String? _selectedJobType;
  List<String> _selectedPolicies = [];
  bool _isRemote = false;

  bool _isLoading = false;

  late final ApiService _apiService;

  @override
  void initState() {
    super.initState();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _apiService = ApiService(authProvider: authProvider);
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _contactInfoController.dispose();
    _minSalaryController.dispose();
    _maxSalaryController.dispose();
    _companyController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    HapticFeedback.mediumImpact();
    if (_formKey.currentState?.validate() ?? false) {
      if (_selectedJobType == null) {
        HapticFeedback.vibrate();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.createJob_selectJobTypeError),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      }
      if (_selectedPolicies.isEmpty) {
        HapticFeedback.vibrate();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.createJob_selectPolicyError),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      }

      final currentUser =
          Provider.of<AuthProvider>(context, listen: false).currentUser;
      if (currentUser == null || currentUser.role != UserType.EMPLOYER) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.createJob_employerError),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      // Parse salaries
      double? minSalary;
      if (_minSalaryController.text.isNotEmpty) {
        minSalary = double.tryParse(
          _minSalaryController.text.replaceAll(RegExp(r'[^0-9.]'), ''),
        );
        if (minSalary == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Invalid minimum salary format. Please enter numbers only.',
              ),
              backgroundColor: Colors.orange,
            ),
          );
          return;
        }
      }

      double? maxSalary;
      if (_maxSalaryController.text.isNotEmpty) {
        maxSalary = double.tryParse(
          _maxSalaryController.text.replaceAll(RegExp(r'[^0-9.]'), ''),
        );
        if (maxSalary == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Invalid maximum salary format. Please enter numbers only.',
              ),
              backgroundColor: Colors.orange,
            ),
          );
          return;
        }
      }

      if (minSalary != null && maxSalary != null && minSalary > maxSalary) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Minimum salary cannot be greater than maximum salary.',
            ),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      }

      setState(() {
        _isLoading = true;
      });

      try {
        final newJob = await _apiService.createJobPost(
          employerId: currentUser.id,
          company:
              _companyController.text.isNotEmpty
                  ? _companyController.text
                  : (currentUser.company ?? 'Your Company'),
          title: _titleController.text,
          description: _descriptionController.text,
          location: _locationController.text,
          remote: _isRemote,
          ethicalTags: _selectedPolicies.join(','),
          contactInformation:
              _contactInfoController.text.isNotEmpty
                  ? _contactInfoController.text
                  : null,
          jobType: _selectedJobType,
          minSalary: minSalary,
          maxSalary: maxSalary,
        );

        if (mounted) {
          HapticFeedback.heavyImpact();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(AppLocalizations.of(context)!.createJob_success(newJob.title)),
              backgroundColor: Colors.green,
            ),
          );
          // Pop back to the previous screen (JobPage)
          Navigator.of(context).pop();
        }
      } catch (e) {
        print("Error creating job post: $e");
        if (mounted) {
          HapticFeedback.vibrate();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(AppLocalizations.of(context)!.createJob_error(e.toString().replaceFirst("Exception: ", ""))),
              backgroundColor: Colors.red,
            ),
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Get available options from service
    final availableJobTypes = _apiService.availableJobTypes;
    final availablePolicies = _apiService.availableEthicalPolicies;

    return Scaffold(
      appBar: AppBar(title: Text(AppLocalizations.of(context)!.createJob_title)),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            Text(
              AppLocalizations.of(context)!.createJob_jobDetails,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16.0),

            // --- Title ---
            TextFormField(
              controller: _titleController,
              decoration: InputDecoration(
                labelText: AppLocalizations.of(context)!.createJob_jobTitle,
                border: OutlineInputBorder(),
              ),
              validator:
                  (value) =>
                      (value == null || value.isEmpty)
                          ? AppLocalizations.of(context)!.createJob_jobTitleRequired
                          : null,
            ),
            const SizedBox(height: 16.0),

            // --- Company ---
            TextFormField(
              controller: _companyController,
              decoration: InputDecoration(
                labelText: AppLocalizations.of(context)!.createJob_company,
                hintText:
                    Provider.of<AuthProvider>(
                      context,
                      listen: false,
                    ).currentUser?.company ??
                    AppLocalizations.of(context)!.createJob_companyHint,
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  // If user has a company set, it can be optional, otherwise required.
                  // This logic might need adjustment based on whether company can be truly empty.
                  // For now, let's make it required if not pre-filled by currentUser.company
                  if (Provider.of<AuthProvider>(
                        context,
                        listen: false,
                      ).currentUser?.company ==
                      null) {
                    return 'Please enter the company name';
                  }
                }
                return null;
              },
            ),
            const SizedBox(height: 16.0),

            // --- Location ---
            TextFormField(
              controller: _locationController,
              decoration: const InputDecoration(
                labelText: 'Location (e.g., City, State, Country)',
                border: OutlineInputBorder(),
              ),
              validator:
                  (value) =>
                      (value == null || value.isEmpty)
                          ? 'Please enter a location'
                          : null,
            ),
            const SizedBox(height: 16.0),

            // --- Remote Checkbox ---
            CheckboxListTile(
              title: const Text('Remote Job'),
              value: _isRemote,
              onChanged: (bool? value) {
                HapticFeedback.lightImpact();
                setState(() {
                  _isRemote = value ?? false;
                });
              },
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
            ),
            const SizedBox(height: 16.0),

            // --- Description ---
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Job Description',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
              maxLines: 5,
              validator:
                  (value) =>
                      (value == null || value.isEmpty)
                          ? 'Please enter a job description'
                          : null,
            ),
            const SizedBox(height: 16.0),

            // --- Job Type Dropdown ---
            DropdownButtonFormField<String>(
              value: _selectedJobType,
              decoration: const InputDecoration(
                labelText: 'Job Type',
                border: OutlineInputBorder(),
              ),
              hint: const Text('Select Job Type'),
              items:
                  availableJobTypes.map((type) {
                    return DropdownMenuItem(value: type, child: Text(type));
                  }).toList(),
              onChanged: (value) => setState(() => _selectedJobType = value),
              validator:
                  (value) => value == null ? 'Please select a job type' : null,
            ),
            const SizedBox(height: 16.0),

            // --- Contact Info ---
            TextFormField(
              controller: _contactInfoController,
              decoration: const InputDecoration(
                labelText: 'Contact Information (Email/Phone/Link)',
                border: OutlineInputBorder(),
              ),
              keyboardType:
                  TextInputType
                      .emailAddress, // Basic type, can be url or phone too
              validator:
                  (value) =>
                      (value == null || value.isEmpty)
                          ? 'Please provide contact information'
                          : null,
            ),
            const SizedBox(height: 16.0),

            // --- Min Salary (Optional) ---
            TextFormField(
              controller: _minSalaryController,
              decoration: const InputDecoration(
                labelText: 'Minimum Salary (Optional)',
                hintText: 'e.g., 50000',
                border: OutlineInputBorder(),
                prefixText: '\$', // Optional: Add a currency symbol
              ),
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              validator: (value) {
                if (value != null && value.isNotEmpty) {
                  // Allow only numbers and a single decimal point
                  final sanitizedValue = value.replaceAll(
                    RegExp(r'[^0-9.]'),
                    '',
                  );
                  if (double.tryParse(sanitizedValue) == null) {
                    return 'Please enter a valid number';
                  }
                  if (sanitizedValue.split('.').length > 2) {
                    return 'Invalid number format (too many decimal points)';
                  }
                }
                return null;
              },
            ),
            const SizedBox(height: 16.0),

            // --- Max Salary (Optional) ---
            TextFormField(
              controller: _maxSalaryController,
              decoration: const InputDecoration(
                labelText: 'Maximum Salary (Optional)',
                hintText: 'e.g., 70000',
                border: OutlineInputBorder(),
                prefixText: '\$', // Optional: Add a currency symbol
              ),
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              validator: (value) {
                if (value != null && value.isNotEmpty) {
                  final sanitizedValue = value.replaceAll(
                    RegExp(r'[^0-9.]'),
                    '',
                  );
                  if (double.tryParse(sanitizedValue) == null) {
                    return 'Please enter a valid number';
                  }
                  if (sanitizedValue.split('.').length > 2) {
                    return 'Invalid number format (too many decimal points)';
                  }
                  final minSalaryText = _minSalaryController.text.replaceAll(
                    RegExp(r'[^0-9.]'),
                    '',
                  );
                  if (minSalaryText.isNotEmpty &&
                      double.tryParse(minSalaryText) != null) {
                    final minSal = double.parse(minSalaryText);
                    final maxSal = double.tryParse(sanitizedValue);
                    if (maxSal != null && minSal > maxSal) {
                      return 'Max salary must be >= min salary';
                    }
                  }
                }
                return null;
              },
            ),
            const SizedBox(height: 24.0), // Spacing after salary fields
            // --- Ethical Policies Checkboxes/Chips ---
            Text(
              'Ethical Policies Compliance',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8.0),
            Wrap(
              spacing: 8.0,
              runSpacing: 4.0,
              children:
                  availablePolicies.map((policy) {
                    final isSelected = _selectedPolicies.contains(policy);
                    return FilterChip(
                      label: Text(policy.formatFilterName()),
                      selected: isSelected,
                      onSelected: (selected) {
                        HapticFeedback.lightImpact();
                        setState(() {
                          if (selected) {
                            _selectedPolicies.add(policy);
                          } else {
                            _selectedPolicies.remove(policy);
                          }
                        });
                      },
                      selectedColor: Colors.blue.withOpacity(0.2), // Blue selection to match design
                      checkmarkColor: Colors.blue, // Blue checkmark
                    );
                  }).toList(),
            ),
            const SizedBox(height: 32.0),

            // --- Submit Button ---
            ElevatedButton.icon(
              icon:
                  _isLoading
                      ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                      : const Icon(Icons.publish),
              label: Text(_isLoading ? AppLocalizations.of(context)!.createJob_creatingPost : AppLocalizations.of(context)!.createJob_createPost),
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                textStyle: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(color: Colors.white),
              ),
              onPressed: _isLoading ? null : _submitForm,
            ),
          ],
        ),
      ),
    );
  }
}
