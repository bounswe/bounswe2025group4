import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/workplace_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/workplace_review.dart';
import 'add_review_page.dart';

class WorkplaceReviewsPage extends StatefulWidget {
  final int workplaceId;
  final String workplaceName;

  const WorkplaceReviewsPage({
    super.key,
    required this.workplaceId,
    required this.workplaceName,
  });

  @override
  State<WorkplaceReviewsPage> createState() => _WorkplaceReviewsPageState();
}

class _WorkplaceReviewsPageState extends State<WorkplaceReviewsPage> {
  WorkplaceProvider? _workplaceProvider;
  bool _isInitialized = false;
  List<WorkplaceReview> _reviews = [];
  bool _isLoading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInitialized) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authProvider: authProvider);
      _workplaceProvider = WorkplaceProvider(apiService: apiService);
      _isInitialized = true;
      _loadReviews();
    }
  }

  Future<void> _loadReviews() async {
    if (_workplaceProvider == null) return;
    setState(() => _isLoading = true);
    await _workplaceProvider!.fetchWorkplaceReviews(widget.workplaceId);
    setState(() {
      _reviews = _workplaceProvider!.currentReviews;
      _isLoading = false;
    });
  }

  Future<void> _deleteReview(WorkplaceReview review) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Review'),
        content: const Text('Are you sure you want to delete this review?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true && _workplaceProvider != null) {
      final success = await _workplaceProvider!.deleteReview(
        widget.workplaceId,
        review.id,
      );

      if (!mounted) return;

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Review deleted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        _loadReviews();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _workplaceProvider!.error ?? 'Failed to delete review',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final currentUserId = authProvider.currentUser?.id;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Reviews'),
            Text(
              widget.workplaceName,
              style: const TextStyle(fontSize: 14),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => AddReviewPage(
                    workplaceId: widget.workplaceId,
                    workplaceName: widget.workplaceName,
                  ),
                ),
              );
              if (result == true) {
                _loadReviews();
              }
            },
            tooltip: 'Add Review',
          ),
        ],
      ),
      body: _isLoading
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
                        onPressed: _loadReviews,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _reviews.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.rate_review_outlined, size: 64),
                          SizedBox(height: 16),
                          Text(
                            'No reviews yet',
                            style: TextStyle(fontSize: 18),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Be the first to review this workplace!',
                            style: TextStyle(color: Colors.grey),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadReviews,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _reviews.length,
                        itemBuilder: (context, index) {
                          final review = _reviews[index];
                          final isOwnReview = currentUserId != null &&
                              review.userId.toString() == currentUserId;

                          return Card(
                            margin: const EdgeInsets.only(bottom: 16),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Header
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.star,
                                        color: Colors.amber,
                                        size: 24,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        review.overallRating.toStringAsFixed(1),
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
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
                                      if (isOwnReview) ...[
                                        IconButton(
                                          icon: const Icon(Icons.edit),
                                          onPressed: () async {
                                            final result = await Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (context) =>
                                                    AddReviewPage(
                                                  workplaceId: widget.workplaceId,
                                                  workplaceName:
                                                      widget.workplaceName,
                                                  existingReview: review,
                                                ),
                                              ),
                                            );
                                            if (result == true) {
                                              _loadReviews();
                                            }
                                          },
                                        ),
                                        IconButton(
                                          icon: const Icon(
                                            Icons.delete,
                                            color: Colors.red,
                                          ),
                                          onPressed: () => _deleteReview(review),
                                        ),
                                      ],
                                      IconButton(
                                        icon: const Icon(Icons.flag_outlined),
                                        onPressed: () {
                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(
                                            const SnackBar(
                                              content: Text(
                                                'Report feature coming soon',
                                              ),
                                            ),
                                          );
                                        },
                                        tooltip: 'Report',
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),

                                  // Title
                                  Text(
                                    review.title,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 8),

                                  // Content
                                  Text(review.content),
                                  const SizedBox(height: 12),

                                  // Helpful count
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.thumb_up_outlined,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 4),
                                      Text('${review.helpfulCount} helpful'),
                                    ],
                                  ),

                                  // Reply section
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
                        },
                      ),
                    ),
    );
  }
}

