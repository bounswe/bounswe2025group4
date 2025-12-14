import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import ProfilePage from '@modules/profile/pages/ProfilePage';
import { renderWithProviders, setupUserEvent } from '@/__tests__/utils';
import { useAuthStore } from '@shared/stores/authStore';
import { API_BASE_URL, createMockJWT } from '@/__tests__/handlers';
import { server } from '@/__tests__/setup';

const renderProfileRoute = (initialEntry = '/profile') =>
  renderWithProviders(
    <Routes>
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:userId" element={<ProfilePage />} />
    </Routes>,
    { initialEntries: [initialEntry] }
  );

const setOwnerAuthState = () =>
  act(() => {
    useAuthStore.setState({
      user: {
        id: 1,
        username: 'owner',
        email: 'owner@example.com',
        role: 'ROLE_JOBSEEKER',
      },
      accessToken: createMockJWT('owner', 'owner@example.com', 1, 'ROLE_JOBSEEKER'),
      isAuthenticated: true,
    });
  });

describe('ProfilePage', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it('renders owner profile with editable sections and danger zone', async () => {
    renderProfileRoute();
    setOwnerAuthState();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('profile.header.actions.editImage')).toBeInTheDocument();
    expect(screen.getByText('profile.about.title')).toBeInTheDocument();
    expect(screen.getByText('profile.experience.title')).toBeInTheDocument();
    expect(screen.getByText('profile.education.title')).toBeInTheDocument();
    expect(screen.getByText('profile.skills.title')).toBeInTheDocument();
    expect(screen.getByText('profile.interests.title')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'profile.page.dangerZone.button' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'profile.actions.add' }).length).toBeGreaterThan(0);
  });

  it('switches tabs to show activity and posts content', async () => {
    renderProfileRoute();
    setOwnerAuthState();
    const user = setupUserEvent();

    await screen.findByText('profile.tabs.about');

    await user.click(screen.getByRole('button', { name: 'profile.tabs.activity' }));
    expect(await screen.findByText('Applied to Senior Product Designer at Innovation Labs')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'profile.tabs.posts' }));
    expect(await screen.findByText('User Research Techniques: A Comprehensive Guide')).toBeInTheDocument();
  });

  it('renders public view for other users without edit controls', async () => {
    renderProfileRoute('/profile/2');

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    expect(screen.getByText('profile.public.note')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'profile.actions.add' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('profile.header.actions.editImage')).not.toBeInTheDocument();
  });

  it('shows create profile modal when owner profile is missing and submits data', async () => {
    const createRequests: Array<{ firstName: string; lastName: string; bio?: string }> = [];
    let profileCreated = false;

    server.use(
      http.get(`${API_BASE_URL}/profile`, async () => {
        if (profileCreated) {
          const [latest] = createRequests.slice(-1);
          return HttpResponse.json(
            {
              id: 1,
              userId: 1,
              firstName: latest?.firstName ?? 'Ada',
              lastName: latest?.lastName ?? 'Lovelace',
              bio: latest?.bio ?? 'Bio',
              educations: [],
              experiences: [],
              skills: [],
              interests: [],
              badges: [],
              imageUrl: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { status: 200 }
          );
        }

        return HttpResponse.json(
          { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' },
          { status: 404 }
        );
      }),
      http.post(`${API_BASE_URL}/profile`, async ({ request }) => {
        const body = (await request.json()) as { firstName: string; lastName: string; bio?: string };
        createRequests.push(body);
        profileCreated = true;
        return HttpResponse.json({ id: 1, userId: 1, ...body }, { status: 201 });
      })
    );

    renderProfileRoute();
    setOwnerAuthState();
    const user = setupUserEvent();

    expect(await screen.findByText('profile.create.title')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('profile.create.fields.firstName.placeholder'), 'Ada');
    await user.type(screen.getByPlaceholderText('profile.create.fields.lastName.placeholder'), 'Lovelace');
    await user.type(screen.getByPlaceholderText('profile.create.fields.bio.placeholder'), 'Pioneer');

    await user.click(screen.getByRole('button', { name: 'profile.create.submit' }));

    await waitFor(() => {
      expect(createRequests.length).toBe(1);
    });
    expect(createRequests[0]).toMatchObject({
      firstName: 'Ada',
      lastName: 'Lovelace',
      bio: 'Pioneer',
    });

    await waitFor(() => {
      expect(screen.queryByText('profile.create.title')).not.toBeInTheDocument();
    });
  });
});
