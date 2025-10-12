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

  @override
  String get careerStatusScreen_question =>
      'What is your current career status?';

  @override
  String get careerStatusScreen_student => 'Student';

  @override
  String get careerStatusScreen_recentGraduate => 'Recent Graduate';

  @override
  String get careerStatusScreen_midLevel => 'Mid-Level Professional';

  @override
  String get careerStatusScreen_senior => 'Senior Professional';

  @override
  String get careerStatusScreen_changingCareers => 'Changing Careers';

  @override
  String get organizationTypeScreen_question =>
      'What type of organization do you represent?';

  @override
  String get organizationTypeScreen_company => 'Company';

  @override
  String get organizationTypeScreen_startup => 'Startup';

  @override
  String get organizationTypeScreen_nonprofit => 'Non-profit';

  @override
  String get organizationTypeScreen_freelancer =>
      'Freelancer hiring for a project';

  @override
  String get organizationTypeScreen_other => 'Other';

  @override
  String get organizationTypeScreen_pleaseSpecify => 'Please specify';

  @override
  String get jobPrioritiesScreen_question =>
      'What are your top priorities when looking for a job?';

  @override
  String get jobPrioritiesScreen_selectAll => 'Select all that apply';

  @override
  String get jobPrioritiesScreen_fairWages => 'Fair Wages';

  @override
  String get jobPrioritiesScreen_fairWagesDesc =>
      'Companies that pay living wages and maintain transparent compensation practices';

  @override
  String get jobPrioritiesScreen_inclusive => 'Inclusive Workplace';

  @override
  String get jobPrioritiesScreen_inclusiveDesc =>
      'Organizations committed to diversity, equity, and inclusion';

  @override
  String get jobPrioritiesScreen_sustainability =>
      'Sustainability/Environmental Policies';

  @override
  String get jobPrioritiesScreen_sustainabilityDesc =>
      'Companies with strong environmental commitments and practices';

  @override
  String get jobPrioritiesScreen_workLife => 'Work-Life Balance';

  @override
  String get jobPrioritiesScreen_workLifeDesc =>
      'Respectful of personal time with flexible scheduling options';

  @override
  String get jobPrioritiesScreen_remote => 'Remote-Friendly';

  @override
  String get jobPrioritiesScreen_remoteDesc =>
      'Options for remote work and flexible location';

  @override
  String get jobPrioritiesScreen_growth => 'Career Growth Opportunities';

  @override
  String get jobPrioritiesScreen_growthDesc =>
      'Clear paths for advancement and professional development';

  @override
  String get companyPoliciesScreen_question =>
      'Which ethical policies does your company follow?';

  @override
  String get companyPoliciesScreen_fairWage => 'Fair wage commitment';

  @override
  String get companyPoliciesScreen_fairWageDesc =>
      'Ensuring competitive compensation and transparent pay practices';

  @override
  String get companyPoliciesScreen_diversity => 'Diversity & inclusion policy';

  @override
  String get companyPoliciesScreen_diversityDesc =>
      'Promoting an inclusive workplace with equal opportunities';

  @override
  String get companyPoliciesScreen_wellbeing => 'Employee well-being programs';

  @override
  String get companyPoliciesScreen_wellbeingDesc =>
      'Supporting mental health, work-life balance, and personal growth';

  @override
  String get companyPoliciesScreen_remotePolicy => 'Remote-friendly culture';

  @override
  String get companyPoliciesScreen_remotePolicyDesc =>
      'Offering flexible work arrangements and remote options';

  @override
  String get companyPoliciesScreen_sustainabilityPolicy =>
      'Sustainability/environmental goals';

  @override
  String get companyPoliciesScreen_sustainabilityPolicyDesc =>
      'Implementing eco-friendly practices and reducing environmental impact';

  @override
  String get industrySelectionScreen_question =>
      'Which industries are you most interested in?';

  @override
  String get industrySelectionScreen_tech => 'Tech';

  @override
  String get industrySelectionScreen_healthcare => 'Healthcare';

  @override
  String get industrySelectionScreen_education => 'Education';

  @override
  String get industrySelectionScreen_finance => 'Finance';

  @override
  String get industrySelectionScreen_creativeArts => 'Creative Arts';

  @override
  String get mentorshipSelectionScreen_question =>
      'Would you like to participate in our mentorship system?';

  @override
  String get mentorshipSelectionScreen_subtitle =>
      'You can connect with others to either receive or provide career guidance.';

  @override
  String get mentorshipSelectionScreen_beMentor => 'I want to be a mentor';

  @override
  String get mentorshipSelectionScreen_beMentorDesc =>
      'Help others improve their resumes and careers';

  @override
  String get mentorshipSelectionScreen_lookingForMentor =>
      'I\'m looking for a mentor (mentee)';

  @override
  String get mentorshipSelectionScreen_lookingForMentorDesc =>
      'Get feedback and guidance to grow professionally';

  @override
  String get mentorshipSelectionScreen_maxMentees =>
      'How many mentees are you willing to take?';

  @override
  String get mentorshipSelectionScreen_maxMenteesLabel =>
      'Max Mentee Count (1-20)';

  @override
  String get mentorshipSelectionScreen_enterNumber => 'Please enter a number';

  @override
  String get mentorshipSelectionScreen_validNumber =>
      'Please enter a valid number';

  @override
  String get mentorshipSelectionScreen_greaterThanZero =>
      'Must be greater than 0';

  @override
  String get mentorshipSelectionScreen_lessThan21 => 'Must be less than 21';

  @override
  String get jobPage_title => 'Jobs';

  @override
  String get jobPage_search => 'Search jobs...';

  @override
  String get jobPage_filter => 'Filter';

  @override
  String get jobPage_createJob => 'Create Job Post';

  @override
  String get jobPage_myApplications => 'My Applications';

  @override
  String get jobPage_viewApplications => 'View Applications';

  @override
  String get jobPage_noJobs => 'No jobs found';

  @override
  String get jobPage_loadError => 'Failed to load jobs. Please try again.';

  @override
  String get jobPage_posted => 'Posted';

  @override
  String get jobPage_remote => 'Remote';

  @override
  String get jobPage_yourPostedJobs => 'Your Posted Jobs';

  @override
  String get jobPage_noPostedJobs => 'You have not posted any jobs yet.';

  @override
  String get jobDetails_title => 'Job Details';

  @override
  String get jobDetails_apply => 'Apply Now';

  @override
  String get jobDetails_loadError =>
      'Failed to load job details. Please try again.';

  @override
  String get jobDetails_applyError => 'Error: Could not identify user.';

  @override
  String jobDetails_applySuccess(String jobTitle) {
    return 'Successfully applied to $jobTitle';
  }

  @override
  String get jobDetails_company => 'Company';

  @override
  String get jobDetails_location => 'Location';

  @override
  String get jobDetails_salary => 'Salary';

  @override
  String get jobDetails_description => 'Description';

  @override
  String get jobDetails_requirements => 'Requirements';

  @override
  String get jobDetails_ethicalTags => 'Ethical Tags';

  @override
  String get jobDetails_notFound => 'Job details not found.';

  @override
  String get jobDetails_noTags => 'No specific tags listed.';

  @override
  String get jobDetails_salaryRange => 'Salary Range';

  @override
  String get jobDetails_contactInfo => 'Contact Information';

  @override
  String get jobDetails_applying => 'Applying...';

  @override
  String get forumPage_title => 'Forum';

  @override
  String get forumPage_loadError =>
      'Failed to load Forum: Please check your connection and try again.';

  @override
  String get forumPage_noDiscussions => 'No discussions yet';

  @override
  String get forumPage_filter => 'Filter';

  @override
  String get forumPage_searchTags => 'Search tags';

  @override
  String get forumPage_reset => 'Reset';

  @override
  String get createThread_newTitle => 'New Discussion';

  @override
  String get createThread_editTitle => 'Edit Discussion';

  @override
  String get createThread_titleLabel => 'Title';

  @override
  String get createThread_titleRequired => 'Please enter a title';

  @override
  String get createThread_titleMaxLength =>
      'Title must be at most 100 characters';

  @override
  String get createThread_bodyLabel => 'What\'s on your mind?';

  @override
  String get createThread_bodyRequired => 'Please enter content';

  @override
  String get createThread_tags => 'Tags';

  @override
  String get createThread_selectTags => 'Select Tags';

  @override
  String get createThread_suggestTags => 'Suggest Tags';

  @override
  String get createThread_enterTitleForSuggestions =>
      'Please enter a title to get tag suggestions.';

  @override
  String get createThread_addNewTag => 'Add a new tag';

  @override
  String get createThread_tagEmpty => 'Tag name cannot be empty.';

  @override
  String get createThread_tagMaxLength =>
      'Tag name must be at most 255 characters.';

  @override
  String get createThread_done => 'Done';

  @override
  String get createThread_post => 'Post';

  @override
  String get createThread_save => 'Save';

  @override
  String get createThread_createError =>
      'Failed to create/edit discussion. Please check your connection.';

  @override
  String get createThread_generalError => 'Failed to create/edit discussion.';

  @override
  String get threadDetail_report => 'Report';

  @override
  String get threadDetail_edit => 'Edit';

  @override
  String get threadDetail_delete => 'Delete';

  @override
  String get threadDetail_reported => 'Discussion reported';

  @override
  String get threadDetail_connectionError =>
      'Failed: Please check your connection and refresh the page.';

  @override
  String get threadDetail_unavailable =>
      'Failed: This discussion is no longer available.';

  @override
  String get threadDetail_deleteError => 'Failed to delete discussion.';

  @override
  String get threadDetail_threadDetails => 'Thread Details';

  @override
  String get threadDetail_creator => 'Creator: ';

  @override
  String get threadDetail_content => 'Content:';

  @override
  String get threadDetail_tags => 'Tags:';

  @override
  String threadDetail_created(String date) {
    return 'Created: $date';
  }

  @override
  String threadDetail_edited(String date) {
    return 'Edited: $date';
  }

  @override
  String get threadDetail_comments => 'Comments';

  @override
  String get threadDetail_addComment => 'Add a comment…';

  @override
  String get threadDetail_commentRequired => 'Please enter a comment';

  @override
  String get threadDetail_deleteCommentError => 'Failed to delete comment.';

  @override
  String get common_notSpecified => 'Not specified';

  @override
  String common_upTo(String amount) {
    return 'Up to $amount';
  }

  @override
  String common_from(String amount) {
    return 'From $amount';
  }
}
