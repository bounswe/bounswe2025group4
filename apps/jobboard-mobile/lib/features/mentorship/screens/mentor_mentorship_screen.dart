import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/models/mentorship_request.dart';
import '../providers/mentor_provider.dart';
import '../widgets/mentee_card.dart';
import '../widgets/mentorship_request_card.dart';
import 'package:mobile/core/models/mentor_profile.dart';
import 'package:mobile/core/models/user.dart';
import 'package:mobile/core/models/user_type.dart';
import '../../../generated/l10n/app_localizations.dart';

class MentorMentorshipScreen extends StatefulWidget {
  const MentorMentorshipScreen({super.key});

  @override
  State<MentorMentorshipScreen> createState() => _MentorMentorshipScreenState();
}

class _MentorMentorshipScreenState extends State<MentorMentorshipScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _capacityController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);

    // Schedule the data loading after the initial build is complete
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
      print("Data loaded");
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _capacityController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    if (!mounted) return;

    final mentorProvider = Provider.of<MentorProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userId = authProvider.currentUser!.id;

    try {
      await Future.wait([
        mentorProvider.fetchMentorRequests(userId),
        mentorProvider.fetchCurrentUserMentorProfile(userId),
      ]);
    } catch (_) {
      // errors handled in provider
    }
  }

  Future<void> _updateMaxMentees() async {
    final mentorProvider = Provider.of<MentorProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userId = authProvider.currentUser!.id;

    final profile = mentorProvider.currentUserMentorProfile;
    if (profile == null) return;

    final newMax = int.tryParse(_capacityController.text);
    if (newMax != null && newMax > 0) {
      final success = await mentorProvider.updateMentorProfile(
        userId: userId,
        expertise: profile.expertise,
        maxMentees: newMax,
      );
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(context)!.mentorScreen_capacityUpdated,
            ),
          ),
        );
      }
    }
  }

  void _showCapacityDialog() {
    final mentorProvider = Provider.of<MentorProvider>(context, listen: false);
    final currentMax =
        mentorProvider.currentUserMentorProfile?.maxMentees ?? 1;
    _capacityController.text = currentMax.toString();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          AppLocalizations.of(context)!.mentorScreen_updateCapacityTitle,
        ),
        content: TextField(
          controller: _capacityController,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            labelText: AppLocalizations.of(context)!.mentorScreen_maxMentees,
            hintText: AppLocalizations.of(context)!.mentorScreen_enterNumber,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            style: TextButton.styleFrom(foregroundColor: Colors.blue),
            child: Text(AppLocalizations.of(context)!.mentorScreen_cancel),
          ),
          TextButton(
            onPressed: () {
              _updateMaxMentees();
              Navigator.pop(context);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.blue),
            child: Text(AppLocalizations.of(context)!.mentorScreen_update),
          ),
        ],
      ),
    );
  }

  // This method can be called from the RefreshIndicator
  Future<void> refresh() async {
    return _loadData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.mentorScreen_title),
        automaticallyImplyLeading: false,
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(text: AppLocalizations.of(context)!.mentorScreen_currentMentees), 
            Tab(text: AppLocalizations.of(context)!.mentorScreen_requests)
          ],
          indicatorColor: Colors.blue,
          labelColor: Colors.blue,
        ),
      ),
      body: Consumer<MentorProvider>(
        builder: (context, mentorProvider, child) {
          if (mentorProvider.isLoadingProfile ||
              mentorProvider.isLoadingMentorRequests) {
            return const Center(child: CircularProgressIndicator());
          }

          final profile = mentorProvider.currentUserMentorProfile;
          final acceptedRequests = mentorProvider.mentorRequests
              .where((r) => r.status == MentorshipRequestStatus.ACCEPTED)
              .toList();
          final pendingRequests = mentorProvider.mentorRequests
              .where((r) => r.status == MentorshipRequestStatus.PENDING)
              .toList();

          return TabBarView(
            controller: _tabController,
            children: [
              // Current Mentees Tab
              RefreshIndicator(
                onRefresh: refresh,
                child: Column(
                  children: [
                    if (profile != null)
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              AppLocalizations.of(context)!
                                  .mentorScreen_currentCapacity(
                                profile.maxMentees,
                              ),
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            ElevatedButton(
                              onPressed: _showCapacityDialog,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blue,
                                foregroundColor: Colors.white,
                              ),
                              child: Text(
                                AppLocalizations.of(context)!
                                    .mentorScreen_updateCapacity,
                              ),
                            ),
                          ],
                        ),
                      ),
                    Expanded(
                      child: acceptedRequests.isEmpty
                          ? ListView(
                        children: [
                          const SizedBox(height: 100),
                          Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.person_off,
                                  size: 48,
                                  color: Colors.grey[400],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  AppLocalizations.of(context)!
                                      .mentorScreen_noCurrentMentees,
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      )
                          : ListView.builder(
                        itemCount: acceptedRequests.length,
                        itemBuilder: (context, index) {
                          final request = acceptedRequests[index];
                          final menteeLabel =
                          (request.requesterId ?? '').isNotEmpty
                              ? request.requesterId!
                              : 'Mentee ${request.id}';
                          return MenteeCard(
                            menteeLabel: menteeLabel,
                            onChatTap: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    AppLocalizations.of(context)!
                                        .mentorScreen_openChat(
                                        menteeLabel ?? 'Unknown',
                                    ),
                                  ),
                                ),
                              );
                            },
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),

              // Requests Tab
              RefreshIndicator(
                onRefresh: refresh,
                child: pendingRequests.isEmpty
                    ? ListView(
                  children: [
                    const SizedBox(height: 100),
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.mail_outline,
                            size: 48,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            AppLocalizations.of(context)!
                                .mentorScreen_noPendingRequests,
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                )
                    : ListView.builder(
                  itemCount: pendingRequests.length,
                  itemBuilder: (context, index) {
                    final request = pendingRequests[index];
                    return MentorshipRequestCard(
                      request: request,
                      onAccept: () async {
                        final success = await mentorProvider
                            .respondToRequest(
                          requestId: request.id,
                          accept: true,
                        );
                        if (success && mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                AppLocalizations.of(context)!
                                    .mentorScreen_requestAccepted,
                              ),
                            ),
                          );
                        }
                      },
                      onReject: () async {
                        final success = await mentorProvider
                            .respondToRequest(
                          requestId: request.id,
                          accept: false,
                        );
                        if (success && mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                AppLocalizations.of(context)!
                                    .mentorScreen_requestRejected,
                              ),
                            ),
                          );
                        }
                      },
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
