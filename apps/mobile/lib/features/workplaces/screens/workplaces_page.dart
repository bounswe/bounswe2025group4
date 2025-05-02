import 'package:flutter/material.dart';

class WorkplacesPage extends StatelessWidget {
  const WorkplacesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Workplaces'),
        automaticallyImplyLeading: false,
      ),
      body: const Center(
        child: Text('Workplaces Page - Company Profiles & Reviews TBD'),
        // TODO: Implement workplace reviews (Req 1.1.4)
        // TODO: Display company profiles (Glossary: Company Profile)
      ),
    );
  }
}
