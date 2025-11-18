import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';
import LoginPage from '../../LoginPage';
import { renderWithProviders, setupUserEvent } from '@/test/utils';
import { server } from '@/test/setup';
import { API_BASE_URL } from '@/test/handlers';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('signs in successfully and navigates home', async () => {
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });
    const user = setupUserEvent();

    await user.type(screen.getByLabelText(/username/i), 'tester');
    await user.type(screen.getByLabelText(/password/i), 'password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('redirects to OTP verification when temporary token is returned', async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/login`, async () =>
        HttpResponse.json(
          { temporaryToken: 'tmp-token', token: null },
          { status: 200 },
        ),
      ),
    );

    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });
    const user = setupUserEvent();

    await user.type(screen.getByLabelText(/username/i), 'otp-user');
    await user.type(screen.getByLabelText(/password/i), 'password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/verify-otp',
        expect.objectContaining({
          state: expect.objectContaining({
            temporaryToken: 'tmp-token',
            username: 'otp-user',
          }),
        }),
      );
    });
  });

  it('surfaces invalid credential errors from the API', async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/login`, async () =>
        HttpResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 },
        ),
      ),
    );

    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });
    const user = setupUserEvent();

    await user.type(screen.getByLabelText(/username/i), 'wrong');
    await user.type(screen.getByLabelText(/password/i), 'nope');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid username or password/i);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows success message when provided via navigation state', async () => {
    const successMessage = 'Password reset successful! You can now log in with your new password.';

    renderWithProviders(<LoginPage />, {
      initialEntries: [
        {
          pathname: '/login',
          state: { message: successMessage },
        },
      ],
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(successMessage);
  });
});
