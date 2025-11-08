import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../generated/l10n/app_localizations.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/workplace_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/user_type.dart';
import 'workplace_detail_page.dart';
import 'create_workplace_page.dart';

class WorkplacesPage extends StatefulWidget {
  const WorkplacesPage({super.key});

  @override
  State<WorkplacesPage> createState() => _WorkplacesPageState();
}

class _WorkplacesPageState extends State<WorkplacesPage> {
  late WorkplaceProvider _workplaceProvider;
  final TextEditingController _searchController = TextEditingController();
  String? _selectedSector;
  String? _selectedLocation;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadWorkplaces();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final apiService = ApiService(authProvider: authProvider);
    _workplaceProvider = WorkplaceProvider(apiService: apiService);
  }

  Future<void> _loadWorkplaces() async {
    try {
      print('Loading workplaces...');
      await _workplaceProvider.fetchWorkplaces(
        search: _searchController.text.isEmpty ? null : _searchController.text,
        sector: _selectedSector,
        location: _selectedLocation,
        page: 0,
        size: 20,
      );
      print('Workplaces loaded: ${_workplaceProvider.workplaces.length}');
      if (_workplaceProvider.error != null) {
        print('Error loading workplaces: ${_workplaceProvider.error}');
      }
    } catch (e) {
      print('Exception loading workplaces: $e');
    }
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _searchController.dispose();
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
          if (isEmployer)
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
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadWorkplaces,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16.0),
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

          // Workplaces list
          Expanded(
            child:
                _workplaceProvider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : _workplaceProvider.error != null
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
                            _workplaceProvider.error!,
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
                    : _workplaceProvider.workplaces.isEmpty
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
                    : RefreshIndicator(
                      onRefresh: _loadWorkplaces,
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        itemCount: _workplaceProvider.workplaces.length,
                        itemBuilder: (context, index) {
                          final workplace =
                              _workplaceProvider.workplaces[index];
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
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Company image or placeholder
                                    Container(
                                      width: 60,
                                      height: 60,
                                      decoration: BoxDecoration(
                                        color: Colors.grey[200],
                                        borderRadius: BorderRadius.circular(8),
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
                                                workplace.overallAvg
                                                    .toStringAsFixed(1),
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 14,
                                                ),
                                              ),
                                            ],
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
          ),
        ],
      ),
    );
  }
}
