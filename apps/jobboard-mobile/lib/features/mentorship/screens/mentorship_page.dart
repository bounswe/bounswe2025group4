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

  Future<void> _loadData() async {
    if (mounted) {
      setState(() {
        _isLoading = true;
      });
    }

    await Future.delayed(const Duration(milliseconds: 100));

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _handleRefresh(BuildContext context) async {
    final mentorProvider = Provider.of<MentorProvider>(
      context,
      listen: false,
    );
    final authProvider = Provider.of<AuthProvider>(
      context,
      listen: false,
    );
    final userId = authProvider.currentUser!.id;

    try {
      await Future.wait([
        mentorProvider.fetchAvailableMentors(),
        mentorProvider.fetchMenteeRequests(userId),
        mentorProvider.fetchMentorRequests(userId),
        mentorProvider.fetchCurrentUserMentorProfile(userId),
      ]);
    } catch (_) {
      // provider handles errors
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final apiService = Provider.of<ApiService>(context);

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

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: Text(AppLocalizations.of(context)!.mentorshipPage_title),
          automaticallyImplyLeading: false,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final isMentor =
        authProvider.currentUser?.mentorshipStatus == MentorshipStatus.MENTOR;

    return RefreshIndicator(
      onRefresh: () => _handleRefresh(context),
      child: isMentor
          ? const MentorMentorshipScreen()
          : const MenteeMentorshipScreen(),
    );
  }
}
