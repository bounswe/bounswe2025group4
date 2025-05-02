import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/user.dart'; // Adjust path
import '../../../core/providers/auth_provider.dart'; // Adjust path
import '../../auth/screens/mentorship_selection_screen.dart'; // Import the store
import './mentee_mentorship_screen.dart'; // Import the new mentee screen

class MentorshipPage extends StatelessWidget {
  const MentorshipPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Read the mentorship choice from onboarding
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final mentorshipChoice = authProvider.onboardingMentorshipPreference;

    // Determine the correct widget based on the choice
    Widget bodyContent;
    String appBarTitle = 'Mentorship';

    if (mentorshipChoice == MentorshipPreference.mentor) {
      // TODO: Implement Mentor screen
      bodyContent = const Center(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Text(
            'Mentor View - Coming Soon!',
            style: TextStyle(fontSize: 18),
            textAlign: TextAlign.center,
          ),
        ),
      );
    } else if (mentorshipChoice == MentorshipPreference.mentee) {
      // Return the MenteeMentorshipScreen directly, it has its own Scaffold/AppBar
      return const MenteeMentorshipScreen();
    } else if (mentorshipChoice == MentorshipPreference.none) {
      bodyContent = const Center(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Text(
            'You have not joined the mentorship program yet. You can always join later from your profile settings.',
            style: TextStyle(fontSize: 18),
            textAlign: TextAlign.center,
          ),
        ),
      );
    } else {
      // Default case or if choice is null
      bodyContent = const Center(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Text(
            'Join our mentorship program to connect with others!',
            style: TextStyle(fontSize: 18),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    // Only build Scaffold/AppBar if not returning MenteeMentorshipScreen
    return Scaffold(
      appBar: AppBar(
        title: Text(appBarTitle),
        automaticallyImplyLeading:
            false, // Keep this if it's a top-level tab screen
      ),
      body: bodyContent,
    );
  }
}
