import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import RegisterPage from '../RegisterPage';
import { renderWithProviders, setupUserEvent } from '@/test/utils';
import { server } from '@/test/setup';
import { API_BASE_URL } from '@/test/handlers';

describe('RegisterPage', () => {
  async function completeRequiredFields() {
    const user = setupUserEvent();
    await user.type(screen.getByLabelText('auth.register.username'), 'newuser');
    await user.type(screen.getByLabelText('auth.register.email'), 'newuser@example.com');
    await user.type(screen.getByLabelText('auth.register.password'), 'StrongPass1!');
    await user.type(screen.getByLabelText('auth.register.confirmPassword'), 'StrongPass1!');
    await user.selectOptions(screen.getByLabelText('auth.register.role'), 'ROLE_JOBSEEKER');
    await user.click(screen.getByLabelText('auth.register.termsLabelPlain'));
    return user;
  }

  it('shows a success message when registration completes', async () => {
    renderWithProviders(<RegisterPage />, { initialEntries: ['/register'] });

    const user = await completeRequiredFields();
    await user.click(screen.getByRole('button', { name: 'auth.register.submit' }));

    expect(
      await screen.findByText('auth.register.success'),
    ).toBeInTheDocument();
  });

  it('maps backend duplicate email errors to localized copy', async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/register`, async () =>
        HttpResponse.json(
          { message: 'Error: Email is already in use' },
          { status: 200 },
        ),
      ),
    );

    renderWithProviders(<RegisterPage />, { initialEntries: ['/register'] });

    const user = await completeRequiredFields();
    await user.click(screen.getByRole('button', { name: 'auth.register.submit' }));

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('auth.register.errors.emailInUse');
  });

  it('shows a service unavailable message on 401 responses', async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/register`, async () =>
        HttpResponse.json(
          { message: 'Service down' },
          { status: 401 },
        ),
      ),
    );

    renderWithProviders(<RegisterPage />, { initialEntries: ['/register'] });

    const user = await completeRequiredFields();
    await user.click(screen.getByRole('button', { name: 'auth.register.submit' }));

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('auth.register.errors.serviceUnavailable');
  });
});

