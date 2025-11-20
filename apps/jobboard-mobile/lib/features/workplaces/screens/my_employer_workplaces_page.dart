import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/workplace_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/employer_workplace_item.dart';
import 'workplace_detail_page.dart';
import 'employer_requests_page.dart';
import 'edit_workplace_page.dart';

class MyEmployerWorkplacesPage extends StatefulWidget {
  const MyEmployerWorkplacesPage({super.key});

  @override
  State<MyEmployerWorkplacesPage> createState() =>
      _MyEmployerWorkplacesPageState();
}

class _MyEmployerWorkplacesPageState extends State<MyEmployerWorkplacesPage> {
  late WorkplaceProvider _workplaceProvider;
  List<EmployerWorkplaceItem> _workplaces = [];
  bool _isLoading = true;

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
    setState(() => _isLoading = true);
    final workplaces = await _workplaceProvider.getMyEmployerWorkplaces();
    setState(() {
      _workplaces = workplaces;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Workplaces'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadWorkplaces,
          ),
        ],
      ),
      body:
          _isLoading
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
              : _workplaces.isEmpty
              ? const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.business_outlined, size: 64),
                    SizedBox(height: 16),
                    Text('No workplaces found', style: TextStyle(fontSize: 18)),
                    SizedBox(height: 8),
                    Text(
                      'You are not managing any workplaces yet',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
              )
              : RefreshIndicator(
                onRefresh: _loadWorkplaces,
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _workplaces.length,
                  itemBuilder: (context, index) {
                    final item = _workplaces[index];
                    final workplace = item.workplace;
                    final isOwner = item.role.toUpperCase() == 'OWNER';

                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
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
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  // Company logo
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
                                                  );
                                                },
                                              ),
                                            )
                                            : const Icon(
                                              Icons.business,
                                              size: 32,
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
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 8,
                                                    vertical: 4,
                                                  ),
                                              decoration: BoxDecoration(
                                                color:
                                                    isOwner
                                                        ? Colors.blue.shade100
                                                        : Colors.green.shade100,
                                                borderRadius:
                                                    BorderRadius.circular(4),
                                              ),
                                              child: Text(
                                                item.role,
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold,
                                                  color:
                                                      isOwner
                                                          ? Colors.blue.shade900
                                                          : Colors
                                                              .green
                                                              .shade900,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              const Divider(),
                              const SizedBox(height: 8),

                              // Stats
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceAround,
                                children: [
                                  _buildStat(
                                    icon: Icons.star,
                                    label: 'Rating',
                                    value: workplace.overallAvg != null
                                        ? workplace.overallAvg!.toStringAsFixed(1)
                                        : 'N/A',
                                    color: Colors.amber,
                                  ),
                                  _buildStat(
                                    icon: Icons.rate_review,
                                    label: 'Reviews',
                                    value: workplace.reviewCount.toString(),
                                    color: Colors.blue,
                                  ),
                                  _buildStat(
                                    icon: Icons.verified,
                                    label: 'Policies',
                                    value:
                                        workplace.ethicalTags.length.toString(),
                                    color: Colors.green,
                                  ),
                                ],
                              ),

                              // Owner actions
                              if (isOwner) ...[
                                const SizedBox(height: 12),
                                const Divider(),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Expanded(
                                      child: OutlinedButton.icon(
                                        onPressed: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder:
                                                  (
                                                    context,
                                                  ) => EmployerRequestsPage(
                                                    workplaceId: workplace.id,
                                                    workplaceName:
                                                        workplace.companyName,
                                                  ),
                                            ),
                                          ).then((_) => _loadWorkplaces());
                                        },
                                        icon: const Icon(
                                          Icons.people,
                                          size: 18,
                                        ),
                                        label: const Text(
                                          'Requests',
                                          style: TextStyle(fontSize: 12),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: OutlinedButton.icon(
                                        onPressed: () {
                                          _editWorkplace(workplace.id);
                                        },
                                        icon: const Icon(
                                          Icons.edit,
                                          size: 18,
                                        ),
                                        label: const Text(
                                          'Edit',
                                          style: TextStyle(fontSize: 12),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    IconButton(
                                      onPressed: () => _deleteWorkplace(workplace),
                                      icon: const Icon(
                                        Icons.delete_outline,
                                        color: Colors.red,
                                      ),
                                      tooltip: 'Delete Workplace',
                                    ),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
    );
  }

  Widget _buildStat({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
      ],
    );
  }

  Future<void> _editWorkplace(int workplaceId) async {
    // First, fetch the full workplace details
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final apiService = ApiService(authProvider: authProvider);
    final provider = WorkplaceProvider(apiService: apiService);
    
    // Show loading indicator
    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );
    
    await provider.fetchWorkplaceById(workplaceId);
    
    if (!mounted) return;
    Navigator.pop(context); // Close loading dialog
    
    if (provider.currentWorkplace != null) {
      final result = await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) =>
              EditWorkplacePage(workplace: provider.currentWorkplace!),
        ),
      );

      if (result == true) {
        _loadWorkplaces();
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.error ?? 'Failed to load workplace'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _deleteWorkplace(workplace) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Delete Workplace'),
            content: Text(
              'Are you sure you want to delete "${workplace.companyName}"? '
              'This action cannot be undone and will remove all reviews and data.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Delete'),
              ),
            ],
          ),
    );

    if (confirm != true) return;

    try {
      final response = await _workplaceProvider.deleteWorkplace(workplace.id);

      if (!mounted) return;

      if (response != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.message),
            backgroundColor: Colors.green,
          ),
        );

        // Reload workplaces list
        _loadWorkplaces();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _workplaceProvider.error ?? 'Failed to delete workplace',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error deleting workplace: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
