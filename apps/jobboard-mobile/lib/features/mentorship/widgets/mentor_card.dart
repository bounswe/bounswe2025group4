import 'package:flutter/material.dart';
import '../../../core/widgets/a11y.dart';
import '../../../generated/l10n/app_localizations.dart';

class MentorCard extends StatelessWidget {
  final String mentorId;
  final String name;
  final String role;
  final String? company;
  final int maxMenteeCount;
  final int currentMenteeCount;
  final double averageRating;
  final VoidCallback onTap;
  final VoidCallback onRequestTap;

  const MentorCard({
    super.key,
    required this.mentorId,
    required this.name,
    required this.role,
    this.company,
    required this.maxMenteeCount,
    required this.currentMenteeCount,
    required this.averageRating,
    required this.onTap,
    required this.onRequestTap,
  });

  @override
  Widget build(BuildContext context) {
    final bool isFull = currentMenteeCount >= maxMenteeCount;
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6.0, horizontal: 12.0),
      elevation: 2.0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12.0),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              A11y(
                label: AppLocalizations.of(context)!.mentorScreen_openChat(name),
                child: CircleAvatar(
                  radius: 28,
                  backgroundColor: theme.colorScheme.primaryContainer,
                  child: Text(
                    name.isNotEmpty ? name[0] : '?',
                    style: textTheme.headlineSmall?.copyWith(
                      color: theme.colorScheme.onPrimaryContainer,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      role + (company != null ? ' @ $company' : ''),
                      style: textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.secondary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        A11y(label: AppLocalizations.of(context)!.mentorScreen_currentMentees, child: const Icon(Icons.people_outline, size: 16)),
                        const SizedBox(width: 4),
                        Text(
                          '$currentMenteeCount / $maxMenteeCount mentees',
                          style: textTheme.bodySmall,
                        ),
                        const Spacer(),
                        A11y(label: AppLocalizations.of(context)!.mentorProfile_rating, child: Icon(Icons.star_border, size: 16, color: Colors.amber.shade700)),
                        const SizedBox(width: 4),
                        Text(
                          averageRating.toStringAsFixed(1),
                          style: textTheme.bodySmall?.copyWith(
                            color: Colors.amber.shade800,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerRight,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          textStyle: textTheme.labelMedium,
                          backgroundColor:
                              isFull
                                  ? Colors.grey.shade300
                                  : theme.colorScheme.primary,
                          foregroundColor:
                              isFull
                                  ? Colors.grey.shade600
                                  : theme.colorScheme.onPrimary,
                        ),
                        onPressed: isFull ? null : onRequestTap,
                        child: Text(isFull
                            ? AppLocalizations.of(context)!.mentorProfile_notAvailable
                            : AppLocalizations.of(context)!.menteeScreen_sendRequest),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
