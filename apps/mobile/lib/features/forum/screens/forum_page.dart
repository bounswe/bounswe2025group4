import 'package:flutter/material.dart';

class ForumPage extends StatelessWidget {
  const ForumPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Forum'),
        automaticallyImplyLeading: false,
      ),
      body: const Center(child: Text('Forum Page - To be implemented')),
    );
  }
}
