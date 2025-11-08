import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/workplace_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/workplace_review.dart';
import '../../../core/models/workplace.dart';

class AddReviewPage extends StatefulWidget {
  final int workplaceId;
  final String workplaceName;
  final WorkplaceReview? existingReview;

  const AddReviewPage({
    super.key,
    required this.workplaceId,
    required this.workplaceName,
    this.existingReview,
  });

  @override
  State<AddReviewPage> createState() => _AddReviewPageState();
}

class _AddReviewPageState extends State<AddReviewPage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  late WorkplaceProvider _workplaceProvider;
  bool _isSubmitting = false;
  bool _anonymous = false;
  bool _isLoading = true;
  Workplace? _workplace;

  // Ethical policy ratings (1-5)
  final Map<String, int> _policyRatings = {};

  // Workplace's ethical policies (loaded from API)
  List<String> _ethicalPolicies = [];

  @override
  void initState() {
    super.initState();
    if (widget.existingReview != null) {
      _titleController.text = widget.existingReview!.title;
      _contentController.text = widget.existingReview!.content;
      _anonymous = widget.existingReview!.anonymous;
      _policyRatings.addAll(widget.existingReview!.ethicalPolicyRatings);
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final apiService = ApiService(authProvider: authProvider);
    _workplaceProvider = WorkplaceProvider(apiService: apiService);
    _loadWorkplaceData();
  }

  Future<void> _loadWorkplaceData() async {
    try {
      await _workplaceProvider.fetchWorkplaceById(widget.workplaceId);
      setState(() {
        _workplace = _workplaceProvider.currentWorkplace;
        _ethicalPolicies = _workplace?.ethicalTags ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load workplace data: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _submitReview() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_policyRatings.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please rate at least one ethical policy'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      if (widget.existingReview != null) {
        // Update existing review
        final success = await _workplaceProvider.updateReview(
          workplaceId: widget.workplaceId,
          reviewId: widget.existingReview!.id,
          title: _titleController.text.trim(),
          content: _contentController.text.trim(),
          anonymous: _anonymous,
          ethicalPolicyRatings: _policyRatings,
        );

        if (!mounted) return;

        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Review updated successfully!'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.pop(context, true);
        } else {
          throw Exception(
            _workplaceProvider.error ?? 'Failed to update review',
          );
        }
      } else {
        // Create new review
        final review = await _workplaceProvider.createReview(
          workplaceId: widget.workplaceId,
          title: _titleController.text.trim(),
          content: _contentController.text.trim(),
          ethicalPolicyRatings: _policyRatings,
          anonymous: _anonymous,
        );

        if (!mounted) return;

        if (review != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Review submitted successfully!'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.pop(context, true);
        } else {
          throw Exception(
            _workplaceProvider.error ?? 'Failed to create review',
          );
        }
      }
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.existingReview != null ? 'Edit Review' : 'Add Review',
        ),
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _ethicalPolicies.isEmpty
              ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.warning_amber_rounded,
                        size: 64,
                        color: Colors.orange,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'No Ethical Policies',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'This workplace has not set any ethical policies yet. You cannot review it at this time.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Go Back'),
                      ),
                    ],
                  ),
                ),
              )
              : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Workplace name
                      Card(
                        color: Colors.blue.shade50,
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              const Icon(Icons.business, color: Colors.blue),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  widget.workplaceName,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Title
                      const Text(
                        'Review Title',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _titleController,
                        decoration: const InputDecoration(
                          hintText: 'Summarize your experience',
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Please enter a title';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Content
                      const Text(
                        'Your Review',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _contentController,
                        maxLines: 6,
                        maxLength: 1000,
                        decoration: const InputDecoration(
                          hintText: 'Share your experience working here...',
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Please enter your review';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Anonymous toggle
                      SwitchListTile(
                        title: const Text('Post anonymously'),
                        subtitle: const Text('Your name will not be shown'),
                        value: _anonymous,
                        onChanged: (value) {
                          setState(() => _anonymous = value);
                        },
                      ),
                      const SizedBox(height: 24),

                      // Ethical Policy Ratings
                      const Text(
                        'Rate Ethical Policies (1-5)',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Rate the policies that apply to this workplace',
                        style: TextStyle(color: Colors.grey),
                      ),
                      const SizedBox(height: 16),

                      ..._ethicalPolicies.map((policy) {
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  policy.replaceAll('_', ' ').toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceEvenly,
                                  children: List.generate(5, (index) {
                                    final rating = index + 1;
                                    final isSelected =
                                        _policyRatings[policy] == rating;
                                    return InkWell(
                                      onTap: () {
                                        setState(() {
                                          if (isSelected) {
                                            _policyRatings.remove(policy);
                                          } else {
                                            _policyRatings[policy] = rating;
                                          }
                                        });
                                      },
                                      child: Container(
                                        width: 50,
                                        height: 50,
                                        decoration: BoxDecoration(
                                          color:
                                              isSelected
                                                  ? Colors.blue
                                                  : Colors.grey.shade200,
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        child: Center(
                                          child: Text(
                                            '$rating',
                                            style: TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                              color:
                                                  isSelected
                                                      ? Colors.white
                                                      : Colors.black,
                                            ),
                                          ),
                                        ),
                                      ),
                                    );
                                  }),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),

                      const SizedBox(height: 24),

                      // Submit button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isSubmitting ? null : _submitReview,
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                          ),
                          child:
                              _isSubmitting
                                  ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white,
                                      ),
                                    ),
                                  )
                                  : Text(
                                    widget.existingReview != null
                                        ? 'Update Review'
                                        : 'Submit Review',
                                    style: const TextStyle(fontSize: 16),
                                  ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
    );
  }
}
