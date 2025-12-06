import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';
import ResetPasswordPage from '../ResetPasswordPage';
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

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('requires a token in the query string', () => {
    renderWithProviders(<ResetPasswordPage />, { initialEntries: ['/reset-password'] });
    expect(
      screen.getByText('auth.reset.invalidDescription'),
    ).toBeInTheDocument();
  });

  it('submits a new password and redirects to login with success message', async () => {
    renderWithProviders(<ResetPasswordPage />, { initialEntries: ['/reset-password?token=abc123'] });
    const user = setupUserEvent();

    await user.type(screen.getByLabelText('auth.reset.newPassword'), 'StrongPass1!');
    await user.type(screen.getByLabelText('auth.reset.confirmPassword'), 'StrongPass1!');
    await user.click(screen.getByRole('button', { name: 'auth.reset.submit' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/login',
        expect.objectContaining({
          replace: true,
          state: expect.objectContaining({
            message: 'auth.reset.success',
          }),
        }),
      );
    });
  });

  it('shows translated error when backend rejects password reuse', async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/password-reset/confirm`, async () =>
        HttpResponse.json(
          { message: 'New password cannot be the same as the old password' },
          { status: 400 },
        ),
      ),
    );

    renderWithProviders(<ResetPasswordPage />, { initialEntries: ['/reset-password?token=abc123'] });
    const user = setupUserEvent();

    await user.type(screen.getByLabelText('auth.reset.newPassword'), 'SamePassword1!');
    await user.type(screen.getByLabelText('auth.reset.confirmPassword'), 'SamePassword1!');
    await user.click(screen.getByRole('button', { name: 'auth.reset.submit' }));

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('auth.reset.errors.sameAsOld');
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

