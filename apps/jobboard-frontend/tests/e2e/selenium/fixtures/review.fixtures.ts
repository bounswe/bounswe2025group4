/**
 * Review Test Fixtures
 *
 * Provides test data for workplace reviews.
 * Based on the ReviewFormDialog component structure.
 */

import { getDefaultWorkplaceData } from './workplace.fixtures.ts';

export interface ReviewData {
  title?: string; // Optional review title
  policyRatings: Record<string, number>; // Ethical policy ratings (1-5 stars each)
  content?: string; // Optional review content/comment
  anonymous?: boolean; // Whether to post anonymously
}

/**
 * Default ethical policies used in the form
 */
export const DEFAULT_POLICIES = [
  ...(getDefaultWorkplaceData().ethicalTags || []),
] as const;

const buildPolicyRatings = (
  defaultRating: number,
  overrides: Partial<Record<string, number>> = {}
): Record<string, number> => {
  const baseRatings = Object.fromEntries(
    DEFAULT_POLICIES.map((policy) => [policy, defaultRating])
  ) as Record<string, number>;

  // Filter out undefined values from overrides to ensure type safety
  const validOverrides = Object.fromEntries(
    Object.entries(overrides).filter(([_, value]) => value !== undefined)
  ) as Record<string, number>;

  return {
    ...baseRatings,
    ...validOverrides,
  };
};

/**
 * Default review data for testing
 */
export function getDefaultReviewData(): ReviewData {
  return {
    title: 'Great workplace environment',
    policyRatings: buildPolicyRatings(4),
    content:
      'Great workplace with excellent ethical standards. The management is transparent and values employee feedback. Work-life balance is respected and the company truly cares about its employees.',
    anonymous: false,
  };
}

/**
 * Generate custom review data
 */
export function generateReviewData(overrides: Partial<ReviewData> = {}): ReviewData {
  return {
    ...getDefaultReviewData(),
    ...overrides,
    policyRatings: buildPolicyRatings(
      4,
      overrides.policyRatings || {}
    ),
  };
}

/**
 * Sample review data variations
 */
export const reviewVariations = {
  positive: generateReviewData({
    title: 'Exceptional workplace',
    policyRatings: buildPolicyRatings(5),
    content:
      'Exceptional workplace! Outstanding leadership, great culture, and strong commitment to ethical practices. Highly recommend working here.',
  }),
  neutral: generateReviewData({
    title: 'Decent workplace',
    policyRatings: buildPolicyRatings(3),
    content:
      'Decent workplace with some good practices. Room for improvement in certain areas, but overall a fair employer.',
  }),
  detailed: generateReviewData({
    title: 'Good workplace with room for improvement',
    policyRatings: buildPolicyRatings(4),
    content:
      'Good workplace environment with clear ethical policies. Management is generally responsive. Benefits are competitive. Some areas could use improvement but overall positive experience. Would recommend to others in the industry.',
  }),
  brief: generateReviewData({
    title: 'Good company',
    policyRatings: buildPolicyRatings(4),
    content: 'Good company with strong values and ethical practices.',
  }),
  minimalRatings: generateReviewData({
    policyRatings: DEFAULT_POLICIES.reduce((acc, policy, index) => {
      acc[policy] = index === 0 ? 4 : 0;
      return acc;
    }, {} as Record<string, number>),
    content: 'Minimal review with only diversity rating.',
  }),
  anonymous: generateReviewData({
    title: 'Anonymous feedback',
    policyRatings: buildPolicyRatings(4, DEFAULT_POLICIES.reduce((acc, policy, index) => {
      acc[policy] = index % 2 === 0 ? 4 : 3;
      return acc;
    }, {} as Record<string, number>)),
    content: 'Posting this anonymously to share honest feedback about workplace practices.',
    anonymous: true,
  }),
};

/**
 * Generate random rating (1-5)
 */
export function generateRandomRating(): number {
  return Math.floor(Math.random() * 5) + 1;
}

/**
 * Generate review with timestamp for uniqueness
 */
export function generateUniqueReview(): ReviewData {
  const timestamp = new Date().toISOString();
  return {
    title: `E2E Test Review ${timestamp}`,
    policyRatings: buildPolicyRatings(4),
    content: `E2E test review posted at ${timestamp}. This workplace demonstrates good ethical practices and values transparency.`,
    anonymous: false,
  };
}

/**
 * Generate policy ratings with all same rating
 */
export function generateUniformRatings(rating: number): Record<string, number> {
  return Object.fromEntries(DEFAULT_POLICIES.map((policy) => [policy, rating]));
}
