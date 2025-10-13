import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/models/mentorship_status.dart';
import '../providers/mentor_provider.dart';
import './mentee_mentorship_screen.dart';
import './mentor_mentorship_screen.dart';
import '../../../generated/l10n/app_localizations.dart';

class MentorshipPage extends StatefulWidget {
  const MentorshipPage({super.key});

  @override
  State<MentorshipPage> createState() => _MentorshipPageState();
}

class _MentorshipPageState extends State<MentorshipPage> {
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  // Method to refresh the data
  Future<void> _loadData() async {
    // Set loading state
    if (mounted) {
      setState(() {
        _isLoading = true;
      });
    }

    // Delay showing content until the next frame to prevent shaky animation
    await Future.delayed(const Duration(milliseconds: 100));

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  // Method to handle refresh for the RefreshIndicator
  Future<void> _handleRefresh(BuildContext context) async {
    // Refresh the MentorProvider data
    final mentorProvider = Provider.of<MentorProvider>(context, listen: false);

    // Reload basic data that's common to both screens
    try {
      await Future.wait([
        mentorProvider.fetchMenteeRequests(),
        mentorProvider.fetchMentorRequests(),
        mentorProvider.fetchAvailableMentors(),
      ]);
    } catch (e) {
      // Errors are handled inside the provider
    }

    return;
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final apiService = Provider.of<ApiService>(context);

    // If the user is not logged in, show a message
    if (!authProvider.isLoggedIn) {
      return Scaffold(
        appBar: AppBar(
          title: Text(AppLocalizations.of(context)!.mentorshipPage_title),
          automaticallyImplyLeading: false,
        ),
        body: Center(
          child: Text(
            AppLocalizations.of(context)!.mentorshipPage_loginRequired,
            style: const TextStyle(fontSize: 16),
          ),
        ),
      );
    }

    // Show loading state
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: Text(AppLocalizations.of(context)!.mentorshipPage_title),
          automaticallyImplyLeading: false,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    // Determine which screen to show
    final isMentor =
        authProvider.currentUser?.mentorshipStatus == MentorshipStatus.MENTOR;

    // Create a MentorProvider for this screen
    return ChangeNotifierProvider(
      create: (_) => MentorProvider(apiService: apiService),
      // Use Builder to access the provider in a separate build method
      child: Builder(
        builder: (context) {
          return RefreshIndicator(
            onRefresh: () => _handleRefresh(context),
            child:
                isMentor
                    ? const MentorMentorshipScreen()
                    : const MenteeMentorshipScreen(),
          );
        },
      ),
    );
  }
}
