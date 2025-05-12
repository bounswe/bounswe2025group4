import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../utils/test-utils';
import RegisterPage from '../Register';
import userEvent from '@testing-library/user-event';

// Mock the auth service
vi.mock('../../../services/auth.service', () => ({
  useRegister: () => ({
    mutate: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

// Mock the react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the registration form correctly', () => {
    render(<RegisterPage />);

    // Check for form elements
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByText(/i agree to the terms and conditions/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('allows toggling password visibility', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();

    // Check password field
    const passwordField = screen.getByLabelText(/^password$/i);
    expect(passwordField).toHaveAttribute('type', 'password');

    // Find and click the password visibility toggle
    const passwordVisibilityToggles = screen.getAllByRole('button', {
      name: /toggle password visibility/i,
    });

    await user.click(passwordVisibilityToggles[0]);
    expect(passwordField).toHaveAttribute('type', 'text');

    // Check confirm password field
    const confirmPasswordField = screen.getByLabelText(/confirm password/i);
    expect(confirmPasswordField).toHaveAttribute('type', 'password');

    await user.click(passwordVisibilityToggles[1]);
    expect(confirmPasswordField).toHaveAttribute('type', 'text');
  });

  it('validates form inputs', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();

    // Submit form without input
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Check for validation errors
    await waitFor(() => {
      expect(
        screen.getByText(/username must be at least 2 characters/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });

    // Input invalid values
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(usernameInput, 'a');
    await user.type(emailInput, 'invalidemail');
    await user.type(passwordInput, 'weak');
    await user.type(confirmPasswordInput, 'different');

    // Check for specific validation errors
    await waitFor(() => {
      expect(
        screen.getByText(/username must be at least 2 characters/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it('advances to the next step when form is valid', async () => {
    render(<RegisterPage />);
    const user = userEvent.setup();

    // Fill out the form with valid values
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const termsCheckbox = screen.getByRole('checkbox');

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'StrongPassword1!');
    await user.type(confirmPasswordInput, 'StrongPassword1!');
    await user.click(termsCheckbox);

    // Submit the form
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Check that we've advanced to the user type selection
    await waitFor(() => {
      expect(screen.getByText(/select your user type/i)).toBeInTheDocument();
      expect(screen.getByText(/job seeker/i)).toBeInTheDocument();
      expect(screen.getByText(/employer/i)).toBeInTheDocument();
    });
  });
});
