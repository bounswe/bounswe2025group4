import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/models/mentor_profile.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/core/providers/quote_provider.dart';
import '../providers/mentor_provider.dart';

class MentorProfileScreen extends StatefulWidget {
  final int mentorId;
  final String userId;
  final String mentorName;

  const MentorProfileScreen({
    super.key,
    required this.mentorId,
    required this.userId,
    required this.mentorName,
  });

  @override
  State<MentorProfileScreen> createState() => _MentorProfileScreenState();
}

class _MentorProfileScreenState extends State<MentorProfileScreen> {
  bool _isLoading = true;
  MentorProfile? _mentorProfile;
  String? _errorMessage;
  bool _isSubmittingRating = false;
  int _selectedRating = 0;
  final TextEditingController _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadMentorProfile();
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _loadMentorProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final apiService = Provider.of<ApiService>(context, listen: false);
      final profile = await apiService.getMentorProfile(
        int.parse(widget.userId),
      );

      setState(() {
        _mentorProfile = profile;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load mentor profile';
        _isLoading = false;
      });
    }
  }

  void _showRatingDialog() {
    // Track selected rating within dialog
    int dialogRating = _selectedRating;

    showDialog(
      context: context,
      builder:
          (dialogContext) => StatefulBuilder(
            builder:
                (context, setDialogState) => AlertDialog(
                  title: Text('Rate ${widget.mentorName}'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('Select a rating:'),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(5, (index) {
                          return IconButton(
                            icon: Icon(
                              index < dialogRating
                                  ? Icons.star
                                  : Icons.star_border,
                              color: Colors.amber,
                              size: 36,
                            ),
                            onPressed: () {
                              // Use setDialogState instead of setState
                              setDialogState(() {
                                dialogRating = index + 1;
                                print('Selected rating: $dialogRating');
                              });
                              // Update parent state too
                              setState(() {
                                _selectedRating = dialogRating;
                              });
                            },
                          );
                        }),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _commentController,
                        decoration: const InputDecoration(
                          labelText: 'Comment (optional)',
                          border: OutlineInputBorder(),
                        ),
                        maxLines: 3,
                      ),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () {
                        Navigator.pop(context);
                        setState(() {
                          _selectedRating = 0;
                          _commentController.clear();
                        });
                      },
                      child: const Text('Cancel'),
                    ),
                    ElevatedButton(
                      onPressed:
                          dialogRating > 0
                              ? () {
                                setState(() {
                                  _selectedRating = dialogRating;
                                });
                                _submitRating();
                              }
                              : null,
                      child: Text(
                        _isSubmittingRating ? 'Submitting...' : 'Submit',
                      ),
                    ),
                  ],
                ),
          ),
    );
  }

  Future<void> _submitRating() async {
    if (_selectedRating == 0) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please select a rating')));
      return;
    }

    setState(() {
      _isSubmittingRating = true;
    });

    try {
      final comment = _commentController.text.trim();
      final apiService = Provider.of<ApiService>(context, listen: false);

      await apiService.createMentorReview(
        userId: widget.userId,
        rating: _selectedRating,
        comment: comment.isNotEmpty ? comment : null,
      );

      if (mounted) {
        Navigator.pop(context); // Close dialog
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Rating submitted successfully')),
        );
        setState(() {
          _selectedRating = 0;
          _commentController.clear();
        });

        // Reload mentor profile to show updated rating
        _loadMentorProfile();
      }
    } catch (e) {
      print('Error submitting rating: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error submitting rating: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmittingRating = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Mentor Profile: ${widget.mentorName}')),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _errorMessage != null
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(_errorMessage!),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadMentorProfile,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
              : _buildProfileContent(),
      floatingActionButton:
          !_isLoading && _errorMessage == null
              ? FloatingActionButton(
                onPressed: _showRatingDialog,
                child: const Icon(Icons.star),
                tooltip: 'Rate this mentor',
              )
              : null,
    );
  }

  Widget _buildProfileContent() {
    if (_mentorProfile == null) {
      return const Center(child: Text('No profile data available'));
    }

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Header
            Row(
              children: [
                CircleAvatar(
                  radius: 40,
                  child: Text(
                    _mentorProfile!.user.username[0].toUpperCase(),
                    style: const TextStyle(fontSize: 30),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _mentorProfile!.user.username,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (_mentorProfile!.user.jobTitle != null)
                        Text(
                          _mentorProfile!.user.jobTitle!,
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                          ),
                        ),
                      if (_mentorProfile!.user.company != null)
                        Text(
                          'at ${_mentorProfile!.user.company!}',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Quote Card
            Consumer<QuoteProvider>(
              builder: (context, quoteProvider, child) {
                if (quoteProvider.hasQuote) {
                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '"${quoteProvider.quote!.text}"',
                            style: const TextStyle(
                              fontSize: 16,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Align(
                            alignment: Alignment.centerRight,
                            child: Text(
                              '- ${quoteProvider.quote!.author}',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
            const SizedBox(height: 16),

            // Rating Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Rating',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Row(
                          children: List.generate(5, (index) {
                            return Icon(
                              index < _mentorProfile!.averageRating
                                  ? Icons.star
                                  : Icons.star_border,
                              color: Colors.amber,
                            );
                          }),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${_mentorProfile!.averageRating.toStringAsFixed(1)} (${_mentorProfile!.reviewCount} reviews)',
                          style: const TextStyle(fontSize: 16),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Mentorship Info
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Mentorship Information',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _buildInfoRow(
                      'Capacity',
                      '${_mentorProfile!.currentMenteeCount}/${_mentorProfile!.capacity} mentees',
                    ),
                    _buildInfoRow(
                      'Status',
                      _mentorProfile!.isAvailable
                          ? 'Available for mentorship'
                          : 'Not available for mentorship',
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Bio Section
            if (_mentorProfile!.user.bio != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'About',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _mentorProfile!.user.bio!,
                        style: const TextStyle(fontSize: 16),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Text(
            '$label: ',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          Text(value, style: const TextStyle(fontSize: 16)),
        ],
      ),
    );
  }
}
