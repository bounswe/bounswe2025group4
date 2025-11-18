import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/workplace_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/workplace.dart';

class EditWorkplacePage extends StatefulWidget {
  final Workplace workplace;

  const EditWorkplacePage({super.key, required this.workplace});

  @override
  State<EditWorkplacePage> createState() => _EditWorkplacePageState();
}

class _EditWorkplacePageState extends State<EditWorkplacePage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _companyNameController;
  late TextEditingController _sectorController;
  late TextEditingController _locationController;
  late TextEditingController _shortDescriptionController;
  late TextEditingController _detailedDescriptionController;
  late TextEditingController _websiteController;

  late List<String> _selectedEthicalTags;
  final List<String> _availableEthicalTags = [
    'salary_transparency',
    'equal_pay_policy',
    'living_wage_employer',
    'comprehensive_health_insurance',
    'performance_based_bonus',
    'retirement_plan_support',
    'flexible_hours',
    'remote_friendly',
    'no_after_hours_work_culture',
    'mental_health_support',
    'generous_paid_time_off',
    'paid_parental_leave',
    'inclusive_hiring_practices',
    'diverse_leadership',
    'lgbtq_friendly_workplace',
    'disability_inclusive_workplace',
    'supports_women_in_leadership',
    'mentorship_program',
    'learning_development_budget',
    'transparent_promotion_paths',
    'internal_mobility',
    'sustainability_focused',
    'ethical_supply_chain',
    'community_volunteering',
    'certified_b_corporation',
  ];

  bool _isLoading = false;
  late WorkplaceProvider _workplaceProvider;

  @override
  void initState() {
    super.initState();
    _companyNameController = TextEditingController(
      text: widget.workplace.companyName,
    );
    _sectorController = TextEditingController(text: widget.workplace.sector);
    _locationController = TextEditingController(
      text: widget.workplace.location,
    );
    _shortDescriptionController = TextEditingController(
      text: widget.workplace.shortDescription,
    );
    _detailedDescriptionController = TextEditingController(
      text: widget.workplace.detailedDescription,
    );
    _websiteController = TextEditingController(
      text: widget.workplace.website ?? '',
    );

    // Convert tags from API format (Title Case with spaces) to snake_case format
    _selectedEthicalTags =
        widget.workplace.ethicalTags.map((tag) {
          return _convertToSnakeCase(tag);
        }).toList();
  }

  // Convert formatted tag back to snake_case
  // Must match the reverse of ApiService._formatEthicalTag
  String _convertToSnakeCase(String formattedTag) {
    // Reverse mapping for special cases
    final reverseSpecialCases = {
      'LGBTQ+ Friendly Workplace': 'lgbtq_friendly_workplace',
      'Certified B-Corporation': 'certified_b_corporation',
      'No After-Hours Work Culture': 'no_after_hours_work_culture',
      'Remote-Friendly': 'remote_friendly',
      'Performance-Based Bonus': 'performance_based_bonus',
      'Learning & Development Budget': 'learning_development_budget',
      'Sustainability-Focused': 'sustainability_focused',
      'Disability-Inclusive Workplace': 'disability_inclusive_workplace',
    };

    // Check if it's a special case
    if (reverseSpecialCases.containsKey(formattedTag)) {
      return reverseSpecialCases[formattedTag]!;
    }

    // Default: Convert Title Case to snake_case
    return formattedTag
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll('&', 'and')
        .replaceAll('-', '_');
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final apiService = ApiService(authProvider: authProvider);
    _workplaceProvider = WorkplaceProvider(apiService: apiService);
  }

  @override
  void dispose() {
    _companyNameController.dispose();
    _sectorController.dispose();
    _locationController.dispose();
    _shortDescriptionController.dispose();
    _detailedDescriptionController.dispose();
    _websiteController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedEthicalTags.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select at least one ethical policy'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    final success = await _workplaceProvider.updateWorkplace(
      workplaceId: widget.workplace.id,
      companyName: _companyNameController.text.trim(),
      sector: _sectorController.text.trim(),
      location: _locationController.text.trim(),
      shortDescription: _shortDescriptionController.text.trim(),
      detailedDescription: _detailedDescriptionController.text.trim(),
      ethicalTags: _selectedEthicalTags,
      website:
          _websiteController.text.trim().isEmpty
              ? null
              : _websiteController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Workplace updated successfully!'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _workplaceProvider.error ?? 'Failed to update workplace',
          ),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Workplace')),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : Form(
                key: _formKey,
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    TextFormField(
                      controller: _companyNameController,
                      decoration: const InputDecoration(
                        labelText: 'Company Name *',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.business),
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter company name';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    TextFormField(
                      controller: _sectorController,
                      decoration: const InputDecoration(
                        labelText: 'Sector *',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.category),
                        hintText: 'e.g., Technology, Healthcare, Finance',
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter sector';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    TextFormField(
                      controller: _locationController,
                      decoration: const InputDecoration(
                        labelText: 'Location *',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.location_on),
                        hintText: 'e.g., San Francisco, CA',
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter location';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    TextFormField(
                      controller: _shortDescriptionController,
                      decoration: const InputDecoration(
                        labelText: 'Short Description *',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.short_text),
                        hintText: 'Brief description of your company',
                      ),
                      maxLines: 2,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter short description';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    TextFormField(
                      controller: _detailedDescriptionController,
                      decoration: const InputDecoration(
                        labelText: 'Detailed Description *',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.description),
                        hintText: 'Detailed information about your company',
                      ),
                      maxLines: 5,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter detailed description';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    TextFormField(
                      controller: _websiteController,
                      decoration: const InputDecoration(
                        labelText: 'Website (Optional)',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.language),
                        hintText: 'https://example.com',
                      ),
                      keyboardType: TextInputType.url,
                    ),
                    const SizedBox(height: 24),

                    // Ethical Tags Section
                    const Text(
                      'Ethical Policies *',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Select the ethical policies your company follows:',
                      style: TextStyle(color: Colors.grey),
                    ),
                    const SizedBox(height: 12),

                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children:
                          _availableEthicalTags.map((tag) {
                            final isSelected = _selectedEthicalTags.contains(
                              tag,
                            );
                            return FilterChip(
                              label: Text(
                                tag.replaceAll('_', ' '),
                                style: TextStyle(
                                  fontSize: 12,
                                  color:
                                      isSelected
                                          ? Colors.white
                                          : Colors.black87,
                                ),
                              ),
                              selected: isSelected,
                              onSelected: (selected) {
                                setState(() {
                                  if (selected) {
                                    if (!_selectedEthicalTags.contains(tag)) {
                                      _selectedEthicalTags.add(tag);
                                    }
                                  } else {
                                    _selectedEthicalTags.remove(tag);
                                  }
                                });
                              },
                              selectedColor: Colors.green,
                              checkmarkColor: Colors.white,
                            );
                          }).toList(),
                    ),

                    const SizedBox(height: 32),

                    ElevatedButton(
                      onPressed: _submitForm,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text(
                        'Update Workplace',
                        style: TextStyle(fontSize: 16),
                      ),
                    ),

                    const SizedBox(height: 16),
                  ],
                ),
              ),
    );
  }
}
