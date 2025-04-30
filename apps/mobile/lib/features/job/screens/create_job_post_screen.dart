import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/job_post.dart';
import '../../../core/models/user.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/utils/string_extensions.dart';

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
  final _salaryRangeController = TextEditingController();

  String? _selectedJobType;
  List<String> _selectedPolicies = [];

  bool _isLoading = false;

  // TODO: Inject or locate service properly
  final ApiService _apiService = ApiService();

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _contactInfoController.dispose();
    _salaryRangeController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    if (_formKey.currentState?.validate() ?? false) {
      if (_selectedJobType == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please select a job type.'),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      }
      if (_selectedPolicies.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please select at least one ethical policy.'),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      }

      final currentUser =
          Provider.of<AuthProvider>(context, listen: false).currentUser;
      if (currentUser == null || currentUser.role != UserRole.employer) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error: Could not verify employer account.'),
            backgroundColor: Colors.red,
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
          companyName:
              currentUser.companyName ??
              'Your Company', // Get company from user profile or default
          title: _titleController.text,
          description: _descriptionController.text,
          contactInfo: _contactInfoController.text,
          jobType: _selectedJobType!, // Already checked for null
          ethicalPolicies: _selectedPolicies,
          salaryRange: _salaryRangeController.text, // Optional
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Job "${newJob.title}" created successfully!'),
              backgroundColor: Colors.green,
            ),
          );
          // Pop back to the previous screen (JobPage)
          Navigator.of(context).pop();
        }
      } catch (e) {
        print("Error creating job post: $e");
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Error creating job: ${e.toString().replaceFirst("Exception: ", "")}',
              ),
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
      appBar: AppBar(title: const Text('Create New Job Posting')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            Text(
              'Job Details',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16.0),

            // --- Title ---
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(
                labelText: 'Job Title',
                border: OutlineInputBorder(),
              ),
              validator:
                  (value) =>
                      (value == null || value.isEmpty)
                          ? 'Please enter a job title'
                          : null,
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

            // --- Salary Range (Optional) ---
            TextFormField(
              controller: _salaryRangeController,
              decoration: const InputDecoration(
                labelText: r'Salary Range (e.g., $50k - $70k)',
                hintText: 'Optional',
                border: OutlineInputBorder(),
              ),
              // No validator, as it's optional
            ),
            const SizedBox(height: 24.0),

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
                        setState(() {
                          if (selected) {
                            _selectedPolicies.add(policy);
                          } else {
                            _selectedPolicies.remove(policy);
                          }
                        });
                      },
                      selectedColor: Colors.teal.shade100,
                      checkmarkColor: Colors.teal.shade800,
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
              label: Text(_isLoading ? 'Creating Post...' : 'Create Job Post'),
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
