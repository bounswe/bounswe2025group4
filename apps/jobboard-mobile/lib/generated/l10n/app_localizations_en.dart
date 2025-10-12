// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get welcomeScreen_stayMotivated => 'Stay motivated!';

  @override
  String get welcomeScreen_title => 'Welcome to Ethical Job Platform';

  @override
  String get welcomeScreen_subtitle =>
      'Connect with companies that share your values and build an ethical career path';

  @override
  String get welcomeScreen_getStarted => 'Get Started';

  @override
  String get welcomeScreen_alreadyHaveAccount => 'I already have an account';

  @override
  String get signInScreen_title => 'Sign In';

  @override
  String get signInScreen_welcomeBack => 'Welcome back!';

  @override
  String get signInScreen_username => 'Username';

  @override
  String get signInScreen_password => 'Password';

  @override
  String get signInScreen_usernameRequired => 'Please enter your username';

  @override
  String get signInScreen_passwordRequired => 'Please enter your password';

  @override
  String get signInScreen_signInButton => 'Sign In';

  @override
  String get signInScreen_dontHaveAccount => 'Don\'t have an account?';

  @override
  String get signInScreen_signUpLink => 'Sign Up';

  @override
  String get signInScreen_loginFailed =>
      'Login Failed. Please check your credentials.';

  @override
  String get signUpScreen_title => 'Sign Up';

  @override
  String get signUpScreen_createAccount => 'Create your account';

  @override
  String get signUpScreen_username => 'Username';

  @override
  String get signUpScreen_email => 'Email';

  @override
  String get signUpScreen_password => 'Password';

  @override
  String get signUpScreen_confirmPassword => 'Confirm Password';

  @override
  String get signUpScreen_bio => 'Bio';

  @override
  String get signUpScreen_usernameRequired => 'Please enter a username';

  @override
  String get signUpScreen_emailRequired => 'Please enter your email';

  @override
  String get signUpScreen_emailInvalid => 'Please enter a valid email';

  @override
  String get signUpScreen_passwordRequired => 'Please enter a password';

  @override
  String get signUpScreen_passwordTooShort =>
      'Password must be at least 6 characters';

  @override
  String get signUpScreen_confirmPasswordRequired =>
      'Please confirm your password';

  @override
  String get signUpScreen_passwordsDoNotMatch => 'Passwords do not match';

  @override
  String get signUpScreen_bioRequired => 'Please enter a bio';

  @override
  String get signUpScreen_signUpButton => 'Sign Up';

  @override
  String get signUpScreen_alreadyHaveAccount => 'Already have an account?';

  @override
  String get signUpScreen_signInLink => 'Sign In';

  @override
  String get signUpScreen_userTypeMissing =>
      'User type missing. Please restart signup process.';

  @override
  String get signUpScreen_signUpFailed =>
      'Sign up failed. Please try again later.';

  @override
  String get signUpScreen_mentorProfileFailed =>
      'Failed to create mentor profile. Please try again or contact support.';

  @override
  String get signUpScreen_alreadyExists => 'Username or email already exists.';

  @override
  String signUpScreen_registrationFailed(String error) {
    return 'Registration failed: $error';
  }

  @override
  String get userTypeScreen_question => 'How will you use our platform?';

  @override
  String get userTypeScreen_jobSeeker => 'Job Seeker';

  @override
  String get userTypeScreen_jobSeekerDesc =>
      'Find ethical companies and opportunities aligned with your values';

  @override
  String get userTypeScreen_employer => 'Employer';

  @override
  String get userTypeScreen_employerDesc =>
      'Post jobs and find candidates who share your company\'s values';

  @override
  String get userTypeScreen_continue => 'Continue';

  @override
  String get mainScaffold_forum => 'Forum';

  @override
  String get mainScaffold_jobs => 'Jobs';

  @override
  String get mainScaffold_mentorship => 'Mentorship';

  @override
  String get mainScaffold_profile => 'Profile';

  @override
  String get mainScaffold_workplaces => 'Workplaces';

  @override
  String get common_loading => 'Loading...';

  @override
  String get common_error => 'Error';

  @override
  String get common_retry => 'Retry';

  @override
  String get common_cancel => 'Cancel';

  @override
  String get common_save => 'Save';

  @override
  String get common_delete => 'Delete';

  @override
  String get common_edit => 'Edit';

  @override
  String get common_search => 'Search';

  @override
  String get common_ok => 'OK';

  @override
  String get common_yes => 'Yes';

  @override
  String get common_no => 'No';

  @override
  String get profilePage_title => 'My Profile';

  @override
  String get profilePage_editProfile => 'Edit profile';

  @override
  String get profilePage_logout => 'Logout';

  @override
  String get profilePage_failedToLoad => 'Failed to load profile';

  @override
  String profilePage_fontSizeChanged(String size) {
    return 'Font size changed to $size';
  }

  @override
  String profilePage_languageChanged(String language) {
    return 'Language changed to $language';
  }
}
