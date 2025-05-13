import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

import '../../../core/models/job_application.dart';
import '../../../core/services/api_service.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/utils/string_extensions.dart';

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
        _errorMessage = "Error: User not found. Cannot load applications.";
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
          _errorMessage = "Failed to load applications. Please try again.";
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
      appBar: AppBar(title: const Text('My Job Applications')),
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
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_applications.isEmpty) {
      return const Center(child: Text('You have not applied to any jobs yet.'));
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
            Text('Applied: ${dateFormat.format(application.dateApplied)}'),
            if (application.employerFeedback != null &&
                application.employerFeedback!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4.0),
                child: Text(
                  'Feedback: ${application.employerFeedback}',
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
          // Show a more detailed feedback in a dialog if available
          if (application.employerFeedback != null &&
              application.employerFeedback!.isNotEmpty) {
            showDialog(
              context: context,
              builder:
                  (context) => AlertDialog(
                    title: Text('Feedback for ${application.jobTitle}'),
                    content: Text(application.employerFeedback!),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Close'),
                      ),
                    ],
                  ),
            );
          }
        },
      ),
    );
  }

  Color _getStatusColor(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.approved:
        return Colors.green.shade700;
      case ApplicationStatus.rejected:
        return Colors.red.shade700;
      case ApplicationStatus.pending:
      default:
        return Colors.orange.shade700;
    }
  }
}
