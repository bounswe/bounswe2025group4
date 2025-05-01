import 'package:flutter/material.dart';
import 'package:mobile/features/auth/screens/job_priorities_screen.dart';
import 'package:mobile/features/auth/widgets/onboarding_progress_bar.dart';

class CareerStatusScreen extends StatefulWidget {
  const CareerStatusScreen({super.key});

  @override
  State<CareerStatusScreen> createState() => _CareerStatusScreenState();
}

class _CareerStatusScreenState extends State<CareerStatusScreen> {
  String? selectedStatus;

  final List<String> careerStatuses = [
    'Student',
    'Recent Graduate',
    'Mid-Level Professional',
    'Senior Professional',
    'Changing Careers',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const JobPrioritiesScreen(),
                ),
              );
            },
            child: const Text('Skip'),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            const OnboardingProgressBar(
              currentStep: 1,
              totalSteps: 3,
            ),
            const SizedBox(height: 24),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'What is your current career status?',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 32),
                    Expanded(
                      child: ListView.separated(
                        itemCount: careerStatuses.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final status = careerStatuses[index];
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
                                  color: selectedStatus == status
                                      ? Colors.blue
                                      : Colors.grey.shade300,
                                ),
                                borderRadius: BorderRadius.circular(8),
                                color: selectedStatus == status
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
                                        fontWeight: selectedStatus == status
                                            ? FontWeight.bold
                                            : FontWeight.normal,
                                      ),
                                    ),
                                  ),
                                  if (selectedStatus == status)
                                    const Icon(Icons.check_circle, color: Colors.blue),
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
                        onPressed: selectedStatus != null
                            ? () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => const JobPrioritiesScreen(),
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
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                          ),
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