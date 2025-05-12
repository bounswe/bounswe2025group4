import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

import '../../../core/models/job_post.dart';
import '../../../core/models/user_type.dart';
import '../../../core/services/api_service.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/utils/string_extensions.dart';

class JobDetailsScreen extends StatefulWidget {
  final String jobId;

  const JobDetailsScreen({super.key, required this.jobId});

  @override
  State<JobDetailsScreen> createState() => _JobDetailsScreenState();
}

class _JobDetailsScreenState extends State<JobDetailsScreen> {
  JobPost? _jobPost;
  bool _isLoading = true;
  String? _errorMessage;
  bool _isApplying = false; // State for apply button loading

  // Initialize ApiService late or in initState AFTER getting AuthProvider
  late final ApiService _apiService;

  @override
  void initState() {
    super.initState();
    // Get AuthProvider first
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    // Initialize ApiService with AuthProvider
    _apiService = ApiService(authProvider: authProvider);
    _loadJobDetails();
  }

  Future<void> _loadJobDetails() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final jobPost = await _apiService.getJobDetails(widget.jobId);
      if (mounted) {
        setState(() {
          _jobPost = jobPost;
        });
      }
    } catch (e) {
      print("Error loading job details: $e");
      if (mounted) {
        setState(() {
          _errorMessage = "Failed to load job details. Please try again.";
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

  Future<void> _applyToJob() async {
    final userId =
        Provider.of<AuthProvider>(context, listen: false).currentUser?.id;
    if (userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Error: Could not identify user.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_jobPost == null) return;

    setState(() {
      _isApplying = true;
    });

    try {
      await _apiService.applyToJob(userId, _jobPost!.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Successfully applied to ${_jobPost!.title}'),
            backgroundColor: Colors.green,
          ),
        );
        // Optional: Navigate back or update UI to show applied status
        Navigator.of(context).pop(); // Go back after applying
      }
    } catch (e) {
      print("Error applying to job: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Error applying: ${e.toString().replaceFirst("Exception: ", "")}',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isApplying = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // Show job title in AppBar if loaded
        title: Text(_jobPost?.title ?? 'Job Details'),
      ),
      body: _buildContent(),
      // Add Apply button at the bottom
      bottomNavigationBar: _buildApplyButton(),
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
                onPressed: _loadJobDetails,
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_jobPost == null) {
      return const Center(child: Text('Job details not found.'));
    }

    final job = _jobPost!;
    final dateFormat = DateFormat.yMMMd();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Section
          Text(
            job.title,
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8.0),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(job.company, style: Theme.of(context).textTheme.titleMedium),
              Text(
                job.jobType ?? 'N/A',
                style: Theme.of(
                  context,
                ).textTheme.titleSmall?.copyWith(color: Colors.blueGrey),
              ),
            ],
          ),
          const SizedBox(height: 4.0),
          if (job.datePosted != null)
            Text(
              'Posted: ${dateFormat.format(job.datePosted!)}',
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(color: Colors.grey.shade600),
            )
          else
            Text(
              'Posted: Unknown',
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(color: Colors.grey.shade600),
            ),

          const Divider(height: 32.0),

          // Description Section
          Text(
            'Job Description',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8.0),
          Text(job.description, style: Theme.of(context).textTheme.bodyMedium),

          const Divider(height: 32.0),

          // Ethical Policies Section
          Text('Ethical Tags', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8.0),
          if (job.ethicalTags.isNotEmpty)
            Wrap(
              spacing: 8.0,
              runSpacing: 4.0,
              children:
                  job.ethicalTags
                      .split(',')
                      .map((e) => e.trim())
                      .where((e) => e.isNotEmpty)
                      .map(
                        (tag) => Chip(
                          label: Text(tag.formatFilterName()),
                          backgroundColor: Colors.teal.shade50,
                          side: BorderSide.none,
                        ),
                      )
                      .toList(),
            )
          else
            Text(
              'No specific tags listed.',
              style: Theme.of(context).textTheme.bodySmall,
            ),

          const Divider(height: 32.0),

          // Salary Section
          Text('Salary Range', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8.0),
          Text(
            job.salaryRange ?? 'Not specified',
            style: Theme.of(context).textTheme.bodyMedium,
          ),

          const Divider(height: 32.0),

          // Contact Section
          Text(
            'Contact Information',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8.0),
          Text(
            (job.contactInfo != null && job.contactInfo!.isNotEmpty)
                ? job.contactInfo!
                : 'Not specified',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 24.0), // Space before apply button area
        ],
      ),
    );
  }

  Widget? _buildApplyButton() {
    // Only show button if job loaded and user is a job seeker
    final userRole =
        Provider.of<AuthProvider>(context, listen: false).currentUser?.role;
    if (_isLoading || _jobPost == null || userRole != UserType.JOB_SEEKER) {
      return null;
    }

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: ElevatedButton.icon(
        icon:
            _isApplying
                ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
                : const Icon(Icons.send),
        label: Text(_isApplying ? 'Applying...' : 'Apply Now'),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.teal, // Or theme primary color
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 50), // Full width button
          textStyle: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(color: Colors.white),
        ),
        onPressed: _isApplying ? null : _applyToJob, // Disable while applying
      ),
    );
  }
}
