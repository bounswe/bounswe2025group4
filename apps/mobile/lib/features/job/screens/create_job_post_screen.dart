import 'package:flutter/material.dart';

class CreateJobPostScreen extends StatelessWidget {
  const CreateJobPostScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO: Implement form fields for title, description, ethical policies (checkboxes/dropdown), salary, contact info (Req 1.1.3.1 - 1.1.3.4)
    // TODO: Add submit button to call API to create the post
    return Scaffold(
      appBar: AppBar(title: const Text('Create Job Posting')),
      body: const Center(child: Text('Create Job Post Form (TBD)')),
    );
  }
}
