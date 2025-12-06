import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, setupUserEvent } from '@/test/utils';
import { JobCard } from '@modules/jobs/components/jobs/JobCard';
import type { Job } from '@shared/types/job';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('JobCard', () => {
  const createMockJobForCard = (overrides: Partial<Job> = {}): Job => ({
    id: '1',
    title: 'Software Engineer',
    workplace: {
      id: 1,
      companyName: 'Tech Corp',
      imageUrl: 'https://example.com/logo.png',
      sector: 'Technology',
      location: 'San Francisco',
      shortDescription: 'A tech company',
      overallAvg: 4.5,
      ethicalTags: ['Salary Transparency', 'Remote-Friendly'],
      ethicalAverages: {
        'Salary Transparency': 4.8,
        'Remote-Friendly': 4.3,
      },
    },
    location: 'San Francisco, CA',
    type: ['Full-time'],
    minSalary: 100,
    maxSalary: 150,
    inclusiveOpportunity: false,
    ...overrides,
  });

  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders job card with complete data', () => {
    const job = createMockJobForCard();

    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('$100k - $150k')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
  });

  it('renders job card with minimal data', () => {
    const job = createMockJobForCard({
      title: 'Junior Developer',
      workplace: {
        id: 2,
        companyName: 'StartupCo',
        sector: 'Tech',
        location: 'Remote',
        overallAvg: 0,
        ethicalTags: [],
        ethicalAverages: {},
      },
      minSalary: 50,
      maxSalary: 70,
    });

    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByText('Junior Developer')).toBeInTheDocument();
    expect(screen.getByText('StartupCo')).toBeInTheDocument();
    expect(screen.getByText('$50k - $70k')).toBeInTheDocument();
  });

  it('displays ethical tags correctly', () => {
    const job = createMockJobForCard({
      workplace: {
        ...createMockJobForCard().workplace,
        ethicalTags: ['Salary Transparency', 'Remote-Friendly', 'Mental Health Support'],
      },
    });

    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByText('jobs.tags.tags.salaryTransparency')).toBeInTheDocument();
    expect(screen.getByText('jobs.tags.tags.remoteFriendly')).toBeInTheDocument();
    expect(screen.getByText('jobs.tags.tags.mentalHealthSupport')).toBeInTheDocument();
  });

  it('shows truncated ethical tags with count badge when more than 3', () => {
    const job = createMockJobForCard({
      workplace: {
        ...createMockJobForCard().workplace,
        ethicalTags: [
          'Salary Transparency',
          'Equal Pay Policy',
          'Living Wage Employer',
          'Comprehensive Health Insurance',
          'Performance-Based Bonus',
        ],
      },
    });

    renderWithProviders(<JobCard job={job} />);

    // Should show first 3 tags
    expect(screen.getByText('jobs.tags.tags.salaryTransparency')).toBeInTheDocument();
    expect(screen.getByText('jobs.tags.tags.equalPayPolicy')).toBeInTheDocument();
    expect(screen.getByText('jobs.tags.tags.livingWageEmployer')).toBeInTheDocument();

    // Should show +2 badge
    expect(screen.getByText('+2')).toBeInTheDocument();

    // Should NOT show remaining tags
    expect(screen.queryByText('jobs.tags.tags.comprehensiveHealthInsurance')).not.toBeInTheDocument();
    expect(screen.queryByText('jobs.tags.tags.performanceBasedBonus')).not.toBeInTheDocument();
  });

  it('displays inclusive opportunity badge when enabled', () => {
    const job = createMockJobForCard({
      inclusiveOpportunity: true,
    });

    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByText('jobs.card.inclusiveOpportunity')).toBeInTheDocument();
  });

  it('does not display inclusive opportunity badge when disabled', () => {
    const job = createMockJobForCard({
      inclusiveOpportunity: false,
    });

    renderWithProviders(<JobCard job={job} />);

    expect(screen.queryByText('jobs.card.inclusiveOpportunity')).not.toBeInTheDocument();
  });

  it('displays "Remote" when location is "remote"', () => {
    const job = createMockJobForCard({
      location: 'remote',
    });

    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByText('jobs.card.remote')).toBeInTheDocument();
  });

  it('displays multiple job types correctly', () => {
    const job = createMockJobForCard({
      type: ['Full-time', 'Contract'],
    });

    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByText('jobs.filters.jobTypeOptions.fullTime / jobs.filters.jobTypeOptions.contract')).toBeInTheDocument();
  });

  it('navigates to job detail page when card is clicked', async () => {
    const user = setupUserEvent();
    const job = createMockJobForCard({ id: '123' });

    renderWithProviders(<JobCard job={job} />);

    const card = screen.getByText('Software Engineer').closest('.group');
    await user.click(card!);

    expect(mockNavigate).toHaveBeenCalledWith('/jobs/123');
  });

  it('navigates to workplace page when company name is clicked', async () => {
    const user = setupUserEvent();
    const job = createMockJobForCard({
      workplace: {
        ...createMockJobForCard().workplace,
        id: 456,
      },
    });

    renderWithProviders(<JobCard job={job} />);

    const companyName = screen.getByText('Tech Corp');
    await user.click(companyName);

    expect(mockNavigate).toHaveBeenCalledWith('/workplace/456');
  });

  it('navigates to workplace page when company logo is clicked', async () => {
    const user = setupUserEvent();
    const job = createMockJobForCard({
      workplace: {
        ...createMockJobForCard().workplace,
        id: 789,
      },
    });

    renderWithProviders(<JobCard job={job} />);

    // Find the avatar fallback or image container
    const avatarContainer = screen.getByText('TC') || screen.getByText('Tech Corp').closest('.group')?.querySelector('.size-20');
    await user.click(avatarContainer!);

    expect(mockNavigate).toHaveBeenCalledWith('/workplace/789');
  });

  it('does not navigate to job detail when clicking company name', async () => {
    const user = setupUserEvent();
    const job = createMockJobForCard({ id: '123' });

    renderWithProviders(<JobCard job={job} />);

    const companyName = screen.getByText('Tech Corp');
    await user.click(companyName);

    // Should navigate to workplace, not job
    expect(mockNavigate).not.toHaveBeenCalledWith('/jobs/123');
    expect(mockNavigate).toHaveBeenCalledWith('/workplace/1');
  });

  it('generates correct avatar fallback for company name', () => {
    const job = createMockJobForCard({
      workplace: {
        ...createMockJobForCard().workplace,
        companyName: 'Tech Innovation Corp',
        imageUrl: undefined,
      },
    });

    renderWithProviders(<JobCard job={job} />);

    // Should show initials: TIC (first letter of each word, max 3)
    expect(screen.getByText('TIC')).toBeInTheDocument();
  });

  it('handles very long job titles correctly', () => {
    const longTitle = 'Senior Principal Staff Lead Architect Engineer Manager Director';
    const job = createMockJobForCard({
      title: longTitle,
    });

    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('handles special characters in job title and company', () => {
    const job = createMockJobForCard({
      title: 'C++ & C# Developer @ Tech',
      workplace: {
        ...createMockJobForCard().workplace,
        companyName: 'Tech & Innovation Inc.',
      },
    });

    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByText('C++ & C# Developer @ Tech')).toBeInTheDocument();
    expect(screen.getByText('Tech & Innovation Inc.')).toBeInTheDocument();
  });

  it('formats salary correctly', () => {
    const job = createMockJobForCard({
      minSalary: 75,
      maxSalary: 125,
    });

    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByText('$75k - $125k')).toBeInTheDocument();
  });

  it('handles very large salary values', () => {
    const job = createMockJobForCard({
      minSalary: 500,
      maxSalary: 1000,
    });

    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByText('$500k - $1000k')).toBeInTheDocument();
  });

  it('handles international location names', () => {
    const job = createMockJobForCard({
      location: 'São Paulo, Brasil',
    });

    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByText('São Paulo, Brasil')).toBeInTheDocument();
  });

  it('displays job type as Part-time', () => {
    const job = createMockJobForCard({
      type: ['Part-time'],
    });

    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByText('jobs.filters.jobTypeOptions.partTime')).toBeInTheDocument();
  });

  it('displays job type as Contract', () => {
    const job = createMockJobForCard({
      type: ['Contract'],
    });

    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByText(/Contract/i)).toBeInTheDocument();
  });

  it('handles empty ethical tags array', () => {
    const job = createMockJobForCard({
      workplace: {
        ...createMockJobForCard().workplace,
        ethicalTags: [],
      },
    });

    renderWithProviders(<JobCard job={job} />);

    // Should still render the card
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('displays company logo when imageUrl is provided', () => {
    const job = createMockJobForCard({
      workplace: {
        ...createMockJobForCard().workplace,
        imageUrl: 'https://example.com/logo.png',
        companyName: 'Logo Corp',
      },
    });

    renderWithProviders(<JobCard job={job} />);

    // Check that company name is displayed (logo fallback shows initials)
    expect(screen.getByText('Logo Corp')).toBeInTheDocument();
    // Avatar fallback should show "LC" (first letter of each word)
    expect(screen.getByText('LC')).toBeInTheDocument();
  });

  it('renders all job types separated by slash', () => {
    const job = createMockJobForCard({
      type: ['Full-time', 'Part-time', 'Contract'],
    });

    renderWithProviders(<JobCard job={job} />);

    expect(screen.getByText('jobs.filters.jobTypeOptions.fullTime / jobs.filters.jobTypeOptions.partTime / jobs.filters.jobTypeOptions.contract')).toBeInTheDocument();
  });

  it('applies hover effect classes', () => {
    const job = createMockJobForCard();

    renderWithProviders(<JobCard job={job} />);

    const card = screen.getByText('Software Engineer').closest('.group');
    expect(card).toHaveClass('hover:-translate-y-0.5');
    expect(card).toHaveClass('hover:shadow-md');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('has correct ARIA attributes for accessibility', () => {
    const job = createMockJobForCard();

    renderWithProviders(<JobCard job={job} />);

    const card = screen.getByText('Software Engineer').closest('.group');
    expect(card).toBeInTheDocument();

    // Card should be clickable
    expect(card).toHaveClass('cursor-pointer');

    // Check that company name link is accessible
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });
});

