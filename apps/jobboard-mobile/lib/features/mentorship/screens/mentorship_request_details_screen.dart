import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/models/mentorship_request.dart';
import 'package:mobile/features/mentorship/providers/mentor_provider.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/models/user.dart';
import 'package:mobile/core/models/full_profile.dart';
import 'package:mobile/core/models/experience.dart';
import 'package:mobile/core/models/education.dart';

import '../../../generated/l10n/app_localizations.dart';

class MentorshipRequestDetailsScreen extends StatefulWidget {
  final String requestId;
  const MentorshipRequestDetailsScreen({super.key, required this.requestId});

  @override
  State<MentorshipRequestDetailsScreen> createState() =>
      _MentorshipRequestDetailsScreenState();
}

class _MentorshipRequestDetailsScreenState
    extends State<MentorshipRequestDetailsScreen> {

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final mentorProvider =
      Provider.of<MentorProvider>(context, listen: false);

      await mentorProvider.fetchMentorshipRequest(widget.requestId);

      final req = mentorProvider.currentRequest;
      if (req?.requesterId != null) {
        await mentorProvider.getUserProfile(
          int.parse(req!.requesterId!),
        );
      }
    });
  }

  void _rejectWithMessage() {
    final controller = TextEditingController();

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(AppLocalizations.of(context)!.mentorScreen_requestRejected),
        content: TextField(
          controller: controller,
          maxLines: 3,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            hintText: "Optional response message",
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(AppLocalizations.of(context)!.mentorScreen_cancel),
          ),
          TextButton(
            onPressed: () async {
              final mentorProvider =
              Provider.of<MentorProvider>(context, listen: false);
              final req = mentorProvider.currentRequest!;

              await mentorProvider.respondToRequest(
                requestId: req.id,
                accept: false,
                responseMessage: controller.text.trim(),
              );

              Navigator.pop(context);
              Navigator.pop(context);

              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(AppLocalizations.of(context)!
                      .mentorScreen_requestRejected),
                ),
              );
            },
            child: Text('Reject'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<MentorProvider>(
      builder: (context, mentorProvider, _) {
        if (mentorProvider.isLoadingProfile ||
            mentorProvider.currentRequest == null ||
            mentorProvider.otherProfile == null) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        if (mentorProvider.error != null) {
          return Scaffold(
            body: Center(
              child: Text("Error: ${mentorProvider.error}"),
            ),
          );
        }

        final req = mentorProvider.currentRequest!;
        final mentee = mentorProvider.otherProfile!;

        return Scaffold(
          appBar: AppBar(title: const Text("Request Details")),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              ClipOval(
                child: SizedBox(
                  width: 80,
                  height: 80,
                  child: mentee.profilePicture != null
                      ? Image.network(
                    mentee.profilePicture!,
                    fit: BoxFit.contain,
                  )
                      : Container(
                    color: Colors.grey.shade300,
                    child: Center(
                      child: Text(
                        mentee.fullName.isNotEmpty
                            ? mentee.fullName[0].toUpperCase()
                            : "?",
                        style: const TextStyle(fontSize: 32),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Center(
                child: Text(
                  mentee.fullName,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              if (mentee.bio != null && mentee.bio!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  mentee.bio!,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],


              const Divider(height: 32),

              _chipSection("Skills", mentee.skills),
              _chipSection("Interests", mentee.interests),

              _experienceSection(mentee.experience),
              _educationSection(mentee.education),

              const Divider(height: 32),

              Text(
                "Motivation",
                style: Theme.of(context).textTheme.titleMedium!.copyWith(fontWeight: FontWeight.bold),
              ),

              const SizedBox(height: 8),

              Text( req.motivation ?? "No motivation provided.", style: const TextStyle(fontSize: 16),
              ),

              const Divider(height: 32),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _rejectWithMessage,
                      child: const Text("Reject"),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () async {
                        await mentorProvider.respondToRequest(
                          requestId: req.id,
                          accept: true,
                          responseMessage: null,
                        );

                        if (mounted) Navigator.pop(context);

                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              AppLocalizations.of(context)!
                                  .mentorScreen_requestAccepted,
                            ),
                          ),
                        );
                      },
                      child: const Text("Accept"),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _chipSection(String title, List<String> items) {
    if (items.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 4,
          children: items
              .map((item) => Chip(label: Text(item)))
              .toList(),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _experienceSection(List<Experience> experiences) {
    if (experiences.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Experience",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        ...experiences.map(
              (e) => Card(
            child: ListTile(
              title: Text(e.position ?? ''),
              subtitle: Text(
                [
                  e.company,
                  e.description,
                ].where((s) => s != null && s!.isNotEmpty).join("\n"),
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _educationSection(List<Education> education) {
    if (education.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Education",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        ...education.map(
              (e) => Card(
            child: ListTile(
              title: Text(e.school ?? ''),
              subtitle: Text(e.degree ?? ''),
            ),
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }



}
