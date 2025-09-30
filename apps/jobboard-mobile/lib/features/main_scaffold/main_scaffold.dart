import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../forum/screens/forum_page.dart';
import '../job/screens/job_page.dart';
import '../mentorship/screens/mentorship_page.dart';
import '../profile/screens/profile_page.dart';
import '../workplaces/screens/workplaces_page.dart';
import '../../core/providers/auth_provider.dart';
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
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.forum), label: 'Forum'),
          BottomNavigationBarItem(
            icon: Icon(Icons.work),
            label: 'Jobs', // This is your Job page
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.school), // Or Icons.people or similar
            label: 'Mentorship', // This is your Mentorship page
          ),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
          BottomNavigationBarItem(
            icon: Icon(Icons.business),
            label: 'Workplaces',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.amber[800], // Customize color
        unselectedItemColor: Colors.grey, // Ensure unselected items are visible
        showUnselectedLabels: true, // Make labels always visible
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed, // Use fixed if > 3 items often
      ),
    );
  }
}
