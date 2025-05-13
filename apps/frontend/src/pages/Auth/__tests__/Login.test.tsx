import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../utils/test-utils';
import LoginPage from '../Login';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';

// Mock the auth service
const mockMutateAsync = vi.fn(); // Define it here to be accessible in tests
vi.mock('../../../services/auth.service', () => ({
  useLogin: () => ({
    mutateAsync: mockMutateAsync, // Use the spy
    isError: false,
    error: null,
  }),
}));

// Define the Link component props
interface LinkProps {
  children: ReactNode;
  to: string;
  [key: string]: unknown; // for other props that might be passed - Changed 'any' to 'unknown'
}

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, ...props }: LinkProps) => (
      <a {...props} data-testid="router-link">
        {children}
      </a>
    ),
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
    mockMutateAsync.mockClear(); // Clear history before each test
    mockMutateAsync.mockResolvedValue({}); // Default to successful login
  });

  it('renders the login form correctly', () => {
    render(<LoginPage />);

    expect(
      screen.getByRole('heading', { name: /log in/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('allows toggling password visibility', async () => {
    render(<LoginPage />);
    const user = userEvent.setup();

    const passwordField = screen.getByPlaceholderText('Password');
    expect(passwordField).toHaveAttribute('type', 'password');

    const visibilityToggle = screen.getByRole('button', {
      name: /toggle-password-visibility/i,
    });

    await user.click(visibilityToggle);

    expect(passwordField).toHaveAttribute('type', 'text');
  });

  it('updates input values when user types', async () => {
    render(<LoginPage />);
    const user = userEvent.setup();

    const usernameInput = screen.getByRole('textbox', { name: /username/i });
    const passwordInput = screen.getByPlaceholderText('Password');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  it('shows navigation links', () => {
    render(<LoginPage />);

    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    render(<LoginPage />);
    const user = userEvent.setup();

    const usernameInput = screen.getByRole('textbox', { name: /username/i });
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /log in/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
    },
    {
      onSuccess: expect.any(Function),
      onError: expect.any(Function),
    }
    );
    // Wait for async operations to complete, like the navigation
    // A simple way to wait for location change is to check for it until it meets the condition or timeout
    await vi.waitFor(() => expect(window.location.href).toBe(''));
  });

  it('handles failed login', async () => {
    const loginError = new Error('Login failed');
    mockMutateAsync.mockRejectedValueOnce(loginError);

    render(<LoginPage />);
    const user = userEvent.setup();
    const initialHref = window.location.href; // Capture initial href, should be '' due to beforeEach

    const usernameInput = screen.getByRole('textbox', { name: /username/i });
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /log in/i });

    await user.type(usernameInput, 'baduser');
    await user.type(passwordInput, 'badpassword');
    await user.click(loginButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      username: 'baduser',
      password: 'badpassword',
    },
    {
      onSuccess: expect.any(Function),
      onError: expect.any(Function),
    }
    );

    // Ensure async operations complete
    // We check that the button is still there and not in a loading state indefinitely
    await screen.findByRole('button', { name: /log in/i });

    expect(window.location.href).toBe(initialHref); // Should not have navigated
    expect(screen.getByText('Login failed')).toBeInTheDocument();
  });
});
