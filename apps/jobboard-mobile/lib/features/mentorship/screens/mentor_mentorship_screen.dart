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

  final mockRequests = [
    MentorshipRequest(
      id: 1,
      mentee: User(
        id: "156",
        username: "alice",
        firstName: "Alice",
        lastName: "Johnson",
        role: UserType.ROLE_JOBSEEKER,
        jobTitle: "Junior Developer",
        company: "TechCorp",
        email: "alice@nutritionai.com",
      ),
      mentor: User(
        id: "1234",
        username: "abcd",
        firstName: "Jack",
        lastName: "Deniz",
        role: UserType.ROLE_JOBSEEKER,
        jobTitle: "Junior Developer",
        company: "Meta",
        email: "jack@meta.com",
      ),

      status: MentorshipRequestStatus.PENDING,
      message: "I’d love mentorship on mobile app development!",
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
    ),

    MentorshipRequest(
      id: 2,
      mentee: User(
        id: "123",
        username: "mehmet-yilmaz",
        firstName: "Mehmet",
        lastName: "Yilmaz",
        role: UserType.ROLE_JOBSEEKER,
        jobTitle: "CS Student",
        company: "TechCorp",
        email: "alice@techcorp.com",
      ),
      mentor: User(
        id: "1234",
        username: "abcd",
        firstName: "Jack",
        lastName: "Deniz",
        role: UserType.ROLE_JOBSEEKER,
        jobTitle: "Junior Developer",
        company: "Meta",
        email: "jack@meta.com",
      ),

      status: MentorshipRequestStatus.ACCEPTED,
      message: "Hi! I'm a successful student who would love your mentorship on software engineering!",
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
    ),

    MentorshipRequest(
      id: 3,
      mentee: User(
        id: "123",
        username: "yann-lecun",
        firstName: "Yann",
        lastName: "LeCun",
        role: UserType.ROLE_EMPLOYER,
        jobTitle: "Researcher",
        company: "Meta",
        email: "yannle@meta.com",
      ),
      mentor: User(
        id: "1234",
        username: "abcd",
        firstName: "Jack",
        lastName: "Deniz",
        role: UserType.ROLE_JOBSEEKER,
        jobTitle: "Junior Developer",
        company: "Meta",
        email: "jack@meta.com",
      ),

      status: MentorshipRequestStatus.ACCEPTED,
      message: "Hi! I'm a senior researcher at Meta, and I love your mentorship!",
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
    ),

  ];

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
          SnackBar(content: Text(AppLocalizations.of(context)!.mentorScreen_capacityUpdated)),
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
            title: Text(AppLocalizations.of(context)!.mentorScreen_updateCapacityTitle),
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
                child: Text(AppLocalizations.of(context)!.mentorScreen_cancel),
                style: TextButton.styleFrom(
                  foregroundColor: Colors.blue,
                ),
              ),
              TextButton(
                onPressed: () {
                  _updateCapacity();
                  Navigator.pop(context);
                },
                child: Text(AppLocalizations.of(context)!.mentorScreen_update),
                style: TextButton.styleFrom(
                  foregroundColor: Colors.blue,
                ),
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
    final isComplete = status == MentorshipRequestStatus.COMPLETED;
    final actionColor = isComplete ? Colors.green : Colors.red;

    // Capture the provider before showing dialog
    final mentorProvider = Provider.of<MentorProvider>(context, listen: false);

    showDialog(
      context: context,
      builder:
          (dialogContext) => AlertDialog(
            title: Text(isComplete 
                ? AppLocalizations.of(context)!.mentorScreen_completeMentorship
                : AppLocalizations.of(context)!.mentorScreen_cancelMentorship),
            content: Text(isComplete
                ? AppLocalizations.of(context)!.mentorScreen_confirmComplete(menteeName)
                : AppLocalizations.of(context)!.mentorScreen_confirmCancel(menteeName)),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialogContext),
                child: Text(AppLocalizations.of(context)!.mentorScreen_cancel),
                style: TextButton.styleFrom(
                  foregroundColor: Colors.blue,
                ),
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
                        content: Text(isComplete
                            ? AppLocalizations.of(context)!.mentorScreen_mentorshipCompleted
                            : AppLocalizations.of(context)!.mentorScreen_mentorshipCancelled),
                        backgroundColor: actionColor.withOpacity(0.8),
                      ),
                    );
                  }
                },
                child: Text(AppLocalizations.of(context)!.mentorScreen_confirm, 
                    style: TextStyle(color: actionColor)),
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

          return TabBarView(
            controller: _tabController,
            children: [
              // Current Mentees Tab
              RefreshIndicator(
                onRefresh: refresh,
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            AppLocalizations.of(context)!.mentorScreen_currentCapacity(
                              mentorProvider.currentUserMentorProfile?.capacity ?? 10
                            ),
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          ElevatedButton(
                            onPressed: _showCapacityDialog,
                            child: Text(AppLocalizations.of(context)!.mentorScreen_updateCapacity),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child:
                          //mentorProvider.mentorRequests
                          mockRequests
                                  .where(
                                    (r) =>
                                        r.status ==
                                        MentorshipRequestStatus.ACCEPTED,
                                  )
                                  .isEmpty
                              ? ListView(
                                // Use ListView instead of Center to make it scrollable for RefreshIndicator
                                children: [
                                  const SizedBox(
                                    height: 100,
                                  ), // Add space to center content visually
                                  Center(
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          Icons.person_off,
                                          size: 48,
                                          color: Colors.grey[400],
                                        ),
                                        const SizedBox(height: 16),
                                        Text(
                                          AppLocalizations.of(context)!.mentorScreen_noCurrentMentees,
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
                                itemCount:
                                    //mentorProvider.mentorRequests
                                    mockRequests
                                        .where(
                                          (r) =>
                                              r.status ==
                                              MentorshipRequestStatus.ACCEPTED,
                                        )
                                        .length,
                                itemBuilder: (context, index) {
                                  final request =
                                      //mentorProvider.mentorRequests
                                      mockRequests
                                          .where(
                                            (r) =>
                                                r.status ==
                                                MentorshipRequestStatus
                                                    .ACCEPTED,
                                          )
                                          .toList()[index];
                                  return MenteeCard(
                                    mentee: request.mentee,
                                    onChatTap: () {
                                      // TODO: Implement chat navigation
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text(
                                            AppLocalizations.of(context)!.mentorScreen_openChat(request.mentee.username),
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
              ),
              // Requests Tab
              RefreshIndicator(
                onRefresh: refresh,
                child:
                    //mentorProvider.mentorRequests
                    mockRequests
                            .where(
                              (r) =>
                                  r.status == MentorshipRequestStatus.PENDING,
                            )
                            .isEmpty
                        ? ListView(
                          // Use ListView instead of Center to make it scrollable for RefreshIndicator
                          children: [
                            const SizedBox(
                              height: 100,
                            ), // Add space to center content visually
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
                                    AppLocalizations.of(context)!.mentorScreen_noPendingRequests,
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
                          itemCount:
                              //mentorProvider.mentorRequests
                              mockRequests
                                  .where(
                                    (r) =>
                                        r.status ==
                                        MentorshipRequestStatus.PENDING,
                                  )
                                  .length,
                          itemBuilder: (context, index) {
                            final request =
                                mockRequests//mentorProvider.mentorRequests
                                    .where(
                                      (r) =>
                                          r.status ==
                                          MentorshipRequestStatus.PENDING,
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
                                    SnackBar(
                                      content: Text(AppLocalizations.of(context)!.mentorScreen_requestAccepted),
                                    ),
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
                                    SnackBar(
                                      content: Text(AppLocalizations.of(context)!.mentorScreen_requestRejected),
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
