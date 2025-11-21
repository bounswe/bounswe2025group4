/**
 * Workplace Test Fixtures
 *
 * Provides test data for workplace creation and management.
 */

export interface WorkplaceData {
  name: string;
  description: string;
  industry: string;
  location: string;
  website: string;
  ethicalPolicies: string;
}

/**
 * Generate unique workplace name with timestamp
 */
export function generateUniqueWorkplaceName(prefix: string = 'E2E Test Company'): string {
  const timestamp = Date.now();
  return `${prefix} ${timestamp}`;
}

/**
 * Default workplace data for testing
 */
export function getDefaultWorkplaceData(): WorkplaceData {
  return {
    name: generateUniqueWorkplaceName(),
    description:
      'This is an automated E2E test workplace. It demonstrates ethical workplace practices and values transparency.',
    industry: 'Technology',
    location: 'San Francisco, CA',
    website: 'https://example-test-company.com',
    ethicalPolicies:
      'We prioritize employee well-being, maintain transparent communication, and uphold fair labor practices.',
  };
}

/**
 * Generate custom workplace data
 */
export function generateWorkplaceData(overrides: Partial<WorkplaceData> = {}): WorkplaceData {
  return {
    ...getDefaultWorkplaceData(),
    ...overrides,
  };
}

/**
 * Sample workplace data variations for testing
 */
export const workplaceVariations = {
  techStartup: generateWorkplaceData({
    name: generateUniqueWorkplaceName('Tech Startup'),
    industry: 'Technology',
    description: 'Innovative tech startup focused on AI and machine learning solutions.',
  }),
  healthcareOrg: generateWorkplaceData({
    name: generateUniqueWorkplaceName('Healthcare Org'),
    industry: 'Healthcare',
    description: 'Healthcare organization committed to patient-first care and ethical practices.',
  }),
  educationInst: generateWorkplaceData({
    name: generateUniqueWorkplaceName('Education Institute'),
    industry: 'Education',
    description: 'Educational institution promoting inclusive learning and teacher support.',
  }),
};
