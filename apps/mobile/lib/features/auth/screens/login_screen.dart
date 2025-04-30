import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart'; // Adjust path
import 'register_screen.dart'; // Adjust path
import '../../main_scaffold/main_scaffold.dart'; // Adjust path
import '../../../core/models/user.dart'; // Adjust path for UserRole

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) {
      return; // Don't proceed if form is invalid
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.login(
      _usernameController.text.trim(),
      _passwordController.text.trim(),
    );

    if (success && mounted) {
      // Navigate to MainScaffold on successful login
      // pushReplacementNamed prevents going back to login screen
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const MainScaffold()),
      );
    } else if (mounted) {
      // Show error message
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Login Failed. Please try again.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Temporary Role Selector for Testing
              DropdownButton<UserRole>(
                value: authProvider.simulatedRole,
                hint: const Text("Select Role for Testing"),
                onChanged: (UserRole? newValue) {
                  if (newValue != null) {
                    authProvider.setSimulatedRole(newValue);
                  }
                },
                items:
                    UserRole.values
                        .where(
                          (role) => role != UserRole.guest,
                        ) // Exclude guest
                        .map<DropdownMenuItem<UserRole>>((UserRole value) {
                          return DropdownMenuItem<UserRole>(
                            value: value,
                            child: Text(
                              value.toString().split('.').last,
                            ), // Display role name
                          );
                        })
                        .toList(),
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: _usernameController,
                decoration: const InputDecoration(labelText: 'Username'),
                validator:
                    (value) => value!.isEmpty ? 'Please enter username' : null,
              ),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(labelText: 'Password'),
                obscureText: true,
                validator:
                    (value) => value!.isEmpty ? 'Please enter password' : null,
              ),
              const SizedBox(height: 20),
              authProvider.isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                    onPressed: _login,
                    child: const Text('Login'),
                  ),
              TextButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const RegisterScreen()),
                  );
                },
                child: const Text('Don\'t have an account? Register'),
              ),
              // Add Password Reset later
            ],
          ),
        ),
      ),
    );
  }
}
