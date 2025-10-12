import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';
import 'app_localizations_tr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en'),
    Locale('tr'),
  ];

  /// Fallback message when quote fails to load
  ///
  /// In en, this message translates to:
  /// **'Stay motivated!'**
  String get welcomeScreen_stayMotivated;

  /// Main title on welcome screen
  ///
  /// In en, this message translates to:
  /// **'Welcome to Ethical Job Platform'**
  String get welcomeScreen_title;

  /// Subtitle description on welcome screen
  ///
  /// In en, this message translates to:
  /// **'Connect with companies that share your values and build an ethical career path'**
  String get welcomeScreen_subtitle;

  /// Primary CTA button
  ///
  /// In en, this message translates to:
  /// **'Get Started'**
  String get welcomeScreen_getStarted;

  /// Secondary button for existing users
  ///
  /// In en, this message translates to:
  /// **'I already have an account'**
  String get welcomeScreen_alreadyHaveAccount;

  /// Sign in screen title
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get signInScreen_title;

  /// Welcome back message
  ///
  /// In en, this message translates to:
  /// **'Welcome back!'**
  String get signInScreen_welcomeBack;

  /// Username field label
  ///
  /// In en, this message translates to:
  /// **'Username'**
  String get signInScreen_username;

  /// Password field label
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get signInScreen_password;

  /// Username validation error
  ///
  /// In en, this message translates to:
  /// **'Please enter your username'**
  String get signInScreen_usernameRequired;

  /// Password validation error
  ///
  /// In en, this message translates to:
  /// **'Please enter your password'**
  String get signInScreen_passwordRequired;

  /// Sign in button text
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get signInScreen_signInButton;

  /// Prompt for new users
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account?'**
  String get signInScreen_dontHaveAccount;

  /// Sign up link text
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get signInScreen_signUpLink;

  /// Login failure error message
  ///
  /// In en, this message translates to:
  /// **'Login Failed. Please check your credentials.'**
  String get signInScreen_loginFailed;

  /// Sign up screen title
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get signUpScreen_title;

  /// Create account heading
  ///
  /// In en, this message translates to:
  /// **'Create your account'**
  String get signUpScreen_createAccount;

  /// Username field label
  ///
  /// In en, this message translates to:
  /// **'Username'**
  String get signUpScreen_username;

  /// Email field label
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get signUpScreen_email;

  /// Password field label
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get signUpScreen_password;

  /// Confirm password field label
  ///
  /// In en, this message translates to:
  /// **'Confirm Password'**
  String get signUpScreen_confirmPassword;

  /// Bio field label
  ///
  /// In en, this message translates to:
  /// **'Bio'**
  String get signUpScreen_bio;

  /// Username validation error
  ///
  /// In en, this message translates to:
  /// **'Please enter a username'**
  String get signUpScreen_usernameRequired;

  /// Email validation error
  ///
  /// In en, this message translates to:
  /// **'Please enter your email'**
  String get signUpScreen_emailRequired;

  /// Invalid email format error
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid email'**
  String get signUpScreen_emailInvalid;

  /// Password validation error
  ///
  /// In en, this message translates to:
  /// **'Please enter a password'**
  String get signUpScreen_passwordRequired;

  /// Password length validation error
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 6 characters'**
  String get signUpScreen_passwordTooShort;

  /// Confirm password validation error
  ///
  /// In en, this message translates to:
  /// **'Please confirm your password'**
  String get signUpScreen_confirmPasswordRequired;

  /// Password mismatch error
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get signUpScreen_passwordsDoNotMatch;

  /// Bio validation error
  ///
  /// In en, this message translates to:
  /// **'Please enter a bio'**
  String get signUpScreen_bioRequired;

  /// Sign up button text
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get signUpScreen_signUpButton;

  /// Prompt for existing users
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get signUpScreen_alreadyHaveAccount;

  /// Sign in link text
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get signUpScreen_signInLink;

  /// Error when user type is not selected
  ///
  /// In en, this message translates to:
  /// **'User type missing. Please restart signup process.'**
  String get signUpScreen_userTypeMissing;

  /// Generic signup failure message
  ///
  /// In en, this message translates to:
  /// **'Sign up failed. Please try again later.'**
  String get signUpScreen_signUpFailed;

  /// Mentor profile creation error
  ///
  /// In en, this message translates to:
  /// **'Failed to create mentor profile. Please try again or contact support.'**
  String get signUpScreen_mentorProfileFailed;

  /// Duplicate user error
  ///
  /// In en, this message translates to:
  /// **'Username or email already exists.'**
  String get signUpScreen_alreadyExists;

  /// Registration failure with error details
  ///
  /// In en, this message translates to:
  /// **'Registration failed: {error}'**
  String signUpScreen_registrationFailed(String error);

  /// User type selection question
  ///
  /// In en, this message translates to:
  /// **'How will you use our platform?'**
  String get userTypeScreen_question;

  /// Job seeker option
  ///
  /// In en, this message translates to:
  /// **'Job Seeker'**
  String get userTypeScreen_jobSeeker;

  /// Job seeker description
  ///
  /// In en, this message translates to:
  /// **'Find ethical companies and opportunities aligned with your values'**
  String get userTypeScreen_jobSeekerDesc;

  /// Employer option
  ///
  /// In en, this message translates to:
  /// **'Employer'**
  String get userTypeScreen_employer;

  /// Employer description
  ///
  /// In en, this message translates to:
  /// **'Post jobs and find candidates who share your company\'s values'**
  String get userTypeScreen_employerDesc;

  /// Continue button
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get userTypeScreen_continue;

  /// Forum tab label
  ///
  /// In en, this message translates to:
  /// **'Forum'**
  String get mainScaffold_forum;

  /// Jobs tab label
  ///
  /// In en, this message translates to:
  /// **'Jobs'**
  String get mainScaffold_jobs;

  /// Mentorship tab label
  ///
  /// In en, this message translates to:
  /// **'Mentorship'**
  String get mainScaffold_mentorship;

  /// Profile tab label
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get mainScaffold_profile;

  /// Workplaces tab label
  ///
  /// In en, this message translates to:
  /// **'Workplaces'**
  String get mainScaffold_workplaces;

  /// Generic loading message
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get common_loading;

  /// Generic error label
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get common_error;

  /// Retry button
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get common_retry;

  /// Cancel button
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get common_cancel;

  /// Save button
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get common_save;

  /// Delete button
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get common_delete;

  /// Edit button
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get common_edit;

  /// Search placeholder
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get common_search;

  /// OK button
  ///
  /// In en, this message translates to:
  /// **'OK'**
  String get common_ok;

  /// Yes button
  ///
  /// In en, this message translates to:
  /// **'Yes'**
  String get common_yes;

  /// No button
  ///
  /// In en, this message translates to:
  /// **'No'**
  String get common_no;

  /// Profile page title
  ///
  /// In en, this message translates to:
  /// **'My Profile'**
  String get profilePage_title;

  /// Edit profile tooltip
  ///
  /// In en, this message translates to:
  /// **'Edit profile'**
  String get profilePage_editProfile;

  /// Logout tooltip
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get profilePage_logout;

  /// Error message when profile fails to load
  ///
  /// In en, this message translates to:
  /// **'Failed to load profile'**
  String get profilePage_failedToLoad;

  /// Snackbar message when font size is changed
  ///
  /// In en, this message translates to:
  /// **'Font size changed to {size}'**
  String profilePage_fontSizeChanged(String size);

  /// Snackbar message when language is changed
  ///
  /// In en, this message translates to:
  /// **'Language changed to {language}'**
  String profilePage_languageChanged(String language);

  /// Career status question
  ///
  /// In en, this message translates to:
  /// **'What is your current career status?'**
  String get careerStatusScreen_question;

  /// No description provided for @careerStatusScreen_student.
  ///
  /// In en, this message translates to:
  /// **'Student'**
  String get careerStatusScreen_student;

  /// No description provided for @careerStatusScreen_recentGraduate.
  ///
  /// In en, this message translates to:
  /// **'Recent Graduate'**
  String get careerStatusScreen_recentGraduate;

  /// No description provided for @careerStatusScreen_midLevel.
  ///
  /// In en, this message translates to:
  /// **'Mid-Level Professional'**
  String get careerStatusScreen_midLevel;

  /// No description provided for @careerStatusScreen_senior.
  ///
  /// In en, this message translates to:
  /// **'Senior Professional'**
  String get careerStatusScreen_senior;

  /// No description provided for @careerStatusScreen_changingCareers.
  ///
  /// In en, this message translates to:
  /// **'Changing Careers'**
  String get careerStatusScreen_changingCareers;

  /// Organization type question
  ///
  /// In en, this message translates to:
  /// **'What type of organization do you represent?'**
  String get organizationTypeScreen_question;

  /// No description provided for @organizationTypeScreen_company.
  ///
  /// In en, this message translates to:
  /// **'Company'**
  String get organizationTypeScreen_company;

  /// No description provided for @organizationTypeScreen_startup.
  ///
  /// In en, this message translates to:
  /// **'Startup'**
  String get organizationTypeScreen_startup;

  /// No description provided for @organizationTypeScreen_nonprofit.
  ///
  /// In en, this message translates to:
  /// **'Non-profit'**
  String get organizationTypeScreen_nonprofit;

  /// No description provided for @organizationTypeScreen_freelancer.
  ///
  /// In en, this message translates to:
  /// **'Freelancer hiring for a project'**
  String get organizationTypeScreen_freelancer;

  /// No description provided for @organizationTypeScreen_other.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get organizationTypeScreen_other;

  /// No description provided for @organizationTypeScreen_pleaseSpecify.
  ///
  /// In en, this message translates to:
  /// **'Please specify'**
  String get organizationTypeScreen_pleaseSpecify;

  /// Job priorities question
  ///
  /// In en, this message translates to:
  /// **'What are your top priorities when looking for a job?'**
  String get jobPrioritiesScreen_question;

  /// No description provided for @jobPrioritiesScreen_selectAll.
  ///
  /// In en, this message translates to:
  /// **'Select all that apply'**
  String get jobPrioritiesScreen_selectAll;

  /// No description provided for @jobPrioritiesScreen_fairWages.
  ///
  /// In en, this message translates to:
  /// **'Fair Wages'**
  String get jobPrioritiesScreen_fairWages;

  /// No description provided for @jobPrioritiesScreen_fairWagesDesc.
  ///
  /// In en, this message translates to:
  /// **'Companies that pay living wages and maintain transparent compensation practices'**
  String get jobPrioritiesScreen_fairWagesDesc;

  /// No description provided for @jobPrioritiesScreen_inclusive.
  ///
  /// In en, this message translates to:
  /// **'Inclusive Workplace'**
  String get jobPrioritiesScreen_inclusive;

  /// No description provided for @jobPrioritiesScreen_inclusiveDesc.
  ///
  /// In en, this message translates to:
  /// **'Organizations committed to diversity, equity, and inclusion'**
  String get jobPrioritiesScreen_inclusiveDesc;

  /// No description provided for @jobPrioritiesScreen_sustainability.
  ///
  /// In en, this message translates to:
  /// **'Sustainability/Environmental Policies'**
  String get jobPrioritiesScreen_sustainability;

  /// No description provided for @jobPrioritiesScreen_sustainabilityDesc.
  ///
  /// In en, this message translates to:
  /// **'Companies with strong environmental commitments and practices'**
  String get jobPrioritiesScreen_sustainabilityDesc;

  /// No description provided for @jobPrioritiesScreen_workLife.
  ///
  /// In en, this message translates to:
  /// **'Work-Life Balance'**
  String get jobPrioritiesScreen_workLife;

  /// No description provided for @jobPrioritiesScreen_workLifeDesc.
  ///
  /// In en, this message translates to:
  /// **'Respectful of personal time with flexible scheduling options'**
  String get jobPrioritiesScreen_workLifeDesc;

  /// No description provided for @jobPrioritiesScreen_remote.
  ///
  /// In en, this message translates to:
  /// **'Remote-Friendly'**
  String get jobPrioritiesScreen_remote;

  /// No description provided for @jobPrioritiesScreen_remoteDesc.
  ///
  /// In en, this message translates to:
  /// **'Options for remote work and flexible location'**
  String get jobPrioritiesScreen_remoteDesc;

  /// No description provided for @jobPrioritiesScreen_growth.
  ///
  /// In en, this message translates to:
  /// **'Career Growth Opportunities'**
  String get jobPrioritiesScreen_growth;

  /// No description provided for @jobPrioritiesScreen_growthDesc.
  ///
  /// In en, this message translates to:
  /// **'Clear paths for advancement and professional development'**
  String get jobPrioritiesScreen_growthDesc;

  /// Company policies question
  ///
  /// In en, this message translates to:
  /// **'Which ethical policies does your company follow?'**
  String get companyPoliciesScreen_question;

  /// No description provided for @companyPoliciesScreen_fairWage.
  ///
  /// In en, this message translates to:
  /// **'Fair wage commitment'**
  String get companyPoliciesScreen_fairWage;

  /// No description provided for @companyPoliciesScreen_fairWageDesc.
  ///
  /// In en, this message translates to:
  /// **'Ensuring competitive compensation and transparent pay practices'**
  String get companyPoliciesScreen_fairWageDesc;

  /// No description provided for @companyPoliciesScreen_diversity.
  ///
  /// In en, this message translates to:
  /// **'Diversity & inclusion policy'**
  String get companyPoliciesScreen_diversity;

  /// No description provided for @companyPoliciesScreen_diversityDesc.
  ///
  /// In en, this message translates to:
  /// **'Promoting an inclusive workplace with equal opportunities'**
  String get companyPoliciesScreen_diversityDesc;

  /// No description provided for @companyPoliciesScreen_wellbeing.
  ///
  /// In en, this message translates to:
  /// **'Employee well-being programs'**
  String get companyPoliciesScreen_wellbeing;

  /// No description provided for @companyPoliciesScreen_wellbeingDesc.
  ///
  /// In en, this message translates to:
  /// **'Supporting mental health, work-life balance, and personal growth'**
  String get companyPoliciesScreen_wellbeingDesc;

  /// No description provided for @companyPoliciesScreen_remotePolicy.
  ///
  /// In en, this message translates to:
  /// **'Remote-friendly culture'**
  String get companyPoliciesScreen_remotePolicy;

  /// No description provided for @companyPoliciesScreen_remotePolicyDesc.
  ///
  /// In en, this message translates to:
  /// **'Offering flexible work arrangements and remote options'**
  String get companyPoliciesScreen_remotePolicyDesc;

  /// No description provided for @companyPoliciesScreen_sustainabilityPolicy.
  ///
  /// In en, this message translates to:
  /// **'Sustainability/environmental goals'**
  String get companyPoliciesScreen_sustainabilityPolicy;

  /// No description provided for @companyPoliciesScreen_sustainabilityPolicyDesc.
  ///
  /// In en, this message translates to:
  /// **'Implementing eco-friendly practices and reducing environmental impact'**
  String get companyPoliciesScreen_sustainabilityPolicyDesc;

  /// Industry selection question
  ///
  /// In en, this message translates to:
  /// **'Which industries are you most interested in?'**
  String get industrySelectionScreen_question;

  /// No description provided for @industrySelectionScreen_tech.
  ///
  /// In en, this message translates to:
  /// **'Tech'**
  String get industrySelectionScreen_tech;

  /// No description provided for @industrySelectionScreen_healthcare.
  ///
  /// In en, this message translates to:
  /// **'Healthcare'**
  String get industrySelectionScreen_healthcare;

  /// No description provided for @industrySelectionScreen_education.
  ///
  /// In en, this message translates to:
  /// **'Education'**
  String get industrySelectionScreen_education;

  /// No description provided for @industrySelectionScreen_finance.
  ///
  /// In en, this message translates to:
  /// **'Finance'**
  String get industrySelectionScreen_finance;

  /// No description provided for @industrySelectionScreen_creativeArts.
  ///
  /// In en, this message translates to:
  /// **'Creative Arts'**
  String get industrySelectionScreen_creativeArts;

  /// Mentorship participation question
  ///
  /// In en, this message translates to:
  /// **'Would you like to participate in our mentorship system?'**
  String get mentorshipSelectionScreen_question;

  /// Mentorship explanation
  ///
  /// In en, this message translates to:
  /// **'You can connect with others to either receive or provide career guidance.'**
  String get mentorshipSelectionScreen_subtitle;

  /// No description provided for @mentorshipSelectionScreen_beMentor.
  ///
  /// In en, this message translates to:
  /// **'I want to be a mentor'**
  String get mentorshipSelectionScreen_beMentor;

  /// No description provided for @mentorshipSelectionScreen_beMentorDesc.
  ///
  /// In en, this message translates to:
  /// **'Help others improve their resumes and careers'**
  String get mentorshipSelectionScreen_beMentorDesc;

  /// No description provided for @mentorshipSelectionScreen_lookingForMentor.
  ///
  /// In en, this message translates to:
  /// **'I\'m looking for a mentor (mentee)'**
  String get mentorshipSelectionScreen_lookingForMentor;

  /// No description provided for @mentorshipSelectionScreen_lookingForMentorDesc.
  ///
  /// In en, this message translates to:
  /// **'Get feedback and guidance to grow professionally'**
  String get mentorshipSelectionScreen_lookingForMentorDesc;

  /// No description provided for @mentorshipSelectionScreen_maxMentees.
  ///
  /// In en, this message translates to:
  /// **'How many mentees are you willing to take?'**
  String get mentorshipSelectionScreen_maxMentees;

  /// No description provided for @mentorshipSelectionScreen_maxMenteesLabel.
  ///
  /// In en, this message translates to:
  /// **'Max Mentee Count (1-20)'**
  String get mentorshipSelectionScreen_maxMenteesLabel;

  /// No description provided for @mentorshipSelectionScreen_enterNumber.
  ///
  /// In en, this message translates to:
  /// **'Please enter a number'**
  String get mentorshipSelectionScreen_enterNumber;

  /// No description provided for @mentorshipSelectionScreen_validNumber.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid number'**
  String get mentorshipSelectionScreen_validNumber;

  /// No description provided for @mentorshipSelectionScreen_greaterThanZero.
  ///
  /// In en, this message translates to:
  /// **'Must be greater than 0'**
  String get mentorshipSelectionScreen_greaterThanZero;

  /// No description provided for @mentorshipSelectionScreen_lessThan21.
  ///
  /// In en, this message translates to:
  /// **'Must be less than 21'**
  String get mentorshipSelectionScreen_lessThan21;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en', 'tr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
    case 'tr':
      return AppLocalizationsTr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
