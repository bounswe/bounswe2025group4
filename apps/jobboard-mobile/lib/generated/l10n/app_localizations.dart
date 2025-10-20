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

  /// Password uppercase validation error
  ///
  /// In en, this message translates to:
  /// **'Password must contain at least 1 uppercase letter'**
  String get signUpScreen_passwordNoUppercase;

  /// Password lowercase validation error
  ///
  /// In en, this message translates to:
  /// **'Password must contain at least 1 lowercase letter'**
  String get signUpScreen_passwordNoLowercase;

  /// Password number validation error
  ///
  /// In en, this message translates to:
  /// **'Password must contain at least 1 number'**
  String get signUpScreen_passwordNoNumber;

  /// Password special character validation error
  ///
  /// In en, this message translates to:
  /// **'Password must contain at least 1 special character.'**
  String get signUpScreen_passwordNoSpecialChar;

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

  /// Gender field label
  ///
  /// In en, this message translates to:
  /// **'Gender'**
  String get signUpScreen_gender;

  /// Male option
  ///
  /// In en, this message translates to:
  /// **'Male'**
  String get signUpScreen_male;

  /// Female option
  ///
  /// In en, this message translates to:
  /// **'Female'**
  String get signUpScreen_female;

  /// Other option
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get signUpScreen_other;

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

  /// Font size change notification
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

  /// Jobs page title
  ///
  /// In en, this message translates to:
  /// **'Jobs'**
  String get jobPage_title;

  /// Search placeholder
  ///
  /// In en, this message translates to:
  /// **'Search jobs...'**
  String get jobPage_search;

  /// Filter button
  ///
  /// In en, this message translates to:
  /// **'Filter'**
  String get jobPage_filter;

  /// Create job post button
  ///
  /// In en, this message translates to:
  /// **'Create Job Post'**
  String get jobPage_createJob;

  /// My applications button
  ///
  /// In en, this message translates to:
  /// **'My Applications'**
  String get jobPage_myApplications;

  /// View applications button
  ///
  /// In en, this message translates to:
  /// **'View Applications'**
  String get jobPage_viewApplications;

  /// No jobs message
  ///
  /// In en, this message translates to:
  /// **'No jobs found'**
  String get jobPage_noJobs;

  /// Load error message
  ///
  /// In en, this message translates to:
  /// **'Failed to load jobs. Please try again.'**
  String get jobPage_loadError;

  /// Posted label
  ///
  /// In en, this message translates to:
  /// **'Posted'**
  String get jobPage_posted;

  /// Remote badge
  ///
  /// In en, this message translates to:
  /// **'Remote'**
  String get jobPage_remote;

  /// Employer posted jobs title
  ///
  /// In en, this message translates to:
  /// **'Your Posted Jobs'**
  String get jobPage_yourPostedJobs;

  /// No posted jobs message for employers
  ///
  /// In en, this message translates to:
  /// **'You have not posted any jobs yet.'**
  String get jobPage_noPostedJobs;

  /// Job details screen title
  ///
  /// In en, this message translates to:
  /// **'Job Details'**
  String get jobDetails_title;

  /// Apply button
  ///
  /// In en, this message translates to:
  /// **'Apply Now'**
  String get jobDetails_apply;

  /// Load error message
  ///
  /// In en, this message translates to:
  /// **'Failed to load job details. Please try again.'**
  String get jobDetails_loadError;

  /// Apply error message
  ///
  /// In en, this message translates to:
  /// **'Error: Could not identify user.'**
  String get jobDetails_applyError;

  /// Apply success message
  ///
  /// In en, this message translates to:
  /// **'Successfully applied to {jobTitle}'**
  String jobDetails_applySuccess(String jobTitle);

  /// Company label
  ///
  /// In en, this message translates to:
  /// **'Company'**
  String get jobDetails_company;

  /// Location label
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get jobDetails_location;

  /// Salary label
  ///
  /// In en, this message translates to:
  /// **'Salary'**
  String get jobDetails_salary;

  /// Description label
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get jobDetails_description;

  /// Requirements label
  ///
  /// In en, this message translates to:
  /// **'Requirements'**
  String get jobDetails_requirements;

  /// Ethical tags label
  ///
  /// In en, this message translates to:
  /// **'Ethical Tags'**
  String get jobDetails_ethicalTags;

  /// Job not found message
  ///
  /// In en, this message translates to:
  /// **'Job details not found.'**
  String get jobDetails_notFound;

  /// No tags message
  ///
  /// In en, this message translates to:
  /// **'No specific tags listed.'**
  String get jobDetails_noTags;

  /// Salary range label
  ///
  /// In en, this message translates to:
  /// **'Salary Range'**
  String get jobDetails_salaryRange;

  /// Contact information label
  ///
  /// In en, this message translates to:
  /// **'Contact Information'**
  String get jobDetails_contactInfo;

  /// Applying button loading state
  ///
  /// In en, this message translates to:
  /// **'Applying...'**
  String get jobDetails_applying;

  /// Forum page title
  ///
  /// In en, this message translates to:
  /// **'Forum'**
  String get forumPage_title;

  /// Forum load error message
  ///
  /// In en, this message translates to:
  /// **'Failed to load Forum: Please check your connection and try again.'**
  String get forumPage_loadError;

  /// No discussions message
  ///
  /// In en, this message translates to:
  /// **'No discussions yet'**
  String get forumPage_noDiscussions;

  /// Filter button
  ///
  /// In en, this message translates to:
  /// **'Filter'**
  String get forumPage_filter;

  /// Search tags placeholder
  ///
  /// In en, this message translates to:
  /// **'Search tags'**
  String get forumPage_searchTags;

  /// Reset button
  ///
  /// In en, this message translates to:
  /// **'Reset'**
  String get forumPage_reset;

  /// New discussion screen title
  ///
  /// In en, this message translates to:
  /// **'New Discussion'**
  String get createThread_newTitle;

  /// Edit discussion screen title
  ///
  /// In en, this message translates to:
  /// **'Edit Discussion'**
  String get createThread_editTitle;

  /// Title input label
  ///
  /// In en, this message translates to:
  /// **'Title'**
  String get createThread_titleLabel;

  /// Title required validation
  ///
  /// In en, this message translates to:
  /// **'Please enter a title'**
  String get createThread_titleRequired;

  /// Title max length validation
  ///
  /// In en, this message translates to:
  /// **'Title must be at most 100 characters'**
  String get createThread_titleMaxLength;

  /// Body input label
  ///
  /// In en, this message translates to:
  /// **'What\'s on your mind?'**
  String get createThread_bodyLabel;

  /// Body required validation
  ///
  /// In en, this message translates to:
  /// **'Please enter content'**
  String get createThread_bodyRequired;

  /// Tags label
  ///
  /// In en, this message translates to:
  /// **'Tags'**
  String get createThread_tags;

  /// Select tags button
  ///
  /// In en, this message translates to:
  /// **'Select Tags'**
  String get createThread_selectTags;

  /// Suggest tags button
  ///
  /// In en, this message translates to:
  /// **'Suggest Tags'**
  String get createThread_suggestTags;

  /// Enter title for suggestions message
  ///
  /// In en, this message translates to:
  /// **'Please enter a title to get tag suggestions.'**
  String get createThread_enterTitleForSuggestions;

  /// Add new tag label
  ///
  /// In en, this message translates to:
  /// **'Add a new tag'**
  String get createThread_addNewTag;

  /// Tag empty validation
  ///
  /// In en, this message translates to:
  /// **'Tag name cannot be empty.'**
  String get createThread_tagEmpty;

  /// Tag max length validation
  ///
  /// In en, this message translates to:
  /// **'Tag name must be at most 255 characters.'**
  String get createThread_tagMaxLength;

  /// Done button
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get createThread_done;

  /// Post button
  ///
  /// In en, this message translates to:
  /// **'Post'**
  String get createThread_post;

  /// Save button
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get createThread_save;

  /// Create/edit error message
  ///
  /// In en, this message translates to:
  /// **'Failed to create/edit discussion. Please check your connection.'**
  String get createThread_createError;

  /// General error message
  ///
  /// In en, this message translates to:
  /// **'Failed to create/edit discussion.'**
  String get createThread_generalError;

  /// Report action
  ///
  /// In en, this message translates to:
  /// **'Report'**
  String get threadDetail_report;

  /// Edit action
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get threadDetail_edit;

  /// Delete action
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get threadDetail_delete;

  /// Discussion reported message
  ///
  /// In en, this message translates to:
  /// **'Discussion reported'**
  String get threadDetail_reported;

  /// Connection error message
  ///
  /// In en, this message translates to:
  /// **'Failed: Please check your connection and refresh the page.'**
  String get threadDetail_connectionError;

  /// Discussion unavailable message
  ///
  /// In en, this message translates to:
  /// **'Failed: This discussion is no longer available.'**
  String get threadDetail_unavailable;

  /// Delete error message
  ///
  /// In en, this message translates to:
  /// **'Failed to delete discussion.'**
  String get threadDetail_deleteError;

  /// Thread details label
  ///
  /// In en, this message translates to:
  /// **'Thread Details'**
  String get threadDetail_threadDetails;

  /// Creator label
  ///
  /// In en, this message translates to:
  /// **'Creator: '**
  String get threadDetail_creator;

  /// Content label
  ///
  /// In en, this message translates to:
  /// **'Content:'**
  String get threadDetail_content;

  /// Tags label
  ///
  /// In en, this message translates to:
  /// **'Tags:'**
  String get threadDetail_tags;

  /// Created date
  ///
  /// In en, this message translates to:
  /// **'Created: {date}'**
  String threadDetail_created(String date);

  /// Edited date
  ///
  /// In en, this message translates to:
  /// **'Edited: {date}'**
  String threadDetail_edited(String date);

  /// Comments label
  ///
  /// In en, this message translates to:
  /// **'Comments'**
  String get threadDetail_comments;

  /// Add comment placeholder
  ///
  /// In en, this message translates to:
  /// **'Add a comment…'**
  String get threadDetail_addComment;

  /// Comment required validation
  ///
  /// In en, this message translates to:
  /// **'Please enter a comment'**
  String get threadDetail_commentRequired;

  /// Delete comment error
  ///
  /// In en, this message translates to:
  /// **'Failed to delete comment.'**
  String get threadDetail_deleteCommentError;

  /// Mentorship page title
  ///
  /// In en, this message translates to:
  /// **'Mentorship'**
  String get mentorshipPage_title;

  /// Login required message
  ///
  /// In en, this message translates to:
  /// **'Please log in to access mentorship features.'**
  String get mentorshipPage_loginRequired;

  /// Mentor screen title
  ///
  /// In en, this message translates to:
  /// **'Mentorship'**
  String get mentorScreen_title;

  /// Current mentees tab
  ///
  /// In en, this message translates to:
  /// **'Current Mentees'**
  String get mentorScreen_currentMentees;

  /// Requests tab
  ///
  /// In en, this message translates to:
  /// **'Requests'**
  String get mentorScreen_requests;

  /// Current capacity label
  ///
  /// In en, this message translates to:
  /// **'Current Capacity: {capacity}'**
  String mentorScreen_currentCapacity(int capacity);

  /// Update capacity button
  ///
  /// In en, this message translates to:
  /// **'Update Capacity'**
  String get mentorScreen_updateCapacity;

  /// No current mentees message
  ///
  /// In en, this message translates to:
  /// **'No current mentees'**
  String get mentorScreen_noCurrentMentees;

  /// No pending requests message
  ///
  /// In en, this message translates to:
  /// **'No pending requests'**
  String get mentorScreen_noPendingRequests;

  /// Capacity updated message
  ///
  /// In en, this message translates to:
  /// **'Capacity updated successfully'**
  String get mentorScreen_capacityUpdated;

  /// Request accepted message
  ///
  /// In en, this message translates to:
  /// **'Request accepted'**
  String get mentorScreen_requestAccepted;

  /// Request rejected message
  ///
  /// In en, this message translates to:
  /// **'Request rejected'**
  String get mentorScreen_requestRejected;

  /// Mentorship completed message
  ///
  /// In en, this message translates to:
  /// **'Mentorship completed successfully'**
  String get mentorScreen_mentorshipCompleted;

  /// Mentorship cancelled message
  ///
  /// In en, this message translates to:
  /// **'Mentorship cancelled successfully'**
  String get mentorScreen_mentorshipCancelled;

  /// Open chat message
  ///
  /// In en, this message translates to:
  /// **'Open chat with {menteeName}'**
  String mentorScreen_openChat(String menteeName);

  /// Update capacity dialog title
  ///
  /// In en, this message translates to:
  /// **'Update Maximum Mentee Capacity'**
  String get mentorScreen_updateCapacityTitle;

  /// Max mentees label
  ///
  /// In en, this message translates to:
  /// **'Maximum number of mentees'**
  String get mentorScreen_maxMentees;

  /// Enter number hint
  ///
  /// In en, this message translates to:
  /// **'Enter a number'**
  String get mentorScreen_enterNumber;

  /// Cancel button
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get mentorScreen_cancel;

  /// Update button
  ///
  /// In en, this message translates to:
  /// **'Update'**
  String get mentorScreen_update;

  /// Complete mentorship dialog title
  ///
  /// In en, this message translates to:
  /// **'complete Mentorship'**
  String get mentorScreen_completeMentorship;

  /// Cancel mentorship dialog title
  ///
  /// In en, this message translates to:
  /// **'cancel Mentorship'**
  String get mentorScreen_cancelMentorship;

  /// Confirm complete message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to complete your mentorship with {menteeName}?\n\nThis will mark the mentorship as successfully completed.'**
  String mentorScreen_confirmComplete(String menteeName);

  /// Confirm cancel message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to cancel your mentorship with {menteeName}?\n\nThis will end the mentorship relationship.'**
  String mentorScreen_confirmCancel(String menteeName);

  /// Confirm button
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get mentorScreen_confirm;

  /// Find mentors tab
  ///
  /// In en, this message translates to:
  /// **'Find Mentors'**
  String get menteeScreen_findMentors;

  /// My mentorships tab
  ///
  /// In en, this message translates to:
  /// **'My Mentorships'**
  String get menteeScreen_myMentorships;

  /// Search mentors placeholder
  ///
  /// In en, this message translates to:
  /// **'Search mentors by name, role, company...'**
  String get menteeScreen_searchMentors;

  /// No mentors found message
  ///
  /// In en, this message translates to:
  /// **'No mentors found.'**
  String get menteeScreen_noMentorsFound;

  /// Error loading mentors
  ///
  /// In en, this message translates to:
  /// **'Error loading mentors: {error}'**
  String menteeScreen_errorLoadingMentors(String error);

  /// Retry loading mentors button
  ///
  /// In en, this message translates to:
  /// **'Retry Loading Mentors'**
  String get menteeScreen_retryLoadingMentors;

  /// Request mentorship dialog title
  ///
  /// In en, this message translates to:
  /// **'Request Mentorship from {mentorName}'**
  String menteeScreen_requestMentorshipTitle(String mentorName);

  /// Provide message text
  ///
  /// In en, this message translates to:
  /// **'Please provide a message for your mentorship request:'**
  String get menteeScreen_provideMessage;

  /// Message hint
  ///
  /// In en, this message translates to:
  /// **'I would like you to be my mentor because...'**
  String get menteeScreen_messageHint;

  /// Send request button
  ///
  /// In en, this message translates to:
  /// **'Send Request'**
  String get menteeScreen_sendRequest;

  /// Message min length validation
  ///
  /// In en, this message translates to:
  /// **'Please enter a message of at least 10 characters'**
  String get menteeScreen_messageMinLength;

  /// Request sent message
  ///
  /// In en, this message translates to:
  /// **'Mentorship requested for {mentorName}'**
  String menteeScreen_requestSent(String mentorName);

  /// Request error message
  ///
  /// In en, this message translates to:
  /// **'There is an error while requesting'**
  String get menteeScreen_requestError;

  /// Pending requests section
  ///
  /// In en, this message translates to:
  /// **'Pending Requests'**
  String get menteeScreen_pendingRequests;

  /// Active mentorships section
  ///
  /// In en, this message translates to:
  /// **'Active Mentorships'**
  String get menteeScreen_activeMentorships;

  /// No pending requests message
  ///
  /// In en, this message translates to:
  /// **'No pending requests.'**
  String get menteeScreen_noPendingRequests;

  /// No active mentorships message
  ///
  /// In en, this message translates to:
  /// **'No active mentorships.'**
  String get menteeScreen_noActiveMentorships;

  /// Error message
  ///
  /// In en, this message translates to:
  /// **'Error: {error}'**
  String menteeScreen_error(String error);

  /// Mentor profile title
  ///
  /// In en, this message translates to:
  /// **'Mentor Profile: {mentorName}'**
  String mentorProfile_title(String mentorName);

  /// Load error message
  ///
  /// In en, this message translates to:
  /// **'Failed to load mentor profile or reviews: {error}'**
  String mentorProfile_loadError(String error);

  /// No profile data message
  ///
  /// In en, this message translates to:
  /// **'No profile data available'**
  String get mentorProfile_noProfileData;

  /// Rate mentor tooltip
  ///
  /// In en, this message translates to:
  /// **'Rate this mentor'**
  String get mentorProfile_rateMentor;

  /// At company text
  ///
  /// In en, this message translates to:
  /// **'at {company}'**
  String mentorProfile_atCompany(String company);

  /// Rating label
  ///
  /// In en, this message translates to:
  /// **'Rating'**
  String get mentorProfile_rating;

  /// Reviews count
  ///
  /// In en, this message translates to:
  /// **'{count} reviews'**
  String mentorProfile_reviews(int count);

  /// Mentorship information label
  ///
  /// In en, this message translates to:
  /// **'Mentorship Information'**
  String get mentorProfile_mentorshipInfo;

  /// Capacity label
  ///
  /// In en, this message translates to:
  /// **'Capacity'**
  String get mentorProfile_capacity;

  /// Mentees count
  ///
  /// In en, this message translates to:
  /// **'{current}/{max} mentees'**
  String mentorProfile_mentees(int current, int max);

  /// Status label
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get mentorProfile_status;

  /// Available status
  ///
  /// In en, this message translates to:
  /// **'Available for mentorship'**
  String get mentorProfile_available;

  /// Not available status
  ///
  /// In en, this message translates to:
  /// **'Not available for mentorship'**
  String get mentorProfile_notAvailable;

  /// About label
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get mentorProfile_about;

  /// No reviews message
  ///
  /// In en, this message translates to:
  /// **'No reviews yet.'**
  String get mentorProfile_noReviews;

  /// Review by user
  ///
  /// In en, this message translates to:
  /// **'By: {username}'**
  String mentorProfile_byUser(String username);

  /// Rate dialog title
  ///
  /// In en, this message translates to:
  /// **'Rate {mentorName}'**
  String mentorProfile_rateTitle(String mentorName);

  /// Select rating text
  ///
  /// In en, this message translates to:
  /// **'Select a rating:'**
  String get mentorProfile_selectRating;

  /// Comment optional label
  ///
  /// In en, this message translates to:
  /// **'Comment (optional)'**
  String get mentorProfile_commentOptional;

  /// Submitting button text
  ///
  /// In en, this message translates to:
  /// **'Submitting...'**
  String get mentorProfile_submitting;

  /// Submit button
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get mentorProfile_submit;

  /// Select rating error
  ///
  /// In en, this message translates to:
  /// **'Please select a rating'**
  String get mentorProfile_selectRatingError;

  /// Rating submitted message
  ///
  /// In en, this message translates to:
  /// **'Rating submitted successfully'**
  String get mentorProfile_ratingSubmitted;

  /// Rating error message
  ///
  /// In en, this message translates to:
  /// **'Error submitting rating: {error}'**
  String mentorProfile_ratingError(String error);

  /// Direct message title
  ///
  /// In en, this message translates to:
  /// **'{mentorName}'**
  String directMessage_title(String mentorName);

  /// Attach file tooltip
  ///
  /// In en, this message translates to:
  /// **'Attach file'**
  String get directMessage_attachFile;

  /// Type message placeholder
  ///
  /// In en, this message translates to:
  /// **'Type a message...'**
  String get directMessage_typeMessage;

  /// Send message tooltip
  ///
  /// In en, this message translates to:
  /// **'Send message'**
  String get directMessage_sendMessage;

  /// File attachment not implemented message
  ///
  /// In en, this message translates to:
  /// **'File attachment not implemented yet.'**
  String get directMessage_fileNotImplemented;

  /// Create job screen title
  ///
  /// In en, this message translates to:
  /// **'Create New Job Posting'**
  String get createJob_title;

  /// Job details section title
  ///
  /// In en, this message translates to:
  /// **'Job Details'**
  String get createJob_jobDetails;

  /// Job title field label
  ///
  /// In en, this message translates to:
  /// **'Job Title'**
  String get createJob_jobTitle;

  /// Job title validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter a job title'**
  String get createJob_jobTitleRequired;

  /// Company field label
  ///
  /// In en, this message translates to:
  /// **'Company'**
  String get createJob_company;

  /// Company field hint
  ///
  /// In en, this message translates to:
  /// **'Your Company Name'**
  String get createJob_companyHint;

  /// Company validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter the company name'**
  String get createJob_companyRequired;

  /// Location field label
  ///
  /// In en, this message translates to:
  /// **'Location (e.g., City, State, Country)'**
  String get createJob_location;

  /// Location validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter a location'**
  String get createJob_locationRequired;

  /// Remote job checkbox label
  ///
  /// In en, this message translates to:
  /// **'Remote Job'**
  String get createJob_remoteJob;

  /// Description field label
  ///
  /// In en, this message translates to:
  /// **'Job Description'**
  String get createJob_description;

  /// Description validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter a job description'**
  String get createJob_descriptionRequired;

  /// Job type field label
  ///
  /// In en, this message translates to:
  /// **'Job Type'**
  String get createJob_jobType;

  /// Job type dropdown hint
  ///
  /// In en, this message translates to:
  /// **'Select Job Type'**
  String get createJob_selectJobType;

  /// Job type validation message
  ///
  /// In en, this message translates to:
  /// **'Please select a job type'**
  String get createJob_jobTypeRequired;

  /// Contact info field label
  ///
  /// In en, this message translates to:
  /// **'Contact Information (Email/Phone/Link)'**
  String get createJob_contactInfo;

  /// Contact info validation message
  ///
  /// In en, this message translates to:
  /// **'Please provide contact information'**
  String get createJob_contactInfoRequired;

  /// Min salary field label
  ///
  /// In en, this message translates to:
  /// **'Minimum Salary (Optional)'**
  String get createJob_minSalary;

  /// Min salary field hint
  ///
  /// In en, this message translates to:
  /// **'e.g., 50000'**
  String get createJob_minSalaryHint;

  /// Max salary field label
  ///
  /// In en, this message translates to:
  /// **'Maximum Salary (Optional)'**
  String get createJob_maxSalary;

  /// Max salary field hint
  ///
  /// In en, this message translates to:
  /// **'e.g., 70000'**
  String get createJob_maxSalaryHint;

  /// Number validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid number'**
  String get createJob_validNumber;

  /// Number format validation message
  ///
  /// In en, this message translates to:
  /// **'Invalid number format (too many decimal points)'**
  String get createJob_invalidFormat;

  /// Max salary validation message
  ///
  /// In en, this message translates to:
  /// **'Max salary must be >= min salary'**
  String get createJob_maxSalaryError;

  /// Ethical policies section title
  ///
  /// In en, this message translates to:
  /// **'Ethical Policies Compliance'**
  String get createJob_ethicalPolicies;

  /// Creating post button text
  ///
  /// In en, this message translates to:
  /// **'Creating Post...'**
  String get createJob_creatingPost;

  /// Create post button text
  ///
  /// In en, this message translates to:
  /// **'Create Job Post'**
  String get createJob_createPost;

  /// Job type selection error
  ///
  /// In en, this message translates to:
  /// **'Please select a job type.'**
  String get createJob_selectJobTypeError;

  /// Policy selection error
  ///
  /// In en, this message translates to:
  /// **'Please select at least one ethical policy.'**
  String get createJob_selectPolicyError;

  /// Employer verification error
  ///
  /// In en, this message translates to:
  /// **'Error: Could not verify employer account.'**
  String get createJob_employerError;

  /// Min salary format error
  ///
  /// In en, this message translates to:
  /// **'Invalid minimum salary format. Please enter numbers only.'**
  String get createJob_invalidMinSalary;

  /// Max salary format error
  ///
  /// In en, this message translates to:
  /// **'Invalid maximum salary format. Please enter numbers only.'**
  String get createJob_invalidMaxSalary;

  /// Salary range error
  ///
  /// In en, this message translates to:
  /// **'Minimum salary cannot be greater than maximum salary.'**
  String get createJob_salaryRangeError;

  /// Job creation success message
  ///
  /// In en, this message translates to:
  /// **'Job \"{jobTitle}\" created successfully!'**
  String createJob_success(String jobTitle);

  /// Job creation error message
  ///
  /// In en, this message translates to:
  /// **'Error creating job: {error}'**
  String createJob_error(String error);

  /// Job applications screen title
  ///
  /// In en, this message translates to:
  /// **'Job Applications'**
  String get jobApplications_title;

  /// User error message
  ///
  /// In en, this message translates to:
  /// **'User not logged in or user ID not found.'**
  String get jobApplications_userError;

  /// Load error message
  ///
  /// In en, this message translates to:
  /// **'Failed to load applications. Please try again.'**
  String get jobApplications_loadError;

  /// No applications message
  ///
  /// In en, this message translates to:
  /// **'No applications received for this job yet.'**
  String get jobApplications_noApplications;

  /// Applied date label
  ///
  /// In en, this message translates to:
  /// **'Applied: {date}'**
  String jobApplications_applied(String date);

  /// Feedback label
  ///
  /// In en, this message translates to:
  /// **'Feedback: {feedback}'**
  String jobApplications_feedback(String feedback);

  /// Reject button
  ///
  /// In en, this message translates to:
  /// **'Reject'**
  String get jobApplications_reject;

  /// Approve button
  ///
  /// In en, this message translates to:
  /// **'Approve'**
  String get jobApplications_approve;

  /// Status updated message
  ///
  /// In en, this message translates to:
  /// **'Application {status}.'**
  String jobApplications_statusUpdated(String status);

  /// Update error message
  ///
  /// In en, this message translates to:
  /// **'Error updating status: {error}'**
  String jobApplications_updateError(String error);

  /// Feedback dialog title
  ///
  /// In en, this message translates to:
  /// **'Provide Feedback (Optional) for {action}'**
  String jobApplications_feedbackTitle(String action);

  /// Feedback input hint
  ///
  /// In en, this message translates to:
  /// **'Enter feedback here...'**
  String get jobApplications_feedbackHint;

  /// Submit button
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get jobApplications_submit;

  /// Filter dialog title
  ///
  /// In en, this message translates to:
  /// **'Filter Jobs'**
  String get jobFilter_title;

  /// Job title filter label
  ///
  /// In en, this message translates to:
  /// **'Job Title'**
  String get jobFilter_jobTitle;

  /// Job title filter hint
  ///
  /// In en, this message translates to:
  /// **'Enter job title prefix'**
  String get jobFilter_jobTitleHint;

  /// Company name filter label
  ///
  /// In en, this message translates to:
  /// **'Company Name'**
  String get jobFilter_companyName;

  /// Company name filter hint
  ///
  /// In en, this message translates to:
  /// **'Enter company name prefix'**
  String get jobFilter_companyNameHint;

  /// Ethical policies filter section
  ///
  /// In en, this message translates to:
  /// **'Ethical Policies'**
  String get jobFilter_ethicalPolicies;

  /// Min salary filter label
  ///
  /// In en, this message translates to:
  /// **'Min Salary'**
  String get jobFilter_minSalary;

  /// Min salary filter hint
  ///
  /// In en, this message translates to:
  /// **'e.g., 30000'**
  String get jobFilter_minSalaryHint;

  /// Max salary filter label
  ///
  /// In en, this message translates to:
  /// **'Max Salary'**
  String get jobFilter_maxSalary;

  /// Max salary filter hint
  ///
  /// In en, this message translates to:
  /// **'e.g., 100000'**
  String get jobFilter_maxSalaryHint;

  /// Remote jobs filter label
  ///
  /// In en, this message translates to:
  /// **'Remote Jobs Only'**
  String get jobFilter_remoteOnly;

  /// Job type filter section
  ///
  /// In en, this message translates to:
  /// **'Job Type'**
  String get jobFilter_jobType;

  /// Clear all button
  ///
  /// In en, this message translates to:
  /// **'Clear All'**
  String get jobFilter_clearAll;

  /// Apply filters button
  ///
  /// In en, this message translates to:
  /// **'Apply Filters'**
  String get jobFilter_applyFilters;

  /// My applications screen title
  ///
  /// In en, this message translates to:
  /// **'My Job Applications'**
  String get myApplications_title;

  /// User error message
  ///
  /// In en, this message translates to:
  /// **'Error: User not found. Cannot load applications.'**
  String get myApplications_userError;

  /// Load error message
  ///
  /// In en, this message translates to:
  /// **'Failed to load applications. Please try again.'**
  String get myApplications_loadError;

  /// No applications message
  ///
  /// In en, this message translates to:
  /// **'You have not applied to any jobs yet.'**
  String get myApplications_noApplications;

  /// Applied date label
  ///
  /// In en, this message translates to:
  /// **'Applied: {date}'**
  String myApplications_applied(String date);

  /// Feedback label
  ///
  /// In en, this message translates to:
  /// **'Feedback: {feedback}'**
  String myApplications_feedback(String feedback);

  /// Feedback dialog title
  ///
  /// In en, this message translates to:
  /// **'Feedback for {jobTitle}'**
  String myApplications_feedbackTitle(String jobTitle);

  /// Close button
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get myApplications_close;

  /// Workplaces screen title
  ///
  /// In en, this message translates to:
  /// **'Workplaces'**
  String get workplaces_title;

  /// Reviews count
  ///
  /// In en, this message translates to:
  /// **'{count} reviews'**
  String workplaces_reviews(int count);

  /// Edit profile screen title
  ///
  /// In en, this message translates to:
  /// **'Edit Profile'**
  String get editProfile_title;

  /// Save changes tooltip
  ///
  /// In en, this message translates to:
  /// **'Save changes'**
  String get editProfile_saveChanges;

  /// Personal information section
  ///
  /// In en, this message translates to:
  /// **'Personal Information'**
  String get editProfile_personalInfo;

  /// Full name field label
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get editProfile_fullName;

  /// Bio field label
  ///
  /// In en, this message translates to:
  /// **'Bio'**
  String get editProfile_bio;

  /// Location field label
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get editProfile_location;

  /// Phone field label
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get editProfile_phone;

  /// Occupation field label
  ///
  /// In en, this message translates to:
  /// **'Occupation'**
  String get editProfile_occupation;

  /// Account information section
  ///
  /// In en, this message translates to:
  /// **'Account Information'**
  String get editProfile_accountInfo;

  /// Username field label
  ///
  /// In en, this message translates to:
  /// **'Username'**
  String get editProfile_username;

  /// Email field label
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get editProfile_email;

  /// Work experience section
  ///
  /// In en, this message translates to:
  /// **'Work Experience'**
  String get editProfile_workExperience;

  /// Education section
  ///
  /// In en, this message translates to:
  /// **'Education'**
  String get editProfile_education;

  /// Add work experience button
  ///
  /// In en, this message translates to:
  /// **'Add Work Experience'**
  String get editProfile_addWorkExperience;

  /// Add education button
  ///
  /// In en, this message translates to:
  /// **'Add Education'**
  String get editProfile_addEducation;

  /// User profile screen title
  ///
  /// In en, this message translates to:
  /// **'User Profile'**
  String get userProfile_title;

  /// Load error message
  ///
  /// In en, this message translates to:
  /// **'Failed to load user profile'**
  String get userProfile_loadError;

  /// Try again button
  ///
  /// In en, this message translates to:
  /// **'Try Again'**
  String get userProfile_tryAgain;

  /// Work experience section
  ///
  /// In en, this message translates to:
  /// **'Work Experience'**
  String get userProfile_workExperience;

  /// Education section
  ///
  /// In en, this message translates to:
  /// **'Education'**
  String get userProfile_education;

  /// No work experience message
  ///
  /// In en, this message translates to:
  /// **'No work experience added yet'**
  String get userProfile_noWorkExperience;

  /// No education message
  ///
  /// In en, this message translates to:
  /// **'No education added yet'**
  String get userProfile_noEducation;

  /// Skills section title
  ///
  /// In en, this message translates to:
  /// **'Skills'**
  String get userProfile_skills;

  /// Interests section title
  ///
  /// In en, this message translates to:
  /// **'Interests'**
  String get userProfile_interests;

  /// Username label
  ///
  /// In en, this message translates to:
  /// **'Username: {username}'**
  String profilePage_username(String username);

  /// Email label
  ///
  /// In en, this message translates to:
  /// **'Email: {email}'**
  String profilePage_email(String email);

  /// Skills section title
  ///
  /// In en, this message translates to:
  /// **'Skills'**
  String get profilePage_skills;

  /// No skills message
  ///
  /// In en, this message translates to:
  /// **'No skills added yet.'**
  String get profilePage_noSkills;

  /// Add skill dialog title
  ///
  /// In en, this message translates to:
  /// **'Add Skill'**
  String get profilePage_addSkill;

  /// Add skill dialog hint
  ///
  /// In en, this message translates to:
  /// **'Enter a skill'**
  String get profilePage_enterSkill;

  /// Interests section title
  ///
  /// In en, this message translates to:
  /// **'Interests'**
  String get profilePage_interests;

  /// No interests message
  ///
  /// In en, this message translates to:
  /// **'No interests added yet.'**
  String get profilePage_noInterests;

  /// Add interest dialog title
  ///
  /// In en, this message translates to:
  /// **'Add Interest'**
  String get profilePage_addInterest;

  /// Add interest dialog hint
  ///
  /// In en, this message translates to:
  /// **'Enter an interest'**
  String get profilePage_enterInterest;

  /// Theme section title
  ///
  /// In en, this message translates to:
  /// **'Theme'**
  String get profilePage_theme;

  /// Light theme option
  ///
  /// In en, this message translates to:
  /// **'Light'**
  String get profilePage_lightMode;

  /// Dark theme option
  ///
  /// In en, this message translates to:
  /// **'Dark'**
  String get profilePage_darkMode;

  /// System theme option
  ///
  /// In en, this message translates to:
  /// **'System'**
  String get profilePage_systemMode;

  /// Theme change notification
  ///
  /// In en, this message translates to:
  /// **'Theme changed to {theme}'**
  String profilePage_themeChanged(String theme);

  /// Font size section title
  ///
  /// In en, this message translates to:
  /// **'Font Size'**
  String get profilePage_fontSize;

  /// Small font size option
  ///
  /// In en, this message translates to:
  /// **'Small'**
  String get profilePage_small;

  /// Medium font size option
  ///
  /// In en, this message translates to:
  /// **'Medium'**
  String get profilePage_medium;

  /// Large font size option
  ///
  /// In en, this message translates to:
  /// **'Large'**
  String get profilePage_large;

  /// Language section title
  ///
  /// In en, this message translates to:
  /// **'Language / Dil / اللغة'**
  String get profilePage_language;

  /// Education section title
  ///
  /// In en, this message translates to:
  /// **'Education'**
  String get profileWidgets_education;

  /// Add button
  ///
  /// In en, this message translates to:
  /// **'Add'**
  String get profileWidgets_add;

  /// No education message
  ///
  /// In en, this message translates to:
  /// **'No education history added yet.'**
  String get profileWidgets_noEducation;

  /// Delete education dialog title
  ///
  /// In en, this message translates to:
  /// **'Delete Education'**
  String get profileWidgets_deleteEducation;

  /// Delete education confirmation
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete your education at {school}?'**
  String profileWidgets_confirmDeleteEducation(String school);

  /// Cancel button
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get profileWidgets_cancel;

  /// Delete button
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get profileWidgets_delete;

  /// Work experience section title
  ///
  /// In en, this message translates to:
  /// **'Work Experience'**
  String get profileWidgets_workExperience;

  /// No work experience message
  ///
  /// In en, this message translates to:
  /// **'No work experience added yet.'**
  String get profileWidgets_noWorkExperience;

  /// Delete experience dialog title
  ///
  /// In en, this message translates to:
  /// **'Delete Experience'**
  String get profileWidgets_deleteExperience;

  /// Delete experience confirmation
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete your experience at {company}?'**
  String profileWidgets_confirmDeleteExperience(String company);

  /// Add education dialog title
  ///
  /// In en, this message translates to:
  /// **'Add Education'**
  String get educationDialog_addTitle;

  /// Edit education dialog title
  ///
  /// In en, this message translates to:
  /// **'Edit Education'**
  String get educationDialog_editTitle;

  /// School field label
  ///
  /// In en, this message translates to:
  /// **'School/University'**
  String get educationDialog_school;

  /// School validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter a school name'**
  String get educationDialog_schoolRequired;

  /// Degree field label
  ///
  /// In en, this message translates to:
  /// **'Degree'**
  String get educationDialog_degree;

  /// Degree validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter a degree'**
  String get educationDialog_degreeRequired;

  /// Field of study label
  ///
  /// In en, this message translates to:
  /// **'Field of Study'**
  String get educationDialog_field;

  /// Field validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter a field of study'**
  String get educationDialog_fieldRequired;

  /// Start date field label
  ///
  /// In en, this message translates to:
  /// **'Start Date (MM/YYYY)'**
  String get educationDialog_startDate;

  /// Start date validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter a start date'**
  String get educationDialog_startDateRequired;

  /// Currently studying checkbox
  ///
  /// In en, this message translates to:
  /// **'I am currently studying here'**
  String get educationDialog_currentlyStudying;

  /// End date field label
  ///
  /// In en, this message translates to:
  /// **'End Date (MM/YYYY)'**
  String get educationDialog_endDate;

  /// End date validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter an end date'**
  String get educationDialog_endDateRequired;

  /// Save button
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get educationDialog_save;

  /// Add work experience dialog title
  ///
  /// In en, this message translates to:
  /// **'Add Work Experience'**
  String get workExperienceDialog_addTitle;

  /// Edit work experience dialog title
  ///
  /// In en, this message translates to:
  /// **'Edit Work Experience'**
  String get workExperienceDialog_editTitle;

  /// Company field label
  ///
  /// In en, this message translates to:
  /// **'Company'**
  String get workExperienceDialog_company;

  /// Company validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter a company name'**
  String get workExperienceDialog_companyRequired;

  /// Position field label
  ///
  /// In en, this message translates to:
  /// **'Position'**
  String get workExperienceDialog_position;

  /// Position validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter a position'**
  String get workExperienceDialog_positionRequired;

  /// Start date field label
  ///
  /// In en, this message translates to:
  /// **'Start Date (MM/YYYY)'**
  String get workExperienceDialog_startDate;

  /// Start date validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter a start date'**
  String get workExperienceDialog_startDateRequired;

  /// Currently working checkbox
  ///
  /// In en, this message translates to:
  /// **'I currently work here'**
  String get workExperienceDialog_currentlyWorking;

  /// End date field label
  ///
  /// In en, this message translates to:
  /// **'End Date (MM/YYYY)'**
  String get workExperienceDialog_endDate;

  /// End date validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter an end date'**
  String get workExperienceDialog_endDateRequired;

  /// Description field label
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get workExperienceDialog_description;

  /// Description validation message
  ///
  /// In en, this message translates to:
  /// **'Please enter a description'**
  String get workExperienceDialog_descriptionRequired;

  /// Save button
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get workExperienceDialog_save;

  /// Badges section title
  ///
  /// In en, this message translates to:
  /// **'Achievements & Badges'**
  String get badges_title;

  /// No badges message
  ///
  /// In en, this message translates to:
  /// **'No badges earned yet.'**
  String get badges_noBadges;

  /// Earned date label
  ///
  /// In en, this message translates to:
  /// **'Earned {date}'**
  String badges_earned(String date);

  /// Today label
  ///
  /// In en, this message translates to:
  /// **'today'**
  String get badges_today;

  /// Yesterday label
  ///
  /// In en, this message translates to:
  /// **'yesterday'**
  String get badges_yesterday;

  /// Days ago label
  ///
  /// In en, this message translates to:
  /// **'{days} days ago'**
  String badges_daysAgo(int days);

  /// Months ago label
  ///
  /// In en, this message translates to:
  /// **'{months} {monthText} ago'**
  String badges_monthsAgo(int months, String monthText);

  /// Years ago label
  ///
  /// In en, this message translates to:
  /// **'{years} {yearText} ago'**
  String badges_yearsAgo(int years, String yearText);

  /// Month singular
  ///
  /// In en, this message translates to:
  /// **'month'**
  String get badges_month;

  /// Month plural
  ///
  /// In en, this message translates to:
  /// **'months'**
  String get badges_months;

  /// Year singular
  ///
  /// In en, this message translates to:
  /// **'year'**
  String get badges_year;

  /// Year plural
  ///
  /// In en, this message translates to:
  /// **'years'**
  String get badges_years;

  /// Not specified message
  ///
  /// In en, this message translates to:
  /// **'Not specified'**
  String get common_notSpecified;

  /// Up to amount
  ///
  /// In en, this message translates to:
  /// **'Up to {amount}'**
  String common_upTo(String amount);

  /// From amount
  ///
  /// In en, this message translates to:
  /// **'From {amount}'**
  String common_from(String amount);

  /// Dark mode label
  ///
  /// In en, this message translates to:
  /// **'Dark Mode'**
  String get common_darkMode;

  /// Light mode label
  ///
  /// In en, this message translates to:
  /// **'Light Mode'**
  String get common_lightMode;

  /// Theme toggle label
  ///
  /// In en, this message translates to:
  /// **'Toggle Theme'**
  String get common_themeToggle;

  /// Dark mode icon label
  ///
  /// In en, this message translates to:
  /// **'Dark mode icon'**
  String get common_darkModeIcon;

  /// Light mode icon label
  ///
  /// In en, this message translates to:
  /// **'Light mode icon'**
  String get common_lightModeIcon;

  /// Back button tooltip
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get common_back;
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
