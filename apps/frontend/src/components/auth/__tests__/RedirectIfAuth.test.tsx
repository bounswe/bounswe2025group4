import { vi } from 'vitest';
import { useAuth } from '../../../hooks/useAuth';
import { render, renderHook, screen } from '@testing-library/react';
import RedirectIfAuth from '../RedirectIfAuth';

vi.mock('../../../hooks/useAuth');

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

const mockAuthContext = {
  token: 'mock-token',
  setToken: vi.fn(),
  id: 'mock-id',
  setId: vi.fn(),
};

describe('RedirectIfAuth', () => {
  it('should redirect to the home page if the user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuthContext);
    renderHook(() => useAuth());

    const children = <div>Test</div>;
    render(<RedirectIfAuth>{children}</RedirectIfAuth>);

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
  });
});
