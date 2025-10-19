import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../generated/l10n/app_localizations.dart';
import '../forum/screens/forum_page.dart';
import '../job/screens/job_page.dart';
import '../mentorship/screens/mentorship_page.dart';
import '../profile/screens/profile_page.dart';
import '../workplaces/screens/workplaces_page.dart';
import '../../core/providers/quote_provider.dart';

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _selectedIndex = 1;

  static const List<Widget> _widgetOptions = <Widget>[
    ForumPage(),
    JobPage(),
    MentorshipPage(),
    ProfilePage(),
    WorkplacesPage(),
  ];

  void _onItemTapped(int index) {
    HapticFeedback.selectionClick();
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  void initState() {
    super.initState();
    // Fetch a random quote when the main scaffold loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<QuoteProvider>(context, listen: false).fetchRandomQuote();
    });
  }

  @override
  Widget build(BuildContext context) {
    // You might need access to the user's role here or within specific pages
    // final userRole = Provider.of<AuthProvider>(context).currentUser?.role;
    // print("Building MainScaffold. Current user role: $userRole"); // Debug print

    return Scaffold(
      // AppBar can be added here if common to all pages,
      // or within each individual page if they differ.
      // appBar: AppBar(title: Text('Job Platform')),
      body: Center(
        // Display the widget corresponding to the selected index
        child: _widgetOptions.elementAt(_selectedIndex),
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: const Icon(Icons.forum),
            label: AppLocalizations.of(context)!.mainScaffold_forum,
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.work),
            label: AppLocalizations.of(context)!.mainScaffold_jobs,
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.school),
            label: AppLocalizations.of(context)!.mainScaffold_mentorship,
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.person),
            label: AppLocalizations.of(context)!.mainScaffold_profile,
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.business),
            label: AppLocalizations.of(context)!.mainScaffold_workplaces,
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.blue, // Use blue to match onboarding design
        unselectedItemColor: Colors.grey, // Ensure unselected items are visible
        showUnselectedLabels: true, // Make labels always visible
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed, // Use fixed if > 3 items often
      ),
    );
  }
}
