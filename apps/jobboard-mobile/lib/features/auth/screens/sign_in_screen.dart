import 'package:flutter/material.dart';
import 'package:mobile/features/main_scaffold/main_scaffold.dart';
import 'package:mobile/features/auth/screens/sign_up_screen.dart';
import 'package:mobile/features/auth/screens/forgot_password_screen.dart';
import 'package:mobile/generated/l10n/app_localizations.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/providers/profile_provider.dart';
import '../../../core/widgets/a11y.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleSignIn() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      final username = _usernameController.text.trim();
      final password = _passwordController.text.trim();

      final ok = await authProvider.login(username, password);

      if (!mounted) return;

      if (ok) {
        final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
        profileProvider.clearCurrentUserProfile();
        await profileProvider.fetchMyProfile();
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const MainScaffold()),
        );
      } else {
        if (authProvider.hasPendingOtp) {
          _showOtpDialog(context);
          return;
        }
        else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                  AppLocalizations.of(context)!.signInScreen_loginFailed),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }
  void _showOtpDialog(BuildContext context) {
    final otpController = TextEditingController();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Enter verification code'),
          content: TextField(
            controller: otpController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: '6-digit code',
              border: OutlineInputBorder(),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                final code = otpController.text.trim();
                if (code.isEmpty) return;

                final success = await context.read<AuthProvider>()
                    .verifyOtpAndCompleteLogin(code);

                if (!mounted) return;

                if (success) {
                  Navigator.of(ctx).pop(); // close dialog
                  // proceed to app
                  final profileProvider = context.read<ProfileProvider>();
                  profileProvider.clearCurrentUserProfile();
                  await profileProvider.fetchMyProfile();
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (_) => const MainScaffold()),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Invalid code. Try again.')),
                  );
                }
              },
              child: const Text('Verify'),
            ),
          ],
        );
      },
    );
  }


  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: 'Back',
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(AppLocalizations.of(context)!.signInScreen_title),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  AppLocalizations.of(context)!.signInScreen_welcomeBack,
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 32),
                TextFormField(
                  controller: _usernameController,
                  keyboardType: TextInputType.text,
                  decoration: InputDecoration(
                    labelText: AppLocalizations.of(context)!.signInScreen_username,
                    border: const OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return AppLocalizations.of(context)!.signInScreen_usernameRequired;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: AppLocalizations.of(context)!.signInScreen_password,
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      icon: A11y(
                        label: _obscurePassword ? 'Show password' : 'Hide password',
                        child: Icon(
                        _obscurePassword
                            ? Icons.visibility_off
                            : Icons.visibility,
                        ),
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return AppLocalizations.of(context)!.signInScreen_passwordRequired;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: authProvider.isLoading ? null : _handleSignIn,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child:
                        authProvider.isLoading
                            ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                              ),
                            )
                            : Text(
                              AppLocalizations.of(context)!.signInScreen_signInButton,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                              ),
                            ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    TextButton(
                      onPressed: () {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const ForgotPasswordScreen(),
                          ),
                        );
                      },
                      child: Text("Forgot password?"),
                    ),
                  ],
                ),

                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(AppLocalizations.of(context)!.signInScreen_dontHaveAccount),
                    TextButton(
                      onPressed: () {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const SignUpScreen(),
                          ),
                        );
                      },
                      child: Text(AppLocalizations.of(context)!.signInScreen_signUpLink),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
