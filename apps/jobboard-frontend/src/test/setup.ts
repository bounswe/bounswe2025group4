import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { authHandlers, profileHandlers, API_BASE_URL } from './handlers';

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
    },
    education: {
      title: 'Education',
    },
    skills: {
      title: 'Skills',
    },
    interests: {
      title: 'Interests',
    },
    actions: {
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
      dangerZone: {
        title: 'Danger Zone',
        button: 'Delete Account',
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

export const server = setupServer(...authHandlers, ...profileHandlers);

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
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
