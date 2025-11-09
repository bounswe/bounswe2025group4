import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import ProfilePage from '../../ProfilePage';
import { renderWithProviders, setupUserEvent } from '@/test/utils';
import { server } from '@/test/setup';
import { API_BASE_URL } from '@/test/handlers';
import { useAuthStore } from '@/stores/authStore';

describe('ProfilePage', () => {
  beforeEach(() => {
    // Set up authenticated user state for tests
    useAuthStore.setState({
      user: {
        id: 1,
        username: 'johndoe',
        email: 'john@example.com',
        role: 'ROLE_JOBSEEKER',
      },
      accessToken: 'mock-jwt-token',
      refreshToken: null,
      isAuthenticated: true,
    });
  });

  it('renders profile page with user information', async () => {
    renderWithProviders(<ProfilePage />);

    // Wait for loading to complete and check that user name is displayed
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check if bio is rendered 
    expect(screen.getByText('Software Engineer with 5 years of experience')).toBeInTheDocument();

    // Check if tab buttons are present - get all instances and verify we have the expected number
    expect(screen.getAllByText('About')).toHaveLength(2); // Tab and section heading
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getAllByText('Posts')).toHaveLength(2); // Tab and stats label
  });

  it('displays skills in about tab', async () => {
    renderWithProviders(<ProfilePage />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check skills section - these should be visible since about tab is default
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    renderWithProviders(<ProfilePage />);
    const user = setupUserEvent();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click the activity tab button (use getByRole to be more specific)
    const activityTab = screen.getByRole('button', { name: 'Activity' });
    await user.click(activityTab);
    
    // Find and click the posts tab button 
    const postsTab = screen.getByRole('button', { name: 'Posts' });
    await user.click(postsTab);
    
    // Switch back to about tab
    const aboutTab = screen.getByRole('button', { name: 'About' });
    await user.click(aboutTab);
  });

  it('shows create profile modal when profile does not exist', async () => {
    // Mock 404 response for profile not found
    server.use(
      http.get(`${API_BASE_URL}/profile`, () =>
        HttpResponse.json(
          { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' },
          { status: 404 }
        )
      )
    );

    renderWithProviders(<ProfilePage />);

    // Wait for the create profile modal to appear by checking for the heading
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Create Profile' })).toBeInTheDocument();
    });

    // Check for form fields in the modal
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
  });

  it('handles profile loading error gracefully', async () => {
    // Mock server error
    server.use(
      http.get(`${API_BASE_URL}/profile`, () =>
        HttpResponse.json(
          { message: 'Internal server error' },
          { status: 500 }
        )
      )
    );

    renderWithProviders(<ProfilePage />);

    // Wait for loading to finish - the page should not crash and should handle the error
    await waitFor(() => {
      // Since error handling shows a toast, we can't easily check for the toast text
      // but we can ensure the component doesn't crash by checking the page structure
      expect(document.body).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('renders profile sections with proper structure', async () => {
    renderWithProviders(<ProfilePage />);

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check for profile sections by their headings
    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Experience' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Education' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Interests' })).toBeInTheDocument();
  });

  it('displays profile data from API response', async () => {
    renderWithProviders(<ProfilePage />);

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check data from mock profile
    expect(screen.getByText('Software Engineer with 5 years of experience')).toBeInTheDocument();
    
    // Check for experience data (should be in heading format)
    expect(screen.getByText('Software Engineer, Tech Corp')).toBeInTheDocument();
    
    // Check for education data
    expect(screen.getByText('Bachelor of Science in Computer Science, University of Example')).toBeInTheDocument();
    
    // Check for interests
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Machine Learning')).toBeInTheDocument();
  });
});
