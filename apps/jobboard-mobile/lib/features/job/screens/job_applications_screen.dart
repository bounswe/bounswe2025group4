import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/models/job_application.dart';
import '../../../core/services/api_service.dart';
import '../../../core/utils/string_extensions.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../generated/l10n/app_localizations.dart';

class JobApplicationsScreen extends StatefulWidget {
  final String jobId;
  // Optional: Pass job title for AppBar
  final String? jobTitle;

  const JobApplicationsScreen({super.key, required this.jobId, this.jobTitle});

  @override
  State<JobApplicationsScreen> createState() => _JobApplicationsScreenState();
}

class _JobApplicationsScreenState extends State<JobApplicationsScreen> {
  List<JobApplication> _applications = [];
  bool _isLoading = false;
  String? _errorMessage;
  Map<String, bool> _isUpdatingStatus =
      {}; // Track loading state per application

  // Initialize ApiService late or in initState AFTER getting AuthProvider
  late final ApiService _apiService;

  @override
  void initState() {
    super.initState();
    // Get AuthProvider first
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    // Initialize ApiService with AuthProvider
    _apiService = ApiService(authProvider: authProvider);

    _loadApplications();
  }

  Future<void> _loadApplications() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _isUpdatingStatus.clear(); // Clear individual loading states
    });

    try {
      // Get the current user's ID from AuthProvider
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final userId = authProvider.currentUser?.id; // Access id via currentUser

      if (userId == null) {
        // Handle case where user is not logged in or user object is missing ID
        if (mounted) {
          setState(() {
            _errorMessage = AppLocalizations.of(context)!.jobApplications_userError;
            _isLoading = false;
          });
        }
        return; // Stop execution if no userId
      }

      final applications = await _apiService.getApplicationsForJob(
        widget.jobId,
      );
      if (mounted) {
        setState(() {
          _applications = applications;
          // Sort by date initially (newest first)
          _applications.sort((a, b) => b.dateApplied.compareTo(a.dateApplied));
        });
      }
    } catch (e) {
      print("Error loading applications for job: $e");
      if (mounted) {
        setState(() {
          _errorMessage = AppLocalizations.of(context)!.jobApplications_loadError;
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _updateStatus(
    JobApplication application,
    ApplicationStatus newStatus,
  ) async {
    String? feedback = await _showFeedbackDialog(newStatus);
    // If user cancelled dialog (null feedback), don't proceed unless rejecting without feedback is allowed
    if (feedback == null && newStatus == ApplicationStatus.approved)
      return; // Require feedback for approval? Or handle null case
    if (feedback == null && newStatus == ApplicationStatus.rejected)
      feedback = ""; // Allow empty feedback for rejection

    if (!mounted) return;
    setState(() {
      _isUpdatingStatus[application.id] = true;
    });

    try {
      final updatedApplication = await _apiService.updateApplicationStatus(
        application.id,
        newStatus,
        jobPostingId: application.jobId,
        jobSeekerId: application.jobSeekerId,
        feedback: feedback,
      );

      // Update the list locally
      if (mounted) {
        setState(() {
          final index = _applications.indexWhere(
            (app) => app.id == application.id,
          );
          if (index != -1) {
            _applications[index] = updatedApplication;
          }
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.jobApplications_statusUpdated(newStatus.name)),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      print("Error updating application status: $e");
      if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(AppLocalizations.of(context)!.jobApplications_updateError(e.toString().replaceFirst("Exception: ", ""))),
              backgroundColor: Colors.red,
            ),
          );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUpdatingStatus[application.id] = false;
        });
      }
    }
  }

  Future<String?> _showFeedbackDialog(ApplicationStatus action) async {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Text(
              'Provide Feedback (Optional) for ${action.name.capitalizeFirst()}',
            ),
            content: TextField(
              controller: controller,
              decoration: const InputDecoration(
                hintText: 'Enter feedback here...',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(), // Cancel
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(
                    context,
                  ).pop(controller.text.trim()); // Return feedback
                },
                child: const Text('Submit'),
              ),
            ],
          ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.jobTitle ?? AppLocalizations.of(context)!.jobApplications_title)),
      body: _buildContent(),
    );
  }

  Widget _buildContent() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: _loadApplications,
                child: Text(AppLocalizations.of(context)!.common_retry),
              ),
            ],
          ),
        ),
      );
    }

    if (_applications.isEmpty) {
      return Center(
        child: Text(AppLocalizations.of(context)!.jobApplications_noApplications),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadApplications,
      child: ListView.builder(
        padding: const EdgeInsets.all(8.0),
        itemCount: _applications.length,
        itemBuilder: (context, index) {
          final application = _applications[index];
          return _buildApplicationCard(application);
        },
      ),
    );
  }

  Widget _buildApplicationCard(JobApplication application) {
    final dateFormat = DateFormat.yMMMd();
    final statusColor = _getStatusColor(application.status);
    final statusText = application.status.name.capitalizeFirst();
    final bool isPending = application.status == ApplicationStatus.pending;
    final bool isUpdating = _isUpdatingStatus[application.id] ?? false;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6.0),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    application.applicantName, // Display applicant name
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Chip(
                  label: Text(statusText),
                  backgroundColor: statusColor.withOpacity(0.1),
                  side: BorderSide(color: statusColor),
                  labelStyle: TextStyle(
                    color: statusColor,
                    fontWeight: FontWeight.bold,
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
            const SizedBox(height: 4.0),
            Text(
              'Applied: ${dateFormat.format(application.dateApplied)}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            if (application.employerFeedback != null &&
                application.employerFeedback!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Text(
                  'Feedback: ${application.employerFeedback}',
                  style: Theme.of(
                    context,
                  ).textTheme.bodySmall?.copyWith(fontStyle: FontStyle.italic),
                ),
              ),
            if (isPending)
              Padding(
                padding: const EdgeInsets.only(top: 12.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (isUpdating)
                      const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    if (!isUpdating) ...[
                      OutlinedButton.icon(
                        icon: const Icon(
                          Icons.close,
                          color: Colors.red,
                          size: 18,
                        ),
                        label: const Text(
                          'Reject',
                          style: TextStyle(color: Colors.red),
                        ),
                        onPressed:
                            () => _updateStatus(
                              application,
                              ApplicationStatus.rejected,
                            ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.red),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8.0),
                      ElevatedButton.icon(
                        icon: const Icon(
                          Icons.check,
                          color: Colors.white,
                          size: 18,
                        ),
                        label: const Text(
                          'Approve',
                          style: TextStyle(color: Colors.white),
                        ),
                        onPressed:
                            () => _updateStatus(
                              application,
                              ApplicationStatus.approved,
                            ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue, // Use blue to match design language
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            // TODO: Add option to view applicant profile/details?
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.approved:
        return Colors.blue; // Use blue to match design language
      case ApplicationStatus.rejected:
        return Colors.red.shade700; // Keep red for rejection
      case ApplicationStatus.pending:
      default:
        return Colors.grey.shade600; // Use neutral grey for pending
    }
  }
}
