import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../generated/l10n/app_localizations.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/workplace_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/user_type.dart';
import 'workplace_detail_page.dart';
import 'create_workplace_page.dart';
import 'my_employer_workplaces_page.dart';

class WorkplacesPage extends StatefulWidget {
  const WorkplacesPage({super.key});

  @override
  State<WorkplacesPage> createState() => _WorkplacesPageState();
}

class _WorkplacesPageState extends State<WorkplacesPage> {
  WorkplaceProvider? _workplaceProvider;
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _sectorController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  List<String> _selectedEthicalTags = [];
  double? _minRating;
  String? _sortBy;
  int _currentPage = 0;
  final int _pageSize = 20;
  bool _isInitialized = false;
  bool _showFilters = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInitialized) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authProvider: authProvider);
      _workplaceProvider = WorkplaceProvider(apiService: apiService);
      _isInitialized = true;
      _loadWorkplaces();
    }
  }

  Future<void> _loadWorkplaces() async {
    if (_workplaceProvider == null) return;
    try {
      print('=== Loading workplaces ===');
      print('Search: ${_searchController.text}');
      print('Sector: ${_sectorController.text}');
      print('Location: ${_locationController.text}');
      print('Selected Ethical Tags: $_selectedEthicalTags');
      print('Min Rating: $_minRating');
      print('Sort: $_sortBy');
      print('Page: $_currentPage');

      // For ethical tags, we'll need to make multiple calls or modify the API
      // For now, we'll just use the first tag if multiple are selected
      final ethicalTag =
          _selectedEthicalTags.isNotEmpty ? _selectedEthicalTags.first : null;

      print('Ethical Tag to send: $ethicalTag');

      await _workplaceProvider!.fetchWorkplaces(
        search: _searchController.text.isEmpty ? null : _searchController.text,
        sector: _sectorController.text.isEmpty ? null : _sectorController.text,
        location:
            _locationController.text.isEmpty ? null : _locationController.text,
        ethicalTag: ethicalTag,
        minRating: _minRating,
        sort: _sortBy,
        page: _currentPage,
        size: _pageSize,
      );
      print('Workplaces loaded: ${_workplaceProvider!.workplaces.length}');
      if (_workplaceProvider!.error != null) {
        print('Error loading workplaces: ${_workplaceProvider!.error}');
      }
    } catch (e) {
      print('Exception loading workplaces: $e');
    }
    if (mounted) setState(() {});
  }

  void _resetFilters() {
    setState(() {
      _searchController.clear();
      _sectorController.clear();
      _locationController.clear();
      _selectedEthicalTags.clear();
      _minRating = null;
      _sortBy = null;
      _currentPage = 0;
    });
    _loadWorkplaces();
  }

  void _changePage(int newPage) {
    setState(() {
      _currentPage = newPage;
    });
    _loadWorkplaces();
  }

  bool get _hasActiveFilters =>
      _searchController.text.isNotEmpty ||
      _sectorController.text.isNotEmpty ||
      _locationController.text.isNotEmpty ||
      _selectedEthicalTags.isNotEmpty ||
      _minRating != null;

  @override
  void dispose() {
    _searchController.dispose();
    _sectorController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final isEmployer = authProvider.currentUser?.role == UserType.ROLE_EMPLOYER;

    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context).workplaces_title),
        automaticallyImplyLeading: false,
        actions: [
          if (isEmployer) ...[
            IconButton(
              icon: const Icon(Icons.business_center),
              tooltip: 'My Workplaces',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const MyEmployerWorkplacesPage(),
                  ),
                );
              },
            ),
            IconButton(
              icon: const Icon(Icons.add),
              tooltip: 'Create Workplace',
              onPressed: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const CreateWorkplacePage(),
                  ),
                );
                if (result == true) {
                  _loadWorkplaces();
                }
              },
            ),
          ],
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadWorkplaces,
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              // Search bar and filter button
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        decoration: InputDecoration(
                          hintText: 'Search workplaces...',
                          prefixIcon: const Icon(Icons.search),
                          suffixIcon:
                              _searchController.text.isNotEmpty
                                  ? IconButton(
                                    icon: const Icon(Icons.clear),
                                    onPressed: () {
                                      _searchController.clear();
                                      _loadWorkplaces();
                                    },
                                  )
                                  : null,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onSubmitted: (_) => _loadWorkplaces(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Filter toggle button
                    Stack(
                      children: [
                        IconButton(
                          icon: Icon(
                            _showFilters
                                ? Icons.filter_alt
                                : Icons.filter_alt_outlined,
                          ),
                          onPressed: () {
                            setState(() {
                              _showFilters = !_showFilters;
                            });
                          },
                          tooltip: 'Filters',
                          style: IconButton.styleFrom(
                            backgroundColor:
                                _hasActiveFilters
                                    ? Theme.of(
                                      context,
                                    ).primaryColor.withOpacity(0.1)
                                    : null,
                          ),
                        ),
                        if (_hasActiveFilters)
                          Positioned(
                            right: 8,
                            top: 8,
                            child: Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: Theme.of(context).primaryColor,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),

              // Sort dropdown
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  children: [
                    Text(
                      'Sort by: ',
                      style: TextStyle(color: Colors.grey[600], fontSize: 14),
                    ),
                    DropdownButton<String>(
                      value: _sortBy,
                      underline: const SizedBox(),
                      hint: const Text('Name (A-Z)'),
                      items: const [
                        DropdownMenuItem(
                          value: 'nameAsc',
                          child: Text('Name (A-Z)'),
                        ),
                        DropdownMenuItem(
                          value: 'nameDesc',
                          child: Text('Name (Z-A)'),
                        ),
                        DropdownMenuItem(
                          value: 'ratingDesc',
                          child: Text('Rating (High-Low)'),
                        ),
                        DropdownMenuItem(
                          value: 'ratingAsc',
                          child: Text('Rating (Low-High)'),
                        ),
                        DropdownMenuItem(
                          value: 'reviewCountDesc',
                          child: Text('Most Reviews'),
                        ),
                        DropdownMenuItem(
                          value: 'reviewCountAsc',
                          child: Text('Least Reviews'),
                        ),
                      ],
                      onChanged: (value) {
                        setState(() {
                          _sortBy = value;
                          _currentPage = 0;
                        });
                        _loadWorkplaces();
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),

              // Workplaces list
              Expanded(
                child:
                    _workplaceProvider == null || _workplaceProvider!.isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : _workplaceProvider!.error != null
                        ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.error_outline,
                                size: 48,
                                color: Colors.red,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                _workplaceProvider!.error!,
                                textAlign: TextAlign.center,
                                style: const TextStyle(color: Colors.red),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton(
                                onPressed: _loadWorkplaces,
                                child: const Text('Retry'),
                              ),
                            ],
                          ),
                        )
                        : _workplaceProvider!.workplaces.isEmpty
                        ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.business_outlined, size: 64),
                              const SizedBox(height: 16),
                              const Text(
                                'No workplaces found',
                                style: TextStyle(fontSize: 18),
                              ),
                              if (isEmployer) ...[
                                const SizedBox(height: 8),
                                const Text(
                                  'Create your first workplace!',
                                  style: TextStyle(color: Colors.grey),
                                ),
                              ],
                            ],
                          ),
                        )
                        : ListView.builder(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          itemCount: _workplaceProvider!.workplaces.length + 1,
                          itemBuilder: (context, index) {
                            // Last item is pagination
                            if (index ==
                                _workplaceProvider!.workplaces.length) {
                              return _workplaceProvider!.paginatedResponse !=
                                      null
                                  ? _buildPaginationControls()
                                  : const SizedBox.shrink();
                            }

                            final workplace =
                                _workplaceProvider!.workplaces[index];
                            return Card(
                              margin: const EdgeInsets.symmetric(vertical: 8),
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: InkWell(
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder:
                                          (context) => WorkplaceDetailPage(
                                            workplaceId: workplace.id,
                                          ),
                                    ),
                                  );
                                },
                                borderRadius: BorderRadius.circular(12),
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      // Company image or placeholder
                                      Container(
                                        width: 60,
                                        height: 60,
                                        decoration: BoxDecoration(
                                          color: Colors.grey[200],
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        child:
                                            workplace.imageUrl != null
                                                ? ClipRRect(
                                                  borderRadius:
                                                      BorderRadius.circular(8),
                                                  child: Image.network(
                                                    workplace.imageUrl!,
                                                    fit: BoxFit.cover,
                                                    errorBuilder: (
                                                      context,
                                                      error,
                                                      stackTrace,
                                                    ) {
                                                      return const Icon(
                                                        Icons.business,
                                                        size: 32,
                                                        color: Colors.grey,
                                                      );
                                                    },
                                                  ),
                                                )
                                                : const Icon(
                                                  Icons.business,
                                                  size: 32,
                                                  color: Colors.grey,
                                                ),
                                      ),
                                      const SizedBox(width: 16),

                                      // Company info
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              workplace.companyName,
                                              style: const TextStyle(
                                                fontSize: 18,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              workplace.sector,
                                              style: TextStyle(
                                                fontSize: 14,
                                                color: Colors.grey[600],
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Row(
                                              children: [
                                                Icon(
                                                  Icons.location_on,
                                                  size: 14,
                                                  color: Colors.grey[600],
                                                ),
                                                const SizedBox(width: 4),
                                                Expanded(
                                                  child: Text(
                                                    workplace.location,
                                                    style: TextStyle(
                                                      fontSize: 12,
                                                      color: Colors.grey[600],
                                                    ),
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 8),
                                            Row(
                                              children: [
                                                const Icon(
                                                  Icons.star,
                                                  color: Colors.amber,
                                                  size: 18,
                                                ),
                                                const SizedBox(width: 4),
                                                Text(
                                                  workplace.overallAvg != null
                                                      ? workplace.overallAvg!
                                                          .toStringAsFixed(1)
                                                      : 'Not rated yet',
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 14,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            if (workplace
                                                .ethicalTags
                                                .isNotEmpty)
                                              Wrap(
                                                spacing: 4,
                                                runSpacing: 4,
                                                children:
                                                    workplace.ethicalTags
                                                        .take(2)
                                                        .map(
                                                          (tag) => Chip(
                                                            label: Text(
                                                              tag,
                                                              style:
                                                                  const TextStyle(
                                                                    fontSize:
                                                                        10,
                                                                  ),
                                                            ),
                                                            materialTapTargetSize:
                                                                MaterialTapTargetSize
                                                                    .shrinkWrap,
                                                            padding:
                                                                const EdgeInsets.all(
                                                                  2,
                                                                ),
                                                            visualDensity:
                                                                VisualDensity
                                                                    .compact,
                                                          ),
                                                        )
                                                        .toList(),
                                              ),
                                          ],
                                        ),
                                      ),

                                      // Arrow icon
                                      const Icon(
                                        Icons.chevron_right,
                                        color: Colors.grey,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
              ),
            ],
          ),

          // Filter panel as overlay
          if (_showFilters)
            Positioned(top: 80, left: 0, right: 0, child: _buildFilterPanel()),
        ],
      ),
    );
  }

  Widget _buildFilterPanel() {
    // All ethical policies from the API service
    final ethicalTags = [
      'salary_transparency',
      'equal_pay_policy',
      'living_wage_employer',
      'comprehensive_health_insurance',
      'performance_based_bonus',
      'retirement_plan_support',
      'flexible_hours',
      'remote_friendly',
      'no_after_hours_work_culture',
      'mental_health_support',
      'generous_paid_time_off',
      'paid_parental_leave',
      'inclusive_hiring_practices',
      'diverse_leadership',
      'lgbtq_friendly_workplace',
      'disability_inclusive_workplace',
      'supports_women_in_leadership',
      'mentorship_program',
      'learning_development_budget',
      'transparent_promotion_paths',
      'internal_mobility',
      'sustainability_focused',
      'ethical_supply_chain',
      'community_volunteering',
      'certified_b_corporation',
    ];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Filters',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                if (_hasActiveFilters)
                  TextButton(
                    onPressed: _resetFilters,
                    child: const Text('Clear All'),
                  ),
              ],
            ),
            const SizedBox(height: 12),

            // Sector filter - now writable
            TextField(
              controller: _sectorController,
              decoration: const InputDecoration(
                labelText: 'Sector',
                hintText: 'e.g., Technology, Healthcare',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
              ),
              onChanged: (value) {
                setState(() {
                  _currentPage = 0;
                });
              },
              onSubmitted: (_) => _loadWorkplaces(),
            ),
            const SizedBox(height: 12),

            // Location filter - now writable
            TextField(
              controller: _locationController,
              decoration: const InputDecoration(
                labelText: 'Location',
                hintText: 'e.g., Istanbul, Ankara',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
              ),
              onChanged: (value) {
                setState(() {
                  _currentPage = 0;
                });
              },
              onSubmitted: (_) => _loadWorkplaces(),
            ),
            const SizedBox(height: 12),

            // Ethical tags filter - multiple selection
            const Text(
              'Ethical Tags',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            Container(
              constraints: const BoxConstraints(maxHeight: 200),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(8),
              ),
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: ethicalTags.length,
                itemBuilder: (context, index) {
                  final tag = ethicalTags[index];
                  final isSelected = _selectedEthicalTags.contains(tag);
                  return CheckboxListTile(
                    title: Text(
                      tag.replaceAll('_', ' ').toUpperCase(),
                      style: const TextStyle(fontSize: 12),
                    ),
                    value: isSelected,
                    dense: true,
                    onChanged: (bool? value) {
                      setState(() {
                        if (value == true) {
                          _selectedEthicalTags.add(tag);
                        } else {
                          _selectedEthicalTags.remove(tag);
                        }
                        _currentPage = 0;
                      });
                      _loadWorkplaces();
                    },
                  );
                },
              ),
            ),
            const SizedBox(height: 12),

            // Rating filter
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Minimum Rating'),
                    if (_minRating != null)
                      Text(
                        _minRating!.toStringAsFixed(1),
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                  ],
                ),
                Slider(
                  value: _minRating ?? 0,
                  min: 0,
                  max: 5,
                  divisions: 10,
                  label: _minRating?.toStringAsFixed(1) ?? '0',
                  onChanged: (value) {
                    setState(() {
                      _minRating = value == 0 ? null : value;
                    });
                  },
                  onChangeEnd: (value) {
                    setState(() {
                      _currentPage = 0;
                    });
                    _loadWorkplaces();
                  },
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Apply filters button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loadWorkplaces,
                child: const Text('Apply Filters'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaginationControls() {
    final paginatedResponse = _workplaceProvider!.paginatedResponse!;
    final totalPages = paginatedResponse.totalPages;
    final currentPage = paginatedResponse.page;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Previous button
          ElevatedButton.icon(
            onPressed:
                currentPage > 0 ? () => _changePage(currentPage - 1) : null,
            icon: const Icon(Icons.chevron_left, size: 18),
            label: const Text('Prev'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              backgroundColor: Colors.white,
              foregroundColor: Theme.of(context).primaryColor,
              side: BorderSide(color: Theme.of(context).primaryColor),
            ),
          ),

          // Page info
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              'Page ${currentPage + 1} of $totalPages',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Theme.of(context).primaryColor,
              ),
            ),
          ),

          // Next button
          ElevatedButton.icon(
            onPressed:
                currentPage < totalPages - 1
                    ? () => _changePage(currentPage + 1)
                    : null,
            icon: const Icon(Icons.chevron_right, size: 18),
            label: const Text('Next'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              backgroundColor: Colors.white,
              foregroundColor: Theme.of(context).primaryColor,
              side: BorderSide(color: Theme.of(context).primaryColor),
            ),
          ),
        ],
      ),
    );
  }
}
