import 'package:flutter/material.dart';
import 'package:mobile/features/auth/screens/mentorship_selection_screen.dart';
import 'package:mobile/features/auth/screens/sign_up_screen.dart';
import 'package:mobile/features/auth/widgets/onboarding_progress_bar.dart';
import '../../../core/widgets/a11y.dart';

class CompanyPoliciesScreen extends StatefulWidget {
  const CompanyPoliciesScreen({super.key});

  @override
  State<CompanyPoliciesScreen> createState() => _CompanyPoliciesScreenState();
}

class _CompanyPoliciesScreenState extends State<CompanyPoliciesScreen> {
  final Set<String> selectedPolicies = {};

  final List<CompanyPolicy> policies = [
    CompanyPolicy(
      title: 'Fair wage commitment',
      description:
          'Ensuring competitive compensation and transparent pay practices',
    ),
    CompanyPolicy(
      title: 'Diversity & inclusion policy',
      description: 'Promoting an inclusive workplace with equal opportunities',
    ),
    CompanyPolicy(
      title: 'Employee well-being programs',
      description:
          'Supporting mental health, work-life balance, and personal growth',
    ),
    CompanyPolicy(
      title: 'Remote-friendly culture',
      description: 'Offering flexible work arrangements and remote options',
    ),
    CompanyPolicy(
      title: 'Sustainability/environmental goals',
      description:
          'Implementing eco-friendly practices and reducing environmental impact',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: 'Back',
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            const OnboardingProgressBar(currentStep: 2, totalSteps: 3),
            const SizedBox(height: 24),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Which ethical policies does your company follow?',
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
                        itemCount: policies.length,
                        separatorBuilder:
                            (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final policy = policies[index];
                          final isSelected = selectedPolicies.contains(
                            policy.title,
                          );

                          return InkWell(
                            onTap: () {
                              setState(() {
                                if (isSelected) {
                                  selectedPolicies.remove(policy.title);
                                } else {
                                  selectedPolicies.add(policy.title);
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
                                          policy.title,
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
                                          policy.description,
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: Colors.grey.shade600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (isSelected)
                                    const A11y(
                                      label: 'Selected',
                                      child: Icon(
                                        Icons.check_circle,
                                        color: Colors.blue,
                                      ),
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
                            selectedPolicies.isNotEmpty
                                ? () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder:
                                          (context) =>
                                              const MentorshipSelectionScreen(
                                                isJobSeeker: false,
                                              ),
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

class CompanyPolicy {
  final String title;
  final String description;

  const CompanyPolicy({required this.title, required this.description});
}
