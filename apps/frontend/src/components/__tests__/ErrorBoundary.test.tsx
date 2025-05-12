import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../ErrorBoundary';

// A single callback we can inspect
const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom'
  );
  return {
    ...actual,
    useRouteError: vi.fn().mockReturnValue(new Error('Test error')),
    // Every call to useNavigate returns the *same* spy
    useNavigate: vi.fn(() => navigateMock),
  };
});

describe('ErrorBoundary', () => {
  it('renders error info', () => {
    render(<ErrorBoundary />);
    expect(screen.getByText(/oops!/i)).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });

  it('shows a “Return to Home” button', () => {
    render(<ErrorBoundary />);
    expect(
      screen.getByRole('button', { name: /return to home/i })
    ).toBeInTheDocument();
  });

  it('calls navigate("/") when the button is pressed', async () => {
    render(<ErrorBoundary />);

    await userEvent.click(
      screen.getByRole('button', { name: /return to home/i })
    );

    expect(navigateMock).toHaveBeenCalledWith('/');
  });
});
