import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '../../../utils/test-utils';
import RegisterPage from '../Register';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';

// Mock the auth service
const mockMutate = vi.fn();
vi.mock('../../../services/auth.service', () => ({
  useRegister: () => ({
    mutate: mockMutate,
    isError: false,
    error: null,
  }),
}));

// Define the Link component props
interface LinkProps {
  children: ReactNode;
  to: string;
  [key: string]: unknown;
}

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }: LinkProps) => (
      <a href={to} {...props} data-testid="router-link">
        {children}
      </a>
    ),
  };
});

describe('RegisterPage', () => {
  beforeEach(() => {
    mockMutate.mockClear();
    mockNavigate.mockClear();
    // Default to successful registration
    mockMutate.mockImplementation((_data, options) => {
      if (options && options.onSuccess) {
        options.onSuccess();
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the initial credentials form correctly', () => {
    render(<RegisterPage />);

    expect(
      screen.getByRole('heading', { name: /create your account/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/i agree to the/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /continue/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('updates input values in credentials form', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');

    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('Password123!');
    expect(confirmPasswordInput).toHaveValue('Password123!');
  });

  it('toggles password visibility', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();

    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    // There are two visibility toggles, one for password and one for confirm password.
    // We are targetting the first one which is for the password field.
    const visibilityToggles = screen.getAllByRole('button', {
      name: '',
    });
    const passwordVisibilityToggle = visibilityToggles[0];

    await user.click(passwordVisibilityToggle);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(passwordVisibilityToggle);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows error messages for invalid credentials input', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const continueButton = screen.getByRole('button', { name: /continue/i });
    const agreeCheckbox = screen.getByLabelText(/i agree to the/i);
    await user.click(agreeCheckbox);

    await user.type(screen.getByLabelText(/username/i), 'u'); // less than 2 characters

    // Submit without filling anything
    await user.click(continueButton);

    expect(
      await screen.findByText('Username must be at least 2 characters')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Please enter a valid email address')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Password must be at least 8 characters')
    ).toBeInTheDocument();
    // Confirm password error won't show yet because password itself is too short

    // Fill username and email, but short password
    await user.type(usernameInput, 'usr');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'short');
    await user.click(continueButton); // Attempt to submit

    expect(
      screen.getByText('Password must be at least 8 characters')
    ).toBeInTheDocument();

    // Fill with non-matching passwords
    await user.clear(passwordInput);
    await user.type(passwordInput, 'ValidPass123!');
    await user.type(confirmPasswordInput, 'MismatchedPass123!');
    await user.click(continueButton);

    expect(
      await screen.findByText("Passwords don't match")
    ).toBeInTheDocument();

    // Forget to agree to terms
    await user.clear(confirmPasswordInput);
    await user.type(confirmPasswordInput, 'ValidPass123!');
    // The checkbox is checked by , so we need to uncheck it first
    await user.click(agreeCheckbox); // Uncheck
    await user.click(continueButton);

    expect(
      await screen.findByText('You must agree to the terms and conditions')
    ).toBeInTheDocument();
  });

  it('navigates to user type selection on valid credentials submission', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(
      screen.getByLabelText(/email address/i),
      'test@example.com'
    );
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByLabelText(/i agree to the/i));

    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(
      await screen.findByRole('heading', { name: /choose your role/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/select your primary purpose/i)
    ).toBeInTheDocument();
  });

  it('allows selection of user type and navigates to mentorship role', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();

    // Simulate being on the user type step
    // (Directly setting state is hard, so we go through the first step)
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(
      screen.getByLabelText(/email address/i),
      'test@example.com'
    );
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByLabelText(/i agree to the/i));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await screen.findByRole('heading', { name: /choose your role/i }); // Wait for navigation

    const employerOption = screen.getByText(/employer/i);
    await user.click(employerOption);

    // Check if Employer option is selected (visually indicated by border or background)
    // This relies on visual cues being testable or having specific attributes.
    // For now, we'll assume clicking selects it and enables continue.

    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeEnabled();
    await user.click(continueButton);

    expect(
      await screen.findByRole('heading', { name: /choose mentorship role/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/select your mentorship role/i)
    ).toBeInTheDocument();
  });

  it('allows selection of mentorship role and navigates to profile info', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();

    // Navigate through credentials and user type steps
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(
      screen.getByLabelText(/email address/i),
      'test@example.com'
    );
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByLabelText(/i agree to the/i));
    await user.click(screen.getAllByRole('button', { name: /continue/i })[0]); // Credentials continue
    await screen.findByRole('heading', { name: /choose your role/i });
    await user.click(screen.getByText(/job seeker/i)); // Select job seeker
    await user.click(screen.getAllByRole('button', { name: /continue/i })[0]); // User type continue

    await screen.findByRole('heading', { name: /choose mentorship role/i }); // Wait for navigation

    const mentorOption = screen.getByText('Mentor');
    await user.click(mentorOption);

    // Continue button in selection step is actually the "handleNext" which directly moves
    // to profile info upon selection, so no separate continue button click needed for mentorship.
    // The click on mentorOption triggers handleMentorshipRoleSelect which calls setCurrentStep('profileInfo')

    expect(
      await screen.findByRole('heading', { name: /profile information/i })
    ).toBeInTheDocument();
  });

  it('allows filling profile information and submitting registration', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();

    // Step 1: Credentials
    await user.type(screen.getByLabelText(/username/i), 'finaluser');
    await user.type(
      screen.getByLabelText(/email address/i),
      'final@example.com'
    );
    await user.type(screen.getByLabelText(/^password$/i), 'FinalPass123!');
    await user.type(
      screen.getByLabelText(/confirm password/i),
      'FinalPass123!'
    );
    await user.click(screen.getByLabelText(/i agree to the/i));
    await user.click(screen.getAllByRole('button', { name: /continue/i })[0]);

    // Step 2: User Type
    await screen.findByRole('heading', { name: /choose your role/i });
    await user.click(screen.getByText(/job seeker/i));
    await user.click(screen.getAllByRole('button', { name: /continue/i })[0]);

    // Step 3: Mentorship Role
    await screen.findByRole('heading', { name: /choose mentorship role/i });
    await user.click(screen.getByText(/mentee/i)); // This click also navigates

    // Step 4: Profile Info
    await screen.findByRole('heading', { name: /profile information/i });
    await user.type(screen.getByLabelText(/first name/i), 'Test');
    await user.type(screen.getByLabelText(/last name/i), 'User');
    await user.type(screen.getByLabelText(/phone number/i), '1234567890');
    await user.type(screen.getByLabelText(/location/i), 'Test City');
    await user.type(screen.getByLabelText(/occupation/i), 'Tester');
    await user.type(screen.getByLabelText(/bio/i), 'This is a test bio.');

    await user.click(
      screen.getByRole('button', { name: /complete registration/i })
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'finaluser',
          email: 'final@example.com',
          password: 'FinalPass123!',
          fullName: 'Test User',
          phone: '1234567890',
          location: 'Test City',
          occupation: 'Tester',
          bio: 'This is a test bio.',
          userType: 'JOB_SEEKER',
          mentorshipStatus: 'MENTEE',
        }),
        {
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }
      );
    });
    expect(mockNavigate).toHaveBeenCalledWith('/register-successful');
  });

  it('handles successful registration and navigates', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();

    // Minimal path to final submission
    await user.type(screen.getByLabelText(/username/i), 'gooduser');
    await user.type(
      screen.getByLabelText(/email address/i),
      'good@example.com'
    );
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPass123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'GoodPass123!');
    await user.click(screen.getByLabelText(/i agree to the/i));
    await user.click(screen.getAllByRole('button', { name: /continue/i })[0]);
    await screen.findByRole('heading', { name: /choose your role/i });
    await user.click(screen.getByText(/job seeker/i));
    await user.click(screen.getAllByRole('button', { name: /continue/i })[0]);
    await screen.findByRole('heading', { name: /choose mentorship role/i });
    await user.click(screen.getByText(/mentee/i));
    await screen.findByRole('heading', { name: /profile information/i });
    await user.type(screen.getByLabelText(/first name/i), 'Good');
    await user.type(screen.getByLabelText(/last name/i), 'User');
    await user.type(screen.getByLabelText(/phone number/i), '0987654321');
    await user.type(screen.getByLabelText(/location/i), 'Good City');
    await user.type(screen.getByLabelText(/occupation/i), 'Hero');
    await user.type(screen.getByLabelText(/bio/i), 'I save the day.');

    await user.click(
      screen.getByRole('button', { name: /complete registration/i })
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/register-successful');
    });
  });

  it('handles failed registration and shows error snackbar', async () => {
    const errorMessage = 'Registration failed miserably';
    mockMutate.mockImplementation((_data, options) => {
      if (options && options.onError) {
        options.onError({ message: errorMessage });
      }
    });

    render(<RegisterPage />);
    const user = userEvent.setup();

    // Minimal path to final submission
    await user.type(screen.getByLabelText(/username/i), 'baduser');
    await user.type(screen.getByLabelText(/email address/i), 'bad@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'BadPass123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'BadPass123!');
    await user.click(screen.getByLabelText(/i agree to the/i));
    await user.click(screen.getAllByRole('button', { name: /continue/i })[0]); // Credentials
    await screen.findByRole('heading', { name: /choose your role/i });
    await user.click(screen.getByText(/job seeker/i));
    await user.click(screen.getAllByRole('button', { name: /continue/i })[0]); // User type
    await screen.findByRole('heading', { name: /choose mentorship role/i });
    await user.click(screen.getByText(/mentee/i)); // Mentorship (navigates)
    await screen.findByRole('heading', { name: /profile information/i });
    await user.type(screen.getByLabelText(/first name/i), 'Bad');
    await user.type(screen.getByLabelText(/last name/i), 'User');
    await user.type(screen.getByLabelText(/phone number/i), '1112223333');
    await user.type(screen.getByLabelText(/location/i), 'Bad City');
    await user.type(screen.getByLabelText(/occupation/i), 'Villain');
    await user.type(screen.getByLabelText(/bio/i), 'I cause trouble.');

    await user.click(
      screen.getByRole('button', { name: /complete registration/i })
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();

    // Test snackbar close
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });
  });

  it('allows navigation back from user type to credentials', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();

    // Go to user type step
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(
      screen.getByLabelText(/email address/i),
      'test@example.com'
    );
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByLabelText(/i agree to the/i));
    await user.click(screen.getAllByRole('button', { name: /continue/i })[0]);
    await screen.findByRole('heading', { name: /choose your role/i });

    // Click back button
    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(await screen.findByText(/create your account/i)).toBeInTheDocument();
  });

  it('allows navigation back from mentorship to user type', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();

    // Go to mentorship step
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(
      screen.getByLabelText(/email address/i),
      'test@example.com'
    );
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByLabelText(/i agree to the/i));
    await user.click(screen.getAllByRole('button', { name: /continue/i })[0]); // Credentials
    await screen.findByText(/choose your role/i);
    await user.click(screen.getByText(/job seeker/i));
    await user.click(screen.getAllByRole('button', { name: /continue/i })[0]); // User type
    await screen.findByText(/choose mentorship role/i);

    // Click back button
    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(await screen.findByText(/choose your role/i)).toBeInTheDocument();
  });

  it('allows navigation back from profile info to mentorship', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();

    // Go to profile info step
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(
      screen.getByLabelText(/email address/i),
      'test@example.com'
    );
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    await user.click(screen.getByLabelText(/i agree to the/i));
    await user.click(screen.getAllByRole('button', { name: /continue/i })[0]); // Credentials
    await screen.findByRole('heading', { name: /choose your role/i });
    await user.click(screen.getByText(/job seeker/i));
    await user.click(screen.getAllByRole('button', { name: /continue/i })[0]); // User type
    await screen.findByText(/choose mentorship role/i);
    await user.click(screen.getByText(/mentee/i)); // Mentorship (navigates)
    await screen.findByText(/profile information/i);

    // Click back button
    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(
      await screen.findByText(/choose mentorship role/i)
    ).toBeInTheDocument();
  });
});
