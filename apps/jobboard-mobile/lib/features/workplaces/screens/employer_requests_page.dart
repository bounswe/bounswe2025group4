import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/workplace_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/employer_request.dart';
import '../../../core/models/paginated_employer_request_response.dart';

class EmployerRequestsPage extends StatefulWidget {
  final int workplaceId;
  final String workplaceName;

  const EmployerRequestsPage({
    super.key,
    required this.workplaceId,
    required this.workplaceName,
  });

  @override
  State<EmployerRequestsPage> createState() => _EmployerRequestsPageState();
}

class _EmployerRequestsPageState extends State<EmployerRequestsPage> {
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
    final response = await _workplaceProvider!.getEmployerRequests(
      widget.workplaceId,
      page: _currentPage,
      size: _pageSize,
    );
    setState(() {
      _response = response;
      _isLoading = false;
    });
  }

  Future<void> _handleRequest(EmployerRequest request, String action) async {
    if (_workplaceProvider == null) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Text(
              '${action == 'approve' ? 'Approve' : 'Reject'} Request',
            ),
            content: Text(
              'Are you sure you want to ${action} this employer request?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      action == 'approve' ? Colors.green : Colors.red,
                ),
                child: Text(action == 'approve' ? 'Approve' : 'Reject'),
              ),
            ],
          ),
    );

    if (confirm != true) return;

    final result = await _workplaceProvider!.handleEmployerRequest(
      widget.workplaceId,
      request.id,
      action: action,
    );

    if (!mounted) return;

    if (result != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Request ${action == 'approve' ? 'approved' : 'rejected'} successfully',
          ),
          backgroundColor: Colors.green,
        ),
      );
      _loadRequests();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _workplaceProvider!.error ?? 'Failed to $action request',
          ),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Employer Requests'),
            Text(widget.workplaceName, style: const TextStyle(fontSize: 14)),
          ],
        ),
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
                    Text(
                      _workplaceProvider!.error!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.red),
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
              ? const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.inbox_outlined, size: 64),
                    SizedBox(height: 16),
                    Text(
                      'No employer requests',
                      style: TextStyle(fontSize: 18),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'No pending requests at the moment',
                      style: TextStyle(color: Colors.grey),
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
                            color: Colors.black.withOpacity(0.1),
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
    if (isPending) statusColor = Colors.orange;
    if (isApproved) statusColor = Colors.green;
    if (isRejected) statusColor = Colors.red;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: statusColor.withOpacity(0.2),
                  child: Icon(
                    isPending
                        ? Icons.hourglass_empty
                        : isApproved
                        ? Icons.check_circle
                        : Icons.cancel,
                    color: statusColor,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        request.createdByUsername ??
                            'User ID: ${request.createdByUserId}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Request #${request.id}',
                        style: TextStyle(fontSize: 14, color: Colors.grey[600]),
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
                    color: statusColor.withOpacity(0.2),
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
            Row(
              children: [
                Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 4),
                Text(
                  'Created: ${_formatDate(request.createdAt)}',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
              ],
            ),

            if (isPending) ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _handleRequest(request, 'reject'),
                      icon: const Icon(Icons.close, size: 18),
                      label: const Text('Reject'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _handleRequest(request, 'approve'),
                      icon: const Icon(Icons.check, size: 18),
                      label: const Text('Approve'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
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
