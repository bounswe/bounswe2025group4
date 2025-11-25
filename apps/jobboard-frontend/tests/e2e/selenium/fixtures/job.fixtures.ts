/**
 * Job Post Test Fixtures
 *
 * Provides reusable data for creating job posts in E2E tests.
 */

export interface JobPostData {
  title: string;
  description: string;
  remote: boolean;
  minSalary: number;
  maxSalary: number;
  contactEmail: string;
  inclusiveOpportunity: boolean;
}

/**
 * Generate unique job title with timestamp
 */
export function generateUniqueJobTitle(prefix: string = 'E2E Job'): string {
  const timestamp = Date.now();
  return `${prefix} ${timestamp}`;
}

/**
 * Default job post data for testing
 */
export function getDefaultJobPostData(titlePrefix: string = 'E2E Job Post'): JobPostData {
  return {
    title: generateUniqueJobTitle(titlePrefix),
    description:
      'Automated E2E job post created for test coverage. This role validates the creation flow and should not be used for production hiring.',
    remote: true,
    minSalary: 60000,
    maxSalary: 90000,
    contactEmail: 'e2e-employer@test.com',
    inclusiveOpportunity: true,
  };
}

/**
 * Generate custom job post data
 */
export function generateJobPostData(overrides: Partial<JobPostData> = {}): JobPostData {
  return {
    ...getDefaultJobPostData(),
    ...overrides,
  };
}
