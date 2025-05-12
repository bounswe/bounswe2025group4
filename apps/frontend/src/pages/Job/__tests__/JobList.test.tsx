import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../../utils/test-utils';
import JobListPage from '../JobList';
import { JobPost } from '../../../types/job';

// Mock the React Router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock the job service
vi.mock('../../../services/jobs.service', () => ({
  useGetJobs: () => ({
    data: [
      {
        id: 1,
        title: 'Frontend Developer',
        companyName: 'Tech Inc',
        location: 'Istanbul, Turkey',
        salary: 80000,
        description: 'A great frontend role',
        isRemote: true,
        ethicalTags: ['Green Policy', 'DEI Focus'],
        postedAt: '2023-10-15T12:00:00Z',
      },
      {
        id: 2,
        title: 'Backend Developer',
        companyName: 'Code Co',
        location: 'Ankara, Turkey',
        salary: 90000,
        description: 'A great backend role',
        isRemote: false,
        ethicalTags: ['Sustainable Tech', 'Fair Compensation'],
        postedAt: '2023-10-16T12:00:00Z',
      },
    ],
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
  }),
}));

// Mock the components
vi.mock('../../../components/jobs/JobFilterSidebar', () => ({
  default: () => <div data-testid="job-filter-sidebar">Filter Sidebar</div>,
}));

vi.mock('../../../components/jobs/JobCard', () => ({
  default: ({ job }: { job: JobPost }) => (
    <div data-testid={`job-card-${job.id}`}>{job.title}</div>
  ),
}));

vi.mock('../../../components/jobs/JobListSkeleton', () => ({
  default: () => <div data-testid="job-list-skeleton">Loading...</div>,
}));

vi.mock('../../../components/jobs/EmptyJobsState', () => ({
  default: () => <div data-testid="empty-jobs-state">No jobs found</div>,
}));

describe('JobListPage', () => {
  it('renders the job list page with correct elements', async () => {
    render(<JobListPage />);

    // Check the heading shows correct job count
    expect(screen.getByText(/job listings \(2 found\)/i)).toBeInTheDocument();

    // Check filter sidebar is rendered
    expect(screen.getByTestId('job-filter-sidebar')).toBeInTheDocument();

    // Check job cards are rendered
    expect(screen.getByTestId('job-card-1')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();

    expect(screen.getByTestId('job-card-2')).toBeInTheDocument();
    expect(screen.getByText('Backend Developer')).toBeInTheDocument();
  });
});
