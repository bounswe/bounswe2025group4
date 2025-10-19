import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile/features/auth/screens/career_status_screen.dart';
import 'package:mobile/features/auth/screens/organization_type_screen.dart';
import 'package:mobile/features/auth/widgets/onboarding_progress_bar.dart';
import 'package:mobile/generated/l10n/app_localizations.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/models/user_type.dart';

class UserTypeScreen extends StatefulWidget {
  const UserTypeScreen({super.key});

  @override
  State<UserTypeScreen> createState() => _UserTypeScreenState();
}

class _UserTypeScreenState extends State<UserTypeScreen> {
  String? selectedType;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: AppLocalizations.of(context)!.common_back,
          onPressed: () {
            HapticFeedback.lightImpact();
            Navigator.pop(context);
          },
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const OnboardingProgressBar(currentStep: 1, totalSteps: 5),
              const SizedBox(height: 24),
              Text(
                AppLocalizations.of(context)!.userTypeScreen_question,
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 32),
              _buildUserTypeCard(
                context: context,
                title: AppLocalizations.of(context)!.userTypeScreen_jobSeeker,
                description: AppLocalizations.of(context)!.userTypeScreen_jobSeekerDesc,
                icon: Icons.person_outline,
                onTap: () {
                  HapticFeedback.selectionClick();
                  setState(() {
                    selectedType = 'Job Seeker';
                  });
                },
                isSelected: selectedType == 'Job Seeker',
              ),
              const SizedBox(height: 16),
              _buildUserTypeCard(
                context: context,
                title: AppLocalizations.of(context)!.userTypeScreen_employer,
                description: AppLocalizations.of(context)!.userTypeScreen_employerDesc,
                icon: Icons.business_outlined,
                onTap: () {
                  HapticFeedback.selectionClick();
                  setState(() {
                    selectedType = 'Employer';
                  });
                },
                isSelected: selectedType == 'Employer',
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed:
                      selectedType != null
                          ? () {
                            HapticFeedback.mediumImpact();
                            final authProvider = Provider.of<AuthProvider>(
                              context,
                              listen: false,
                            );
                            final type =
                                selectedType == 'Job Seeker'
                                    ? UserType.JOB_SEEKER
                                    : UserType.EMPLOYER;
                            authProvider.setOnboardingUserType(type);

                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder:
                                    (context) =>
                                        selectedType == 'Job Seeker'
                                            ? const CareerStatusScreen()
                                            : const OrganizationTypeScreen(),
                              ),
                            );
                          }
                          : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    AppLocalizations.of(context)!.userTypeScreen_continue,
                    style: const TextStyle(color: Colors.white, fontSize: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUserTypeCard({
    required BuildContext context,
    required String title,
    required String description,
    required IconData icon,
    required VoidCallback onTap,
    required bool isSelected,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? Colors.blue : Colors.grey.shade300,
          ),
          borderRadius: BorderRadius.circular(8),
          color: isSelected ? Colors.blue.withOpacity(0.1) : null,
        ),
        child: Row(
          children: [
            Icon(icon, size: 32, color: isSelected ? Colors.blue : Colors.grey),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight:
                          isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? Colors.blue : Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
            if (isSelected) const Icon(Icons.check_circle, color: Colors.blue),
          ],
        ),
      ),
    );
  }
}
