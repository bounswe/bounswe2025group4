import 'package:flutter/material.dart';
import 'package:mobile/features/main_scaffold/main_scaffold.dart';
import 'package:mobile/features/auth/screens/sign_in_screen.dart';
import 'package:mobile/generated/l10n/app_localizations.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/providers/auth_provider.dart';
import 'package:mobile/core/models/user_type.dart';
import 'package:mobile/core/models/mentorship_status.dart';
import 'package:mobile/core/providers/profile_provider.dart';
import '../../../core/widgets/a11y.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _bioController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  void _handleSignUp() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final username = _usernameController.text.trim();
      final email = _emailController.text.trim();
      final password = _passwordController.text;
      final bio = _bioController.text.trim();

      final userType = authProvider.onboardingUserType;
      final mentorshipStatus = authProvider.onboardingMentorshipStatus;
      final maxMenteeCount = authProvider.onboardingMaxMenteeCount;

      if (userType == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.signUpScreen_userTypeMissing),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      }

      try {
        bool success = await authProvider.register(
          username,
          email,
          password,
          userType,
          bio.isNotEmpty ? bio : null,
          mentorshipStatus: mentorshipStatus,
          maxMenteeCount: maxMenteeCount,
        );

        if (!mounted) return;

        if (success) {
          final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
          profileProvider.clearCurrentUserProfile();
          await profileProvider.fetchMyProfile();
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const MainScaffold()),
          );
        } else {
          // This branch might not be reached since errors now throw exceptions,
          // but keeping it for robustness
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(AppLocalizations.of(context)!.signUpScreen_signUpFailed),
              backgroundColor: Colors.red,
            ),
          );
        }
      } catch (e) {
        if (!mounted) return;

        // Display specific error message
        String errorMessage;
        if (e.toString().contains('mentor profile')) {
          errorMessage = AppLocalizations.of(context)!.signUpScreen_mentorProfileFailed;
        } else if (e.toString().contains('already exist')) {
          errorMessage = AppLocalizations.of(context)!.signUpScreen_alreadyExists;
        } else {
          errorMessage = AppLocalizations.of(context)!.signUpScreen_registrationFailed(e.toString());
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
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
        title: Text(AppLocalizations.of(context)!.signUpScreen_title),
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
                  AppLocalizations.of(context)!.signUpScreen_createAccount,
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 32),
                TextFormField(
                  controller: _usernameController,
                  decoration: InputDecoration(
                    labelText: AppLocalizations.of(context)!.signUpScreen_username,
                    border: const OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return AppLocalizations.of(context)!.signUpScreen_usernameRequired;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    labelText: AppLocalizations.of(context)!.signUpScreen_email,
                    border: const OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return AppLocalizations.of(context)!.signUpScreen_emailRequired;
                    }
                    if (!value.contains('@')) {
                      return AppLocalizations.of(context)!.signUpScreen_emailInvalid;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: AppLocalizations.of(context)!.signUpScreen_password,
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      icon: A11y(
                        label: _obscurePassword ? 'Show password' : 'Hide password',
                        child: Icon(
                        _obscurePassword
                            ? Icons.visibility
                            : Icons.visibility_off,
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
                      return AppLocalizations.of(context)!.signUpScreen_passwordRequired;
                    }
                    if (value.length < 6) {
                      return AppLocalizations.of(context)!.signUpScreen_passwordTooShort;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _confirmPasswordController,
                  obscureText: _obscureConfirmPassword,
                  decoration: InputDecoration(
                    labelText: AppLocalizations.of(context)!.signUpScreen_confirmPassword,
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      icon: A11y(
                        label: _obscureConfirmPassword ? 'Show password' : 'Hide password',
                        child: Icon(
                        _obscureConfirmPassword
                            ? Icons.visibility
                            : Icons.visibility_off,
                        ),
                      ),
                      onPressed: () {
                        setState(() {
                          _obscureConfirmPassword = !_obscureConfirmPassword;
                        });
                      },
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return AppLocalizations.of(context)!.signUpScreen_confirmPasswordRequired;
                    }
                    if (value != _passwordController.text) {
                      return AppLocalizations.of(context)!.signUpScreen_passwordsDoNotMatch;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _bioController,
                  decoration: InputDecoration(
                    labelText: AppLocalizations.of(context)!.signUpScreen_bio,
                    border: const OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return AppLocalizations.of(context)!.signUpScreen_bioRequired;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: authProvider.isLoading ? null : _handleSignUp,
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
                              AppLocalizations.of(context)!.signUpScreen_signUpButton,
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
                    Text(AppLocalizations.of(context)!.signUpScreen_alreadyHaveAccount),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const SignInScreen(),
                          ),
                        );
                      },
                      child: Text(AppLocalizations.of(context)!.signUpScreen_signInLink),
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
