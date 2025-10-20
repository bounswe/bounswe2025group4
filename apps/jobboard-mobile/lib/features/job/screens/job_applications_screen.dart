import 'dart:io';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:path_provider/path_provider.dart';

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
            _errorMessage =
                AppLocalizations.of(context)!.jobApplications_userError;
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
          _errorMessage =
              AppLocalizations.of(context)!.jobApplications_loadError;
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

    // If user cancelled dialog, don't proceed
    if (feedback == null) return;

    if (!mounted) return;
    setState(() {
      _isUpdatingStatus[application.id] = true;
    });

    try {
      // Use new dedicated endpoints for approve/reject
      final JobApplication updatedApplication;
      if (newStatus == ApplicationStatus.approved) {
        updatedApplication = await _apiService.approveApplication(
          application.id,
          feedback: feedback.isEmpty ? null : feedback,
        );
      } else if (newStatus == ApplicationStatus.rejected) {
        updatedApplication = await _apiService.rejectApplication(
          application.id,
          feedback: feedback.isEmpty ? null : feedback,
        );
      } else {
        // For pending status (unlikely but handle it)
        updatedApplication = await _apiService.updateApplicationStatus(
          application.id,
          newStatus,
          jobPostingId: application.jobPostId,
          jobSeekerId: application.jobSeekerId,
          feedback: feedback.isEmpty ? null : feedback,
        );
      }

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

        final statusMessage =
            newStatus == ApplicationStatus.approved
                ? 'Application approved successfully'
                : newStatus == ApplicationStatus.rejected
                ? 'Application rejected'
                : 'Application status updated';

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(statusMessage), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      print("Error updating application status: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(context)!.jobApplications_updateError(
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
          _isUpdatingStatus[application.id] = false;
        });
      }
    }
  }

  Future<String?> _showFeedbackDialog(ApplicationStatus action) async {
    final controller = TextEditingController();
    final isApproving = action == ApplicationStatus.approved;

    return showDialog<String>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Text(
              isApproving ? 'Approve Application' : 'Reject Application',
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isApproving
                      ? 'Provide feedback to the applicant (optional):'
                      : 'Provide reason for rejection (optional):',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: controller,
                  decoration: InputDecoration(
                    hintText:
                        isApproving
                            ? 'e.g., Great qualifications! We\'ll contact you soon.'
                            : 'e.g., We have selected other candidates at this time.',
                    border: const OutlineInputBorder(),
                    contentPadding: const EdgeInsets.all(12),
                  ),
                  maxLines: 4,
                ),
                const SizedBox(height: 8),
                Text(
                  'The applicant will see this feedback.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade600,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(null),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed:
                    () => Navigator.of(context).pop(controller.text.trim()),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isApproving ? Colors.green : Colors.red,
                  foregroundColor: Colors.white,
                ),
                child: Text(isApproving ? 'Approve' : 'Reject'),
              ),
            ],
          ),
    ).whenComplete(() {
      // Delay disposal to avoid _dependents.isEmpty error
      Future.delayed(const Duration(milliseconds: 100), () {
        controller.dispose();
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.jobTitle ??
              AppLocalizations.of(context)!.jobApplications_title,
        ),
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
          AppLocalizations.of(context)!.jobApplications_noApplications,
        ),
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
            if (application.specialNeeds != null &&
                application.specialNeeds!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Text(
                  'Special Needs: ${application.specialNeeds}',
                  style: Theme.of(
                    context,
                  ).textTheme.bodySmall?.copyWith(color: Colors.blue.shade700),
                ),
              ),
            if (application.cvUrl != null && application.cvUrl!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: InkWell(
                  onTap: () => _showCVOptions(application),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.attach_file,
                        size: 16,
                        color: Colors.green,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          'CV Attached (tap to view)',
                          style: Theme.of(
                            context,
                          ).textTheme.bodySmall?.copyWith(
                            color: Colors.green.shade700,
                            decoration: TextDecoration.underline,
                            fontWeight: FontWeight.bold,
                          ),
                          overflow: TextOverflow.ellipsis,
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
              ),
            if (application.coverLetter != null &&
                application.coverLetter!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: ExpansionTile(
                  tilePadding: EdgeInsets.zero,
                  title: Text(
                    'Cover Letter',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.indigo,
                    ),
                  ),
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8.0),
                      child: Text(
                        application.coverLetter!,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                  ],
                ),
              ),
            if (application.feedback != null &&
                application.feedback!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Text(
                  'Feedback: ${application.feedback}',
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
                          backgroundColor:
                              Colors.blue, // Use blue to match design language
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

  /// Downloads and saves CV file locally
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

  /// Shows options to view or download CV
  Future<void> _showCVOptions(JobApplication application) async {
    if (application.cvUrl == null || application.cvUrl!.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No CV uploaded for this application'),
            backgroundColor: Colors.orange,
          ),
        );
      }
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
                title: const Text('View CV in Browser'),
                subtitle: const Text('Open CV in your browser'),
                onTap: () async {
                  Navigator.pop(context);
                  try {
                    final url = Uri.parse(application.cvUrl!);
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
                },
              ),
              ListTile(
                leading: const Icon(Icons.download, color: Colors.green),
                title: const Text('Download CV'),
                subtitle: const Text('Save CV to your device'),
                onTap: () {
                  Navigator.pop(context);
                  _downloadCV(application);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  /// Downloads CV to device
  Future<void> _downloadCV(JobApplication application) async {
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

      // Get downloads directory (or temp for iOS)
      Directory directory;
      if (Platform.isAndroid) {
        // For Android, try to use Downloads folder
        directory = Directory('/storage/emulated/0/Download');
        if (!await directory.exists()) {
          directory = await getApplicationDocumentsDirectory();
        }
      } else {
        // For iOS, use documents directory
        directory = await getApplicationDocumentsDirectory();
      }

      // Determine file extension from CV URL
      String extension = 'pdf'; // Default to PDF
      if (application.cvUrl != null) {
        final urlLower = application.cvUrl!.toLowerCase();
        if (urlLower.endsWith('.doc')) {
          extension = 'doc';
        } else if (urlLower.endsWith('.docx')) {
          extension = 'docx';
        }
      }

      // Create filename with timestamp to avoid conflicts
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final fileName =
          'cv_${application.applicantName.replaceAll(' ', '_')}_$timestamp.$extension';
      final filePath = '${directory.path}/$fileName';

      // Save file
      final file = File(filePath);
      await file.writeAsBytes(cvBytes);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('CV downloaded successfully\n$filePath'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 5),
            action: SnackBarAction(
              label: 'OPEN',
              textColor: Colors.white,
              onPressed: () async {
                try {
                  final url = Uri.file(filePath);
                  await launchUrl(url);
                } catch (e) {
                  print('Error opening downloaded file: $e');
                }
              },
            ),
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
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }
}
