import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/user.dart'; // Adjust path
import '../../../core/providers/auth_provider.dart'; // Adjust path
import '../../auth/screens/mentorship_selection_screen.dart'; // Import the store

class MentorshipPage extends StatelessWidget {
  const MentorshipPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Read the mentorship choice from onboarding
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final mentorshipChoice = authProvider.onboardingMentorshipPreference;

    String text;
    if (mentorshipChoice == MentorshipPreference.mentor) {
      text =
          'You are a mentor. You can help others improve their resumes and careers.';
    } else if (mentorshipChoice == MentorshipPreference.mentee) {
      text =
          'You are a mentee. You can get feedback and guidance to grow professionally.';
    } else if (mentorshipChoice == MentorshipPreference.none) {
      text =
          'You have not joined the mentorship program yet. You can always join later from your profile settings.';
    } else {
      text = 'Join our mentorship program to connect with others!';
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mentorship'),
        automaticallyImplyLeading: false,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Text(
            text,
            style: const TextStyle(fontSize: 18),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
