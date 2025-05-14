import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';
import { useTheme } from '../../../hooks/useTheme';
import { describe, expect, beforeEach, vi } from 'vitest';

// Mock the useTheme hook
vi.mock('../../../hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

describe('ThemeToggle', () => {
  const mockToggleTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders light mode icon when theme is light', () => {
    // Mock light mode
    (useTheme as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mode: 'light',
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);

    // Brightness4Icon is used for light mode (to switch to dark)
    const iconButton = screen.getByRole('button');
    expect(iconButton).toBeInTheDocument();

    // Check tooltip text for light mode
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
  });

  it('renders dark mode icon when theme is dark', () => {
    // Mock dark mode
    (useTheme as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mode: 'dark',
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);

    // Brightness7Icon is used for dark mode (to switch to light)
    const iconButton = screen.getByRole('button');
    expect(iconButton).toBeInTheDocument();

    // Check tooltip text for dark mode
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
  });

  it('calls toggleTheme when button is clicked', () => {
    // Mock light mode
    (useTheme as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mode: 'light',
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);

    // Click the button
    const iconButton = screen.getByRole('button');
    fireEvent.click(iconButton);

    // Check if toggleTheme was called
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
