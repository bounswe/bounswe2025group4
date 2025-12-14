import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/workplace_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/workplace_review.dart';
import '../../../core/models/workplace.dart';
import 'add_review_page.dart';
import 'review_detail_page.dart';

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
  Workplace? _workplace;

  // Filter state
  String? _sortBy;
  double? _minRating;
  double? _maxRating;

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

    // Build ratingFilter string
    // If both are set: "min,max"
    // If only one is set, use 1 as default min or 5 as default max
    String? ratingFilter;
    if (_minRating != null || _maxRating != null) {
      final min = _minRating?.toInt() ?? 1;
      final max = _maxRating?.toInt() ?? 5;
      ratingFilter = '$min,$max';
    }

    // Debug: Log what we're sending
    print('[WorkplaceReviewsPage] Loading reviews with filters:');
    print('[WorkplaceReviewsPage]   workplaceId: ${widget.workplaceId}');
    print('[WorkplaceReviewsPage]   sortBy: $_sortBy');
    print('[WorkplaceReviewsPage]   ratingFilter: $ratingFilter');
    print(
      '[WorkplaceReviewsPage]   _minRating: $_minRating, _maxRating: $_maxRating',
    );

    // Load both workplace data and reviews
    await Future.wait([
      _workplaceProvider!.fetchWorkplaceById(widget.workplaceId),
      _workplaceProvider!.fetchWorkplaceReviews(
        widget.workplaceId,
        sortBy: _sortBy,
        ratingFilter: ratingFilter,
      ),
    ]);

    setState(() {
      _workplace = _workplaceProvider!.currentWorkplace;
      _reviews = _workplaceProvider!.currentReviews;
      _isLoading = false;
    });

    // Debug: Log what we received
    print('[WorkplaceReviewsPage] Received ${_reviews.length} reviews:');
    for (var review in _reviews) {
      print(
        '[WorkplaceReviewsPage]   Review #${review.id}: Rating ${review.overallRating}',
      );
    }
  }

  Future<void> _deleteReview(WorkplaceReview review) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
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

  Future<void> _showReportReviewDialog(WorkplaceReview review) async {
    final descriptionController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    String? selectedReason;
    final reasons = [
      'SPAM',
      'FAKE',
      'OFFENSIVE',
      'HARASSMENT',
      'MISINFORMATION',
      'OTHER',
    ];

    final result = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Report Review'),
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
                                  // Convert UPPERCASE to Title Case for display
                                  final displayText = reason
                                      .split('_')
                                      .map(
                                        (word) =>
                                            word[0] +
                                            word.substring(1).toLowerCase(),
                                      )
                                      .join(' ');
                                  return DropdownMenuItem(
                                    value: reason,
                                    child: Text(displayText),
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
    if (_workplaceProvider == null) return;

    try {
      final success = await _workplaceProvider!.reportContent(
        entityType: 'REVIEW',
        entityId: review.id,
        reasonType: selectedReason!,
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
              _workplaceProvider!.error ?? 'Failed to submit report',
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

  bool _isUserEmployer(String? userId) {
    if (userId == null || _workplace == null) return false;
    final userIdInt = int.tryParse(userId);
    if (userIdInt == null) return false;
    return _workplace!.employers.any((emp) => emp.userId == userIdInt);
  }

  bool _hasUserReviewed(List<WorkplaceReview> reviews, String userId) {
    // Check if the user has already submitted a review
    return reviews.any((review) => review.userId.toString() == userId);
  }

  Future<void> _showFilterDialog() async {
    String? tempSortBy = _sortBy;
    double? tempMinRating = _minRating;
    double? tempMaxRating = _maxRating;

    final result = await showDialog<bool>(
      context: context,
      builder:
          (context) => StatefulBuilder(
            builder:
                (context, setDialogState) => AlertDialog(
                  title: const Text('Filter & Sort Reviews'),
                  content: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Sort options
                        const Text(
                          'Sort By',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: [
                            ChoiceChip(
                              label: const Text('Rating: Low to High'),
                              selected: tempSortBy == 'ratingAsc',
                              onSelected: (selected) {
                                setDialogState(() {
                                  tempSortBy = selected ? 'ratingAsc' : null;
                                });
                              },
                            ),
                            ChoiceChip(
                              label: const Text('Rating: High to Low'),
                              selected: tempSortBy == 'ratingDesc',
                              onSelected: (selected) {
                                setDialogState(() {
                                  tempSortBy = selected ? 'ratingDesc' : null;
                                });
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Rating filter
                        const Text(
                          'Filter by Rating',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<double>(
                                value: tempMinRating,
                                decoration: const InputDecoration(
                                  labelText: 'Min Rating',
                                  border: OutlineInputBorder(),
                                  contentPadding: EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 8,
                                  ),
                                ),
                                items:
                                    [1.0, 2.0, 3.0, 4.0, 5.0].map((rating) {
                                      return DropdownMenuItem(
                                        value: rating,
                                        child: Row(
                                          children: [
                                            const Icon(
                                              Icons.star,
                                              color: Colors.amber,
                                              size: 16,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(rating.toStringAsFixed(0)),
                                          ],
                                        ),
                                      );
                                    }).toList(),
                                onChanged: (value) {
                                  setDialogState(() {
                                    tempMinRating = value;
                                    if (tempMaxRating != null &&
                                        value != null &&
                                        value > tempMaxRating!) {
                                      tempMaxRating = value;
                                    }
                                  });
                                },
                              ),
                            ),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 8),
                              child: Text('to'),
                            ),
                            Expanded(
                              child: DropdownButtonFormField<double>(
                                value: tempMaxRating,
                                decoration: const InputDecoration(
                                  labelText: 'Max Rating',
                                  border: OutlineInputBorder(),
                                  contentPadding: EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 8,
                                  ),
                                ),
                                items:
                                    [1.0, 2.0, 3.0, 4.0, 5.0].map((rating) {
                                      return DropdownMenuItem(
                                        value: rating,
                                        child: Row(
                                          children: [
                                            const Icon(
                                              Icons.star,
                                              color: Colors.amber,
                                              size: 16,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(rating.toStringAsFixed(0)),
                                          ],
                                        ),
                                      );
                                    }).toList(),
                                onChanged: (value) {
                                  setDialogState(() {
                                    tempMaxRating = value;
                                    if (tempMinRating != null &&
                                        value != null &&
                                        value < tempMinRating!) {
                                      tempMinRating = value;
                                    }
                                  });
                                },
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        if (tempMinRating != null || tempMaxRating != null)
                          TextButton.icon(
                            onPressed: () {
                              setDialogState(() {
                                tempMinRating = null;
                                tempMaxRating = null;
                              });
                            },
                            icon: const Icon(Icons.clear),
                            label: const Text('Clear Rating Filter'),
                          ),
                      ],
                    ),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () {
                        setState(() {
                          _sortBy = tempSortBy;
                          _minRating = tempMinRating;
                          _maxRating = tempMaxRating;
                        });
                        Navigator.pop(context, true);
                      },
                      child: const Text('Apply'),
                    ),
                    if (_sortBy != null ||
                        _minRating != null ||
                        _maxRating != null)
                      TextButton(
                        onPressed: () {
                          setState(() {
                            _sortBy = null;
                            _minRating = null;
                            _maxRating = null;
                          });
                          Navigator.pop(context, true);
                        },
                        style: TextButton.styleFrom(
                          foregroundColor: Colors.red,
                        ),
                        child: const Text('Clear All'),
                      ),
                  ],
                ),
          ),
    );

    if (result == true) {
      _loadReviews();
    }
  }

  Future<void> _showReplyDialog({
    required WorkplaceReview review,
    String? existingReply,
  }) async {
    final contentController = TextEditingController(text: existingReply);
    final formKey = GlobalKey<FormState>();

    final result = await showDialog<String>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Text(
              existingReply != null ? 'Edit Reply' : 'Reply to Review',
            ),
            content: Form(
              key: formKey,
              child: TextFormField(
                controller: contentController,
                maxLines: 5,
                maxLength: 500,
                decoration: const InputDecoration(
                  labelText: 'Your Response',
                  hintText: 'Write your response to this review...',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a response';
                  }
                  return null;
                },
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  if (formKey.currentState!.validate()) {
                    Navigator.pop(context, contentController.text.trim());
                  }
                },
                child: Text(existingReply != null ? 'Update' : 'Reply'),
              ),
            ],
          ),
    );

    if (result == null || _workplaceProvider == null) return;

    try {
      bool success;
      if (existingReply != null) {
        // Update existing reply
        success = await _workplaceProvider!.updateReply(
          workplaceId: widget.workplaceId,
          reviewId: review.id,
          content: result,
        );
      } else {
        // Create new reply
        final reply = await _workplaceProvider!.replyToReview(
          workplaceId: widget.workplaceId,
          reviewId: review.id,
          content: result,
        );
        success = reply != null;
      }

      if (!mounted) return;

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              existingReply != null
                  ? 'Reply updated successfully'
                  : 'Reply posted successfully',
            ),
            backgroundColor: Colors.green,
          ),
        );
        _loadReviews();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_workplaceProvider!.error ?? 'Failed to post reply'),
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

  Future<void> _deleteReplyConfirm(WorkplaceReview review) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Delete Reply'),
            content: const Text('Are you sure you want to delete this reply?'),
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

    if (confirm != true || _workplaceProvider == null) return;

    try {
      final success = await _workplaceProvider!.deleteReply(
        workplaceId: widget.workplaceId,
        reviewId: review.id,
      );

      if (!mounted) return;

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Reply deleted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        _loadReviews();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _workplaceProvider!.error ?? 'Failed to delete reply',
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

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final currentUserId = authProvider.currentUser?.id;
    final isEmployer = _isUserEmployer(currentUserId);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Reviews'),
            Text(widget.workplaceName, style: const TextStyle(fontSize: 14)),
          ],
        ),
        actions: [
          // Filter button with badge indicator
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.filter_list),
                onPressed: _showFilterDialog,
                tooltip: 'Filter & Sort',
              ),
              if (_sortBy != null || _minRating != null || _maxRating != null)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
          // Only show "Add" button if user hasn't reviewed yet
          if (currentUserId != null &&
              !_hasUserReviewed(_reviews, currentUserId))
            IconButton(
              icon: const Icon(Icons.add),
              onPressed: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder:
                        (context) => AddReviewPage(
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
      body: Column(
        children: [
          // Active filters display
          if (_sortBy != null || _minRating != null || _maxRating != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: Colors.blue.shade50,
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  const Text(
                    'Active filters:',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  if (_sortBy != null)
                    Chip(
                      label: Text(
                        _sortBy == 'ratingAsc' ? 'Rating ↑' : 'Rating ↓',
                        style: const TextStyle(fontSize: 12),
                      ),
                      deleteIcon: const Icon(Icons.close, size: 16),
                      onDeleted: () {
                        setState(() => _sortBy = null);
                        _loadReviews();
                      },
                      visualDensity: VisualDensity.compact,
                    ),
                  if (_minRating != null || _maxRating != null)
                    Chip(
                      label: Text(
                        'Rating: ${_minRating?.toInt() ?? 1}-${_maxRating?.toInt() ?? 5}',
                        style: const TextStyle(fontSize: 12),
                      ),
                      deleteIcon: const Icon(Icons.close, size: 16),
                      onDeleted: () {
                        setState(() {
                          _minRating = null;
                          _maxRating = null;
                        });
                        _loadReviews();
                      },
                      visualDensity: VisualDensity.compact,
                    ),
                  TextButton.icon(
                    onPressed: () {
                      setState(() {
                        _sortBy = null;
                        _minRating = null;
                        _maxRating = null;
                      });
                      _loadReviews();
                    },
                    icon: const Icon(Icons.clear_all, size: 16),
                    label: const Text(
                      'Clear all',
                      style: TextStyle(fontSize: 12),
                    ),
                    style: TextButton.styleFrom(
                      visualDensity: VisualDensity.compact,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                  ),
                ],
              ),
            ),
          // Main content
          Expanded(
            child:
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
                          final isOwnReview =
                              currentUserId != null &&
                              review.userId.toString() == currentUserId;

                          return Card(
                            margin: const EdgeInsets.only(bottom: 16),
                            child: InkWell(
                              onTap: () async {
                                final result = await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder:
                                        (context) => ReviewDetailPage(
                                          workplaceId: widget.workplaceId,
                                          reviewId: review.id,
                                          workplaceName: widget.workplaceName,
                                        ),
                                  ),
                                );
                                if (result == true) {
                                  _loadReviews();
                                }
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Header with user info
                                    Row(
                                      children: [
                                        // User Avatar
                                        CircleAvatar(
                                          radius: 20,
                                          backgroundColor: Colors.blue.shade100,
                                          child:
                                              review.anonymous
                                                  ? const Icon(
                                                    Icons.person,
                                                    size: 20,
                                                  )
                                                  : Text(
                                                    review.username.isNotEmpty
                                                        ? review.username[0]
                                                            .toUpperCase()
                                                        : '?',
                                                    style: const TextStyle(
                                                      fontWeight:
                                                          FontWeight.bold,
                                                    ),
                                                  ),
                                        ),
                                        const SizedBox(width: 12),
                                        // User Name and Rating
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                review.anonymous
                                                    ? 'Anonymous'
                                                    : review
                                                        .nameSurname
                                                        .isNotEmpty
                                                    ? review.nameSurname
                                                    : review.username,
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                              Row(
                                                children: [
                                                  const Icon(
                                                    Icons.star,
                                                    color: Colors.amber,
                                                    size: 16,
                                                  ),
                                                  const SizedBox(width: 4),
                                                  Text(
                                                    review.overallRating
                                                        .toStringAsFixed(1),
                                                    style: const TextStyle(
                                                      fontSize: 14,
                                                      fontWeight:
                                                          FontWeight.w600,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                        // Action buttons
                                        if (isOwnReview) ...[
                                          IconButton(
                                            icon: const Icon(
                                              Icons.edit,
                                              size: 20,
                                            ),
                                            onPressed: () async {
                                              final result = await Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder:
                                                      (
                                                        context,
                                                      ) => AddReviewPage(
                                                        workplaceId:
                                                            widget.workplaceId,
                                                        workplaceName:
                                                            widget
                                                                .workplaceName,
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
                                              size: 20,
                                            ),
                                            onPressed:
                                                () => _deleteReview(review),
                                          ),
                                        ],
                                        if (!isOwnReview)
                                          IconButton(
                                            icon: const Icon(
                                              Icons.flag_outlined,
                                              size: 20,
                                            ),
                                            onPressed:
                                                () => _showReportReviewDialog(
                                                  review,
                                                ),
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

                                    // Reply section
                                    if (review.reply != null) ...[
                                      const SizedBox(height: 12),
                                      Container(
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          color: Colors.blue.shade50,
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                const Icon(
                                                  Icons.business,
                                                  size: 16,
                                                ),
                                                const SizedBox(width: 4),
                                                const Text(
                                                  'Company Response',
                                                  style: TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                                const Spacer(),
                                                if (isEmployer) ...[
                                                  IconButton(
                                                    icon: const Icon(
                                                      Icons.edit,
                                                      size: 18,
                                                    ),
                                                    onPressed:
                                                        () => _showReplyDialog(
                                                          review: review,
                                                          existingReply:
                                                              review
                                                                  .reply!
                                                                  .content,
                                                        ),
                                                    tooltip: 'Edit Reply',
                                                    padding: EdgeInsets.zero,
                                                    constraints:
                                                        const BoxConstraints(),
                                                  ),
                                                  const SizedBox(width: 8),
                                                  IconButton(
                                                    icon: const Icon(
                                                      Icons.delete,
                                                      size: 18,
                                                      color: Colors.red,
                                                    ),
                                                    onPressed:
                                                        () =>
                                                            _deleteReplyConfirm(
                                                              review,
                                                            ),
                                                    tooltip: 'Delete Reply',
                                                    padding: EdgeInsets.zero,
                                                    constraints:
                                                        const BoxConstraints(),
                                                  ),
                                                ],
                                              ],
                                            ),
                                            const SizedBox(height: 8),
                                            Text(review.reply!.content),
                                          ],
                                        ),
                                      ),
                                    ] else if (isEmployer) ...[
                                      // Show reply button for employers if no reply exists
                                      const SizedBox(height: 12),
                                      OutlinedButton.icon(
                                        onPressed:
                                            () => _showReplyDialog(
                                              review: review,
                                            ),
                                        icon: const Icon(Icons.reply),
                                        label: const Text('Reply to Review'),
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: Colors.blue,
                                        ),
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
          ),
        ],
      ),
    );
  }
}
