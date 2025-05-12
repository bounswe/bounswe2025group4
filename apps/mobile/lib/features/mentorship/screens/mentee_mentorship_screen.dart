import 'package:flutter/material.dart';
import '../widgets/mentor_card.dart'; // Import the MentorCard widget
import '../widgets/pending_request_card.dart';
import '../widgets/active_mentorship_card.dart';
import './direct_message_screen.dart'; // We will create this next

// Placeholder for the Find Mentors tab content
class FindMentorsTab extends StatefulWidget {
  const FindMentorsTab({super.key});

  @override
  State<FindMentorsTab> createState() => _FindMentorsTabState();
}

class _FindMentorsTabState extends State<FindMentorsTab> {
  // Dummy data for mentors - moved to state
  final List<Map<String, dynamic>> _allMentors = [
    {
      'id': 'mentor-1',
      'name': 'Alice Wonderland',
      'role': 'Senior Software Engineer',
      'company': 'Tech Innovations Inc.',
      'maxMenteeCount': 5,
      'currentMenteeCount': 3,
      'averageRating': 4.8,
    },
    {
      'id': 'mentor-2',
      'name': 'Bob The Builder',
      'role': 'Product Manager',
      'company': 'Constructive Solutions',
      'maxMenteeCount': 3,
      'currentMenteeCount': 1,
      'averageRating': 4.5,
    },
    {
      'id': 'mentor-3',
      'name': 'Charlie Chaplin',
      'role': 'UX Designer',
      // 'company': null, // Example without company
      'maxMenteeCount': 4,
      'currentMenteeCount': 4,
      'averageRating': 4.9,
    },
  ];

  List<Map<String, dynamic>> _filteredMentors = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _filteredMentors = _allMentors;
    _searchController.addListener(_filterMentors);
  }

  @override
  void dispose() {
    _searchController.removeListener(_filterMentors);
    _searchController.dispose();
    super.dispose();
  }

  void _filterMentors() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      if (query.isEmpty) {
        _filteredMentors = _allMentors;
      } else {
        _filteredMentors =
            _allMentors.where((mentor) {
              final name = mentor['name']?.toLowerCase() ?? '';
              final role = mentor['role']?.toLowerCase() ?? '';
              final company = mentor['company']?.toLowerCase() ?? '';
              return name.contains(query) ||
                  role.contains(query) ||
                  company.contains(query);
            }).toList();
      }
    });
  }

  void _navigateToMentorProfile(String mentorId, String mentorName) {
    // TODO: Implement actual navigation to the mentor's profile page
    // You might use Navigator.pushNamed or Navigator.push
    // Pass the mentorId to the profile page
    print('Navigate to profile page for mentor: $mentorName (ID: $mentorId)');
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text('Navigate to profile: $mentorName')));
  }

  void _handleRequestMentorship(String mentorId, String mentorName) {
    // TODO: Implement the actual mentorship request logic (e.g., API call)
    print(
      'Request mentorship button pressed for mentor: $mentorName (ID: $mentorId)',
    );
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Mentorship requested for $mentorName')),
    );
  }

  @override
  Widget build(BuildContext context) {
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
          child:
              _filteredMentors.isEmpty
                  ? const Center(child: Text('No mentors found.'))
                  : ListView.builder(
                    itemCount: _filteredMentors.length,
                    itemBuilder: (context, index) {
                      final mentor = _filteredMentors[index];
                      return MentorCard(
                        mentorId: mentor['id'],
                        name: mentor['name'],
                        role: mentor['role'],
                        company: mentor['company'],
                        maxMenteeCount: mentor['maxMenteeCount'],
                        currentMenteeCount: mentor['currentMenteeCount'],
                        averageRating: mentor['averageRating'],
                        onTap:
                            () => _navigateToMentorProfile(
                              mentor['id'],
                              mentor['name'],
                            ),
                        onRequestTap:
                            () => _handleRequestMentorship(
                              mentor['id'],
                              mentor['name'],
                            ),
                      );
                    },
                  ),
        ),
      ],
    );
  }
}

// Placeholder for the My Mentorships tab content
class MyMentorshipsTab extends StatefulWidget {
  const MyMentorshipsTab({super.key});

  @override
  State<MyMentorshipsTab> createState() => _MyMentorshipsTabState();
}

class _MyMentorshipsTabState extends State<MyMentorshipsTab> {
  // Dummy data
  final List<Map<String, dynamic>> _pendingRequests = [
    {'mentorName': 'Eleanor Rigby'},
    {'mentorName': 'Desmond Jones'},
  ];

  final List<Map<String, dynamic>> _activeMentorships = [
    {
      'mentorId': 'mentor-4',
      'mentorName': 'Penny Lane',
      'mentorRole': 'Marketing Manager',
    },
    {
      'mentorId': 'mentor-5',
      'mentorName': 'Maxwell Edison',
      'mentorRole': 'Data Scientist',
    },
  ];

  void _navigateToDirectMessage(String mentorId, String mentorName) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder:
            (context) =>
                DirectMessageScreen(mentorId: mentorId, mentorName: mentorName),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // TODO: Fetch real data here
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
        if (_pendingRequests.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text(
              'No pending requests.',
              style: TextStyle(fontStyle: FontStyle.italic),
            ),
          )
        else
          ..._pendingRequests.map((req) {
            return PendingRequestCard(mentorName: req['mentorName']);
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
        if (_activeMentorships.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text(
              'No active mentorships.',
              style: TextStyle(fontStyle: FontStyle.italic),
            ),
          )
        else
          ..._activeMentorships.map((mentor) {
            return ActiveMentorshipCard(
              mentorId: mentor['mentorId'],
              mentorName: mentor['mentorName'],
              mentorRole: mentor['mentorRole'],
              onTap:
                  () => _navigateToDirectMessage(
                    mentor['mentorId'],
                    mentor['mentorName'],
                  ),
            );
          }).toList(),
        const SizedBox(height: 16), // Add some padding at the bottom
      ],
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mentorship'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [Tab(text: 'Find Mentors'), Tab(text: 'My Mentorships')],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [FindMentorsTab(), MyMentorshipsTab()],
      ),
    );
  }
}
