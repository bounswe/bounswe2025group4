import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../widgets/mentor_card.dart';
import '../widgets/pending_request_card.dart';
import '../widgets/active_mentorship_card.dart';
import '../providers/mentor_provider.dart';
import 'package:mobile/core/models/mentorship_request.dart';
import './direct_message_screen.dart';
import './mentor_profile_screen.dart';

// Find Mentors tab content - updated to use real API data
class FindMentorsTab extends StatefulWidget {
  const FindMentorsTab({super.key});

  @override
  State<FindMentorsTab> createState() => _FindMentorsTabState();
}

class _FindMentorsTabState extends State<FindMentorsTab> {
  final TextEditingController _searchController = TextEditingController();
  final _messageController = TextEditingController();
  bool _isFiltered = false;
  List<dynamic> _filteredMentors = [];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_filterMentors);

    // Delay showing content to avoid UI jumps
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadMentors();
    });
  }

  @override
  void dispose() {
    _searchController.removeListener(_filterMentors);
    _searchController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _loadMentors() async {
    final mentorProvider = Provider.of<MentorProvider>(context, listen: false);
    await mentorProvider.fetchAvailableMentors();
  }

  void _filterMentors() {
    final mentorProvider = Provider.of<MentorProvider>(context, listen: false);
    final query = _searchController.text.toLowerCase();

    setState(() {
      if (query.isEmpty) {
        _isFiltered = false;
      } else {
        _isFiltered = true;
        _filteredMentors =
            mentorProvider.availableMentors.where((mentor) {
              final name = mentor.user.name.toLowerCase();
              final jobTitle = mentor.user.jobTitle?.toLowerCase() ?? '';
              final company = mentor.user.company?.toLowerCase() ?? '';
              return name.contains(query) ||
                  jobTitle.contains(query) ||
                  company.contains(query);
            }).toList();
      }
    });
  }

  void _navigateToMentorProfile(
    String userId,
    int mentorId,
    String mentorName,
  ) {
    print('Navigating to mentor profile for $mentorId');
    Navigator.push(
      context,
      MaterialPageRoute(
        builder:
            (context) => MentorProfileScreen(
              userId: userId,
              mentorId: mentorId,
              mentorName: mentorName,
            ),
      ),
    );
  }

  void _showRequestMentorshipDialog(int mentorId, String mentorName) {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Text('Request Mentorship from $mentorName'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Please provide a message for your mentorship request:',
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _messageController,
                  decoration: const InputDecoration(
                    hintText: 'I would like you to be my mentor because...',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 3,
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () {
                  if (_messageController.text.trim().length < 10) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Please enter a message of at least 10 characters',
                        ),
                      ),
                    );
                    return;
                  }
                  _handleRequestMentorship(
                    mentorId,
                    mentorName,
                    _messageController.text,
                  );
                  Navigator.pop(context);
                  _messageController.clear();
                },
                child: const Text('Send Request'),
              ),
            ],
          ),
    );
  }

  Future<void> _handleRequestMentorship(
    int mentorId,
    String mentorName,
    String message,
  ) async {
    final mentorProvider = Provider.of<MentorProvider>(context, listen: false);

    try {
      final success = await mentorProvider.createMentorshipRequest(
        mentorId: mentorId,
        message: message,
      );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Mentorship requested for $mentorName')),
        );
        // Refresh mentee requests to show the new request
        await mentorProvider.fetchMenteeRequests();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('There is an error while requesting'),
            backgroundColor: Colors.red,
            duration: Duration(seconds: 5),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<MentorProvider>(
      builder: (context, mentorProvider, child) {
        final mentors =
            _isFiltered ? _filteredMentors : mentorProvider.availableMentors;

        Widget contentWidget;

        if (mentorProvider.isLoadingMentors) {
          contentWidget = const Center(child: CircularProgressIndicator());
        } else if (mentorProvider.error != null && mentors.isEmpty) {
          // Only show error state if there are no mentors to display
          contentWidget = Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Error loading mentors: ${mentorProvider.error}'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    mentorProvider.clearError();
                    _loadMentors();
                  },
                  child: const Text('Retry Loading Mentors'),
                ),
              ],
            ),
          );
        } else if (mentors.isEmpty) {
          contentWidget = const Center(child: Text('No mentors found.'));
        } else {
          contentWidget = ListView.builder(
            itemCount: mentors.length,
            padding: EdgeInsets.zero,
            itemBuilder: (context, index) {
              final mentor = mentors[index];
              return MentorCard(
                mentorId: mentor.id.toString(),
                name: mentor.user.name,
                role: mentor.user.jobTitle ?? 'Mentor',
                company: mentor.user.company,
                maxMenteeCount: mentor.capacity,
                currentMenteeCount: mentor.currentMenteeCount,
                averageRating: mentor.averageRating,
                onTap:
                    () => _navigateToMentorProfile(
                      mentor.user.id,
                      mentor.id,
                      mentor.user.name,
                    ),
                onRequestTap:
                    () => _showRequestMentorshipDialog(
                      mentor.id,
                      mentor.user.name,
                    ),
              );
            },
          );
        }

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search mentors by name, role, company...',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  suffixIcon:
                      _searchController.text.isNotEmpty
                          ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                            },
                          )
                          : null,
                ),
              ),
            ),
            Expanded(
              // Always wrap in a scrollable widget for RefreshIndicator
              child:
                  mentors.isEmpty && !mentorProvider.isLoadingMentors
                      ? ListView(
                        // Use ListView with a centered item instead of just Center
                        children: [
                          SizedBox(
                            height: MediaQuery.of(context).size.height / 3,
                          ),
                          contentWidget,
                        ],
                      )
                      : contentWidget,
            ),
          ],
        );
      },
    );
  }
}

// Updated My Mentorships tab content to use real API data
class MyMentorshipsTab extends StatefulWidget {
  const MyMentorshipsTab({super.key});

  @override
  State<MyMentorshipsTab> createState() => _MyMentorshipsTabState();
}

class _MyMentorshipsTabState extends State<MyMentorshipsTab> {
  @override
  void initState() {
    super.initState();
    // Delay showing content to avoid UI jumps
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  Future<void> _loadData() async {
    final mentorProvider = Provider.of<MentorProvider>(context, listen: false);
    await mentorProvider.fetchMenteeRequests();
  }

  void _navigateToDirectMessage(String mentorId, String mentorName) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder:
            (context) =>
                DirectMessageScreen(mentorId: mentorId, mentorName: mentorName),
      ),
    );
  }

  void _showMentorshipActionDialog(
    int requestId,
    String mentorName,
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
              'Are you sure you want to $actionText your mentorship with $mentorName?'
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
    return Consumer<MentorProvider>(
      builder: (context, mentorProvider, child) {
        // Filter requests by status
        final pendingRequests =
            mentorProvider.menteeRequests
                .where((req) => req.status == MentorshipRequestStatus.PENDING)
                .toList();

        final acceptedRequests =
            mentorProvider.menteeRequests
                .where((req) => req.status == MentorshipRequestStatus.ACCEPTED)
                .toList();

        if (mentorProvider.isLoadingMenteeRequests) {
          // For loading state, still use ListView to ensure it's scrollable for RefreshIndicator
          return ListView(
            children: const [
              SizedBox(height: 100),
              Center(child: CircularProgressIndicator()),
            ],
          );
        }

        if (mentorProvider.error != null) {
          // For error state, use ListView to ensure it's scrollable for RefreshIndicator
          return ListView(
            children: [
              const SizedBox(height: 100),
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Error: ${mentorProvider.error}'),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        mentorProvider.clearError();
                        _loadData();
                      },
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ],
          );
        }

        // If we have no data, still make sure we have a scrollable widget
        if (pendingRequests.isEmpty && acceptedRequests.isEmpty) {
          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              Text(
                'Pending Requests',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              const Text(
                'No pending requests.',
                style: TextStyle(fontStyle: FontStyle.italic),
              ),
              const Divider(height: 32),
              Text(
                'Active Mentorships',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              const Text(
                'No active mentorships.',
                style: TextStyle(fontStyle: FontStyle.italic),
              ),
            ],
          );
        }

        // Regular content with data
        return ListView(
          children: [
            // --- Pending Requests Section ---
            Padding(
              padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 8.0),
              child: Text(
                'Pending Requests',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            if (pendingRequests.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: Text(
                  'No pending requests.',
                  style: TextStyle(fontStyle: FontStyle.italic),
                ),
              )
            else
              ...pendingRequests.map((req) {
                return PendingRequestCard(
                  mentorName: req.mentor.name,
                  status: req.status.toString().split('.').last,
                );
              }).toList(),

            const Divider(height: 32, indent: 16, endIndent: 16),

            // --- Active Mentorships Section ---
            Padding(
              padding: const EdgeInsets.fromLTRB(16.0, 0, 16.0, 8.0),
              child: Text(
                'Active Mentorships',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            if (acceptedRequests.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: Text(
                  'No active mentorships.',
                  style: TextStyle(fontStyle: FontStyle.italic),
                ),
              )
            else
              ...acceptedRequests.map((req) {
                return ActiveMentorshipCard(
                  mentorId: req.mentor.id.toString(),
                  mentorName: req.mentor.name,
                  mentorRole: req.mentor.jobTitle,
                  onTap:
                      () => _navigateToDirectMessage(
                        req.mentor.id.toString(),
                        req.mentor.name,
                      ),
                  onCompleteTap:
                      () => _showMentorshipActionDialog(
                        req.id,
                        req.mentor.name,
                        MentorshipRequestStatus.COMPLETED,
                      ),
                  onCancelTap:
                      () => _showMentorshipActionDialog(
                        req.id,
                        req.mentor.name,
                        MentorshipRequestStatus.CANCELLED,
                      ),
                );
              }).toList(),
          ],
        );
      },
    );
  }
}

class MenteeMentorshipScreen extends StatefulWidget {
  const MenteeMentorshipScreen({super.key});

  @override
  State<MenteeMentorshipScreen> createState() => _MenteeMentorshipScreenState();
}

class _MenteeMentorshipScreenState extends State<MenteeMentorshipScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // Method to refresh data in all tabs
  Future<void> refresh() async {
    // Get the MentorProvider
    final mentorProvider = Provider.of<MentorProvider>(context, listen: false);

    // Refresh all relevant data
    await Future.wait([
      mentorProvider.fetchMenteeRequests(),
      mentorProvider.fetchAvailableMentors(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mentorship'),
        automaticallyImplyLeading: false,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [Tab(text: 'Find Mentors'), Tab(text: 'My Mentorships')],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Find Mentors Tab - Wrap with RefreshIndicator
          RefreshIndicator(onRefresh: refresh, child: const FindMentorsTab()),

          // My Mentorships Tab - Wrap with RefreshIndicator
          RefreshIndicator(onRefresh: refresh, child: const MyMentorshipsTab()),
        ],
      ),
    );
  }
}
