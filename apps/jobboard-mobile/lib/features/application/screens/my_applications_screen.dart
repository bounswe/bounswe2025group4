import 'dart:io';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:path_provider/path_provider.dart';
import 'package:file_picker/file_picker.dart';

import '../../../core/models/job_application.dart';
import '../../../core/services/api_service.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/utils/string_extensions.dart';
import '../../../generated/l10n/app_localizations.dart';

class MyApplicationsScreen extends StatefulWidget {
  const MyApplicationsScreen({super.key});

  @override
  State<MyApplicationsScreen> createState() => _MyApplicationsScreenState();
}

class _MyApplicationsScreenState extends State<MyApplicationsScreen> {
  List<JobApplication> _applications = [];
  bool _isLoading = false;
  String? _errorMessage;

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
    final userId =
        Provider.of<AuthProvider>(context, listen: false).currentUser?.id;
    if (userId == null) {
      setState(() {
        _errorMessage = AppLocalizations.of(context)!.myApplications_userError;
      });
      return;
    }

    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final applications = await _apiService.fetchMyApplications(userId);
      if (mounted) {
        setState(() {
          _applications = applications;
        });
      }
    } catch (e) {
      print("Error loading applications: $e");
      if (mounted) {
        setState(() {
          _errorMessage =
              AppLocalizations.of(context)!.myApplications_loadError;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.myApplications_title),
      ),
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
        child: Text(
          AppLocalizations.of(context)!.myApplications_noApplications,
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadApplications, // Allow pull-to-refresh here
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
    final statusText =
        application.status.toString().split('.').last.capitalizeFirst();

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6.0),
      child: ListTile(
        title: Text(
          application.jobTitle,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${application.companyName}'),
            Text(
              AppLocalizations.of(context)!.myApplications_applied(
                dateFormat.format(application.dateApplied),
              ),
            ),
            if (application.specialNeeds != null &&
                application.specialNeeds!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4.0),
                child: Text(
                  'Special Needs: ${application.specialNeeds}',
                  style: TextStyle(fontSize: 12, color: Colors.blue.shade700),
                ),
              ),
            if (application.cvUrl != null && application.cvUrl!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4.0),
                child: InkWell(
                  onTap: () => _showCVOptions(application),
                  onLongPress: () => _showCVManagementOptions(application),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.attach_file,
                        size: 14,
                        color: Colors.green,
                      ),
                      const SizedBox(width: 4),
                      const Expanded(
                        child: Text(
                          'CV Uploaded (tap to view)',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.green,
                            fontWeight: FontWeight.bold,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                      const Icon(
                        Icons.open_in_new,
                        size: 12,
                        color: Colors.green,
                      ),
                    ],
                  ),
                ),
              ),
            if (application.feedback != null &&
                application.feedback!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4.0),
                child: Text(
                  AppLocalizations.of(
                    context,
                  )!.myApplications_feedback(application.feedback!),
                  style: TextStyle(
                    fontStyle: FontStyle.italic,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
              ),
          ],
        ),
        trailing: Chip(
          label: Text(statusText),
          backgroundColor: statusColor.withOpacity(0.1),
          side: BorderSide(color: statusColor),
          labelStyle: TextStyle(
            color: statusColor,
            fontWeight: FontWeight.bold,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 8.0),
        ),
        isThreeLine: true,
        onTap: () {
          // Show application details dialog
          showDialog(
            context: context,
            builder:
                (context) => AlertDialog(
                  title: Text('Application Details'),
                  content: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          application.jobTitle,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          application.companyName,
                          style: TextStyle(color: Colors.grey.shade600),
                        ),
                        const SizedBox(height: 16),
                        if (application.coverLetter != null &&
                            application.coverLetter!.isNotEmpty) ...[
                          const Text(
                            'Cover Letter:',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(application.coverLetter!),
                          const SizedBox(height: 12),
                        ],
                        if (application.specialNeeds != null &&
                            application.specialNeeds!.isNotEmpty) ...[
                          const Text(
                            'Special Needs:',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(application.specialNeeds!),
                          const SizedBox(height: 12),
                        ],
                        if (application.cvUrl != null &&
                            application.cvUrl!.isNotEmpty) ...[
                          const Text(
                            'CV:',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          InkWell(
                            onTap: () {
                              Navigator.pop(context);
                              _showCVOptions(application);
                            },
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.attach_file,
                                  size: 16,
                                  color: Colors.green,
                                ),
                                const SizedBox(width: 4),
                                const Expanded(
                                  child: Text(
                                    'View/Manage CV',
                                    style: TextStyle(
                                      decoration: TextDecoration.underline,
                                      color: Colors.green,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const Icon(
                                  Icons.arrow_forward_ios,
                                  size: 12,
                                  color: Colors.green,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                        ],
                        if (application.feedback != null &&
                            application.feedback!.isNotEmpty) ...[
                          const Text(
                            'Employer Feedback:',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            application.feedback!,
                            style: const TextStyle(fontStyle: FontStyle.italic),
                          ),
                        ],
                      ],
                    ),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: Text(
                        AppLocalizations.of(context)!.myApplications_close,
                      ),
                    ),
                  ],
                ),
          );
        },
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

  /// Downloads and saves CV file locally, then opens it
  Future<void> _downloadAndOpenCV(JobApplication application) async {
    try {
      // Show loading indicator
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Downloading CV...'),
          duration: Duration(seconds: 2),
        ),
      );

      // Download CV bytes from API
      final cvBytes = await _apiService.getCV(application.id);

      // Get temp directory
      final directory = await getTemporaryDirectory();
      final filePath = '${directory.path}/cv_${application.id}.pdf';

      // Save file
      final file = File(filePath);
      await file.writeAsBytes(cvBytes);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('CV saved to ${file.path}'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      print('Error downloading CV: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Failed to download CV: ${e.toString().replaceFirst("Exception: ", "")}',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// Shows options to view, replace, or delete CV
  Future<void> _showCVOptions(JobApplication application) async {
    if (application.cvUrl == null || application.cvUrl!.isEmpty) {
      // No CV uploaded, offer to upload
      _uploadNewCV(application);
      return;
    }

    // Directly open CV URL in browser for easy viewing
    try {
      final url = Uri.parse(application.cvUrl!);
      // Try to launch with default browser mode
      final launched = await launchUrl(url);

      if (!launched && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Unable to open CV. No app available to handle PDF files.',
            ),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      print('Error opening CV: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error opening CV: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// Shows management options for CV
  Future<void> _showCVManagementOptions(JobApplication application) async {
    if (application.cvUrl == null || application.cvUrl!.isEmpty) {
      _uploadNewCV(application);
      return;
    }

    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return SafeArea(
          child: Wrap(
            children: [
              ListTile(
                leading: const Icon(Icons.visibility, color: Colors.blue),
                title: const Text('View CV'),
                onTap: () async {
                  Navigator.pop(context);
                  final url = Uri.parse(application.cvUrl!);
                  if (await canLaunchUrl(url)) {
                    await launchUrl(url, mode: LaunchMode.externalApplication);
                  }
                },
              ),
              ListTile(
                leading: const Icon(Icons.upload_file, color: Colors.orange),
                title: const Text('Replace CV'),
                onTap: () {
                  Navigator.pop(context);
                  _uploadNewCV(application);
                },
              ),
              ListTile(
                leading: const Icon(Icons.delete, color: Colors.red),
                title: const Text('Delete CV'),
                onTap: () {
                  Navigator.pop(context);
                  _deleteCV(application);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  /// Upload new CV (or replace existing)
  Future<void> _uploadNewCV(JobApplication application) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx'],
    );

    if (result == null || result.files.single.path == null) return;

    try {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Uploading CV...'),
          duration: Duration(seconds: 2),
        ),
      );

      await _apiService.uploadCV(application.id, result.files.single.path!);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('CV uploaded successfully'),
            backgroundColor: Colors.green,
          ),
        );
        // Reload applications to get updated CV URL
        _loadApplications();
      }
    } catch (e) {
      print('Error uploading CV: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Failed to upload CV: ${e.toString().replaceFirst("Exception: ", "")}',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// Delete CV
  Future<void> _deleteCV(JobApplication application) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Delete CV'),
            content: const Text(
              'Are you sure you want to delete your CV? You can upload a new one later.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                style: TextButton.styleFrom(foregroundColor: Colors.red),
                child: const Text('Delete'),
              ),
            ],
          ),
    );

    if (confirmed != true) return;

    try {
      await _apiService.deleteCV(application.id);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('CV deleted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        // Reload applications to reflect the change
        _loadApplications();
      }
    } catch (e) {
      print('Error deleting CV: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Failed to delete CV: ${e.toString().replaceFirst("Exception: ", "")}',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
