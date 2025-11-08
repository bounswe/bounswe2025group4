import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/workplace_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/workplace.dart';

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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Workplace Details'),
        actions: [
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

                      // Reviews
                      if (workplace.recentReviews.isNotEmpty) ...[
                        const Text(
                          'Recent Reviews',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
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
                          return ListTile(
                            leading: CircleAvatar(
                              child: Text(employer.username[0].toUpperCase()),
                            ),
                            title: Text(employer.username),
                            subtitle: Text(employer.role),
                            trailing: Text(
                              'Joined ${_formatDate(employer.joinedAt)}',
                              style: const TextStyle(fontSize: 12),
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
}
