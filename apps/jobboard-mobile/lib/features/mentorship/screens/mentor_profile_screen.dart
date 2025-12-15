import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/models/mentor_profile.dart';
import 'package:mobile/core/models/mentor_review.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/core/providers/quote_provider.dart';
import 'package:mobile/features/mentorship/providers/mentor_provider.dart';
import '../../../generated/l10n/app_localizations.dart';
import 'package:mobile/core/models/full_profile.dart';
import 'package:mobile/core/models/profile.dart';

class MentorProfileScreen extends StatefulWidget {
  final String mentorId;          // userId of mentor
  final String mentorName;
  final int? resumeReviewId;      // optional, only needed for rating

  const MentorProfileScreen({
    super.key,
    required this.mentorId,
    required this.mentorName,
    this.resumeReviewId,
  });

  @override
  State<MentorProfileScreen> createState() => _MentorProfileScreenState();
}

class _MentorProfileScreenState extends State<MentorProfileScreen> {
  bool _isLoading = true;
  MentorProfile? _mentorProfile;
  FullProfile? _userProfile;
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
      final profile = await apiService.getMentorProfile(widget.mentorId);
      final userFuture = await apiService.getUserProfile(int.parse(widget.mentorId));

      setState(() {
        _mentorProfile = profile;
        _userProfile = userFuture;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage =
            AppLocalizations.of(context).mentorProfile_loadError(e.toString());
        _isLoading = false;
      });
    }
  }

  void _showRatingDialog() {
    if (widget.resumeReviewId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context)!.mentorProfile_ratingNotAvailable,
          ),
        ),
      );
      return;
    }

    int dialogRating = _selectedRating;

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text(
            AppLocalizations.of(context)!.mentorProfile_rateTitle(
              widget.mentorName,
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                AppLocalizations.of(context)!.mentorProfile_selectRating,
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  return IconButton(
                    icon: Icon(
                      index < dialogRating ? Icons.star : Icons.star_border,
                      color: Colors.amber,
                      size: 36,
                    ),
                    onPressed: () {
                      setDialogState(() {
                        dialogRating = index + 1;
                      });
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
                decoration: InputDecoration(
                  labelText: AppLocalizations.of(context)!
                      .mentorProfile_commentOptional,
                  border: const OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext);
                setState(() {
                  _selectedRating = 0;
                  _commentController.clear();
                });
              },
              child:
              Text(AppLocalizations.of(context)!.mentorScreen_cancel),
            ),
            ElevatedButton(
              onPressed: !_isSubmittingRating && dialogRating > 0
                  ? () {
                setState(() {
                  _selectedRating = dialogRating;
                });
                _submitRating();
              }
                  : null,
              child: Text(
                _isSubmittingRating
                    ? AppLocalizations.of(context)!.mentorProfile_submitting
                    : AppLocalizations.of(context)!.mentorProfile_submit,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submitRating() async {
    if (_selectedRating == 0 || widget.resumeReviewId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context)!.mentorProfile_selectRatingError,
          ),
        ),
      );
      return;
    }

    setState(() {
      _isSubmittingRating = true;
    });

    try {
      final comment = _commentController.text.trim();
      final mentorProvider = Provider.of<MentorProvider>(
        context,
        listen: false,
      );

      await mentorProvider.createMentorRating(
        resumeReviewId: widget.resumeReviewId!,
        rating: _selectedRating,
        comment: comment.isNotEmpty ? comment : null,
      );

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(context)!.mentorProfile_ratingSubmitted,
            ),
          ),
        );
        setState(() {
          _selectedRating = 0;
          _commentController.clear();
        });

        _loadMentorProfile();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(context)!.mentorProfile_ratingError(
                e.toString(),
              ),
            ),
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
    final canRate = widget.resumeReviewId != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          AppLocalizations.of(context)!.mentorProfile_title(widget.mentorName),
        ),
      ),
      body: _isLoading
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
              child: Text(
                AppLocalizations.of(context)!.common_retry,
              ),
            ),
          ],
        ),
      )
          : _buildProfileContent(),
      floatingActionButton:
      !_isLoading && _errorMessage == null && canRate
          ? FloatingActionButton(
        onPressed: _showRatingDialog,
        child: const Icon(Icons.star),
        tooltip: AppLocalizations.of(context)!
            .mentorProfile_rateMentor,
      )
          : null,
    );
  }

  Widget _buildProfileContent() {
    final profile = _mentorProfile;
    if (profile == null) {
      return Center(
        child: Text(
          AppLocalizations.of(context)!.mentorProfile_noProfileData,
        ),
      );
    }

    final reviews = profile.reviews;

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                CircleAvatar(
                  radius: 40,
                  child: Text(
                    profile.username.isNotEmpty
                        ? profile.username[0].toUpperCase()
                        : '?',
                    style: const TextStyle(fontSize: 30),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    profile.username,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Quote card
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

            if (_userProfile?.bio != null && _userProfile!.bio!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(
                  _userProfile!.bio!,
                  style: const TextStyle(fontSize: 16),
                ),
              ),

            const SizedBox(height: 16),

            if (_userProfile!.education.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                AppLocalizations.of(context)!.profileWidgets_education,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ..._userProfile!.education.map((edu) => Card(
                child: ListTile(
                  title: Text('${edu.school} - ${edu.degree}'),
                  subtitle: Text(
                    '${edu.field}\n${edu.startDate} - ${edu.endDate ?? "Present"}',
                  ),
                ),
              )),
            ],

            if (_userProfile!.experience.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                AppLocalizations.of(context)!.profileWidgets_workExperience,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ..._userProfile!.experience.map((exp) => Card(
                child: ListTile(
                  title: Text('${exp.company} - ${exp.position}'),
                  subtitle: Text(
                    '${exp.description}\n${exp.startDate} - ${exp.endDate ?? "Present"}',
                  ),
                ),
              )),
            ],

            if (_userProfile!.badges.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                AppLocalizations.of(context)!.badges_title,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            Wrap(
              spacing: 8,
              children: _userProfile!.badges.map((b) {
                return Chip(
                  label: Text(b.name),
                );
              }).toList(),
            ),
            ],

            const SizedBox(height: 16),

            if (_userProfile!.profile.skills.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                "Skills",
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _userProfile!.skills.map((skill) {
                  return Chip(
                    label: Text(skill),
                    backgroundColor: Colors.blue.shade50,
                  );
                }).toList(),
              ),
            ],

            if (_userProfile!.profile.interests.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                "Interests",
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _userProfile!.interests.map((interest) {
                  return Chip(
                    label: Text(interest),
                    backgroundColor: Colors.green.shade50,
                  );
                }).toList(),
              ),
            ],


            // Rating summary
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppLocalizations.of(context)!.mentorProfile_rating,
                      style: const TextStyle(
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
                              index < profile.averageRating.round()
                                  ? Icons.star
                                  : Icons.star_border,
                              color: Colors.amber,
                            );
                          }),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${profile.averageRating.toStringAsFixed(1)} '
                              '(${AppLocalizations.of(context)!.mentorProfile_reviews(profile.reviewCount)})',
                          style: const TextStyle(fontSize: 16),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Mentorship info
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppLocalizations.of(context)!.mentorProfile_mentorshipInfo,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _buildInfoRow(
                      AppLocalizations.of(context)!.mentorProfile_capacity,
                      AppLocalizations.of(context)!.mentorProfile_mentees(
                        profile.currentMentees,
                        profile.maxMentees,
                      ),
                    ),
                    if (profile.expertise.isNotEmpty)
                      _buildInfoRow(
                        AppLocalizations.of(context)!.mentorProfile_expertise,
                        profile.expertise.join(', '),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            _buildReviewsSection(reviews),
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
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewsSection(List<MentorReview> reviews) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              AppLocalizations.of(context)!.mentorProfile_rating,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            if (reviews.isEmpty)
              Text(
                AppLocalizations.of(context)!.mentorProfile_noReviews,
                style: const TextStyle(
                  fontSize: 16,
                  fontStyle: FontStyle.italic,
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: reviews.length,
                itemBuilder: (context, index) {
                  final review = reviews[index];
                  final formattedDate = DateFormat('MMM d, yyyy')
                      .format(review.createdAt);

                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment:
                          MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: List.generate(5, (i) {
                                return Icon(
                                  i < review.rating.round()
                                      ? Icons.star
                                      : Icons.star_border,
                                  color: Colors.amber,
                                  size: 20,
                                );
                              }),
                            ),
                            Text(
                              AppLocalizations.of(context)!
                                  .mentorProfile_byUser(
                                review.reviewerUsername,
                              ),
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                        if (review.comment != null &&
                            review.comment!.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 4.0),
                            child: Text(
                              review.comment!,
                              style: const TextStyle(fontSize: 14),
                            ),
                          ),
                        Padding(
                          padding: const EdgeInsets.only(top: 4.0),
                          child: Text(
                            formattedDate,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
                separatorBuilder: (context, index) => const Divider(),
              ),
          ],
        ),
      ),
    );
  }
}
