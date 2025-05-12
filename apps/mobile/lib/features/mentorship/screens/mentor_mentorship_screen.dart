import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/models/mentorship_request.dart';
import '../providers/mentor_provider.dart';
import '../widgets/mentee_card.dart';
import '../widgets/mentorship_request_card.dart';

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
    try {
      await mentorProvider.fetchMentorRequests();

      // Add debugging information
      print("Mentor requests loaded: ${mentorProvider.mentorRequests.length}");
      for (var request in mentorProvider.mentorRequests) {
        print(
          "Request ID: ${request.id}, Status: ${request.status}, From: ${request.mentee.username}",
        );
      }
      print(
        "Mentor profile loaded: ${mentorProvider.currentUserMentorProfile}",
      );
      if (mentorProvider.currentUserMentorProfile == null && mounted) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        await mentorProvider.fetchCurrentUserMentorProfile(
          int.parse(authProvider.currentUser!.id),
        );
      }
    } catch (e) {
      if (mounted) {
        print("Error loading mentor data: $e");
      }
    }
  }

  Future<void> _updateCapacity() async {
    final mentorProvider = Provider.of<MentorProvider>(context, listen: false);
    final newCapacity = int.tryParse(_capacityController.text);
    if (newCapacity != null && newCapacity > 0) {
      final success = await mentorProvider.updateMentorCapacity(newCapacity);
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Capacity updated successfully')),
        );
      }
    }
  }

  void _showCapacityDialog() {
    final mentorProvider = Provider.of<MentorProvider>(context, listen: false);
    final currentCapacity =
        mentorProvider.currentUserMentorProfile?.capacity ?? 1;
    _capacityController.text = currentCapacity.toString();

    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Update Maximum Mentee Capacity'),
            content: TextField(
              controller: _capacityController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Maximum number of mentees',
                hintText: 'Enter a number',
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () {
                  _updateCapacity();
                  Navigator.pop(context);
                },
                child: const Text('Update'),
              ),
            ],
          ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mentorship'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [Tab(text: 'Current Mentees'), Tab(text: 'Requests')],
        ),
      ),
      body: Consumer<MentorProvider>(
        builder: (context, mentorProvider, child) {
          if (mentorProvider.isLoadingProfile ||
              mentorProvider.isLoadingMentorRequests) {
            return const Center(child: CircularProgressIndicator());
          }

          return TabBarView(
            controller: _tabController,
            children: [
              // Current Mentees Tab
              Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Current Capacity: ${mentorProvider.currentUserMentorProfile?.capacity ?? 0}',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        ElevatedButton(
                          onPressed: _showCapacityDialog,
                          child: const Text('Update Capacity'),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child:
                        mentorProvider.mentorRequests
                                .where(
                                  (r) =>
                                      r.status ==
                                      MentorshipRequestStatus.ACCEPTED,
                                )
                                .isEmpty
                            ? Center(
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
                                    'No current mentees',
                                    style: TextStyle(
                                      fontSize: 16,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            )
                            : ListView.builder(
                              itemCount:
                                  mentorProvider.mentorRequests
                                      .where(
                                        (r) =>
                                            r.status ==
                                            MentorshipRequestStatus.ACCEPTED,
                                      )
                                      .length,
                              itemBuilder: (context, index) {
                                final request =
                                    mentorProvider.mentorRequests
                                        .where(
                                          (r) =>
                                              r.status ==
                                              MentorshipRequestStatus.ACCEPTED,
                                        )
                                        .toList()[index];
                                return MenteeCard(
                                  mentee: request.mentee,
                                  onChatTap: () {
                                    // TODO: Implement chat navigation
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          'Open chat with ${request.mentee.username}',
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
              // Requests Tab
              mentorProvider.mentorRequests
                      .where((r) => r.status == MentorshipRequestStatus.PENDING)
                      .isEmpty
                  ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.inbox, size: 48, color: Colors.grey[400]),
                        const SizedBox(height: 16),
                        Text(
                          'No pending mentorship requests',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  )
                  : ListView.builder(
                    itemCount:
                        mentorProvider.mentorRequests
                            .where(
                              (r) =>
                                  r.status == MentorshipRequestStatus.PENDING,
                            )
                            .length,
                    itemBuilder: (context, index) {
                      final request =
                          mentorProvider.mentorRequests
                              .where(
                                (r) =>
                                    r.status == MentorshipRequestStatus.PENDING,
                              )
                              .toList()[index];
                      return MentorshipRequestCard(
                        request: request,
                        onAccept: () async {
                          final success = await mentorProvider
                              .updateRequestStatus(
                                requestId: request.id,
                                status: MentorshipRequestStatus.ACCEPTED,
                              );
                          if (success && mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Request accepted')),
                            );
                          }
                        },
                        onReject: () async {
                          final success = await mentorProvider
                              .updateRequestStatus(
                                requestId: request.id,
                                status: MentorshipRequestStatus.REJECTED,
                              );
                          if (success && mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Request rejected')),
                            );
                          }
                        },
                      );
                    },
                  ),
            ],
          );
        },
      ),
    );
  }
}
