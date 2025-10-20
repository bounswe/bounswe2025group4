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
  String get signUpScreen_passwordNoUppercase =>
      'Password must contain at least 1 uppercase letter';

  @override
  String get signUpScreen_passwordNoLowercase =>
      'Password must contain at least 1 lowercase letter';

  @override
  String get signUpScreen_passwordNoNumber =>
      'Password must contain at least 1 number';

  @override
  String get signUpScreen_passwordNoSpecialChar =>
      'Password must contain at least 1 special character.';

  @override
  String get signUpScreen_confirmPasswordRequired =>
      'Please confirm your password';

  @override
  String get signUpScreen_passwordsDoNotMatch => 'Passwords do not match';

  @override
  String get signUpScreen_gender => 'Gender';

  @override
  String get signUpScreen_male => 'Male';

  @override
  String get signUpScreen_female => 'Female';

  @override
  String get signUpScreen_other => 'Other';

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
  String get mentorshipPage_title => 'Mentorship';

  @override
  String get mentorshipPage_loginRequired =>
      'Please log in to access mentorship features.';

  @override
  String get mentorScreen_title => 'Mentorship';

  @override
  String get mentorScreen_currentMentees => 'Current Mentees';

  @override
  String get mentorScreen_requests => 'Requests';

  @override
  String mentorScreen_currentCapacity(int capacity) {
    return 'Current Capacity: $capacity';
  }

  @override
  String get mentorScreen_updateCapacity => 'Update Capacity';

  @override
  String get mentorScreen_noCurrentMentees => 'No current mentees';

  @override
  String get mentorScreen_noPendingRequests => 'No pending requests';

  @override
  String get mentorScreen_capacityUpdated => 'Capacity updated successfully';

  @override
  String get mentorScreen_requestAccepted => 'Request accepted';

  @override
  String get mentorScreen_requestRejected => 'Request rejected';

  @override
  String get mentorScreen_mentorshipCompleted =>
      'Mentorship completed successfully';

  @override
  String get mentorScreen_mentorshipCancelled =>
      'Mentorship cancelled successfully';

  @override
  String mentorScreen_openChat(String menteeName) {
    return 'Open chat with $menteeName';
  }

  @override
  String get mentorScreen_updateCapacityTitle =>
      'Update Maximum Mentee Capacity';

  @override
  String get mentorScreen_maxMentees => 'Maximum number of mentees';

  @override
  String get mentorScreen_enterNumber => 'Enter a number';

  @override
  String get mentorScreen_cancel => 'Cancel';

  @override
  String get mentorScreen_update => 'Update';

  @override
  String get mentorScreen_completeMentorship => 'complete Mentorship';

  @override
  String get mentorScreen_cancelMentorship => 'cancel Mentorship';

  @override
  String mentorScreen_confirmComplete(String menteeName) {
    return 'Are you sure you want to complete your mentorship with $menteeName?\n\nThis will mark the mentorship as successfully completed.';
  }

  @override
  String mentorScreen_confirmCancel(String menteeName) {
    return 'Are you sure you want to cancel your mentorship with $menteeName?\n\nThis will end the mentorship relationship.';
  }

  @override
  String get mentorScreen_confirm => 'Confirm';

  @override
  String get menteeScreen_findMentors => 'Find Mentors';

  @override
  String get menteeScreen_myMentorships => 'My Mentorships';

  @override
  String get menteeScreen_searchMentors =>
      'Search mentors by name, role, company...';

  @override
  String get menteeScreen_noMentorsFound => 'No mentors found.';

  @override
  String menteeScreen_errorLoadingMentors(String error) {
    return 'Error loading mentors: $error';
  }

  @override
  String get menteeScreen_retryLoadingMentors => 'Retry Loading Mentors';

  @override
  String menteeScreen_requestMentorshipTitle(String mentorName) {
    return 'Request Mentorship from $mentorName';
  }

  @override
  String get menteeScreen_provideMessage =>
      'Please provide a message for your mentorship request:';

  @override
  String get menteeScreen_messageHint =>
      'I would like you to be my mentor because...';

  @override
  String get menteeScreen_sendRequest => 'Send Request';

  @override
  String get menteeScreen_messageMinLength =>
      'Please enter a message of at least 10 characters';

  @override
  String menteeScreen_requestSent(String mentorName) {
    return 'Mentorship requested for $mentorName';
  }

  @override
  String get menteeScreen_requestError => 'There is an error while requesting';

  @override
  String get menteeScreen_pendingRequests => 'Pending Requests';

  @override
  String get menteeScreen_activeMentorships => 'Active Mentorships';

  @override
  String get menteeScreen_noPendingRequests => 'No pending requests.';

  @override
  String get menteeScreen_noActiveMentorships => 'No active mentorships.';

  @override
  String menteeScreen_error(String error) {
    return 'Error: $error';
  }

  @override
  String mentorProfile_title(String mentorName) {
    return 'Mentor Profile: $mentorName';
  }

  @override
  String mentorProfile_loadError(String error) {
    return 'Failed to load mentor profile or reviews: $error';
  }

  @override
  String get mentorProfile_noProfileData => 'No profile data available';

  @override
  String get mentorProfile_rateMentor => 'Rate this mentor';

  @override
  String mentorProfile_atCompany(String company) {
    return 'at $company';
  }

  @override
  String get mentorProfile_rating => 'Rating';

  @override
  String mentorProfile_reviews(int count) {
    return '$count reviews';
  }

  @override
  String get mentorProfile_mentorshipInfo => 'Mentorship Information';

  @override
  String get mentorProfile_capacity => 'Capacity';

  @override
  String mentorProfile_mentees(int current, int max) {
    return '$current/$max mentees';
  }

  @override
  String get mentorProfile_status => 'Status';

  @override
  String get mentorProfile_available => 'Available for mentorship';

  @override
  String get mentorProfile_notAvailable => 'Not available for mentorship';

  @override
  String get mentorProfile_about => 'About';

  @override
  String get mentorProfile_noReviews => 'No reviews yet.';

  @override
  String mentorProfile_byUser(String username) {
    return 'By: $username';
  }

  @override
  String mentorProfile_rateTitle(String mentorName) {
    return 'Rate $mentorName';
  }

  @override
  String get mentorProfile_selectRating => 'Select a rating:';

  @override
  String get mentorProfile_commentOptional => 'Comment (optional)';

  @override
  String get mentorProfile_submitting => 'Submitting...';

  @override
  String get mentorProfile_submit => 'Submit';

  @override
  String get mentorProfile_selectRatingError => 'Please select a rating';

  @override
  String get mentorProfile_ratingSubmitted => 'Rating submitted successfully';

  @override
  String mentorProfile_ratingError(String error) {
    return 'Error submitting rating: $error';
  }

  @override
  String directMessage_title(String mentorName) {
    return '$mentorName';
  }

  @override
  String get directMessage_attachFile => 'Attach file';

  @override
  String get directMessage_typeMessage => 'Type a message...';

  @override
  String get directMessage_sendMessage => 'Send message';

  @override
  String get directMessage_fileNotImplemented =>
      'File attachment not implemented yet.';

  @override
  String get createJob_title => 'Create New Job Posting';

  @override
  String get createJob_jobDetails => 'Job Details';

  @override
  String get createJob_jobTitle => 'Job Title';

  @override
  String get createJob_jobTitleRequired => 'Please enter a job title';

  @override
  String get createJob_company => 'Company';

  @override
  String get createJob_companyHint => 'Your Company Name';

  @override
  String get createJob_companyRequired => 'Please enter the company name';

  @override
  String get createJob_location => 'Location (e.g., City, State, Country)';

  @override
  String get createJob_locationRequired => 'Please enter a location';

  @override
  String get createJob_remoteJob => 'Remote Job';

  @override
  String get createJob_description => 'Job Description';

  @override
  String get createJob_descriptionRequired => 'Please enter a job description';

  @override
  String get createJob_jobType => 'Job Type';

  @override
  String get createJob_selectJobType => 'Select Job Type';

  @override
  String get createJob_jobTypeRequired => 'Please select a job type';

  @override
  String get createJob_contactInfo => 'Contact Information (Email/Phone/Link)';

  @override
  String get createJob_contactInfoRequired =>
      'Please provide contact information';

  @override
  String get createJob_minSalary => 'Minimum Salary (Optional)';

  @override
  String get createJob_minSalaryHint => 'e.g., 50000';

  @override
  String get createJob_maxSalary => 'Maximum Salary (Optional)';

  @override
  String get createJob_maxSalaryHint => 'e.g., 70000';

  @override
  String get createJob_validNumber => 'Please enter a valid number';

  @override
  String get createJob_invalidFormat =>
      'Invalid number format (too many decimal points)';

  @override
  String get createJob_maxSalaryError => 'Max salary must be >= min salary';

  @override
  String get createJob_ethicalPolicies => 'Ethical Policies Compliance';

  @override
  String get createJob_creatingPost => 'Creating Post...';

  @override
  String get createJob_createPost => 'Create Job Post';

  @override
  String get createJob_selectJobTypeError => 'Please select a job type.';

  @override
  String get createJob_selectPolicyError =>
      'Please select at least one ethical policy.';

  @override
  String get createJob_employerError =>
      'Error: Could not verify employer account.';

  @override
  String get createJob_invalidMinSalary =>
      'Invalid minimum salary format. Please enter numbers only.';

  @override
  String get createJob_invalidMaxSalary =>
      'Invalid maximum salary format. Please enter numbers only.';

  @override
  String get createJob_salaryRangeError =>
      'Minimum salary cannot be greater than maximum salary.';

  @override
  String createJob_success(String jobTitle) {
    return 'Job \"$jobTitle\" created successfully!';
  }

  @override
  String createJob_error(String error) {
    return 'Error creating job: $error';
  }

  @override
  String get jobApplications_title => 'Job Applications';

  @override
  String get jobApplications_userError =>
      'User not logged in or user ID not found.';

  @override
  String get jobApplications_loadError =>
      'Failed to load applications. Please try again.';

  @override
  String get jobApplications_noApplications =>
      'No applications received for this job yet.';

  @override
  String jobApplications_applied(String date) {
    return 'Applied: $date';
  }

  @override
  String jobApplications_feedback(String feedback) {
    return 'Feedback: $feedback';
  }

  @override
  String get jobApplications_reject => 'Reject';

  @override
  String get jobApplications_approve => 'Approve';

  @override
  String jobApplications_statusUpdated(String status) {
    return 'Application $status.';
  }

  @override
  String jobApplications_updateError(String error) {
    return 'Error updating status: $error';
  }

  @override
  String jobApplications_feedbackTitle(String action) {
    return 'Provide Feedback (Optional) for $action';
  }

  @override
  String get jobApplications_feedbackHint => 'Enter feedback here...';

  @override
  String get jobApplications_submit => 'Submit';

  @override
  String get jobFilter_title => 'Filter Jobs';

  @override
  String get jobFilter_jobTitle => 'Job Title';

  @override
  String get jobFilter_jobTitleHint => 'Enter job title prefix';

  @override
  String get jobFilter_companyName => 'Company Name';

  @override
  String get jobFilter_companyNameHint => 'Enter company name prefix';

  @override
  String get jobFilter_ethicalPolicies => 'Ethical Policies';

  @override
  String get jobFilter_minSalary => 'Min Salary';

  @override
  String get jobFilter_minSalaryHint => 'e.g., 30000';

  @override
  String get jobFilter_maxSalary => 'Max Salary';

  @override
  String get jobFilter_maxSalaryHint => 'e.g., 100000';

  @override
  String get jobFilter_remoteOnly => 'Remote Jobs Only';

  @override
  String get jobFilter_jobType => 'Job Type';

  @override
  String get jobFilter_clearAll => 'Clear All';

  @override
  String get jobFilter_applyFilters => 'Apply Filters';

  @override
  String get myApplications_title => 'My Job Applications';

  @override
  String get myApplications_userError =>
      'Error: User not found. Cannot load applications.';

  @override
  String get myApplications_loadError =>
      'Failed to load applications. Please try again.';

  @override
  String get myApplications_noApplications =>
      'You have not applied to any jobs yet.';

  @override
  String myApplications_applied(String date) {
    return 'Applied: $date';
  }

  @override
  String myApplications_feedback(String feedback) {
    return 'Feedback: $feedback';
  }

  @override
  String myApplications_feedbackTitle(String jobTitle) {
    return 'Feedback for $jobTitle';
  }

  @override
  String get myApplications_close => 'Close';

  @override
  String get workplaces_title => 'Workplaces';

  @override
  String workplaces_reviews(int count) {
    return '$count reviews';
  }

  @override
  String get editProfile_title => 'Edit Profile';

  @override
  String get editProfile_saveChanges => 'Save changes';

  @override
  String get editProfile_personalInfo => 'Personal Information';

  @override
  String get editProfile_fullName => 'Full Name';

  @override
  String get editProfile_bio => 'Bio';

  @override
  String get editProfile_location => 'Location';

  @override
  String get editProfile_phone => 'Phone';

  @override
  String get editProfile_occupation => 'Occupation';

  @override
  String get editProfile_accountInfo => 'Account Information';

  @override
  String get editProfile_username => 'Username';

  @override
  String get editProfile_email => 'Email';

  @override
  String get editProfile_workExperience => 'Work Experience';

  @override
  String get editProfile_education => 'Education';

  @override
  String get editProfile_addWorkExperience => 'Add Work Experience';

  @override
  String get editProfile_addEducation => 'Add Education';

  @override
  String get userProfile_title => 'User Profile';

  @override
  String get userProfile_loadError => 'Failed to load user profile';

  @override
  String get userProfile_tryAgain => 'Try Again';

  @override
  String get userProfile_workExperience => 'Work Experience';

  @override
  String get userProfile_education => 'Education';

  @override
  String get userProfile_noWorkExperience => 'No work experience added yet';

  @override
  String get userProfile_noEducation => 'No education added yet';

  @override
  String get userProfile_skills => 'Skills';

  @override
  String get userProfile_interests => 'Interests';

  @override
  String profilePage_username(String username) {
    return 'Username: $username';
  }

  @override
  String profilePage_email(String email) {
    return 'Email: $email';
  }

  @override
  String get profilePage_skills => 'Skills';

  @override
  String get profilePage_noSkills => 'No skills added yet.';

  @override
  String get profilePage_addSkill => 'Add Skill';

  @override
  String get profilePage_enterSkill => 'Enter a skill';

  @override
  String get profilePage_interests => 'Interests';

  @override
  String get profilePage_noInterests => 'No interests added yet.';

  @override
  String get profilePage_addInterest => 'Add Interest';

  @override
  String get profilePage_enterInterest => 'Enter an interest';

  @override
  String get profilePage_theme => 'Theme';

  @override
  String get profilePage_lightMode => 'Light';

  @override
  String get profilePage_darkMode => 'Dark';

  @override
  String get profilePage_systemMode => 'System';

  @override
  String profilePage_themeChanged(String theme) {
    return 'Theme changed to $theme';
  }

  @override
  String get profilePage_fontSize => 'Font Size';

  @override
  String get profilePage_small => 'Small';

  @override
  String get profilePage_medium => 'Medium';

  @override
  String get profilePage_large => 'Large';

  @override
  String get profilePage_language => 'Language / Dil / اللغة';

  @override
  String get profileWidgets_education => 'Education';

  @override
  String get profileWidgets_add => 'Add';

  @override
  String get profileWidgets_noEducation => 'No education history added yet.';

  @override
  String get profileWidgets_deleteEducation => 'Delete Education';

  @override
  String profileWidgets_confirmDeleteEducation(String school) {
    return 'Are you sure you want to delete your education at $school?';
  }

  @override
  String get profileWidgets_cancel => 'Cancel';

  @override
  String get profileWidgets_delete => 'Delete';

  @override
  String get profileWidgets_workExperience => 'Work Experience';

  @override
  String get profileWidgets_noWorkExperience => 'No work experience added yet.';

  @override
  String get profileWidgets_deleteExperience => 'Delete Experience';

  @override
  String profileWidgets_confirmDeleteExperience(String company) {
    return 'Are you sure you want to delete your experience at $company?';
  }

  @override
  String get educationDialog_addTitle => 'Add Education';

  @override
  String get educationDialog_editTitle => 'Edit Education';

  @override
  String get educationDialog_school => 'School/University';

  @override
  String get educationDialog_schoolRequired => 'Please enter a school name';

  @override
  String get educationDialog_degree => 'Degree';

  @override
  String get educationDialog_degreeRequired => 'Please enter a degree';

  @override
  String get educationDialog_field => 'Field of Study';

  @override
  String get educationDialog_fieldRequired => 'Please enter a field of study';

  @override
  String get educationDialog_startDate => 'Start Date (MM/YYYY)';

  @override
  String get educationDialog_startDateRequired => 'Please enter a start date';

  @override
  String get educationDialog_currentlyStudying =>
      'I am currently studying here';

  @override
  String get educationDialog_endDate => 'End Date (MM/YYYY)';

  @override
  String get educationDialog_endDateRequired => 'Please enter an end date';

  @override
  String get educationDialog_save => 'Save';

  @override
  String get workExperienceDialog_addTitle => 'Add Work Experience';

  @override
  String get workExperienceDialog_editTitle => 'Edit Work Experience';

  @override
  String get workExperienceDialog_company => 'Company';

  @override
  String get workExperienceDialog_companyRequired =>
      'Please enter a company name';

  @override
  String get workExperienceDialog_position => 'Position';

  @override
  String get workExperienceDialog_positionRequired => 'Please enter a position';

  @override
  String get workExperienceDialog_startDate => 'Start Date (MM/YYYY)';

  @override
  String get workExperienceDialog_startDateRequired =>
      'Please enter a start date';

  @override
  String get workExperienceDialog_currentlyWorking => 'I currently work here';

  @override
  String get workExperienceDialog_endDate => 'End Date (MM/YYYY)';

  @override
  String get workExperienceDialog_endDateRequired => 'Please enter an end date';

  @override
  String get workExperienceDialog_description => 'Description';

  @override
  String get workExperienceDialog_descriptionRequired =>
      'Please enter a description';

  @override
  String get workExperienceDialog_save => 'Save';

  @override
  String get badges_title => 'Achievements & Badges';

  @override
  String get badges_noBadges => 'No badges earned yet.';

  @override
  String badges_earned(String date) {
    return 'Earned $date';
  }

  @override
  String get badges_today => 'today';

  @override
  String get badges_yesterday => 'yesterday';

  @override
  String badges_daysAgo(int days) {
    return '$days days ago';
  }

  @override
  String badges_monthsAgo(int months, String monthText) {
    return '$months $monthText ago';
  }

  @override
  String badges_yearsAgo(int years, String yearText) {
    return '$years $yearText ago';
  }

  @override
  String get badges_month => 'month';

  @override
  String get badges_months => 'months';

  @override
  String get badges_year => 'year';

  @override
  String get badges_years => 'years';

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

  @override
  String get common_darkMode => 'Dark Mode';

  @override
  String get common_lightMode => 'Light Mode';

  @override
  String get common_themeToggle => 'Toggle Theme';

  @override
  String get common_darkModeIcon => 'Dark mode icon';

  @override
  String get common_lightModeIcon => 'Light mode icon';

  @override
  String get common_back => 'Back';
}
