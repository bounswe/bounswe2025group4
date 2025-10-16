import 'package:flutter/material.dart';
import 'package:mobile/features/auth/screens/job_priorities_screen.dart';
import 'package:mobile/features/auth/widgets/onboarding_progress_bar.dart';
import 'package:mobile/generated/l10n/app_localizations.dart';

class CareerStatusScreen extends StatefulWidget {
  const CareerStatusScreen({super.key});

  @override
  State<CareerStatusScreen> createState() => _CareerStatusScreenState();
}

class _CareerStatusScreenState extends State<CareerStatusScreen> {
  String? selectedStatus;

  List<String> _getCareerStatuses(BuildContext context) {
    return [
      AppLocalizations.of(context)!.careerStatusScreen_student,
      AppLocalizations.of(context)!.careerStatusScreen_recentGraduate,
      AppLocalizations.of(context)!.careerStatusScreen_midLevel,
      AppLocalizations.of(context)!.careerStatusScreen_senior,
      AppLocalizations.of(context)!.careerStatusScreen_changingCareers,
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: AppLocalizations.of(context)!.common_back,
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            const OnboardingProgressBar(currentStep: 1, totalSteps: 4),
            const SizedBox(height: 24),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppLocalizations.of(context)!.careerStatusScreen_question,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 32),
                    Expanded(
                      child: ListView.separated(
                        itemCount: _getCareerStatuses(context).length,
                        separatorBuilder:
                            (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final status = _getCareerStatuses(context)[index];
                          return InkWell(
                            onTap: () {
                              setState(() {
                                selectedStatus = status;
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color:
                                      selectedStatus == status
                                          ? Colors.blue
                                          : Colors.grey.shade300,
                                ),
                                borderRadius: BorderRadius.circular(8),
                                color:
                                    selectedStatus == status
                                        ? Colors.blue.withOpacity(0.1)
                                        : null,
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      status,
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight:
                                            selectedStatus == status
                                                ? FontWeight.bold
                                                : FontWeight.normal,
                                      ),
                                    ),
                                  ),
                                  if (selectedStatus == status)
                                    const Icon(
                                      Icons.check_circle,
                                      color: Colors.blue,
                                    ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed:
                            selectedStatus != null
                                ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder:
                                          (context) =>
                                              const JobPrioritiesScreen(),
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
          ],
        ),
      ),
    );
  }
}
