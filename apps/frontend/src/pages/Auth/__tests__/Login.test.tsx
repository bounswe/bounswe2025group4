import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../utils/test-utils';
import LoginPage from '../Login';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';

// Mock the auth service
vi.mock('../../../services/auth.service', () => ({
  useLogin: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isError: false,
    error: null,
  }),
}));

// Define the Link component props
interface LinkProps {
  children: ReactNode;
  to: string;
  [key: string]: any; // for other props that might be passed
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

// Mock window.location.href
const originalLocation = window.location;
beforeEach(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: '' },
  });
});

describe('LoginPage', () => {
  it('renders the login form correctly', () => {
    render(<LoginPage />);

    expect(
      screen.getByRole('heading', { name: /log in/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('allows toggling password visibility', async () => {
    render(<LoginPage />);
    const user = userEvent.setup();

    const passwordField = screen.getByLabelText(/password/i);
    expect(passwordField).toHaveAttribute('type', 'password');

    const visibilityToggle = screen.getByRole('button', {
      name: /toggle password visibility/i,
    });

    await user.click(visibilityToggle);

    expect(passwordField).toHaveAttribute('type', 'text');
  });

  it('updates input values when user types', async () => {
    render(<LoginPage />);
    const user = userEvent.setup();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

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
});
