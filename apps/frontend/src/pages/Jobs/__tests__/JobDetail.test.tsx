import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, screen } from '../../../utils/test-utils';
import JobDetail from '../JobDetail';
import type { JobPost } from '../../../types/job';
import userEvent from '@testing-library/user-event';
import { useGetApplicationsByJobId } from '../../../services/applications.service';
import type { UseQueryResult } from '@tanstack/react-query';
import type {
  Application,
  ApplicationStatus,
} from '../../../types/application';
import { AuthContextType } from '../../../contexts/AuthContext';
import { AuthContext } from '../../../contexts/AuthContext';

// 1) Mock out react-router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
  };
});

// 2) Mock out the job service
const mockJobData: JobPost = {
  id: 123,
  title: 'Senior React Developer',
  company: 'Ethical Tech Co',
  location: 'Istanbul, Turkey',
  description:
    'We are looking for a talented React developer to join our team.',
  remote: true,
  minSalary: 100000,
  maxSalary: 150000,
  ethicalTags: 'fair_wage,sustainability',
  employerId: 1,
  contact: 'hr@ethicaltechco.com',
  postedDate: new Date().toISOString(),
  status: 'ACTIVE',
};

vi.mock('../../../services/jobs.service', () => ({
  useGetJobById: () => ({
    data: mockJobData,
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('../../../services/user.service', () => ({
  useCurrentUser: () => ({ data: { id: 1, name: 'Test User' } }),
}));

const mockSubmitMutateAsync = vi.fn();
// 3) Mock out applications.service
vi.mock('../../../services/applications.service', () => ({
  useGetApplicationsByJobId: vi.fn(),
  useGetApplicationsByUserId: () => vi.fn(),
  useSubmitApplication: () => ({
    mutateAsync: mockSubmitMutateAsync,
    isError: false,
    error: null,
  }),
}));

// 4) Mock auth & current user
const mockAuthContext = {
  id: '1',
  token: '123',
  setToken: vi.fn(),
  setId: vi.fn(),
};

vi.mock('../../../services/user.service', () => ({
  useCurrentUser: () => ({ data: { id: 1, name: 'Test User' } }),
}));

// 5) A little helper to create fake applications
const createMockApplication = (
  id: string,
  status: ApplicationStatus
): Application => ({
  id,
  title: 'Senior React Developer',
  company: 'Ethical Tech Co',
  applicantName: 'Test User',
  jobSeekerId: 1,
  jobPostingId: 123,
  status,
  feedback: '',
  submissionDate: new Date(),
});

// 6) Default mock shapes
const defaultQuery: Partial<UseQueryResult<Application[], Error>> = {
  data: [],
  isLoading: false,
  isError: false,
  isSuccess: true,
  isFetching: false,
  status: 'success',
  refetch: vi.fn(),
};

beforeEach(() => {
  // reset every time
  vi.clearAllMocks();
  // both “by job” and “by user” start out empty:
  vi.mocked(useGetApplicationsByJobId).mockReturnValue(
    defaultQuery as UseQueryResult<Application[], Error>
  );

  mockSubmitMutateAsync.mockClear();
  mockSubmitMutateAsync.mockResolvedValue(createMockApplication('1', 'PENDING'));
});

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

    // case-insensitive regex so “Fair wage” or “fair wage” both pass
    expect(screen.getByText(/fair wage/i)).toBeInTheDocument();
    expect(screen.getByText(/sustainability/i)).toBeInTheDocument();
  });

  it('successfully applies when apply button is clicked', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext as AuthContextType}>
        <JobDetail />
      </AuthContext.Provider>
    );
    const user = userEvent.setup();
    const applyBtn = screen.getByRole('button', {
      name: /apply for this job/i,
    });
    await user.click(applyBtn);

    expect(mockSubmitMutateAsync).toHaveBeenCalledWith({
      jobSeekerId: 1,
      jobPostingId: 123,
    });
  });
});
