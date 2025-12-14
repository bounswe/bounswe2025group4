import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/full_profile.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/widgets/a11y.dart';

class UserProfileViewScreen extends StatefulWidget {
  final int userId;

  const UserProfileViewScreen({super.key, required this.userId});

  @override
  State<UserProfileViewScreen> createState() => _UserProfileViewScreenState();
}

class _UserProfileViewScreenState extends State<UserProfileViewScreen> {
  late final ApiService _api;
  FullProfile? _profile;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _api = ApiService(authProvider: context.read<AuthProvider>());
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final profile = await _api.getUserProfile(widget.userId);
      setState(() {
        _profile = profile;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _showReportDialog() async {
    final result = await showDialog<Map<String, String>>(
      context: context,
      builder: (BuildContext context) {
        String selectedReason = 'SPAM';
        final descriptionController = TextEditingController();

        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Report Profile'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Reason for reporting:'),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: selectedReason,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'SPAM', child: Text('Spam')),
                        DropdownMenuItem(
                          value: 'FAKE',
                          child: Text('Fake Profile'),
                        ),
                        DropdownMenuItem(
                          value: 'OFFENSIVE',
                          child: Text('Offensive Content'),
                        ),
                        DropdownMenuItem(
                          value: 'HARASSMENT',
                          child: Text('Harassment'),
                        ),
                        DropdownMenuItem(
                          value: 'MISINFORMATION',
                          child: Text('Misinformation'),
                        ),
                        DropdownMenuItem(value: 'OTHER', child: Text('Other')),
                      ],
                      onChanged: (value) {
                        setState(() {
                          selectedReason = value!;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    const Text('Additional details (optional):'),
                    const SizedBox(height: 8),
                    TextField(
                      controller: descriptionController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        hintText: 'Provide more context...',
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop({
                      'reason': selectedReason,
                      'description': descriptionController.text,
                    });
                  },
                  child: const Text('Report'),
                ),
              ],
            );
          },
        );
      },
    );

    if (result != null && mounted) {
      try {
        await _api.reportContent(
          entityType: 'PROFILE',
          entityId: widget.userId,
          reasonType: result['reason']!,
          description: result['description'],
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.white),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Thank you for reporting. We will review it soon.',
                    ),
                  ),
                ],
              ),
              backgroundColor: Colors.green,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          );
        }
      } on SocketException {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Row(
                children: [
                  Icon(Icons.wifi_off, color: Colors.white),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text('Failed: Please check your connection.'),
                  ),
                ],
              ),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              action: SnackBarAction(
                label: 'Retry',
                textColor: Colors.white,
                onPressed: () {
                  _api.reportContent(
                    entityType: 'PROFILE',
                    entityId: widget.userId,
                    reasonType: result['reason']!,
                    description: result['description'],
                  );
                },
              ),
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          // Parse the error message to provide better feedback
          String errorMessage = 'Failed to submit report';

          final errorString = e.toString().toLowerCase();
          if (errorString.contains('already reported') ||
              errorString.contains('duplicate')) {
            errorMessage = 'You have already reported this profile';
          } else if (errorString.contains('unauthorized') ||
              errorString.contains('403')) {
            errorMessage = 'You need to be logged in to report';
          } else if (errorString.contains('not found') ||
              errorString.contains('404')) {
            errorMessage = 'This profile no longer exists';
          } else if (errorString.contains('400') ||
              errorString.contains('bad request')) {
            errorMessage = 'Invalid report data. Please try again';
          } else if (errorString.contains('500') ||
              errorString.contains('server error')) {
            errorMessage = 'Server error. Please try again later';
          }

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.white),
                  const SizedBox(width: 12),
                  Expanded(child: Text(errorMessage)),
                ],
              ),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              duration: const Duration(seconds: 4),
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.read<AuthProvider>();
    final currentUserId = authProvider.currentUser?.id;
    final isOwnProfile =
        currentUserId != null && int.tryParse(currentUserId) == widget.userId;

    return Scaffold(
      appBar: AppBar(
        title: const Text('User Profile'),
        actions: [
          if (!isOwnProfile)
            IconButton(
              icon: const Icon(Icons.flag_outlined),
              tooltip: 'Report Profile',
              onPressed: _showReportDialog,
            ),
        ],
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _errorMessage != null
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      size: 48,
                      color: Colors.red,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Failed to load profile',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(_errorMessage!),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadProfile,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
              : _profile == null
              ? const Center(child: Text('Profile not found'))
              : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Profile Header
                    Center(
                      child: Column(
                        children: [
                          CircleAvatar(
                            radius: 50,
                            backgroundImage:
                                _profile!.profile.profilePicture != null
                                    ? NetworkImage(
                                      _profile!.profile.profilePicture!,
                                    )
                                    : null,
                            child:
                                _profile!.profile.profilePicture == null
                                    ? const Icon(Icons.person, size: 50)
                                    : null,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _profile!.profile.fullName,
                            style: Theme.of(context).textTheme.headlineSmall
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          if (_profile!.profile.occupation != null &&
                              _profile!.profile.occupation!.isNotEmpty)
                            Text(
                              _profile!.profile.occupation!,
                              style: Theme.of(context).textTheme.bodyMedium
                                  ?.copyWith(color: Colors.grey[600]),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Bio Section
                    if (_profile!.profile.bio != null &&
                        _profile!.profile.bio!.isNotEmpty) ...[
                      Text(
                        'About',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Text(_profile!.profile.bio!),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],

                    // Experience Section
                    if (_profile!.experience.isNotEmpty) ...[
                      Text(
                        'Experience',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ..._profile!.experience.map(
                        (exp) => Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  exp.position,
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  exp.company,
                                  style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const A11y(
                                      label: 'Date range',
                                      child: Icon(
                                        Icons.calendar_today,
                                        size: 16,
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${exp.startDate} - ${exp.endDate ?? 'Present'}',
                                      style:
                                          Theme.of(context).textTheme.bodySmall,
                                    ),
                                  ],
                                ),
                                if (exp.description != null &&
                                    exp.description!.isNotEmpty) ...[
                                  const SizedBox(height: 8),
                                  Text(exp.description!),
                                ],
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],

                    // Education Section
                    if (_profile!.education.isNotEmpty) ...[
                      Text(
                        'Education',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ..._profile!.education.map(
                        (edu) => Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  edu.school,
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${edu.degree} in ${edu.field}',
                                  style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const A11y(
                                      label: 'Date range',
                                      child: Icon(
                                        Icons.calendar_today,
                                        size: 16,
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${edu.startDate} - ${edu.endDate ?? 'Present'}',
                                      style:
                                          Theme.of(context).textTheme.bodySmall,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
    );
  }
}
