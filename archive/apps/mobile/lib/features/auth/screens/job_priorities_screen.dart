import 'package:flutter/material.dart';
import 'package:mobile/features/auth/screens/industry_selection_screen.dart';
import 'package:mobile/features/auth/widgets/onboarding_progress_bar.dart';

class JobPrioritiesScreen extends StatefulWidget {
  const JobPrioritiesScreen({super.key});

  @override
  State<JobPrioritiesScreen> createState() => _JobPrioritiesScreenState();
}

class _JobPrioritiesScreenState extends State<JobPrioritiesScreen> {
  final Set<String> selectedPriorities = {};

  final List<JobPriority> priorities = [
    JobPriority(
      title: 'Fair Wages',
      description:
          'Companies that pay living wages and maintain transparent compensation practices',
    ),
    JobPriority(
      title: 'Inclusive Workplace',
      description:
          'Organizations committed to diversity, equity, and inclusion',
    ),
    JobPriority(
      title: 'Sustainability/Environmental Policies',
      description:
          'Companies with strong environmental commitments and practices',
    ),
    JobPriority(
      title: 'Work-Life Balance',
      description:
          'Respectful of personal time with flexible scheduling options',
    ),
    JobPriority(
      title: 'Remote-Friendly',
      description: 'Options for remote work and flexible location',
    ),
    JobPriority(
      title: 'Career Growth Opportunities',
      description: 'Clear paths for advancement and professional development',
    ),
  ];

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
                    const Text(
                      'What are your top priorities when looking for a job?',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Select all that apply',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                    const SizedBox(height: 24),
                    Expanded(
                      child: ListView.separated(
                        itemCount: priorities.length,
                        separatorBuilder:
                            (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final priority = priorities[index];
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
                        child: const Text(
                          'Continue',
                          style: TextStyle(color: Colors.white, fontSize: 16),
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
