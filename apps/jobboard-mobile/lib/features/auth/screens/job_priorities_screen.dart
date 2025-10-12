import 'package:flutter/material.dart';
import 'package:mobile/features/auth/screens/industry_selection_screen.dart';
import 'package:mobile/features/auth/widgets/onboarding_progress_bar.dart';
import 'package:mobile/generated/l10n/app_localizations.dart';

class JobPrioritiesScreen extends StatefulWidget {
  const JobPrioritiesScreen({super.key});

  @override
  State<JobPrioritiesScreen> createState() => _JobPrioritiesScreenState();
}

class _JobPrioritiesScreenState extends State<JobPrioritiesScreen> {
  final Set<String> selectedPriorities = {};

  List<JobPriority> _getJobPriorities(BuildContext context) {
    return [
      JobPriority(
        title: AppLocalizations.of(context)!.jobPrioritiesScreen_fairWages,
        description: AppLocalizations.of(context)!.jobPrioritiesScreen_fairWagesDesc,
      ),
      JobPriority(
        title: AppLocalizations.of(context)!.jobPrioritiesScreen_inclusive,
        description: AppLocalizations.of(context)!.jobPrioritiesScreen_inclusiveDesc,
      ),
      JobPriority(
        title: AppLocalizations.of(context)!.jobPrioritiesScreen_sustainability,
        description: AppLocalizations.of(context)!.jobPrioritiesScreen_sustainabilityDesc,
      ),
      JobPriority(
        title: AppLocalizations.of(context)!.jobPrioritiesScreen_workLife,
        description: AppLocalizations.of(context)!.jobPrioritiesScreen_workLifeDesc,
      ),
      JobPriority(
        title: AppLocalizations.of(context)!.jobPrioritiesScreen_remote,
        description: AppLocalizations.of(context)!.jobPrioritiesScreen_remoteDesc,
      ),
      JobPriority(
        title: AppLocalizations.of(context)!.jobPrioritiesScreen_growth,
        description: AppLocalizations.of(context)!.jobPrioritiesScreen_growthDesc,
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            const OnboardingProgressBar(currentStep: 2, totalSteps: 4),
            const SizedBox(height: 24),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppLocalizations.of(context)!.jobPrioritiesScreen_question,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      AppLocalizations.of(context)!.jobPrioritiesScreen_selectAll,
                      style: const TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                    const SizedBox(height: 24),
                    Expanded(
                      child: ListView.separated(
                        itemCount: _getJobPriorities(context).length,
                        separatorBuilder:
                            (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final priority = _getJobPriorities(context)[index];
                          final isSelected = selectedPriorities.contains(
                            priority.title,
                          );

                          return InkWell(
                            onTap: () {
                              setState(() {
                                if (isSelected) {
                                  selectedPriorities.remove(priority.title);
                                } else {
                                  selectedPriorities.add(priority.title);
                                }
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color:
                                      isSelected
                                          ? Colors.blue
                                          : Colors.grey.shade300,
                                ),
                                borderRadius: BorderRadius.circular(8),
                                color:
                                    isSelected
                                        ? Colors.blue.withOpacity(0.1)
                                        : null,
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          priority.title,
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight:
                                                isSelected
                                                    ? FontWeight.bold
                                                    : FontWeight.normal,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          priority.description,
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: Colors.grey.shade600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (isSelected)
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
                            selectedPriorities.isNotEmpty
                                ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder:
                                          (context) =>
                                              const IndustrySelectionScreen(),
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

class JobPriority {
  final String title;
  final String description;

  const JobPriority({required this.title, required this.description});
}
