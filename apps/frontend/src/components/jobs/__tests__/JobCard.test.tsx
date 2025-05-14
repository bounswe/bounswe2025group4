import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import JobCard from '../JobCard';
import { describe, expect, it } from 'vitest';
import { JobPost } from '../../../types/job';

describe('JobCard', () => {
  const mockJob: Partial<JobPost> = {
    id: 1,
    title: 'Senior Developer',
    company: 'Tech Company',
    location: 'New York',
    minSalary: 80000,
    maxSalary: 120000,
    remote: true,
    description: 'This is a job description for a senior developer role.',
    ethicalTags: 'ENVIRONMENT_FRIENDLY,DIVERSITY_INCLUSIVE',
    employerId: 1,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    contact: 'test@example.com',
    postedDate: new Date().toISOString(),
  } as JobPost;

  it('renders job title and company', () => {
    render(
      <BrowserRouter>
        <JobCard job={mockJob as JobPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('Tech Company')).toBeInTheDocument();
  });

  it('renders job location', () => {
    render(
      <BrowserRouter>
        <JobCard job={mockJob as JobPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('formats and renders salary range correctly', () => {
    render(
      <BrowserRouter>
        <JobCard job={mockJob as JobPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('$80k - $120k')).toBeInTheDocument();
  });

  it('renders remote tag when job is remote', () => {
    render(
      <BrowserRouter>
        <JobCard job={mockJob as JobPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('Remote')).toBeInTheDocument();
  });

  it('renders on-site tag when job is not remote', () => {
    const onSiteJob: Partial<JobPost> = {
      ...mockJob,
      remote: false,
    };

    render(
      <BrowserRouter>
        <JobCard job={onSiteJob as JobPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('On-site')).toBeInTheDocument();
  });

  it('renders job description', () => {
    render(
      <BrowserRouter>
        <JobCard job={mockJob as JobPost} />
      </BrowserRouter>
    );

    expect(
      screen.getByText('This is a job description for a senior developer role.')
    ).toBeInTheDocument();
  });

  it('renders ethical tags', () => {
    render(
      <BrowserRouter>
        <JobCard job={mockJob as JobPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('ENVIRONMENT FRIENDLY')).toBeInTheDocument();
    expect(screen.getByText('DIVERSITY INCLUSIVE')).toBeInTheDocument();
  });

  it('does not render ethical tags section when no tags provided', () => {
    const jobWithoutTags: Partial<JobPost> = {
      ...mockJob,
      ethicalTags: '',
    };

    render(
      <BrowserRouter>
        <JobCard job={jobWithoutTags as JobPost} />
      </BrowserRouter>
    );

    expect(screen.queryByText('ENVIRONMENT FRIENDLY')).not.toBeInTheDocument();
    expect(screen.queryByText('DIVERSITY INCLUSIVE')).not.toBeInTheDocument();
  });

  it('formats salary correctly when only minSalary is provided', () => {
    const jobWithMinSalaryOnly: Partial<JobPost> = {
      ...mockJob,
      maxSalary: null as unknown as undefined,
    };

    render(
      <BrowserRouter>
        <JobCard job={jobWithMinSalaryOnly as JobPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('From $80k')).toBeInTheDocument();
  });

  it('formats salary correctly when only maxSalary is provided', () => {
    const jobWithMaxSalaryOnly: Partial<JobPost> = {
      ...mockJob,
      minSalary: null as unknown as undefined,
    };

    render(
      <BrowserRouter>
        <JobCard job={jobWithMaxSalaryOnly as JobPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('Up to $120k')).toBeInTheDocument();
  });

  it('shows "Not specified" when no salary range is provided', () => {
    const jobWithNoSalary: Partial<JobPost> = {
      ...mockJob,
      minSalary: null as unknown as undefined,
      maxSalary: null as unknown as undefined,
    };

    render(
      <BrowserRouter>
        <JobCard job={jobWithNoSalary as JobPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('Not specified')).toBeInTheDocument();
  });
});
