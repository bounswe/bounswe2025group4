import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../utils/test-utils';
import JobDetail from '../JobDetail';
import { JobPost } from '../../../types/job';

// Mock React Router's useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
  };
});

// Mock the job service
const mockJobData: Partial<JobPost> = {
  id: 123,
  title: 'Senior React Developer',
  company: 'Ethical Tech Co',
  location: 'Istanbul, Turkey',
  description:
    'We are looking for a talented React developer to join our team.',
  remote: true,
  minSalary: 100000,
  maxSalary: 150000,
  ethicalTags: ['Green Policy', 'Inclusive Workplace'],
};

vi.mock('../../../services/jobs.service', () => ({
  useGetJobById: () => ({
    data: mockJobData,
    isLoading: false,
    isError: false,
  }),
}));

// Define the props type for the ApplicationForm
interface ApplicationFormProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    jobId: string;
    name: string;
    email: string;
    resume: File;
  }) => void;
}

// Mock the ApplicationForm component
vi.mock('../ApplicationForm', () => ({
  default: ({ open, onClose, onSubmit }: ApplicationFormProps) => (
    <div
      data-testid="application-form"
      style={{ display: open ? 'block' : 'none' }}
    >
      <button onClick={onClose} data-testid="close-button">
        Close
      </button>
      <button
        onClick={() =>
          onSubmit({
            jobId: '123',
            name: 'Test',
            email: 'test@example.com',
            resume: {} as File,
          })
        }
        data-testid="submit-button"
      >
        Submit
      </button>
    </div>
  ),
}));

// Mock window.alert
window.alert = vi.fn();

describe('JobDetail', () => {
  it('renders job details correctly', () => {
    render(<JobDetail />);

    expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
    expect(
      screen.getByText('Ethical Tech Co - Istanbul, Turkey')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'We are looking for a talented React developer to join our team.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Remote:/)).toBeInTheDocument();
    expect(screen.getByText(/Yes/)).toBeInTheDocument();
    expect(screen.getByText(/Salary:/)).toBeInTheDocument();
    expect(screen.getByText(/100000 - 150000/)).toBeInTheDocument();
  });

  it('displays ethical tags', () => {
    render(<JobDetail />);

    expect(screen.getByText('Ethical Tags')).toBeInTheDocument();
    expect(screen.getByText('Green Policy')).toBeInTheDocument();
    expect(screen.getByText('Inclusive Workplace')).toBeInTheDocument();
  });

  it('shows application form when apply button is clicked', () => {
    render(<JobDetail />);

    const applicationForm = screen.getByTestId('application-form');
    expect(applicationForm).toHaveStyle({ display: 'none' });

    const applyButton = screen.getByText('Apply for this Job');
    fireEvent.click(applyButton);

    expect(applicationForm).toHaveStyle({ display: 'block' });
  });

  it('closes application form when close is clicked', () => {
    render(<JobDetail />);

    // Open the form first
    const applyButton = screen.getByText('Apply for this Job');
    fireEvent.click(applyButton);

    const applicationForm = screen.getByTestId('application-form');
    expect(applicationForm).toHaveStyle({ display: 'block' });

    // Now close it
    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);

    expect(applicationForm).toHaveStyle({ display: 'none' });
  });
});
