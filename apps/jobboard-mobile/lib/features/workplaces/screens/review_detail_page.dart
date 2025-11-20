import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/workplace_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/workplace_review.dart';
import '../../../core/models/workplace.dart';
import 'add_review_page.dart';

class ReviewDetailPage extends StatefulWidget {
  final int workplaceId;
  final int reviewId;
  final String workplaceName;

  const ReviewDetailPage({
    super.key,
    required this.workplaceId,
    required this.reviewId,
    required this.workplaceName,
  });

  @override
  State<ReviewDetailPage> createState() => _ReviewDetailPageState();
}

class _ReviewDetailPageState extends State<ReviewDetailPage> {
  WorkplaceProvider? _workplaceProvider;
  bool _isInitialized = false;
  bool _isLoading = true;
  WorkplaceReview? _review;
  Workplace? _workplace;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInitialized) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final apiService = ApiService(authProvider: authProvider);
      _workplaceProvider = WorkplaceProvider(apiService: apiService);
      _isInitialized = true;
      _loadReview();
    }
  }

  Future<void> _loadReview() async {
    if (_workplaceProvider == null) return;
    setState(() => _isLoading = true);

    // Load both review and workplace data
    await Future.wait([
      _workplaceProvider!
          .fetchWorkplaceReviewById(widget.workplaceId, widget.reviewId)
          .then((review) => _review = review),
      _workplaceProvider!
          .fetchWorkplaceById(widget.workplaceId)
          .then((_) => _workplace = _workplaceProvider!.currentWorkplace),
    ]);

    setState(() => _isLoading = false);
  }

  Future<void> _deleteReview() async {
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

    if (confirm == true && _workplaceProvider != null && _review != null) {
      final success = await _workplaceProvider!.deleteReview(
        widget.workplaceId,
        _review!.id,
      );

      if (!mounted) return;

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Review deleted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true); // Return to previous screen
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

  Future<void> _showReportReviewDialog() async {
    if (_review == null) return;

    final descriptionController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    String? selectedReason;
    final reasons = ['Fake_Review', 'Spam', 'Offensive', 'Other'];

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
                                  return DropdownMenuItem(
                                    value: reason,
                                    child: Text(reason.replaceAll('_', ' ')),
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
      final success = await _workplaceProvider!.reportWorkplaceReview(
        workplaceId: widget.workplaceId,
        reviewId: _review!.id,
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

  Future<void> _showReplyDialog({String? existingReply}) async {
    if (_review == null) return;

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
        success = await _workplaceProvider!.updateReply(
          workplaceId: widget.workplaceId,
          reviewId: _review!.id,
          content: result,
        );
      } else {
        final reply = await _workplaceProvider!.replyToReview(
          workplaceId: widget.workplaceId,
          reviewId: _review!.id,
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
        _loadReview();
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

  Future<void> _deleteReplyConfirm() async {
    if (_review == null) return;

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
        reviewId: _review!.id,
      );

      if (!mounted) return;

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Reply deleted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        _loadReview();
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

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays < 1) {
      if (difference.inHours < 1) {
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

  Color _getRatingColor(int rating) {
    if (rating >= 4) return Colors.green;
    if (rating >= 3) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final currentUserId = authProvider.currentUser?.id;
    final isEmployer = _isUserEmployer(currentUserId);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Review Details'),
        actions: [
          if (_review != null) ...[
            if (currentUserId != null &&
                _review!.userId.toString() == currentUserId) ...[
              IconButton(
                icon: const Icon(Icons.edit),
                onPressed: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder:
                          (context) => AddReviewPage(
                            workplaceId: widget.workplaceId,
                            workplaceName: widget.workplaceName,
                            existingReview: _review,
                          ),
                    ),
                  );
                  if (result == true) {
                    _loadReview();
                  }
                },
                tooltip: 'Edit Review',
              ),
              IconButton(
                icon: const Icon(Icons.delete),
                onPressed: _deleteReview,
                tooltip: 'Delete Review',
              ),
            ],
            if (currentUserId == null ||
                _review!.userId.toString() != currentUserId)
              IconButton(
                icon: const Icon(Icons.flag_outlined),
                onPressed: _showReportReviewDialog,
                tooltip: 'Report Review',
              ),
          ],
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
                      onPressed: _loadReview,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
              : _review == null
              ? const Center(child: Text('Review not found'))
              : RefreshIndicator(
                onRefresh: _loadReview,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // User Info Card
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 30,
                                backgroundColor: Colors.blue.shade100,
                                child:
                                    _review!.anonymous
                                        ? const Icon(Icons.person, size: 30)
                                        : Text(
                                          _review!.username.isNotEmpty
                                              ? _review!.username[0]
                                                  .toUpperCase()
                                              : '?',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 24,
                                          ),
                                        ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _review!.anonymous
                                          ? 'Anonymous'
                                          : _review!.nameSurname.isNotEmpty
                                          ? _review!.nameSurname
                                          : _review!.username,
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    if (!_review!.anonymous &&
                                        _review!.nameSurname.isNotEmpty)
                                      Text(
                                        '@${_review!.username}',
                                        style: TextStyle(
                                          fontSize: 14,
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                    const SizedBox(height: 4),
                                    Text(
                                      _formatDate(_review!.createdAt),
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Overall Rating Card
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Overall Rating',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Icon(
                                    Icons.star,
                                    color: Colors.amber,
                                    size: 48,
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    _review!.overallRating.toStringAsFixed(1),
                                    style: const TextStyle(
                                      fontSize: 48,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const Text(
                                    ' / 5.0',
                                    style: TextStyle(
                                      fontSize: 24,
                                      color: Colors.grey,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Review Title and Content Card
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _review!.title,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                _review!.content,
                                style: const TextStyle(fontSize: 16),
                              ),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  Icon(
                                    Icons.thumb_up_outlined,
                                    size: 18,
                                    color: Colors.grey[600],
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${_review!.helpfulCount} people found this helpful',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Ethical Policy Ratings
                      if (_review!.ethicalPolicyRatings.isNotEmpty) ...[
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Ethical Policy Ratings',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                ..._review!.ethicalPolicyRatings.entries.map((
                                  entry,
                                ) {
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 16),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Text(
                                                entry.key.replaceAll('_', ' '),
                                                style: const TextStyle(
                                                  fontSize: 15,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                            ),
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 12,
                                                    vertical: 6,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: _getRatingColor(
                                                  entry.value,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                              ),
                                              child: Text(
                                                '${entry.value}/5',
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 14,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 8),
                                        LinearProgressIndicator(
                                          value: entry.value / 5.0,
                                          backgroundColor: Colors.grey[300],
                                          valueColor:
                                              AlwaysStoppedAnimation<Color>(
                                                _getRatingColor(entry.value),
                                              ),
                                          minHeight: 8,
                                        ),
                                      ],
                                    ),
                                  );
                                }),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Company Reply Section
                      if (_review!.reply != null) ...[
                        Card(
                          color: Colors.blue.shade50,
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.business,
                                      color: Colors.blue.shade700,
                                    ),
                                    const SizedBox(width: 8),
                                    const Expanded(
                                      child: Text(
                                        'Company Response',
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    if (isEmployer) ...[
                                      IconButton(
                                        icon: const Icon(Icons.edit, size: 20),
                                        onPressed:
                                            () => _showReplyDialog(
                                              existingReply:
                                                  _review!.reply!.content,
                                            ),
                                        tooltip: 'Edit Reply',
                                      ),
                                      IconButton(
                                        icon: const Icon(
                                          Icons.delete,
                                          size: 20,
                                          color: Colors.red,
                                        ),
                                        onPressed: _deleteReplyConfirm,
                                        tooltip: 'Delete Reply',
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  _formatDate(_review!.reply!.createdAt),
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[700],
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  _review!.reply!.content,
                                  style: const TextStyle(fontSize: 15),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ] else if (isEmployer) ...[
                        // Show reply button for employers if no reply exists
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => _showReplyDialog(),
                            icon: const Icon(Icons.reply),
                            label: const Text('Reply to Review'),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
    );
  }
}
