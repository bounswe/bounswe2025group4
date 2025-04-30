import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart'; // Import for date formatting
import '../../../core/models/user.dart'; // Adjust path
import '../../../core/providers/auth_provider.dart'; // Adjust path
import '../../../core/models/job_post.dart'; // Placeholder for JobPost model
import '../../../core/services/api_service.dart'; // Placeholder for API service
import '../../../core/utils/string_extensions.dart'; // Import shared extension
import './job_details_screen.dart'; // Import placeholder
import './create_job_post_screen.dart'; // Import placeholder
import './job_applications_screen.dart'; // Import placeholder
import '../widgets/job_filter_dialog.dart'; // Import the filter dialog
import '../../application/screens/my_applications_screen.dart'; // Import the new screen

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
  // Store selected filters as a map
  Map<String, List<String>> _selectedFilters = {'policies': [], 'jobTypes': []};
  UserRole? _userRole; // Store user role

  // Placeholder API service instance
  // TODO: Replace with actual dependency injection or service locator
  final ApiService _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    // Get the role once and store it
    _userRole =
        Provider.of<AuthProvider>(context, listen: false).currentUser?.role;
    print("JobPage initState. Role: $_userRole"); // Debug print
    _loadData(); // Initial data load
  }

  @override
  void dispose() {
    _searchController.dispose();
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
      if (_userRole == UserRole.employer) {
        // TODO: Get actual employer ID
        final employerId =
            Provider.of<AuthProvider>(context, listen: false).currentUser?.id ??
            'unknown_employer';
        // postings = await _apiService.fetchEmployerJobPostings(employerId); // Real API Call
        postings = await _apiService.fetchEmployerJobPostings(
          employerId,
        ); // Using placeholder
      } else {
        // Pass the filter map to the API service
        postings = await _apiService.fetchJobPostings(
          query: searchQuery,
          filters:
              _selectedFilters.values.any((list) => list.isNotEmpty)
                  ? _selectedFilters
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

  // --- Event Handlers ---
  void _handleSearchChanged(String query) {
    // Consider adding debounce here to avoid excessive API calls
    _loadData(searchQuery: query);
  }

  void _handleSearchSubmitted(String query) {
    _loadData(searchQuery: query);
  }

  void _openFilterDialog() async {
    final Map<String, List<String>>? result =
        await showDialog<Map<String, List<String>>>(
          context: context,
          // Prevent dismissal by tapping outside
          barrierDismissible: false,
          builder:
              (context) => JobFilterDialog(
                apiService:
                    _apiService, // Pass service to get available filters
                initialFilters: _selectedFilters,
              ),
        );

    // --- Placeholder simulation removed ---

    if (result != null) {
      // Check if filters actually changed before reloading
      // Using Sets for efficient comparison regardless of order
      final currentPolicies = Set.from(_selectedFilters['policies'] ?? []);
      final newPolicies = Set.from(result['policies'] ?? []);
      final currentJobTypes = Set.from(_selectedFilters['jobTypes'] ?? []);
      final newJobTypes = Set.from(result['jobTypes'] ?? []);

      bool filtersChanged =
          currentPolicies.length != newPolicies.length ||
          currentJobTypes.length != newJobTypes.length ||
          !currentPolicies.containsAll(newPolicies) ||
          !currentJobTypes.containsAll(newJobTypes);

      if (filtersChanged) {
        print("Filters changed to: $result");
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
      case UserRole.jobSeeker:
        content = _buildJobSeekerView(context);
        break;
      case UserRole.employer:
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
        actions: [
          // Conditionally show the "My Applications" button for job seekers
          if (_userRole == UserRole.jobSeeker)
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
          _userRole == UserRole.employer
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
    bool filtersActive = _selectedFilters.values.any((list) => list.isNotEmpty);
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
                    hintText: 'Search jobs (title, company...)',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.0),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: Colors.grey[200],
                    // Optional: Clear button
                    // suffixIcon: _searchController.text.isNotEmpty
                    //     ? IconButton(
                    //         icon: Icon(Icons.clear),
                    //         onPressed: () {
                    //           _searchController.clear();
                    //           _handleSearchChanged('');
                    //         },
                    //       )
                    //     : null,
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
          _userRole == UserRole.employer
              ? 'You have not posted any jobs yet.'
              : 'No jobs found matching your criteria.',
          style: Theme.of(context).textTheme.bodySmall,
        ),
      );
    }

    // Display the list of Job Postings using Cards
    return ListView.builder(
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
              if (_userRole == UserRole.employer) {
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
                      Text(
                        job.jobType,
                        style: Theme.of(
                          context,
                        ).textTheme.bodySmall?.copyWith(color: Colors.blueGrey),
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
                  if (job.ethicalPolicies.isNotEmpty)
                    Wrap(
                      spacing: 6.0,
                      runSpacing: 4.0,
                      children:
                          job.ethicalPolicies
                              .map(
                                (policy) => Chip(
                                  label: Text(policy.formatFilterName()),
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
                  Align(
                    alignment: Alignment.centerRight,
                    child: Text(
                      'Posted: ${dateFormat.format(job.datePosted)}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
