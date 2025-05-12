import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { describe, expect, beforeEach, vi, it } from 'vitest';

// Mock the useAuth hook
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock the useTheme hook
vi.mock('../../../hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

// Mock the ThemeToggle component
vi.mock('../../../components/common/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe('Header', () => {
  beforeEach(() => {
    // Default mock implementation
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      token: null,
      setToken: vi.fn(),
    });

    (useTheme as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mode: 'light',
      toggleTheme: vi.fn(),
    });
  });

  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Check for navigation links
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Jobs')).toBeInTheDocument();
    expect(screen.getByText('Mentorship')).toBeInTheDocument();
    expect(screen.getByText('Forum')).toBeInTheDocument();
  });

  it('renders login and register buttons when not authenticated', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Check for login and register buttons
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('renders profile and logout buttons when authenticated', () => {
    // Mock authenticated state
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      token: 'fake-token',
      setToken: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Check for profile and logout buttons/icons
    expect(screen.getByTestId('profile-button')).toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('renders the theme toggle component', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Check that the ThemeToggle component is rendered
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });
}); 