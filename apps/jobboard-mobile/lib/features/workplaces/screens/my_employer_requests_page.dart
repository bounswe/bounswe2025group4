import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/workplace_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/employer_request.dart';
import '../../../core/models/paginated_employer_request_response.dart';
import 'workplace_detail_page.dart';

class MyEmployerRequestsPage extends StatefulWidget {
  const MyEmployerRequestsPage({super.key});

  @override
  State<MyEmployerRequestsPage> createState() => _MyEmployerRequestsPageState();
}

class _MyEmployerRequestsPageState extends State<MyEmployerRequestsPage> {
  WorkplaceProvider? _workplaceProvider;
  PaginatedEmployerRequestResponse? _response;
  bool _isLoading = true;
  int _currentPage = 0;
  final int _pageSize = 10;
  bool _isInitialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInitialized) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authProvider: authProvider);
      _workplaceProvider = WorkplaceProvider(apiService: apiService);
      _isInitialized = true;
      _loadRequests();
    }
  }

  Future<void> _loadRequests() async {
    if (_workplaceProvider == null) return;
    setState(() => _isLoading = true);
    await _workplaceProvider!.fetchMyEmployerRequests(
      page: _currentPage,
      size: _pageSize,
    );
    setState(() {
      _response = _workplaceProvider!.myEmployerRequests;
      _isLoading = false;
    });
  }

  void _navigateToWorkplace(int workplaceId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => WorkplaceDetailPage(workplaceId: workplaceId),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Employer Requests'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadRequests),
        ],
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _workplaceProvider?.error != null
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
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 32),
                      child: Text(
                        _workplaceProvider!.error!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadRequests,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
              : _response == null || _response!.content.isEmpty
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.inbox_outlined,
                      size: 64,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'No employer requests',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'You haven\'t made any requests yet',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              )
              : Column(
                children: [
                  // Summary
                  Container(
                    padding: const EdgeInsets.all(16),
                    color: Colors.blue.shade50,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Total Requests: ${_response!.totalElements}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Page ${_response!.page + 1} of ${_response!.totalPages}',
                          style: TextStyle(color: Colors.grey[700]),
                        ),
                      ],
                    ),
                  ),

                  // Requests list
                  Expanded(
                    child: RefreshIndicator(
                      onRefresh: _loadRequests,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _response!.content.length,
                        itemBuilder: (context, index) {
                          final request = _response!.content[index];
                          return _buildRequestCard(request);
                        },
                      ),
                    ),
                  ),

                  // Pagination
                  if (_response!.totalPages > 1)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 4,
                            offset: const Offset(0, -2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          ElevatedButton.icon(
                            onPressed:
                                _response!.hasPrevious
                                    ? () {
                                      setState(() => _currentPage--);
                                      _loadRequests();
                                    }
                                    : null,
                            icon: const Icon(Icons.chevron_left),
                            label: const Text('Previous'),
                          ),
                          Text(
                            'Page ${_response!.page + 1}',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          ElevatedButton.icon(
                            onPressed:
                                _response!.hasNext
                                    ? () {
                                      setState(() => _currentPage++);
                                      _loadRequests();
                                    }
                                    : null,
                            icon: const Icon(Icons.chevron_right),
                            label: const Text('Next'),
                            iconAlignment: IconAlignment.end,
                          ),
                        ],
                      ),
                    ),
                ],
              ),
    );
  }

  Widget _buildRequestCard(EmployerRequest request) {
    final isPending = request.status.toUpperCase() == 'PENDING';
    final isApproved = request.status.toUpperCase() == 'APPROVED';
    final isRejected = request.status.toUpperCase() == 'REJECTED';

    Color statusColor = Colors.grey;
    IconData statusIcon = Icons.help_outline;

    if (isPending) {
      statusColor = Colors.orange;
      statusIcon = Icons.hourglass_empty;
    }
    if (isApproved) {
      statusColor = Colors.green;
      statusIcon = Icons.check_circle;
    }
    if (isRejected) {
      statusColor = Colors.red;
      statusIcon = Icons.cancel;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () => _navigateToWorkplace(request.workplaceId),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with workplace name and status
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: statusColor.withValues(alpha: 0.2),
                    child: Icon(statusIcon, color: statusColor),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          request.workplaceCompanyName ??
                              'Workplace ID: ${request.workplaceId}',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Request #${request.id}',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      request.status.toUpperCase(),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: statusColor,
                      ),
                    ),
                  ),
                ],
              ),

              // Note if present
              if (request.note != null && request.note!.isNotEmpty) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Note:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(request.note!, style: const TextStyle(fontSize: 14)),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 12),

              // Timestamps
              Wrap(
                spacing: 16,
                runSpacing: 8,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 16,
                        color: Colors.grey[600],
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Created: ${_formatDate(request.createdAt)}',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                  if (request.updatedAt
                          .difference(request.createdAt)
                          .inMinutes >
                      1)
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.update, size: 16, color: Colors.grey[600]),
                        const SizedBox(width: 4),
                        Text(
                          'Updated: ${_formatDate(request.updatedAt)}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                ],
              ),

              // Status message
              if (isPending) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.orange.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.orange.shade200),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        size: 16,
                        color: Colors.orange[700],
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Waiting for approval from workplace owner',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.orange[700],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ] else if (isApproved) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.green.shade200),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.check_circle_outline,
                        size: 16,
                        color: Colors.green[700],
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Your request has been approved. You can now manage this workplace.',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.green[700],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ] else if (isRejected) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.cancel_outlined,
                        size: 16,
                        color: Colors.red[700],
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Your request has been rejected.',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.red[700],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // View workplace button
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => _navigateToWorkplace(request.workplaceId),
                  icon: const Icon(Icons.business, size: 18),
                  label: const Text('View Workplace'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Theme.of(context).primaryColor,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        if (difference.inMinutes == 0) {
          return 'Just now';
        }
        return '${difference.inMinutes}m ago';
      }
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 30) {
      return '${difference.inDays}d ago';
    } else if (difference.inDays < 365) {
      return '${(difference.inDays / 30).floor()}mo ago';
    } else {
      return '${(difference.inDays / 365).floor()}y ago';
    }
  }
}
