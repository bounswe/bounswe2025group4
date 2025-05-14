import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCurrentUser } from '../../../services/user.service';
import RoleBasedRedirect from '../RoleBasedRedirect';
import { describe, expect, beforeEach, vi, it } from 'vitest';

// Mock the react-router-dom Navigate component
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );
  return {
    ...actual,
    Navigate: vi
      .fn()
      .mockImplementation(({ to }) => (
        <div data-testid="navigate" data-to={to} />
      )),
  };
});

// Mock the auth service
vi.mock('../../../services/user.service', () => ({
  useCurrentUser: vi.fn(),
}));

// Mock the CenteredLoader component
vi.mock('../../../components/layout/CenterLoader', () => ({
  default: () => <div data-testid="centered-loader" />,
}));

// Mock the window.location.pathname
const mockLocationPathname = (pathname: string) => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { pathname },
  });
};

describe('RoleBasedRedirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loader when user data is not yet available', () => {
    mockLocationPathname('/jobs');
    (useCurrentUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
    });

    render(
      <MemoryRouter>
        <RoleBasedRedirect />
      </MemoryRouter>
    );

    expect(screen.getByTestId('centered-loader')).toBeInTheDocument();
  });

  it('should redirect employer to dashboard/jobs', () => {
    mockLocationPathname('/jobs');
    (useCurrentUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { userType: 'EMPLOYER' },
    });

    render(
      <MemoryRouter>
        <RoleBasedRedirect />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute(
      'data-to',
      '/dashboard/jobs'
    );
  });

  it('should redirect job seeker to jobs/list', () => {
    mockLocationPathname('/jobs');
    (useCurrentUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { userType: 'JOB_SEEKER' },
    });

    render(
      <MemoryRouter>
        <RoleBasedRedirect />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute(
      'data-to',
      '/jobs/list'
    );
  });

  it('should redirect unknown user type to home page', () => {
    mockLocationPathname('/jobs');
    (useCurrentUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { userType: 'UNKNOWN' },
    });

    render(
      <MemoryRouter>
        <RoleBasedRedirect />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
  });

  it('should redirect to home page for non-jobs paths', () => {
    mockLocationPathname('/some-other-path');
    (useCurrentUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { userType: 'JOB_SEEKER' },
    });

    render(
      <MemoryRouter>
        <RoleBasedRedirect />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
  });
});
