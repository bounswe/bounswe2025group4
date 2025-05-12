import 'package:flutter/material.dart';
import 'package:mobile/features/auth/screens/sign_up_screen.dart';
import 'package:mobile/features/auth/widgets/onboarding_progress_bar.dart';
import 'package:mobile/core/models/user.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/models/user_type.dart';

class MentorshipSelectionScreen extends StatefulWidget {
  final bool isJobSeeker;

  const MentorshipSelectionScreen({super.key, required this.isJobSeeker});

  @override
  State<MentorshipSelectionScreen> createState() =>
      _MentorshipSelectionScreenState();
}

class _MentorshipSelectionScreenState extends State<MentorshipSelectionScreen> {
  String? selectedChoice;

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
                MaterialPageRoute(builder: (context) => const SignUpScreen()),
              );
            },
            child: const Text('Skip'),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            OnboardingProgressBar(
              currentStep: widget.isJobSeeker ? 4 : 3,
              totalSteps: widget.isJobSeeker ? 4 : 3,
            ),
            const SizedBox(height: 24),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Would you like to participate in our mentorship system?',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'You can connect with others to either receive or provide career guidance.',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                    const SizedBox(height: 32),
                    _buildMentorshipOption(
                      title: 'I want to be a mentor',
                      subtitle: 'Help others improve their resumes and careers',
                      icon: Icons.school,
                      value: 'mentor',
                    ),
                    const SizedBox(height: 16),
                    _buildMentorshipOption(
                      title: 'I\'m looking for a mentor (mentee)',
                      subtitle:
                          'Get feedback and guidance to grow professionally',
                      icon: Icons.person_outline,
                      value: 'mentee',
                    ),
                    const SizedBox(height: 16),
                    _buildMentorshipOption(
                      title: 'Not right now',
                      subtitle:
                          'You can always join later from your profile settings',
                      icon: Icons.close,
                      value: 'none',
                    ),
                    const Spacer(),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed:
                            selectedChoice != null
                                ? () {
                                  final authProvider =
                                      Provider.of<AuthProvider>(
                                        context,
                                        listen: false,
                                      );
                                  // If user explicitly wants to be a mentor, set the type
                                  if (selectedChoice == 'mentor') {
                                    authProvider.setOnboardingUserType(
                                      UserType.MENTOR,
                                    );
                                  }
                                  // Otherwise, keep the UserType set previously

                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder:
                                          (context) => const SignUpScreen(),
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

  Widget _buildMentorshipOption({
    required String title,
    required String subtitle,
    required IconData icon,
    required String value,
  }) {
    final isSelected = selectedChoice == value;

    return InkWell(
      onTap: () {
        setState(() {
          selectedChoice = value;
        });
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? Colors.blue : Colors.grey.shade300,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? Colors.blue : Colors.grey, size: 32),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.blue : Colors.black,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
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
