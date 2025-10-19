// lib/features/auth/screens/forgot_password_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/features/auth/screens/welcome_screen.dart';
import 'package:mobile/core/models/pass_reset_req_result.dart';


class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  final _tokenController = TextEditingController();
  final _newPassController = TextEditingController();
  final _formKeyEmail = GlobalKey<FormState>();
  final _formKeyReset = GlobalKey<FormState>();

  bool _emailSent = false;

  @override
  void dispose() {
    _emailController.dispose();
    _tokenController.dispose();
    _newPassController.dispose();
    super.dispose();
  }

  Future<void> _sendResetEmail() async {
    if (!_formKeyEmail.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final result = await auth.requestPasswordReset(_emailController.text.trim());
    if (!mounted) return;

    switch (result.status) {
      case PasswordResetRequestStatus.sent:
      // Show success and go back to welcome / sign-in
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result.message)),
        );
        // go to the WelcomeScreen()
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => const WelcomeScreen(),
          ),
        );

        break;

      case PasswordResetRequestStatus.notFound:
      // Let the user correct the email
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result.message),
            backgroundColor: Colors.red,
          ),
        );
        break;

      case PasswordResetRequestStatus.failed:
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result.message),
            backgroundColor: Colors.red,
          ),

        );
        break;
    }
  }


  Future<void> _confirmReset() async {
    if (!_formKeyReset.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final ok = await auth.confirmPasswordReset(
      token: _tokenController.text.trim(),
      newPassword: _newPassController.text,
    );
    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password has been reset. Please log in.')),
      );
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Reset failed. Check the token and try again.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthProvider>().isLoading;

    return Scaffold(
      appBar: AppBar(title: const Text('Reset Password')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: _emailSent ? _resetForm(isLoading) : _emailForm(isLoading),
      ),
    );
  }

  Widget _emailForm(bool isLoading) {
    return Form(
      key: _formKeyEmail,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Enter your email to receive a reset link:'),
          const SizedBox(height: 12),
          TextFormField(
            controller: _emailController,
            decoration: const InputDecoration(
              labelText: 'Email',
              border: OutlineInputBorder(),
            ),
            validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: isLoading ? null : _sendResetEmail,
              child: isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Send reset link'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _resetForm(bool isLoading) {
    return Form(
      key: _formKeyReset,
      child: ListView(
        children: [
          const Text(
            'Paste the token from your email and choose a new password.',
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _tokenController,
            decoration: const InputDecoration(
              labelText: 'Token',
              border: OutlineInputBorder(),
            ),
            validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _newPassController,
            obscureText: true,
            decoration: const InputDecoration(
              labelText: 'New password',
              border: OutlineInputBorder(),
            ),
            validator: (v) => (v == null || v.length < 6)
                ? 'Min 6 characters'
                : null,
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: isLoading ? null : _confirmReset,
              child: isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Reset password'),
            ),
          ),
        ],
      ),
    );
  }
}
