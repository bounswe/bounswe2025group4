import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/workplace_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/workplace.dart';
import '../../../core/models/user.dart';
import 'send_employer_request_page.dart';
import 'workplace_reviews_page.dart';
import 'add_review_page.dart';

class WorkplaceDetailPage extends StatefulWidget {
  final int workplaceId;

  const WorkplaceDetailPage({super.key, required this.workplaceId});

  @override
  State<WorkplaceDetailPage> createState() => _WorkplaceDetailPageState();
}

class _WorkplaceDetailPageState extends State<WorkplaceDetailPage> {
  late WorkplaceProvider _workplaceProvider;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadWorkplace();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final apiService = ApiService(authProvider: authProvider);
    _workplaceProvider = WorkplaceProvider(apiService: apiService);
  }

  Future<void> _loadWorkplace() async {
    setState(() => _isLoading = true);
    await _workplaceProvider.fetchWorkplaceById(
      widget.workplaceId,
      includeReviews: true,
      reviewsLimit: 10,
    );
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final workplace = _workplaceProvider.currentWorkplace;
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentUser = authProvider.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Workplace Details'),
        actions: [
          if (workplace != null)
            IconButton(
              icon: const Icon(Icons.flag),
              onPressed: () => _showReportWorkplaceDialog(workplace),
              tooltip: 'Report Workplace',
            ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadWorkplace,
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
                      onPressed: _loadWorkplace,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
              : workplace == null
              ? const Center(child: Text('Workplace not found'))
              : RefreshIndicator(
                onRefresh: _loadWorkplace,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Company header
                      _buildHeader(workplace),
                      const SizedBox(height: 24),

                      // Request Manager Role button (if not already an employer or owner)
                      if (currentUser != null &&
                          !_isUserEmployer(workplace, currentUser)) ...[
                        _buildRequestButton(workplace, currentUser),
                        const SizedBox(height: 24),
                      ],

                      // Short description
                      _buildSection('About', workplace.shortDescription),
                      const SizedBox(height: 16),

                      // Detailed description
                      if (workplace.detailedDescription.isNotEmpty) ...[
                        _buildSection('Details', workplace.detailedDescription),
                        const SizedBox(height: 16),
                      ],

                      // Location and website
                      _buildInfoSection(workplace),
                      const SizedBox(height: 16),

                      // Ethical tags
                      if (workplace.ethicalTags.isNotEmpty) ...[
                        _buildEthicalTags(workplace.ethicalTags),
                        const SizedBox(height: 16),
                      ],

                      // Ratings
                      _buildRatings(workplace),
                      const SizedBox(height: 24),

                      // Reviews Section with Actions
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Reviews',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Row(
                            children: [
                              OutlinedButton.icon(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder:
                                          (context) => AddReviewPage(
                                            workplaceId: workplace.id,
                                            workplaceName:
                                                workplace.companyName,
                                          ),
                                    ),
                                  ).then((_) => _loadWorkplace());
                                },
                                icon: const Icon(Icons.add, size: 18),
                                label: const Text('Add'),
                              ),
                              const SizedBox(width: 8),
                              ElevatedButton.icon(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder:
                                          (context) => WorkplaceReviewsPage(
                                            workplaceId: workplace.id,
                                            workplaceName:
                                                workplace.companyName,
                                          ),
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.list, size: 18),
                                label: const Text('View All'),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Recent Reviews Preview
                      if (workplace.recentReviews.isNotEmpty) ...[
                        ...workplace.recentReviews.map((review) {
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.star,
                                        color: Colors.amber,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        review.overallRating.toStringAsFixed(1),
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                      const Spacer(),
                                      if (review.anonymous)
                                        const Chip(
                                          label: Text(
                                            'Anonymous',
                                            style: TextStyle(fontSize: 12),
                                          ),
                                          padding: EdgeInsets.symmetric(
                                            horizontal: 8,
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    review.title,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(review.content),
                                  if (review.reply != null) ...[
                                    const SizedBox(height: 12),
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: Colors.blue.shade50,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          const Row(
                                            children: [
                                              Icon(Icons.business, size: 16),
                                              SizedBox(width: 4),
                                              Text(
                                                'Company Response',
                                                style: TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 8),
                                          Text(review.reply!.content),
                                        ],
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          );
                        }),
                      ],

                      // Employers section
                      if (workplace.employers.isNotEmpty) ...[
                        const SizedBox(height: 24),
                        const Text(
                          'Team',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        ...workplace.employers.map((employer) {
                          final isCurrentUserOwner =
                              currentUser != null &&
                              _isUserOwnerOfWorkplace(workplace, currentUser);
                          final canDelete =
                              isCurrentUserOwner &&
                              employer.role.toUpperCase() != 'OWNER';

                          return ListTile(
                            leading: CircleAvatar(
                              child: Text(employer.username[0].toUpperCase()),
                            ),
                            title: Text(employer.username),
                            subtitle: Text(employer.role),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'Joined ${_formatDate(employer.joinedAt)}',
                                  style: const TextStyle(fontSize: 12),
                                ),
                                if (canDelete) ...[
                                  const SizedBox(width: 8),
                                  IconButton(
                                    icon: const Icon(
                                      Icons.delete_outline,
                                      color: Colors.red,
                                    ),
                                    onPressed:
                                        () => _deleteEmployer(
                                          workplace,
                                          employer,
                                        ),
                                    tooltip: 'Remove Manager',
                                  ),
                                ],
                              ],
                            ),
                          );
                        }),
                      ],
                    ],
                  ),
                ),
              ),
    );
  }

  Widget _buildHeader(Workplace workplace) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Company logo
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: Colors.grey[200],
            borderRadius: BorderRadius.circular(12),
          ),
          child:
              workplace.imageUrl != null
                  ? ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      workplace.imageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return const Icon(Icons.business, size: 40);
                      },
                    ),
                  )
                  : const Icon(Icons.business, size: 40),
        ),
        const SizedBox(width: 16),

        // Company name and rating
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                workplace.companyName,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                workplace.sector,
                style: TextStyle(fontSize: 16, color: Colors.grey[600]),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.star, color: Colors.amber, size: 24),
                  const SizedBox(width: 4),
                  Text(
                    workplace.overallAvg.toStringAsFixed(1),
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSection(String title, String content) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text(content, style: const TextStyle(fontSize: 16)),
      ],
    );
  }

  Widget _buildInfoSection(Workplace workplace) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.location_on, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                workplace.location,
                style: const TextStyle(fontSize: 16),
              ),
            ),
          ],
        ),
        if (workplace.website != null && workplace.website!.isNotEmpty) ...[
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.language, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  workplace.website!,
                  style: const TextStyle(
                    fontSize: 16,
                    color: Colors.blue,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildEthicalTags(List<String> tags) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Ethical Policies',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children:
              tags.map((tag) {
                return Chip(
                  label: Text(
                    tag.replaceAll('_', ' '),
                    style: const TextStyle(fontSize: 12),
                  ),
                  backgroundColor: Colors.green.shade100,
                );
              }).toList(),
        ),
      ],
    );
  }

  Widget _buildRatings(Workplace workplace) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Ratings by Category',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        ...workplace.ethicalAverages.entries.map((entry) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Text(
                    entry.key.replaceAll('_', ' '),
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
                Expanded(
                  flex: 3,
                  child: Row(
                    children: [
                      Expanded(
                        child: LinearProgressIndicator(
                          value: entry.value / 5.0,
                          backgroundColor: Colors.grey[300],
                          valueColor: AlwaysStoppedAnimation<Color>(
                            _getRatingColor(entry.value),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        entry.value.toStringAsFixed(1),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Color _getRatingColor(double rating) {
    if (rating >= 4.0) return Colors.green;
    if (rating >= 3.0) return Colors.orange;
    return Colors.red;
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays < 30) {
      return '${difference.inDays}d ago';
    } else if (difference.inDays < 365) {
      return '${(difference.inDays / 30).floor()}mo ago';
    } else {
      return '${(difference.inDays / 365).floor()}y ago';
    }
  }

  bool _isUserEmployer(Workplace workplace, User user) {
    // Check if the current user is already an employer (OWNER or MANAGER) at this workplace
    // If they are, they shouldn't see the "Request Manager Role" button
    final userId = int.tryParse(user.id);
    if (userId == null) return false;
    return workplace.employers.any((employer) => employer.userId == userId);
  }

  bool _isUserOwnerOfWorkplace(Workplace workplace, User user) {
    // Check if the current user is the OWNER of this workplace
    final userId = int.tryParse(user.id);
    if (userId == null) return false;

    try {
      final userEmployer = workplace.employers.firstWhere(
        (employer) => employer.userId == userId,
      );
      return userEmployer.role.toUpperCase() == 'OWNER';
    } catch (e) {
      // User not found in employers list
      return false;
    }
  }

  Future<void> _deleteEmployer(Workplace workplace, employer) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Remove Manager'),
            content: Text(
              'Are you sure you want to remove ${employer.username} from this workplace?',
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
                child: const Text('Remove'),
              ),
            ],
          ),
    );

    if (confirm != true) return;

    try {
      await _workplaceProvider.removeEmployerFromWorkplace(
        workplace.id,
        employer.userId,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Manager removed successfully'),
          backgroundColor: Colors.green,
        ),
      );

      // Reload workplace data
      _loadWorkplace();
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to remove manager: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _showReportWorkplaceDialog(Workplace workplace) async {
    final descriptionController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    String? selectedReason;
    final reasons = ['Offensive', 'Fake', 'Spam', 'Other'];

    final result = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Report Workplace'),
            content: StatefulBuilder(
              builder:
                  (context, setState) => Form(
                    key: formKey,
                    child: SingleChildScrollView(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Please select a reason and provide details:',
                            style: TextStyle(fontSize: 14),
                          ),
                          const SizedBox(height: 16),
                          DropdownButtonFormField<String>(
                            value: selectedReason,
                            decoration: const InputDecoration(
                              labelText: 'Reason',
                              border: OutlineInputBorder(),
                            ),
                            items:
                                reasons.map((reason) {
                                  return DropdownMenuItem(
                                    value: reason,
                                    child: Text(reason),
                                  );
                                }).toList(),
                            onChanged: (value) {
                              setState(() => selectedReason = value);
                            },
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please select a reason';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: descriptionController,
                            maxLines: 4,
                            maxLength: 500,
                            decoration: const InputDecoration(
                              labelText: 'Description',
                              hintText: 'Please provide more details...',
                              border: OutlineInputBorder(),
                            ),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Please provide a description';
                              }
                              return null;
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  if (formKey.currentState!.validate()) {
                    Navigator.pop(context, true);
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Report'),
              ),
            ],
          ),
    );

    if (result != true) return;
    if (selectedReason == null) return;

    try {
      final success = await _workplaceProvider.reportWorkplace(
        workplaceId: workplace.id,
        reasonType: selectedReason!, // Safe to use ! after null check
        description: descriptionController.text.trim(),
      );

      if (!mounted) return;

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Report submitted successfully'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _workplaceProvider.error ?? 'Failed to submit report',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Widget _buildRequestButton(Workplace workplace, User user) {
    return Card(
      elevation: 2,
      color: Colors.blue.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.work_outline, color: Colors.blue.shade700),
                const SizedBox(width: 8),
                Text(
                  'Interested in managing this workplace?',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue.shade700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              'Request to become a MANAGER and help manage this workplace\'s information and reviews.',
              style: TextStyle(color: Colors.grey[700]),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder:
                          (context) => SendEmployerRequestPage(
                            workplaceId: workplace.id,
                            workplaceName: workplace.companyName,
                          ),
                    ),
                  );

                  if (result == true && mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Request sent! The workplace owner will review it.',
                        ),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                },
                icon: const Icon(Icons.send),
                label: const Text('Request Manager Role'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
