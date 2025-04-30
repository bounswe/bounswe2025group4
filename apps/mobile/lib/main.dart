import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/providers/auth_provider.dart'; // Adjust path
import 'app.dart'; // Adjust path

void main() {
  runApp(
    // Wrap the entire app with the AuthProvider
    ChangeNotifierProvider(
      create: (context) => AuthProvider(),
      child: const MyApp(),
    ),
  );
}
