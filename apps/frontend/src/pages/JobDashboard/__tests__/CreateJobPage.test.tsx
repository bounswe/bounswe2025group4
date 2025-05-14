import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../utils/test-utils';
import CreateJobPage from '../CreateJobPage';
import userEvent from '@testing-library/user-event';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useCreateJob
const mockMutateAsync = vi.fn().mockResolvedValue({});
vi.mock('../../../services/jobs.service', () => ({
  useCreateJob: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

// Mock console methods
global.console.log = vi.fn();
global.console.error = vi.fn();

describe('CreateJobPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the job creation form correctly', () => {
    render(<CreateJobPage />);

    // Check heading
    expect(screen.getByText('Create New Job Post')).toBeInTheDocument();

    // Check form fields
    expect(screen.getByLabelText('Job Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Job Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
    expect(screen.getByLabelText(/Location/)).toBeInTheDocument();
    expect(screen.getByLabelText(/remote option/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Minimum Salary')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum Salary')).toBeInTheDocument();
    expect(screen.getByText('Ethical Policies')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Contact Email for Applications')
    ).toBeInTheDocument();

    // Check submit button
    expect(
      screen.getByRole('button', { name: /create job post/i })
    ).toBeInTheDocument();
  });

  it('validates required fields on submission', async () => {
    render(<CreateJobPage />);
    const user = userEvent.setup();

    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /create job post/i }));

    // Check validation messages
    await waitFor(() => {
      expect(
        screen.getByText(/title must be at least 5 characters long/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/description must be at least 20 characters long/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/location is required/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('validates salary range correctly', async () => {
    render(<CreateJobPage />);
    const user = userEvent.setup();

    // Fill minimum required fields
    await user.type(
      screen.getByLabelText('Job Title'),
      'Senior Developer Position'
    );
    await user.type(
      screen.getByLabelText('Job Description'),
      'This is a detailed job description with more than 20 characters'
    );
    await user.type(screen.getByLabelText('Company Name'), 'Test Company');
    await user.type(screen.getByLabelText(/Location/), 'Remote');
    await user.type(
      screen.getByLabelText('Contact Email for Applications'),
      'test@example.com'
    );

    // Set invalid salary range (max < min)
    await user.type(screen.getByLabelText('Minimum Salary'), '100000');
    await user.type(screen.getByLabelText('Maximum Salary'), '90000');

    // Try to submit
    await user.click(screen.getByRole('button', { name: /create job post/i }));

    // Check validation message for salary
    await waitFor(() => {
      expect(
        screen.getByText(
          /max salary must be greater than or equal to min salary/i
        )
      ).toBeInTheDocument();
    });
  });

  it('submits the form successfully with valid data', async () => {
    render(<CreateJobPage />);
    const user = userEvent.setup();

    // Fill all required fields
    await user.type(
      screen.getByLabelText('Job Title'),
      'Senior Developer Position'
    );
    await user.type(
      screen.getByLabelText('Job Description'),
      'This is a detailed job description with more than 20 characters'
    );
    await user.type(screen.getByLabelText('Company Name'), 'Test Company');
    await user.type(screen.getByLabelText(/Location/), 'Remote');
    await user.type(
      screen.getByLabelText('Contact Email for Applications'),
      'test@example.com'
    );

    // Set valid salary range
    await user.type(screen.getByLabelText('Minimum Salary'), '80000');
    await user.type(screen.getByLabelText('Maximum Salary'), '120000');

    // Select ethical policies
    await user.click(screen.getByLabelText('Fair Wage'));
    await user.click(screen.getByLabelText('Sustainability'));

    // Submit form
    await user.click(screen.getByRole('button', { name: /create job post/i }));

    // Verify API call and navigation
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/jobs');
    });
  });

  it('allows submission with minimum required fields', async () => {
    render(<CreateJobPage />);
    const user = userEvent.setup();

    // Fill only required fields
    await user.type(screen.getByLabelText('Job Title'), 'Junior Developer');
    await user.type(
      screen.getByLabelText('Job Description'),
      'This is a detailed job description for juniors'
    );
    await user.type(screen.getByLabelText('Company Name'), 'Small Company');
    await user.type(screen.getByLabelText(/Location/), 'New York');
    await user.type(
      screen.getByLabelText('Contact Email for Applications'),
      'hr@smallcompany.com'
    );

    // Submit form
    await user.click(screen.getByRole('button', { name: /create job post/i }));

    // Verify API call and navigation
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/jobs');
    });
  });
});
