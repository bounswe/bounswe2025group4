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
import '../../../generated/l10n/app_localizations.dart';

class JobPage extends StatefulWidget {
  const JobPage({super.key});

  @override
  State<JobPage> createState() => _JobPageState(); // Create State
}

class _JobPageState extends State<JobPage> with SingleTickerProviderStateMixin {
  // State class
  // State variables for standard jobs
  List<JobPost> _jobPostings = [];
  bool _isLoading = false;
  String? _errorMessage;
  
  // State variables for non-profit jobs
  List<JobPost> _nonProfitJobPostings = [];
  bool _isLoadingNonProfit = false;
  String? _errorMessageNonProfit;
  
  final TextEditingController _searchController = TextEditingController();
  // Store selected filters as a map with dynamic values
  Map<String, dynamic> _selectedFilters = {
    'title': null,
    'companyName': null,
    'ethicalTags': <String>[],
    'minSalary': null,
    'maxSalary': null,
    'isRemote': null,
    'inclusiveOpportunity': null,
  };
  UserType? _userRole; // Changed type to UserType?

  // Add debounce timer for search
  Timer? _debounce;
  
  // TabController for tab navigation
  late TabController _tabController;

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
    
    // Initialize TabController with 2 tabs (only for job seekers)
    if (_userRole == UserType.ROLE_JOBSEEKER) {
      _tabController = TabController(length: 2, vsync: this);
      _tabController.addListener(_handleTabChange);
    }
    
    _loadData(); // Initial data load for standard jobs
    if (_userRole == UserType.ROLE_JOBSEEKER) {
      _loadNonProfitData(); // Initial data load for non-profit jobs
    }
  }
  
  void _handleTabChange() {
    if (!_tabController.indexIsChanging) {
      // Load data when tab changes if not already loaded
      if (_tabController.index == 0 && _jobPostings.isEmpty && !_isLoading) {
        _loadData();
      } else if (_tabController.index == 1 && _nonProfitJobPostings.isEmpty && !_isLoadingNonProfit) {
        _loadNonProfitData();
      }
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel(); // Cancel debounce timer on dispose
    if (_userRole == UserType.ROLE_JOBSEEKER) {
      _tabController.removeListener(_handleTabChange);
      _tabController.dispose();
    }
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
      if (_userRole == UserType.ROLE_EMPLOYER) {
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
        // Standard jobs: nonProfit = false
        postings = await _apiService.fetchJobPostings(
          query: searchQuery,
          title: _selectedFilters['title'],
          company: _selectedFilters['companyName'],
          ethicalTags: (_selectedFilters['ethicalTags'] as List<String>).isNotEmpty
              ? (_selectedFilters['ethicalTags'] as List<String>)
              : null,
          minSalary: _selectedFilters['minSalary'] != null
              ? (_selectedFilters['minSalary'] as num).toInt()
              : null,
          maxSalary: _selectedFilters['maxSalary'] != null
              ? (_selectedFilters['maxSalary'] as num).toInt()
              : null,
          isRemote: _selectedFilters['isRemote'] == true ? true : null,
          inclusiveOpportunity:
              _selectedFilters['inclusiveOpportunity'] == true ? true : null,
          nonProfit: false, // Standard jobs only
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
          _errorMessage = AppLocalizations.of(context)!.jobPage_loadError;
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
  
  // Load non-profit jobs
  Future<void> _loadNonProfitData({String? searchQuery}) async {
    if (!mounted) return;
    setState(() {
      _isLoadingNonProfit = true;
      _errorMessageNonProfit = null;
    });

    try {
      // Fetch non-profit jobs only
      final postings = await _apiService.fetchJobPostings(
        query: searchQuery,
        title: _selectedFilters['title'],
        company: _selectedFilters['companyName'],
        ethicalTags: (_selectedFilters['ethicalTags'] as List<String>).isNotEmpty
            ? (_selectedFilters['ethicalTags'] as List<String>)
            : null,
        minSalary: null, // Non-profit jobs don't have salary
        maxSalary: null, // Non-profit jobs don't have salary
        isRemote: _selectedFilters['isRemote'] == true ? true : null,
        inclusiveOpportunity:
            _selectedFilters['inclusiveOpportunity'] == true ? true : null,
        nonProfit: true, // Non-profit jobs only
      );
      if (mounted) {
        setState(() {
          _nonProfitJobPostings = postings;
        });
      }
    } catch (e) {
      print("Error loading non-profit data: $e"); // Debug print
      if (mounted) {
        setState(() {
          _errorMessageNonProfit = AppLocalizations.of(context)!.jobPage_loadError;
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingNonProfit = false;
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
        _selectedFilters['isRemote'] == true ||
        _selectedFilters['inclusiveOpportunity'] == true;
  }

  // --- Event Handlers ---
  void _handleSearchChanged(String query) {
    // Implement debounce to avoid excessive API calls while typing
    if (_debounce?.isActive ?? false) _debounce?.cancel();

    _debounce = Timer(const Duration(milliseconds: 500), () {
      print('Searching for: $query');
      if (_userRole == UserType.ROLE_JOBSEEKER) {
        // Load data for both tabs
        if (_tabController.index == 0) {
          _loadData(searchQuery: query.isEmpty ? null : query);
        } else {
          _loadNonProfitData(searchQuery: query.isEmpty ? null : query);
        }
      } else {
        _loadData(searchQuery: query.isEmpty ? null : query);
      }
    });
  }

  void _handleSearchSubmitted(String query) {
    // Cancel any active debounce
    if (_debounce?.isActive ?? false) _debounce?.cancel();

    print('Search submitted: $query');
    if (_userRole == UserType.ROLE_JOBSEEKER) {
      // Load data for both tabs
      if (_tabController.index == 0) {
        _loadData(searchQuery: query.isEmpty ? null : query);
      } else {
        _loadNonProfitData(searchQuery: query.isEmpty ? null : query);
      }
    } else {
      _loadData(searchQuery: query.isEmpty ? null : query);
    }
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

      // Compare boolean filters
      if (_selectedFilters['isRemote'] != result['isRemote'] ||
          _selectedFilters['inclusiveOpportunity'] !=
              result['inclusiveOpportunity']) {
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

      if (filtersChanged) {
        print("Filters changed, reloading data with: $result");
        setState(() {
          // Update state with the filters returned from the dialog
          _selectedFilters = result;
        });
        if (_userRole == UserType.ROLE_JOBSEEKER) {
          // Reload data for current tab
          if (_tabController.index == 0) {
            _loadData(
              searchQuery:
                  _searchController.text.isNotEmpty ? _searchController.text : null,
            );
          } else {
            _loadNonProfitData(
              searchQuery:
                  _searchController.text.isNotEmpty ? _searchController.text : null,
            );
          }
        } else {
          _loadData(
            searchQuery:
                _searchController.text.isNotEmpty ? _searchController.text : null,
          );
        }
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
      case UserType.ROLE_JOBSEEKER:
        content = _buildJobSeekerView(context);
        break;
      case UserType.ROLE_EMPLOYER:
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
        title: Text(AppLocalizations.of(context)!.jobPage_title),
        automaticallyImplyLeading: false,
        actions: [
          // Conditionally show the "My Applications" button for job seekers
          if (_userRole == UserType.ROLE_JOBSEEKER)
            Padding(
              padding: const EdgeInsets.only(right: 8.0), // Add some padding
              child: TextButton.icon(
                icon: const Icon(Icons.assignment_turned_in_outlined),
                label: Text(
                  AppLocalizations.of(context)!.jobPage_myApplications,
                ),
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
          _userRole == UserType.ROLE_EMPLOYER
              ? FloatingActionButton(
                onPressed: _navigateToCreateJobPost,
                tooltip: AppLocalizations.of(context)!.jobPage_createJob,
                backgroundColor:
                    Colors.blue, // Use blue to match design language
                foregroundColor: Colors.white,
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
                    hintText: AppLocalizations.of(context)!.jobPage_search,
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
                tooltip: AppLocalizations.of(context)!.jobPage_filter,
                onPressed: _openFilterDialog,
              ),
            ],
          ),
        ),
        // TabBar
        TabBar(
          controller: _tabController,
          tabs: [
            Tab(text: AppLocalizations.of(context)!.jobPage_tabJobs),
            Tab(text: AppLocalizations.of(context)!.jobPage_tabNonProfit),
          ],
        ),
        // TabBarView with swipe support
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              // Standard Jobs Tab
              _buildJobList(),
              // Non-Profit Jobs Tab
              _buildNonProfitJobList(),
            ],
          ),
        ),
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
            AppLocalizations.of(context)!.jobPage_yourPostedJobs,
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
              child: Text(AppLocalizations.of(context)!.common_retry),
            ),
          ],
        ),
      );
    }

    if (_jobPostings.isEmpty) {
      return Center(
        child: Text(
          _userRole == UserType.ROLE_EMPLOYER
              ? AppLocalizations.of(context)!.jobPage_noPostedJobs
              : AppLocalizations.of(context)!.jobPage_noJobs,
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
          return _buildJobCard(job);
        },
      ),
    );
  }
  
  // Helper widget to build non-profit job list
  Widget _buildNonProfitJobList() {
    if (_isLoadingNonProfit) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessageNonProfit != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_errorMessageNonProfit!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed:
                  () => _loadNonProfitData(
                    searchQuery:
                        _searchController.text.isNotEmpty
                            ? _searchController.text
                            : null,
                  ),
              child: Text(AppLocalizations.of(context)!.common_retry),
            ),
          ],
        ),
      );
    }

    if (_nonProfitJobPostings.isEmpty) {
      return Center(
        child: Text(
          AppLocalizations.of(context)!.jobPage_noJobs,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      );
    }

    // Display the list of Non-Profit Job Postings using Cards
    return RefreshIndicator(
      onRefresh: () async {
        await _loadNonProfitData(
          searchQuery:
              _searchController.text.isNotEmpty ? _searchController.text : null,
        );
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(8.0),
        itemCount: _nonProfitJobPostings.length + 1, // +1 for welcome card
        itemBuilder: (context, index) {
          // Show welcome card at the top
          if (index == 0) {
            return _buildNonProfitWelcomeCard();
          }
          // Show job cards
          final job = _nonProfitJobPostings[index - 1];
          return _buildJobCard(job);
        },
      ),
    );
  }
  
  // Helper widget to build non-profit welcome card
  Widget _buildNonProfitWelcomeCard() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final localizations = AppLocalizations.of(context)!;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12.0, top: 4.0),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16.0),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [
                  Colors.teal.shade900.withOpacity(0.6),
                  Colors.teal.shade800.withOpacity(0.4),
                ]
              : [
                  Colors.teal.shade50,
                  Colors.teal.shade100.withOpacity(0.7),
                ],
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.teal.withOpacity(0.2),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Card(
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.0),
        ),
        color: Colors.transparent,
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12.0),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.teal.shade800.withOpacity(0.6)
                          : Colors.teal.shade200,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.favorite,
                      color: isDark ? Colors.teal.shade200 : Colors.teal.shade800,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 16.0),
                  Expanded(
                    child: Text(
                      localizations.jobPage_nonProfitWelcome,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.teal.shade200 : Colors.teal.shade900,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16.0),
              Text(
                localizations.jobPage_nonProfitWelcomeMessage,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: isDark ? Colors.grey.shade300 : Colors.grey.shade800,
                  height: 1.6,
                ),
              ),
              const SizedBox(height: 16.0),
              Row(
                children: [
                  Icon(
                    Icons.volunteer_activism,
                    size: 20,
                    color: isDark ? Colors.teal.shade300 : Colors.teal.shade700,
                  ),
                  const SizedBox(width: 8.0),
                  Icon(
                    Icons.eco,
                    size: 20,
                    color: isDark ? Colors.teal.shade300 : Colors.teal.shade700,
                  ),
                  const SizedBox(width: 8.0),
                  Icon(
                    Icons.people,
                    size: 20,
                    color: isDark ? Colors.teal.shade300 : Colors.teal.shade700,
                  ),
                  const Spacer(),
                  Text(
                    '🌟',
                    style: const TextStyle(fontSize: 20),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  // Helper widget to build a job card (reused by both lists)
  Widget _buildJobCard(JobPost job) {
    // Get current locale from context
    final locale = Localizations.localeOf(context).toString();
    final dateFormat = DateFormat.yMMMd(locale);

    return Card(
      elevation: 2.0,
      margin: const EdgeInsets.symmetric(vertical: 6.0),
      child: InkWell(
        onTap: () {
          if (_userRole == UserType.ROLE_EMPLOYER) {
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
                                tag.formatLocalizedEthicalPolicy(context),
                              ),
                              padding: EdgeInsets.zero,
                              labelPadding: const EdgeInsets.symmetric(
                                horizontal: 6.0,
                              ),
                              labelStyle: Theme.of(
                                context,
                              ).textTheme.labelSmall?.copyWith(
                                color:
                                    Theme.of(context).brightness ==
                                            Brightness.dark
                                        ? Colors.teal.shade200
                                        : Colors.teal.shade900,
                              ),
                              visualDensity: VisualDensity.compact,
                              backgroundColor:
                                  Theme.of(context).brightness ==
                                          Brightness.dark
                                      ? Colors.teal.shade900.withOpacity(
                                        0.3,
                                      )
                                      : Colors.teal.shade50,
                              side: BorderSide.none,
                            ),
                          )
                          .toList(),
                ),
              const SizedBox(height: 8.0),
              if (job.postedDate != null)
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    '${AppLocalizations.of(context)!.jobPage_posted}: ${dateFormat.format(job.postedDate!)}',
                    style: Theme.of(context).textTheme.bodySmall
                        ?.copyWith(color: Colors.grey.shade600),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
