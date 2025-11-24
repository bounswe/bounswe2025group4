/**
 * Workplace Test Fixtures
 *
 * Provides test data for workplace creation and management.
 */

export interface WorkplaceData {
  companyName: string;
  sector: string;
  location: string;
  website?: string;
  shortDescription?: string;
  detailedDescription?: string;
  ethicalTags?: string[];
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
    companyName: generateUniqueWorkplaceName(),
    sector: 'Technology',
    location: 'San Francisco, CA',
    website: 'https://example-test-company.com',
    shortDescription:
      'An automated E2E test workplace demonstrating ethical workplace practices.',
    detailedDescription:
      'This is an automated E2E test workplace. We demonstrate ethical workplace practices, value transparency, prioritize employee well-being, maintain transparent communication, and uphold fair labor practices.',
    ethicalTags: [
      'Salary Transparency',
      'Remote-Friendly',
      'Inclusive Hiring Practices',
    ],
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
    companyName: generateUniqueWorkplaceName('Tech Startup'),
    sector: 'Technology',
    shortDescription: 'Innovative tech startup focused on AI and machine learning solutions.',
  }),
  healthcareOrg: generateWorkplaceData({
    companyName: generateUniqueWorkplaceName('Healthcare Org'),
    sector: 'Healthcare',
    shortDescription: 'Healthcare organization committed to patient-first care and ethical practices.',
  }),
  educationInst: generateWorkplaceData({
    companyName: generateUniqueWorkplaceName('Education Institute'),
    sector: 'Education',
    shortDescription: 'Educational institution promoting inclusive learning and teacher support.',
  }),
};
