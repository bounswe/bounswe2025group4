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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('User Profile')),
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
