import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart'; // Import for date formatting
import '../../../core/models/user_type.dart'; // Import UserType
import '../../../core/providers/auth_provider.dart'; // Adjust path
import '../../../core/models/job_post.dart'; // Placeholder for JobPost model
import '../../../core/services/api_service.dart'; // Placeholder for API service
import '../../../core/utils/string_extensions.dart'; // Import shared extension
import './job_details_screen.dart'; // Import placeholder
import './create_job_post_screen.dart'; // Import placeholder
import './job_applications_screen.dart'; // Import placeholder
import '../widgets/job_filter_dialog.dart'; // Import the filter dialog
import '../../application/screens/my_applications_screen.dart'; // Import the new screen
import 'dart:async'; // Import for Timer

class JobPage extends StatefulWidget {
  const JobPage({super.key});

  @override
  State<JobPage> createState() => _JobPageState(); // Create State
}

class _JobPageState extends State<JobPage> {
  // State class
  // State variables
  List<JobPost> _jobPostings = [];
  bool _isLoading = false;
  String? _errorMessage;
  final TextEditingController _searchController = TextEditingController();
  // Store selected filters as a map with dynamic values
  Map<String, dynamic> _selectedFilters = {
    'title': null,
    'companyName': null,
    'ethicalTags': <String>[],
    'minSalary': null,
    'maxSalary': null,
    'isRemote': null,
    'jobTypes': <String>[],
  };
  UserType? _userRole; // Changed type to UserType?

  // Add debounce timer for search
  Timer? _debounce;

  // Initialize ApiService late or in initState AFTER getting AuthProvider
  late final ApiService _apiService;

  @override
  void initState() {
    super.initState();
    // Get AuthProvider first
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    // Initialize ApiService with AuthProvider
    _apiService = ApiService(authProvider: authProvider);

    // Get the role once and store it
    _userRole = authProvider.currentUser?.role;
    print("JobPage initState. Role: $_userRole"); // Debug print
    _loadData(); // Initial data load
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel(); // Cancel debounce timer on dispose
    super.dispose();
  }

  // --- Data Loading ---
  Future<void> _loadData({String? searchQuery}) async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      List<JobPost> postings;
      if (_userRole == UserType.EMPLOYER) {
        // TODO: Get actual employer ID
        final employerId =
            Provider.of<AuthProvider>(context, listen: false).currentUser?.id ??
            'unknown_employer';
        // postings = await _apiService.fetchEmployerJobPostings(employerId); // Real API Call
        postings = await _apiService.fetchEmployerJobPostings(
          employerId,
        ); // Using placeholder
      } else {
        // Pass the search query and filter map to the API service
        postings = await _apiService.fetchJobPostings(
          query: searchQuery,
          title: _hasActiveFilters() ? _selectedFilters['title'] : null,
          company: _hasActiveFilters() ? _selectedFilters['companyName'] : null,
          ethicalTags:
              _hasActiveFilters() &&
                      (_selectedFilters['ethicalTags'] as List<String>)
                          .isNotEmpty
                  ? (_selectedFilters['ethicalTags'] as List<String>).join(',')
                  : null,
          minSalary: _hasActiveFilters() ? _selectedFilters['minSalary'] : null,
          maxSalary: _hasActiveFilters() ? _selectedFilters['maxSalary'] : null,
          remote: _hasActiveFilters() ? _selectedFilters['isRemote'] : null,
          additionalFilters:
              _hasActiveFilters() &&
                      (_selectedFilters['jobTypes'] as List<String>).isNotEmpty
                  ? {'jobTypes': _selectedFilters['jobTypes']}
                  : null,
        );
      }
      if (mounted) {
        setState(() {
          _jobPostings = postings;
        });
      }
    } catch (e) {
      print("Error loading data: $e"); // Debug print
      if (mounted) {
        setState(() {
          _errorMessage = "Failed to load jobs. Please try again.";
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

  // Helper method to check if any filters are active
  bool _hasActiveFilters() {
    return _selectedFilters['title'] != null ||
        _selectedFilters['companyName'] != null ||
        (_selectedFilters['ethicalTags'] as List<String>).isNotEmpty ||
        _selectedFilters['minSalary'] != null ||
        _selectedFilters['maxSalary'] != null ||
        _selectedFilters['isRemote'] != null ||
        (_selectedFilters['jobTypes'] as List<String>).isNotEmpty;
  }

  // --- Event Handlers ---
  void _handleSearchChanged(String query) {
    // Implement debounce to avoid excessive API calls while typing
    if (_debounce?.isActive ?? false) _debounce?.cancel();

    _debounce = Timer(const Duration(milliseconds: 500), () {
      print('Searching for: $query');
      _loadData(searchQuery: query.isEmpty ? null : query);
    });
  }

  void _handleSearchSubmitted(String query) {
    // Cancel any active debounce
    if (_debounce?.isActive ?? false) _debounce?.cancel();

    print('Search submitted: $query');
    _loadData(searchQuery: query.isEmpty ? null : query);
  }

  void _openFilterDialog() async {
    final Map<String, dynamic>? result = await showDialog<Map<String, dynamic>>(
      context: context,
      // Prevent dismissal by tapping outside
      barrierDismissible: false,
      builder:
          (context) => JobFilterDialog(
            apiService: _apiService, // Pass service to get available filters
            initialFilters: _selectedFilters,
          ),
    );

    if (result != null) {
      print("Filters returned from dialog: $result");

      // Check if any filters changed
      bool filtersChanged = false;

      // Compare text-based filters
      if (_selectedFilters['title'] != result['title'] ||
          _selectedFilters['companyName'] != result['companyName']) {
        filtersChanged = true;
      }

      // Compare numeric filters
      if (_selectedFilters['minSalary'] != result['minSalary'] ||
          _selectedFilters['maxSalary'] != result['maxSalary']) {
        filtersChanged = true;
      }

      // Compare boolean filter
      if (_selectedFilters['isRemote'] != result['isRemote']) {
        filtersChanged = true;
      }

      // Compare lists (ethicalTags)
      final currentEthicalTags = Set<String>.from(
        _selectedFilters['ethicalTags'] as List<String>,
      );
      final newEthicalTags = Set<String>.from(
        result['ethicalTags'] as List<String>,
      );
      if (currentEthicalTags.length != newEthicalTags.length ||
          !currentEthicalTags.containsAll(newEthicalTags)) {
        filtersChanged = true;
      }

      // Compare lists (jobTypes)
      final currentJobTypes = Set<String>.from(
        _selectedFilters['jobTypes'] as List<String>,
      );
      final newJobTypes = Set<String>.from(result['jobTypes'] as List<String>);
      if (currentJobTypes.length != newJobTypes.length ||
          !currentJobTypes.containsAll(newJobTypes)) {
        filtersChanged = true;
      }

      if (filtersChanged) {
        print("Filters changed, reloading data with: $result");
        setState(() {
          // Update state with the filters returned from the dialog
          _selectedFilters = result;
        });
        _loadData(
          searchQuery:
              _searchController.text.isNotEmpty ? _searchController.text : null,
        );
      } else {
        print("Filters were not changed.");
      }
    } else {
      // Dialog was cancelled (returned null)
      print("Filter dialog cancelled.");
    }
  }

  void _navigateToJobDetails(JobPost job) {
    print("Navigate to details for Job ID: ${job.id}");
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => JobDetailsScreen(jobId: job.id), // Pass Job ID
      ),
    );
    // ScaffoldMessenger.of(context).showSnackBar(
    //   SnackBar(content: Text('Navigate to details for: ${job.title} (TBD)')),
    // );
  }

  void _navigateToCreateJobPost() {
    print("Navigate to Create Job Post screen");
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const CreateJobPostScreen()),
    );
    // ScaffoldMessenger.of(context).showSnackBar(
    //   const SnackBar(content: Text('Navigate to Create Job Post (TBD)')),
    // );
  }

  void _navigateToJobApplications(JobPost job) {
    print("Navigate to applications for Job ID: ${job.id}");
    Navigator.push(
      context,
      MaterialPageRoute(
        builder:
            (context) => JobApplicationsScreen(
              jobId: job.id,
              jobTitle: job.title, // Pass the job title
            ),
      ),
    );
    // ScaffoldMessenger.of(context).showSnackBar(
    //   SnackBar(
    //     content: Text('Navigate to applications for: ${job.title} (TBD)'),
    //   ),
    // );
  }

  void _navigateToMyApplications() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const MyApplicationsScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    // User role already fetched in initState

    print("Building JobPage. Role: $_userRole"); // Debug print

    Widget content;

    // Display different content based on the user role
    switch (_userRole) {
      case UserType.JOB_SEEKER:
        content = _buildJobSeekerView(context);
        break;
      case UserType.EMPLOYER:
        content = _buildEmployerView(context);
        break;
      default:
        // Handle other roles or null case (though logged-in user should have a role)
        // Show job seeker view by default if role is unknown or null after login
        print(
          "Warning: User role is null or unexpected. Defaulting to Job Seeker view.",
        );
        content = _buildJobSeekerView(context);
      // Or show a specific message:
      // content = const Center(
      //   child: Text('Welcome! Select your role or view general info.'),
      // );
    }

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        actions: [
          // Conditionally show the "My Applications" button for job seekers
          if (_userRole == UserType.JOB_SEEKER)
            Padding(
              padding: const EdgeInsets.only(right: 8.0), // Add some padding
              child: TextButton.icon(
                icon: const Icon(Icons.assignment_turned_in_outlined),
                label: const Text('My Applications'),
                onPressed: _navigateToMyApplications,
                style: TextButton.styleFrom(
                  // Use AppBar theme color or specify
                  foregroundColor:
                      Theme.of(context).appBarTheme.actionsIconTheme?.color ??
                      Theme.of(context).primaryColor,
                ),
              ),
            ),
        ],
      ),
      // Remove RefreshIndicator, ListView provides scrollability
      body: content,
      floatingActionButton:
          _userRole == UserType.EMPLOYER
              ? FloatingActionButton(
                onPressed: _navigateToCreateJobPost,
                tooltip: 'Create Job Post',
                child: const Icon(Icons.add),
              )
              : null,
    );
  }

  // --- Builder Methods for Different Roles ---

  Widget _buildJobSeekerView(BuildContext context) {
    bool filtersActive = _hasActiveFilters();
    return Column(
      children: [
        // Search and Filters Bar
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search jobs',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.0),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: Colors.grey[200],
                  ),
                  onChanged:
                      _handleSearchChanged, // Search as user types (debounced recommended)
                  onSubmitted:
                      _handleSearchSubmitted, // Search when user presses enter/done
                ),
              ),
              IconButton(
                icon: Icon(
                  Icons.filter_list,
                  color: filtersActive ? Theme.of(context).primaryColor : null,
                ),
                tooltip: 'Filter Jobs',
                onPressed: _openFilterDialog,
              ),
            ],
          ),
        ),
        // Loading Indicator or Error Message or Job List
        Expanded(child: _buildJobList()),
      ],
    );
  }

  Widget _buildEmployerView(BuildContext context) {
    // Uses state variables like _isLoading, _errorMessage, _jobPostings
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text(
            'Your Posted Jobs',
            style: Theme.of(context).textTheme.titleLarge,
          ),
        ),
        Expanded(
          child: _buildJobList(), // Re-use the job list builder
        ),
      ],
    );
  }

  // Helper widget to build the list (reused by both views)
  Widget _buildJobList() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed:
                  () => _loadData(
                    searchQuery:
                        _searchController.text.isNotEmpty
                            ? _searchController.text
                            : null,
                  ),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_jobPostings.isEmpty) {
      return Center(
        child: Text(
          _userRole == UserType.EMPLOYER
              ? 'You have not posted any jobs yet.'
              : 'No jobs found matching your criteria.',
          style: Theme.of(context).textTheme.bodySmall,
        ),
      );
    }

    // Display the list of Job Postings using Cards
    return RefreshIndicator(
      onRefresh: () async {
        await _loadData(
          searchQuery:
              _searchController.text.isNotEmpty ? _searchController.text : null,
        );
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(8.0),
        itemCount: _jobPostings.length,
        itemBuilder: (context, index) {
          final job = _jobPostings[index];
          final dateFormat = DateFormat.yMMMd();

          return Card(
            elevation: 2.0,
            margin: const EdgeInsets.symmetric(vertical: 6.0),
            child: InkWell(
              onTap: () {
                if (_userRole == UserType.EMPLOYER) {
                  _navigateToJobApplications(job);
                } else {
                  _navigateToJobDetails(job);
                }
              },
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            job.title,
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(fontWeight: FontWeight.bold),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      job.company,
                      style: Theme.of(context).textTheme.titleSmall,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8.0),
                    // Split the ethicalTags string and display as chips
                    if (job.ethicalTags.isNotEmpty)
                      Wrap(
                        spacing: 6.0,
                        runSpacing: 4.0,
                        children:
                            // Split string by comma, trim whitespace, remove empty strings
                            job.ethicalTags
                                .split(',')
                                .map((e) => e.trim())
                                .where((e) => e.isNotEmpty)
                                .map(
                                  (tag) => Chip(
                                    label: Text(
                                      tag.formatFilterName(),
                                    ), // Assuming formatFilterName works for tags
                                    padding: EdgeInsets.zero,
                                    labelPadding: const EdgeInsets.symmetric(
                                      horizontal: 6.0,
                                    ),
                                    labelStyle:
                                        Theme.of(context).textTheme.labelSmall,
                                    visualDensity: VisualDensity.compact,
                                    backgroundColor: Colors.teal.shade50,
                                    side: BorderSide.none,
                                  ),
                                )
                                .toList(),
                      ),
                    const SizedBox(height: 8.0),
                    if (job.datePosted != null)
                      Align(
                        alignment: Alignment.centerRight,
                        child: Text(
                          'Posted: ${dateFormat.format(job.datePosted!)}',
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(color: Colors.grey.shade600),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
