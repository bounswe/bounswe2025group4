import 'package:flutter/material.dart';

class JobDetailsScreen extends StatelessWidget {
  final String jobId;

  const JobDetailsScreen({super.key, required this.jobId});

  @override
  Widget build(BuildContext context) {
    // TODO: Fetch job details using jobId from API
    // TODO: Display job details (title, company, desc, policies, salary, contact)
    // TODO: Add "Apply" button (Req 1.1.3.6)
    return Scaffold(
      appBar: AppBar(title: const Text('Job Details')),
      body: Center(child: Text('Job Details for ID: $jobId (TBD)')),
    );
  }
}
