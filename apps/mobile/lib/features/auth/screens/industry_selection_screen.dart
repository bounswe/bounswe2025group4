import 'package:flutter/material.dart';
import 'package:mobile/features/auth/screens/sign_up_screen.dart';
import 'package:mobile/features/auth/widgets/onboarding_progress_bar.dart';

class IndustrySelectionScreen extends StatefulWidget {
  const IndustrySelectionScreen({super.key});

  @override
  State<IndustrySelectionScreen> createState() => _IndustrySelectionScreenState();
}

class _IndustrySelectionScreenState extends State<IndustrySelectionScreen> {
  final Set<String> selectedIndustries = {};
  final TextEditingController _otherController = TextEditingController();
  bool showOtherField = false;

  final List<String> industries = [
    'Tech',
    'Healthcare',
    'Education',
    'Finance',
    'Creative Arts',
    'Other',
  ];

  @override
  void dispose() {
    _otherController.dispose();
    super.dispose();
  }

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
                  builder: (context) => const SignUpScreen(),
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
              currentStep: 3,
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
                      'Which industries are you most interested in?',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Select all that apply',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Expanded(
                      child: ListView.separated(
                        itemCount: industries.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final industry = industries[index];
                          final isSelected = selectedIndustries.contains(industry);
                          final isOther = industry == 'Other';
                          
                          return Column(
                            children: [
                              InkWell(
                                onTap: () {
                                  setState(() {
                                    if (isSelected) {
                                      selectedIndustries.remove(industry);
                                      if (isOther) {
                                        showOtherField = false;
                                        _otherController.clear();
                                      }
                                    } else {
                                      selectedIndustries.add(industry);
                                      if (isOther) {
                                        showOtherField = true;
                                      }
                                    }
                                  });
                                },
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
                                      Expanded(
                                        child: Text(
                                          industry,
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: isSelected
                                                ? FontWeight.bold
                                                : FontWeight.normal,
                                          ),
                                        ),
                                      ),
                                      if (isSelected)
                                        const Icon(Icons.check_circle, color: Colors.blue),
                                    ],
                                  ),
                                ),
                              ),
                              if (isOther && showOtherField)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8.0),
                                  child: TextField(
                                    controller: _otherController,
                                    decoration: const InputDecoration(
                                      hintText: 'Please specify',
                                      border: OutlineInputBorder(),
                                      contentPadding: EdgeInsets.symmetric(
                                        horizontal: 16,
                                        vertical: 12,
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: selectedIndustries.isNotEmpty &&
                                (!showOtherField || _otherController.text.isNotEmpty)
                            ? () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => const SignUpScreen(),
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