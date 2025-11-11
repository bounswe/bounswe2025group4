import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from '../../public/locales/en/common.json';
import { authHandlers, profileHandlers, API_BASE_URL } from './handlers';
import { workplaceHandlers } from './workplace-handlers';

// Initialize the real i18n instance with production translations for integration-like tests
i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  resources: { en: { common: enCommon } },
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

vi.mock('@/lib/i18n', () => {
  import { authHandlers, profileHandlers, jobHandlers, applicationHandlers, API_BASE_URL } from './handlers';

  const testTranslations = {
    auth: {
      login: {
        title: 'Welcome Back',
        description: 'Sign in to continue',
        username: 'Username *',
        password: 'Password *',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        submit: 'Sign In',
        submitting: 'Signing in...',
        registerPrompt: "Don't have an account?",
        registerLink: 'Sign up',
        success: 'Email verified successfully! You can now log in.',
        errors: {
          serviceUnavailable: 'Service temporarily unavailable. Please try again later or contact support.',
          invalidCredentials: 'Invalid username or password. Please try again.',
          generic: 'Login failed. Please try again.',
        },
      },
      register: {
        createAccount: 'Create an Account',
        checkEmail: 'Check Your Email',
        description: 'Sign up to access the job board platform',
        verificationLink: 'We have sent you a verification link.',
        username: 'Username *',
        email: 'Email *',
        password: 'Password *',
        confirmPassword: 'Confirm Password *',
        role: 'Role *',
        passwordInfo: 'Password must contain:',
        passwordRules: {
          length: 'At least 8 characters',
          uppercase: 'One uppercase letter',
          lowercase: 'One lowercase letter',
          number: 'One number',
          special: 'One special character',
        },
        roles: {
          jobSeeker: 'Job Seeker',
          employer: 'Employer',
        },
        genderOptional: 'Gender (Optional)',
        pronounsOptional: 'Pronouns (Optional)',
        genderPlaceholder: 'e.g., Male, Female',
        pronounsPlaceholder: 'e.g., he/him, she/her',
        termsLabel: 'I agree to the <TermsLink>Terms and Conditions</TermsLink> and <PrivacyLink>Privacy Policy</PrivacyLink> *',
        termsLabelPlain: 'I agree to the Terms and Conditions and Privacy Policy',
        submit: 'Sign Up',
        submitting: 'Creating account...',
        loginPrompt: 'Already have an account?',
        loginLink: 'Log in',
        success: 'Registration successful! Please check your email to verify your account before logging in.',
        errors: {
          serviceUnavailable: 'Service temporarily unavailable. Please try again later or contact support.',
          emailInUse: 'Email is already in use. If you have not verified it yet, please check your email for the verification link.',
          usernameInUse: 'Username is already taken. Please choose a different username.',
          generic: 'Registration failed. Please try again.',
        },
      },
      reset: {
        invalidTitle: 'Invalid Reset Link',
        invalidDescription: 'This password reset link is invalid or has expired.',
        requestNew: 'Request New Link',
        title: 'Reset Password',
        description: 'Enter your new password below',
        newPassword: 'New Password *',
        confirmPassword: 'Confirm New Password *',
        submit: 'Reset Password',
        submitting: 'Resetting Password...',
        success: 'Password reset successful! You can now log in with your new password.',
        errors: {
          sameAsOld: 'New password cannot be the same as your old password. Please choose a different password.',
          missingToken: 'Invalid or missing reset token.',
          generic: 'Failed to reset password. Please try again.',
        },
      },
    },
    profile: {
      tabs: {
        about: 'About',
        activity: 'Activity',
        posts: 'Posts',
      },
      header: {
        currentRole: 'Software Developer',
        joined: 'Joined January 2024',
        stats: {
          posts: 'Posts',
          badges: 'Badges',
        },
        actions: {
          editImage: 'Edit profile image',
        },
      },
      imageUpload: {
        title: 'Upload Profile Image',
        chooseFile: 'Choose file',
        upload: 'Upload',
        save: 'Save',
        delete: 'Delete',
        remove: 'Remove Image',
        cancel: 'Cancel',
        maxSize: 'Maximum file size: 5MB',
        supportedFormats: 'Supported formats: JPG, PNG, GIF',
      },
      about: {
        title: 'About',
        modal: {
          title: 'Edit Bio',
        },
      },
      experience: {
        title: 'Experience',
        modal: {
          addTitle: 'Add Experience',
          editTitle: 'Edit Experience',
          fields: {
            company: {
              label: 'Company',
              placeholder: 'Company name',
            },
            position: {
              label: 'Position',
              placeholder: 'Job title',
            },
            description: {
              label: 'Description',
              placeholder: 'Describe your role and achievements...',
            },
            startDate: {
              label: 'Start Date',
            },
            endDate: {
              label: 'End Date',
            },
            current: {
              label: 'I currently work here',
            },
          },
          submitAdd: 'Add Experience',
          submitEdit: 'Save Changes',
          cancel: 'Cancel',
        },
      },
      education: {
        title: 'Education',
        modal: {
          addTitle: 'Add Education',
          editTitle: 'Edit Education',
          fields: {
            school: {
              label: 'School',
              placeholder: 'University or school name',
            },
            degree: {
              label: 'Degree',
              placeholder: 'Bachelor of Science',
            },
            field: {
              label: 'Field of Study',
              placeholder: 'Computer Science',
            },
            description: {
              label: 'Description',
              placeholder: 'Describe your studies...',
            },
            startDate: {
              label: 'Start Date',
            },
            endDate: {
              label: 'End Date',
            },
            current: {
              label: 'I currently study here',
            },
          },
          submitAdd: 'Add Education',
          submitEdit: 'Save Changes',
          cancel: 'Cancel',
        },
      },
      skills: {
        title: 'Skills',
        modal: {
          addTitle: 'Add Skill',
          editTitle: 'Edit Skill',
          fields: {
            name: {
              label: 'Skill Name',
              placeholder: 'JavaScript',
            },
            level: {
              label: 'Proficiency Level',
              options: {
                beginner: 'Beginner',
                intermediate: 'Intermediate',
                advanced: 'Advanced',
                expert: 'Expert',
              },
            },
          },
          submitAdd: 'Add Skill',
          submitEdit: 'Save Changes',
          cancel: 'Cancel',
        },
      },
      interests: {
        title: 'Interests',
        modal: {
          addTitle: 'Add Interest',
          editTitle: 'Edit Interest',
          fields: {
            name: {
              label: 'Interest Name',
              placeholder: 'Web Development',
            },
          },
          submitAdd: 'Add Interest',
          submitEdit: 'Save Changes',
          cancel: 'Cancel',
        },
      },
      actions: {
        add: 'Add',
        cancel: 'Cancel',
      },
      common: {
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        add: 'Add',
        cancel: 'Cancel',
      },
      create: {
        title: 'Create Profile',
        description: 'Create your professional profile to get started',
        fields: {
          firstName: {
            label: 'First Name',
            placeholder: 'Enter first name',
          },
          lastName: {
            label: 'Last Name',
            placeholder: 'Enter last name',
          },
          bio: {
            label: 'Bio',
            placeholder: 'Tell us about yourself...',
          },
        },
        submit: 'Create Profile',
        helper: 'You can always edit this later',
      },
      page: {
        loadErrorTitle: 'Failed to load profile',
        emptyTitle: 'Profile not found',
        emptyDescription: 'Create your profile to get started',
        dangerZone: {
          title: 'Danger Zone',
          description: 'This action will permanently delete all your profile data.',
          button: 'Delete Account',
        },
        alerts: {
          deleteFailed: 'Failed to delete account',
        },
      },
      notifications: {
        createSuccess: 'Profile created successfully',
        createError: 'Failed to create profile',
        imageUploadSuccess: 'Profile image uploaded successfully',
        imageUploadError: 'Failed to upload profile image',
        imageDeleteSuccess: 'Profile image deleted successfully',
        imageDeleteError: 'Failed to delete profile image',
        deleteExperienceSuccess: 'Experience deleted successfully',
        deleteExperienceError: 'Failed to delete experience',
        deleteEducationSuccess: 'Education deleted successfully',
        deleteEducationError: 'Failed to delete education',
        deleteSkillSuccess: 'Skill deleted successfully',
        deleteSkillError: 'Failed to delete skill',
        deleteInterestSuccess: 'Interest deleted successfully',
        deleteInterestError: 'Failed to delete interest',
        saveBioSuccess: 'Bio updated successfully',
        saveBioError: 'Failed to update bio',
        saveExperienceSuccess: 'Experience saved successfully',
        saveExperienceError: 'Failed to save experience',
        saveEducationSuccess: 'Education saved successfully',
        saveEducationError: 'Failed to save education',
        saveSkillSuccess: 'Skill saved successfully',
        saveSkillError: 'Failed to save skill',
        saveInterestSuccess: 'Interest saved successfully',
        saveInterestError: 'Failed to save interest',
        deleteAccountSuccess: 'Account deleted successfully',
      },
      activity: {
        items: [
          { type: 'application', text: 'Applied to Software Engineer position at Tech Corp', date: '2024-01-15' },
          { type: 'forum', text: 'Posted a question in React forum', date: '2024-01-14' },
          { type: 'comment', text: 'Commented on JavaScript best practices', date: '2024-01-13' },
        ],
      },
      posts: {
        items: [
          { title: 'How to optimize React performance?', date: '2024-01-10' },
          { title: 'Best practices for TypeScript', date: '2024-01-08' },
          { title: 'Getting started with Node.js', date: '2024-01-05' },
        ],
      },
      deleteModal: {
        title: 'Delete Account',
        confirmKeyword: 'DELETE',
        warningTitle: 'Warning',
        warningDescription: 'This action cannot be undone',
        summaryTitle: 'The following data will be permanently deleted:',
        compliance: 'This action complies with GDPR data deletion requirements',
        confirmPrompt: 'Type <code>{{keyword}}</code> to confirm deletion',
        confirmationLabel: 'Type DELETE to confirm',
        confirmationPlaceholder: 'Type {{keyword}} here',
        items: {
          profilePicture: 'Profile picture',
          bio: 'Bio and personal information',
          experiences: 'Work experience',
          education: 'Education history',
          skills: 'Skills and endorsements',
        },
        buttons: {
          cancel: 'Cancel',
          continue: 'Continue',
          back: 'Back',
          delete: 'Delete Account',
          deleting: 'Deleting...',
        },
      },
    },
    employerDashboard: {
      title: 'Employer Dashboard',
      subtitle: 'Manage your job postings',
      currentPostings: 'Current Job Postings',
      createJob: 'Post New Job',
      emptyState: 'No job postings yet',
      emptyCta: 'Post Your First Job',
      loadingError: 'Failed to load job postings',
      statusLabels: {
        open: 'Open',
        active: 'Active',
        paused: 'Paused',
      },
      table: {
        jobTitle: 'Job Title',
        status: 'Status',
        applications: 'Applications',
        actions: 'Actions',
      },
      actions: {
        manage: 'Manage',
      },
    },
    createJob: {
      title: 'Post a New Job',
      subtitle: 'Fill in the details below',
      jobTitle: 'Job Title *',
      jobTitlePlaceholder: 'e.g., Senior Product Manager',
      jobDescription: 'Job Description *',
      jobDescriptionPlaceholder: 'Describe the role...',
      companyName: 'Company Name *',
      companyNamePlaceholder: 'e.g., Tech Corp',
      location: 'Location *',
      locationPlaceholder: 'e.g., San Francisco, CA',
      remoteWork: 'Remote Work Available',
      remoteWorkDescription: 'Check if remote work is available',
      salaryRange: 'Salary Range (USD) *',
      minimum: 'Minimum',
      maximum: 'Maximum',
      minSalaryPlaceholder: 'e.g., 80000',
      maxSalaryPlaceholder: 'e.g., 120000',
      contactEmail: 'Contact Email *',
      contactEmailPlaceholder: 'e.g., hiring@company.com',
      ethicalTags: 'Ethical Policies',
      ethicalTagsDescription: 'Select ethical policies',
      ethicalTagsPlaceholder: 'Select ethical tags',
      inclusiveOpportunity: 'Inclusive Opportunity',
      inclusiveOpportunityDescription: 'Welcoming to all candidates',
      submit: 'Post Job',
      submitting: 'Posting...',
      submitSuccess: 'Job posted successfully!',
      submitError: 'Failed to create job posting',
    },
    editJob: {
      title: 'Edit Job Posting',
      subtitle: 'Update job details',
      missingId: 'Missing job id.',
      loadError: 'Failed to load job details. Please try again later.',
      submitError: 'Failed to update job posting. Please try again.',
      cancel: 'Cancel',
      save: 'Save Changes',
      saving: 'Saving...',
      backToDetails: 'Back to job details',
    },
    jobs: {
      retry: 'Retry',
    },
  } as const;

  vi.mock('@/lib/i18n', async () => {
    const { createInstance } = await import('i18next');
    const { initReactI18next } = await import('react-i18next');
    const i18n = createInstance();
    await i18n.use(initReactI18next).init({
      lng: 'en',
      fallbackLng: 'en',
      resources: { en: { common: testTranslations } },
      interpolation: {
        escapeValue: false,
      },
      returnNull: false,
    });
    return { default: i18n };
  });

  export const server = setupServer(...authHandlers, ...profileHandlers, ...workplaceHandlers, ...jobHandlers, ...applicationHandlers);

  vi.stubEnv('VITE_API_URL', API_BASE_URL);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
    cleanup();
    window.localStorage.clear();
  });

  afterAll(() => {
    server.close();
  });

  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
      }),
    });
  }

  // Mock ResizeObserver
  window.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
  } as typeof ResizeObserver;
