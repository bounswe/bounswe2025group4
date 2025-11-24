import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/models/user_type.dart';
import '../../../core/models/employer_workplace_item.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
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

  // Workplace selection
  List<EmployerWorkplaceItem> _userWorkplaces = [];
  int? _selectedWorkplaceId;
  bool _isLoadingWorkplaces = true;

  bool _isRemote = false;
  bool _isInclusiveOpportunity = false;
  bool _isNonProfit = false;
  bool _isPoliciesExpanded = false;

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
    _loadUserWorkplaces();
  }

  Future<void> _loadUserWorkplaces() async {
    try {
      final workplaces = await _apiService.getMyEmployerWorkplaces();
      if (mounted) {
        setState(() {
          _userWorkplaces = workplaces;
          _isLoadingWorkplaces = false;
          // Auto-select if only one workplace
          if (workplaces.length == 1) {
            _selectedWorkplaceId = workplaces.first.workplace.id;
          }
        });
      }
    } catch (e) {
      print("Error loading workplaces: $e");
      if (mounted) {
        setState(() {
          _isLoadingWorkplaces = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load workplaces: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _contactInfoController.dispose();
    _minSalaryController.dispose();
    _maxSalaryController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    HapticFeedback.mediumImpact();
    if (_formKey.currentState?.validate() ?? false) {
      // Validate workplace selection
      if (_selectedWorkplaceId == null) {
        HapticFeedback.vibrate();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(context)!.createJob_selectWorkplaceError,
            ),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      }

      final currentUser =
          Provider.of<AuthProvider>(context, listen: false).currentUser;
      if (currentUser == null || currentUser.role != UserType.ROLE_EMPLOYER) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(context)!.createJob_employerError,
            ),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      // Parse salaries (skip if non-profit)
      int? minSalary;
      if (!_isNonProfit && _minSalaryController.text.isNotEmpty) {
        minSalary = int.tryParse(
          _minSalaryController.text.replaceAll(RegExp(r'[^0-9]'), ''),
        );
        if (minSalary == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                AppLocalizations.of(context)!.createJob_invalidMinSalary,
              ),
              backgroundColor: Colors.orange,
            ),
          );
          return;
        }
      }

      int? maxSalary;
      if (!_isNonProfit && _maxSalaryController.text.isNotEmpty) {
        maxSalary = int.tryParse(
          _maxSalaryController.text.replaceAll(RegExp(r'[^0-9]'), ''),
        );
        if (maxSalary == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                AppLocalizations.of(context)!.createJob_invalidMaxSalary,
              ),
              backgroundColor: Colors.orange,
            ),
          );
          return;
        }
      }

      if (!_isNonProfit && minSalary != null && maxSalary != null && minSalary > maxSalary) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(context)!.createJob_salaryRangeError,
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
          workplaceId: _selectedWorkplaceId!,
          title: _titleController.text,
          description: _descriptionController.text,
          remote: _isRemote,
          inclusiveOpportunity: _isInclusiveOpportunity,
          nonProfit: _isNonProfit,
          contactInformation:
              _contactInfoController.text.isNotEmpty
                  ? _contactInfoController.text
                  : null,
          minSalary: minSalary,
          maxSalary: maxSalary,
        );

        if (mounted) {
          HapticFeedback.heavyImpact();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                AppLocalizations.of(context)!.createJob_success(newJob.title),
              ),
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
              content: Text(
                AppLocalizations.of(context)!.createJob_error(
                  e.toString().replaceFirst("Exception: ", ""),
                ),
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
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.createJob_title),
      ),
      body: _isLoadingWorkplaces
          ? const Center(child: CircularProgressIndicator())
          : _userWorkplaces.isEmpty
              ? _buildNoWorkplacesView()
              : Form(
                  key: _formKey,
                  child: ListView(
                    padding: const EdgeInsets.all(16.0),
                    children: [
                      Text(
                        AppLocalizations.of(context)!.createJob_jobDetails,
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 16.0),

                      // --- Workplace Selection ---
                      DropdownButtonFormField<int>(
                        decoration: InputDecoration(
                          labelText:
                              AppLocalizations.of(
                                context,
                              )!.createJob_selectWorkplace,
                          border: const OutlineInputBorder(),
                          prefixIcon: const Icon(Icons.business),
                        ),
                        value: _selectedWorkplaceId,
                        items: _userWorkplaces.map((item) {
                          return DropdownMenuItem<int>(
                            value: item.workplace.id,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  item.workplace.companyName,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  '${item.workplace.location} • ${item.workplace.sector}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedWorkplaceId = value;
                          });
                        },
                        validator: (value) {
                          if (value == null) {
                            return AppLocalizations.of(
                              context,
                            )!.createJob_workplaceRequired;
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16.0),

                      // --- Title ---
                      TextFormField(
                        controller: _titleController,
                        decoration: InputDecoration(
                          labelText:
                              AppLocalizations.of(context)!.createJob_jobTitle,
                          border: const OutlineInputBorder(),
                        ),
                        validator:
                            (value) =>
                                (value == null || value.isEmpty)
                                    ? AppLocalizations.of(
                                      context,
                                    )!.createJob_jobTitleRequired
                                    : null,
                      ),
                      const SizedBox(height: 16.0),

                      // --- Remote Checkbox ---
                      CheckboxListTile(
                        title: Text(
                          AppLocalizations.of(context)!.createJob_remoteLabel,
                        ),
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
                      const SizedBox(height: 8.0),

                      // --- Inclusive Opportunity Checkbox ---
                      CheckboxListTile(
                        title: Text(
                          AppLocalizations.of(
                            context,
                          )!.createJob_inclusiveLabel,
                        ),
                        subtitle: Text(
                          AppLocalizations.of(
                            context,
                          )!.createJob_inclusiveSubtitle,
                        ),
                        value: _isInclusiveOpportunity,
                        onChanged: (bool? value) {
                          HapticFeedback.lightImpact();
                          setState(() {
                            _isInclusiveOpportunity = value ?? false;
                          });
                        },
                        controlAffinity: ListTileControlAffinity.leading,
                        contentPadding: EdgeInsets.zero,
                      ),
                      const SizedBox(height: 8.0),

                      // --- Non-Profit Checkbox ---
                      CheckboxListTile(
                        title: Text(
                          AppLocalizations.of(
                            context,
                          )!.createJob_nonProfitLabel,
                        ),
                        subtitle: Text(
                          AppLocalizations.of(
                            context,
                          )!.createJob_nonProfitSubtitle,
                        ),
                        value: _isNonProfit,
                        onChanged: (bool? value) {
                          HapticFeedback.lightImpact();
                          setState(() {
                            _isNonProfit = value ?? false;
                          });
                        },
                        controlAffinity: ListTileControlAffinity.leading,
                        contentPadding: EdgeInsets.zero,
                      ),
                      const SizedBox(height: 16.0),

                      // --- Description ---
                      TextFormField(
                        controller: _descriptionController,
                        decoration: InputDecoration(
                          labelText:
                              AppLocalizations.of(
                                context,
                              )!.createJob_descriptionLabel,
                          border: const OutlineInputBorder(),
                          alignLabelWithHint: true,
                        ),
                        maxLines: 5,
                        validator:
                            (value) =>
                                (value == null || value.isEmpty)
                                    ? AppLocalizations.of(
                                      context,
                                    )!.createJob_descriptionRequiredError
                                    : null,
                      ),
                      const SizedBox(height: 16.0),

                      // --- Contact Info ---
                      TextFormField(
                        controller: _contactInfoController,
                        decoration: InputDecoration(
                          labelText:
                              AppLocalizations.of(
                                context,
                              )!.createJob_contactLabel,
                          border: const OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.emailAddress,
                        validator:
                            (value) =>
                                (value == null || value.isEmpty)
                                    ? AppLocalizations.of(
                                      context,
                                    )!.createJob_contactRequiredError
                                    : null,
                      ),
                      const SizedBox(height: 16.0),

                      // --- Min Salary (Optional) ---
                      TextFormField(
                        controller: _minSalaryController,
                        decoration: InputDecoration(
                          labelText:
                              AppLocalizations.of(
                                context,
                              )!.createJob_minSalaryLabel,
                          hintText:
                              AppLocalizations.of(
                                context,
                              )!.createJob_minSalaryPlaceholder,
                          border: const OutlineInputBorder(),
                          prefixText: '\$',
                        ),
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: false,
                        ),
                        validator: (value) {
                          if (value != null && value.isNotEmpty) {
                            final sanitizedValue = value.replaceAll(
                              RegExp(r'[^0-9]'),
                              '',
                            );
                            if (int.tryParse(sanitizedValue) == null) {
                              return AppLocalizations.of(
                                context,
                              )!.createJob_validNumberError;
                            }
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16.0),

                      // --- Max Salary (Optional) ---
                      TextFormField(
                        controller: _maxSalaryController,
                        decoration: InputDecoration(
                          labelText:
                              AppLocalizations.of(
                                context,
                              )!.createJob_maxSalaryLabel,
                          hintText:
                              AppLocalizations.of(
                                context,
                              )!.createJob_maxSalaryPlaceholder,
                          border: const OutlineInputBorder(),
                          prefixText: '\$',
                        ),
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: false,
                        ),
                        validator: (value) {
                          if (value != null && value.isNotEmpty) {
                            final sanitizedValue = value.replaceAll(
                              RegExp(r'[^0-9]'),
                              '',
                            );
                            if (int.tryParse(sanitizedValue) == null) {
                              return AppLocalizations.of(
                                context,
                              )!.createJob_validNumberError;
                            }
                            final minSalaryText = _minSalaryController.text
                                .replaceAll(RegExp(r'[^0-9]'), '');
                            if (minSalaryText.isNotEmpty &&
                                int.tryParse(minSalaryText) != null) {
                              final minSal = int.parse(minSalaryText);
                              final maxSal = int.tryParse(sanitizedValue);
                              if (maxSal != null && minSal > maxSal) {
                                return AppLocalizations.of(
                                  context,
                                )!.createJob_maxSalaryError;
                              }
                            }
                          }
                          return null;
                        },
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
                        label: Text(
                          _isLoading
                              ? AppLocalizations.of(
                                context,
                              )!.createJob_creatingPost
                              : AppLocalizations.of(
                                context,
                              )!.createJob_createPost,
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Theme.of(context).primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16.0),
                          textStyle:
                              Theme.of(context)
                                  .textTheme
                                  .titleMedium
                                  ?.copyWith(color: Colors.white),
                        ),
                        onPressed: _isLoading ? null : _submitForm,
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildNoWorkplacesView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.business_outlined,
              size: 80,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 24),
            Text(
              AppLocalizations.of(context)!.createJob_noWorkplacesTitle,
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Text(
              AppLocalizations.of(context)!.createJob_noWorkplacesMessage,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              icon: const Icon(Icons.add_business),
              label: Text(
                AppLocalizations.of(context)!.createJob_createWorkplace,
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).primaryColor,
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              ),
              onPressed: () {
                // Navigate to workplace creation screen
                Navigator.of(context).pushNamed('/create-workplace');
              },
            ),
          ],
        ),
      ),
    );
  }
}
