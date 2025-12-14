import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { JobCard } from '@modules/jobs/components/jobs/JobCard';
import type { Job } from '@shared/types/job';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const baseJob: Job = {
  id: '1',
  title: 'Principal Engineer',
  location: 'Remote',
  type: ['Full-time'],
  minSalary: 150,
  maxSalary: 200,
  inclusiveOpportunity: true,
  workplace: {
    id: 42,
    companyName: 'Open Source Co',
    imageUrl: 'https://example.com/logo.png',
    sector: 'Technology',
    location: 'Remote',
    shortDescription: 'We build open source tools',
    overallAvg: 4.7,
    ethicalTags: ['Remote-Friendly', 'Salary Transparency', 'Mentorship Program', 'Diverse Leadership'],
    ethicalAverages: {},
  },
};

const renderComponent = (job: Job = baseJob) =>
  render(<JobCard job={job} />, {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });

describe('JobCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockClear();
  });

  it('renders core job details with salary and inclusive badge', () => {
    renderComponent();

    expect(screen.getByText('Principal Engineer')).toBeInTheDocument();
    expect(screen.getByText('Open Source Co')).toBeInTheDocument();
    expect(screen.getByText('$150k - $200k')).toBeInTheDocument();
    expect(screen.getByText('jobs.card.remote')).toBeInTheDocument();
    expect(screen.getByText('jobs.card.inclusiveOpportunity')).toBeInTheDocument();
  });

  it('shows up to three ethical tags and an overflow counter', () => {
    renderComponent();

    expect(screen.getByText('jobs.tags.tags.remoteFriendly')).toBeInTheDocument();
    expect(screen.getByText('jobs.tags.tags.salaryTransparency')).toBeInTheDocument();
    expect(screen.getByText('jobs.tags.tags.mentorshipProgram')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('navigates to job details when the card is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Principal Engineer'));

    expect(navigateMock).toHaveBeenCalledWith('/jobs/1', { state: { from: 'jobs' } });
  });

  it('navigates to workplace without triggering card navigation', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Open Source Co'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/workplace/42');
  });

  it('omits inclusive badge when the job is not marked inclusive', () => {
    renderComponent({ ...baseJob, inclusiveOpportunity: false });

    expect(screen.queryByText('jobs.card.inclusiveOpportunity')).not.toBeInTheDocument();
  });
});

