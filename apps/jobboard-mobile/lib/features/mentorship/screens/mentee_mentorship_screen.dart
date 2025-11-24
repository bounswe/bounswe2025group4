import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/models/mentorship_request.dart';
import 'package:mobile/core/models/mentor_profile.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import '../widgets/mentor_card.dart';
import '../widgets/pending_request_card.dart';
import '../widgets/active_mentorship_card.dart';
import 'package:mobile/core/models/mentorship_status.dart';
import '../providers/mentor_provider.dart';
import './direct_message_screen.dart';
import './mentor_profile_screen.dart';
import '../../../generated/l10n/app_localizations.dart';
import 'package:collection/collection.dart';

/// -------------------- FIND MENTORS TAB --------------------
class FindMentorsTab extends StatefulWidget {
  const FindMentorsTab({super.key});

  @override
  State<FindMentorsTab> createState() => _FindMentorsTabState();
}

class _FindMentorsTabState extends State<FindMentorsTab> {
  final TextEditingController _searchController = TextEditingController();
  bool _isFiltered = false;
  List<MentorProfile> _filteredMentors = [];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_filterMentors);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadMentors();
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final mentorProvider = Provider.of<MentorProvider>(context, listen: false);
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      mentorProvider.fetchCurrentUserMentorProfile(authProvider.currentUser!.id);

      mentorProvider.fetchMenteeRequests(authProvider.currentUser!.id);

    });


  }

  @override
  void dispose() {
    _searchController.removeListener(_filterMentors);
    _searchController.dispose();
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
        _filteredMentors = [];
      } else {
        _isFiltered = true;
        _filteredMentors = mentorProvider.availableMentors.where((mentor) {
          final name = mentor.username.toLowerCase();
          final expertiseText = mentor.expertise.join(' ').toLowerCase();
          return name.contains(query) || expertiseText.contains(query);
        }).toList();
      }
    });
  }

  void _navigateToMentorProfile(String mentorId, String mentorName, int? resumeReviewId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => MentorProfileScreen(
          mentorId: mentorId,
          mentorName: mentorName,
          resumeReviewId: resumeReviewId,
        ),
      ),
    );
  }

  void _showRequestMentorshipDialog(String mentorId, String mentorName) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          AppLocalizations.of(context)!.menteeScreen_requestMentorshipTitle(
            mentorName,
          ),
        ),
        //content: Text(
        //  AppLocalizations.of(context)!.menteeScreen_provideMessage,
        //),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            style: TextButton.styleFrom(foregroundColor: Colors.blue),
            child: Text(AppLocalizations.of(context)!.mentorScreen_cancel),
          ),
          TextButton(
            onPressed: () {
              _handleRequestMentorship(mentorId, mentorName);
              Navigator.pop(context);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.blue),
            child: Text(AppLocalizations.of(context)!.menteeScreen_sendRequest),
          ),
        ],
      ),
    );
  }

  Future<void> _handleRequestMentorship(
      String mentorId,
      String mentorName,
      ) async {
    final mentorProvider = Provider.of<MentorProvider>(
      context,
      listen: false,
    );
    final authProvider = Provider.of<AuthProvider>(
      context,
      listen: false,
    );

    try {
      final numericMentorId = int.tryParse(mentorId);
      if (numericMentorId == null) {
        throw Exception('Invalid mentor id: $mentorId');
      }

      final success = await mentorProvider.createMentorshipRequest(
        mentorId: numericMentorId,
      );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(context)!.menteeScreen_requestSent(
                mentorName,
              ),
            ),
          ),
        );
        await mentorProvider.fetchMenteeRequests(
          authProvider.currentUser!.id,
        );
      }
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context)!.menteeScreen_requestError,
          ),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 5),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<MentorProvider>(
      builder: (context, mentorProvider, child) {
        final mentors = _isFiltered
            ? _filteredMentors
            : mentorProvider.availableMentors;

        Widget contentWidget;

        if (mentorProvider.isLoadingMentors) {
          contentWidget = const Center(child: CircularProgressIndicator());
        } else if (mentorProvider.error != null && mentors.isEmpty) {
          contentWidget = Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Error loading mentors: ${mentorProvider.error}',
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    mentorProvider.clearError();
                    _loadMentors();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                  ),
                  child: Text(
                    AppLocalizations.of(context)!
                        .menteeScreen_retryLoadingMentors,
                  ),
                ),
              ],
            ),
          );
        } else if (mentors.isEmpty) {
          contentWidget = Center(
            child: Text(
              AppLocalizations.of(context)!.menteeScreen_noMentorsFound,
            ),
          );
        } else {
          final authProvider =
          Provider.of<AuthProvider>(context, listen: false);
          contentWidget = ListView.builder(
            itemCount: mentors.length,
            padding: EdgeInsets.zero,
            itemBuilder: (context, index) {
              final mentor = mentors[index];
              final expertiseText = mentor.expertise.isNotEmpty
                  ? mentor.expertise.join(', ')
                  : 'Mentor';

              final menteeRequests = mentorProvider.menteeRequests;
              final resumeId = menteeRequests.firstWhereOrNull(
                (req) => req.mentorId == mentor.id,
              )?.resumeReviewId;

              return MentorCard(
                mentorId: mentor.id,
                name: mentor.username,
                role: expertiseText,
                company: null,
                maxMenteeCount: mentor.maxMentees,
                currentMenteeCount: mentor.currentMentees,
                averageRating: mentor.averageRating,
                onTap: () => _navigateToMentorProfile(
                  mentor.id,          // mentorId
                  mentor.username,    // mentorName
                  resumeId,               // No resumeReviewId when browsing mentors
                ),
                onRequestTap: () => _showRequestMentorshipDialog(
                  mentor.id,
                  mentor.username,
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
                  hintText:
                  AppLocalizations.of(context)!.menteeScreen_searchMentors,
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  suffixIcon: _searchController.text.isNotEmpty
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
              child: mentors.isEmpty && !mentorProvider.isLoadingMentors
                  ? ListView(
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

/// -------------------- MY MENTORSHIPS TAB --------------------
class MyMentorshipsTab extends StatefulWidget {
  const MyMentorshipsTab({super.key});

  @override
  State<MyMentorshipsTab> createState() => _MyMentorshipsTabState();
}

class _MyMentorshipsTabState extends State<MyMentorshipsTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  Future<void> _loadData() async {
    final mentorProvider = Provider.of<MentorProvider>(
      context,
      listen: false,
    );
    final authProvider = Provider.of<AuthProvider>(
      context,
      listen: false,
    );
    await mentorProvider.fetchMenteeRequests(authProvider.currentUser!.id);
  }

  void _navigateToDirectMessage(String mentorId, String mentorName, int? resumeReviewId) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) =>
            DirectMessageScreen(mentorId: mentorId, mentorName: mentorName, resumeReviewId: resumeReviewId),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<MentorProvider>(
      builder: (context, mentorProvider, child) {
        final menteeRequests = mentorProvider.menteeRequests;

        final pendingRequests = menteeRequests
            .where((req) => req.status == MentorshipRequestStatus.PENDING)
            .toList();
        final acceptedRequests = menteeRequests
            .where((req) => req.status == MentorshipRequestStatus.ACCEPTED)
            .toList();

        if (mentorProvider.isLoadingMenteeRequests) {
          return ListView(
            children: const [
              SizedBox(height: 100),
              Center(child: CircularProgressIndicator()),
            ],
          );
        }

        if (mentorProvider.error != null &&
            pendingRequests.isEmpty &&
            acceptedRequests.isEmpty) {
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
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ],
          );
        }

        if (pendingRequests.isEmpty && acceptedRequests.isEmpty) {
          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              Text(
                AppLocalizations.of(context)!.menteeScreen_pendingRequests,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                AppLocalizations.of(context)!.menteeScreen_noPendingRequests,
                style: const TextStyle(fontStyle: FontStyle.italic),
              ),
              const Divider(height: 32),
              Text(
                AppLocalizations.of(context)!.menteeScreen_activeMentorships,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                AppLocalizations.of(context)!.menteeScreen_noActiveMentorships,
                style: const TextStyle(fontStyle: FontStyle.italic),
              ),
            ],
          );
        }

        return ListView(
          children: [
            // Pending Requests
            Padding(
              padding:
              const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 8.0),
              child: Text(
                AppLocalizations.of(context)!.menteeScreen_pendingRequests,
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            if (pendingRequests.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16.0,
                  vertical: 8.0,
                ),
                child: Text(
                  AppLocalizations.of(context)!.menteeScreen_noPendingRequests,
                  style: const TextStyle(fontStyle: FontStyle.italic),
                ),
              )
            else
              ...pendingRequests.map((req) {
                final mentorName =
                    req.mentorUsername ?? 'Mentor ${req.mentorId}';
                return PendingRequestCard(
                  mentorName: mentorName,
                  status: req.status.name,
                );
              }).toList(),

            const Divider(height: 32, indent: 16, endIndent: 16),

            // Active Mentorships
            Padding(
              padding: const EdgeInsets.fromLTRB(16.0, 0, 16.0, 8.0),
              child: Text(
                AppLocalizations.of(context)!.menteeScreen_activeMentorships,
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            if (acceptedRequests.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16.0,
                  vertical: 8.0,
                ),
                child: Text(
                  AppLocalizations.of(context)!.menteeScreen_noActiveMentorships,
                  style: const TextStyle(fontStyle: FontStyle.italic),
                ),
              )
            else
              ...acceptedRequests.map((req) {
                final mentorName =
                    req.mentorUsername ?? 'Mentor ${req.mentorId}';
                return ActiveMentorshipCard(
                  mentorId: req.mentorId,
                  mentorName: mentorName,
                  mentorRole: null,
                  onTap: () => _navigateToDirectMessage(
                    req.mentorId,
                    mentorName,
                    req.resumeReviewId,
                  ),


                  onCompleteTap: req.resumeReviewId != null
                      ? () async {
                    final ok = await mentorProvider.completeMentorship(req.resumeReviewId!);
                    if (ok && mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Mentorship marked as completed")),
                      );
                      _loadData(); // refresh
                    }
                  }
                      : null,
                  onCancelTap: req.resumeReviewId != null
                      ? () async {
                    final ok = await mentorProvider.cancelMentorship(req.resumeReviewId!);
                    if (ok && mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Mentorship cancelled")),
                      );
                      _loadData(); // refresh
                    }
                  }
                      : null,
                );
              }).toList()
          ],
        );
      },
    );
  }
}

/// -------------------- MAIN MENTEE SCREEN --------------------
class MenteeMentorshipScreen extends StatefulWidget {
  const MenteeMentorshipScreen({super.key});

  @override
  State<MenteeMentorshipScreen> createState() =>
      _MenteeMentorshipScreenState();
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

  Future<void> refresh() async {
    final mentorProvider = Provider.of<MentorProvider>(
      context,
      listen: false,
    );
    final authProvider = Provider.of<AuthProvider>(
      context,
      listen: false,
    );

    await Future.wait([
      mentorProvider.fetchAvailableMentors(),
      mentorProvider.fetchMenteeRequests(authProvider.currentUser!.id),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final mentorProvider = Provider.of<MentorProvider>(context);

    final bool showBecomeMentorButton =
        authProvider.currentUser!.mentorshipStatus == MentorshipStatus.MENTEE
            && mentorProvider.currentUserMentorProfile == null;

    void _showBecomeMentorDialog(BuildContext context) {
      final mentorProvider = Provider.of<MentorProvider>(context, listen: false);
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      final TextEditingController maxController = TextEditingController(text: "5");

      final List<String> allExpertises = [
        "Software",
        "Tech",
        "Design",
        "Business",
        "Marketing",
        "HR",
        "Data Science",
        "Consulting",
      ];

      final Set<String> selectedExpertise = {};

      showDialog(
        context: context,
        builder: (context) {
          return StatefulBuilder(
            builder: (context, setState) {
              return AlertDialog(
                title: const Text("Become a Mentor"),
                content: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Select your expertise:",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),

                      // Expertise checkboxes
                      ...allExpertises.map(
                            (exp) => CheckboxListTile(
                          title: Text(exp),
                          value: selectedExpertise.contains(exp),
                          onChanged: (checked) {
                            setState(() {
                              if (checked == true) {
                                selectedExpertise.add(exp);
                              } else {
                                selectedExpertise.remove(exp);
                              }
                            });
                          },
                        ),
                      ),

                      const SizedBox(height: 12),
                      const Text(
                        "Max mentees:",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),

                      TextField(
                        controller: maxController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          hintText: "Enter a positive number",
                          border: OutlineInputBorder(),
                        ),
                      ),
                    ],
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text("Cancel"),
                  ),
                  ElevatedButton(
                    onPressed: () async {
                      final max = int.tryParse(maxController.text);

                      if (max == null || max <= 0) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text("Max mentees must be > 0"),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }

                      final userId = authProvider.currentUser!.id;
                      final parsedId = int.tryParse(authProvider.currentUser!.id);
                      if (parsedId == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text("Invalid user id"),
                            backgroundColor: Colors.red,
                          ),
                        );

                      }
                      final success =
                      await mentorProvider.createMentorProfile(
                        userId: parsedId.toString(),
                        expertise: selectedExpertise.toList(),
                        maxMentees: max,
                      );

                      if (!context.mounted) return;

                      if (success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text("You are now a mentor!"),
                          ),
                        );
                        Navigator.pop(context);

                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              "Failed to create mentor profile: ${mentorProvider.error}",
                            ),
                            backgroundColor: Colors.red,
                          ),
                        );
                      }
                    },
                    child: const Text("Create"),
                  ),
                ],
              );
            },
          );
        },
      );
    }


    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.mentorshipPage_title),
        automaticallyImplyLeading: false,
        actions: [
          if (showBecomeMentorButton)
            TextButton(
              onPressed: () => _showBecomeMentorDialog(context),
              style: TextButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Theme.of(context).colorScheme.onPrimary,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                AppLocalizations.of(context)!.mentorshipPage_become_a_mentor,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onPrimary,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(
              text:
              AppLocalizations.of(context)!.menteeScreen_findMentors,
            ),
            Tab(
              text:
              AppLocalizations.of(context)!.menteeScreen_myMentorships,
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          RefreshIndicator(
            onRefresh: refresh,
            child: const FindMentorsTab(),
          ),
          RefreshIndicator(
            onRefresh: refresh,
            child: const MyMentorshipsTab(),
          ),
        ],
      ),
    );
  }
}
