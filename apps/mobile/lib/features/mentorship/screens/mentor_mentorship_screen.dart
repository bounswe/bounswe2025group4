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
      // Load data, the loading states are handled inside the provider methods
      await mentorProvider.fetchMentorRequests();

      if (mentorProvider.currentUserMentorProfile == null) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        await mentorProvider.fetchCurrentUserMentorProfile(
          int.parse(authProvider.currentUser!.id),
        );
      }
    } catch (e) {
      // Error is already handled in the provider
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

  // Show dialog to confirm complete or cancel action
  void _showMentorshipActionDialog(
    int requestId,
    String menteeName,
    MentorshipRequestStatus status,
  ) {
    final actionText =
        status == MentorshipRequestStatus.COMPLETED ? 'complete' : 'cancel';
    final actionColor =
        status == MentorshipRequestStatus.COMPLETED ? Colors.green : Colors.red;

    // Capture the provider before showing dialog
    final mentorProvider = Provider.of<MentorProvider>(context, listen: false);

    showDialog(
      context: context,
      builder:
          (dialogContext) => AlertDialog(
            title: Text('$actionText Mentorship'),
            content: Text(
              'Are you sure you want to $actionText your mentorship with $menteeName?'
              '${status == MentorshipRequestStatus.COMPLETED ? '\n\nThis will mark the mentorship as successfully completed.' : '\n\nThis will end the mentorship relationship.'}',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialogContext),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () async {
                  Navigator.pop(dialogContext);
                  // Use the captured provider instead of trying to get it from the dialog context
                  final success = await mentorProvider.updateRequestStatus(
                    requestId: requestId,
                    status: status,
                  );
                  if (success && mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Mentorship ${actionText}d successfully'),
                        backgroundColor: actionColor.withOpacity(0.8),
                      ),
                    );
                  }
                },
                child: Text('Confirm', style: TextStyle(color: actionColor)),
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
        automaticallyImplyLeading: false,
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
                                  onCompleteTap:
                                      () => _showMentorshipActionDialog(
                                        request.id,
                                        request.mentee.username,
                                        MentorshipRequestStatus.COMPLETED,
                                      ),
                                  onCancelTap:
                                      () => _showMentorshipActionDialog(
                                        request.id,
                                        request.mentee.username,
                                        MentorshipRequestStatus.CANCELLED,
                                      ),
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
