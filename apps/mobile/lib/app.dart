import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/providers/auth_provider.dart'; // Adjust path
import 'features/auth/screens/login_screen.dart'; // Adjust path
import 'features/main_scaffold/main_scaffold.dart'; // Adjust path

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Job Listing Platform',
      theme: ThemeData(
        primarySwatch: Colors.blue, // Customize your theme
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          print(
            "Auth state changed. Logged in: ${authProvider.isLoggedIn}",
          ); // Debug print
          // Show MainScaffold if logged in, otherwise show LoginScreen
          if (authProvider.isLoggedIn) {
            return const MainScaffold();
          } else {
            return const LoginScreen();
          }
        },
      ),
      // Optional: Define named routes if needed later
      // routes: {
      //   '/login': (context) => LoginScreen(),
      //   '/register': (context) => RegisterScreen(),
      //   '/home': (context) => MainScaffold(),
      // },
    );
  }
}
