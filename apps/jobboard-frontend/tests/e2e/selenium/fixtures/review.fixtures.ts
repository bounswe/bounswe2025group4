/**
 * Review Test Fixtures
 *
 * Provides test data for workplace reviews.
 */

export interface ReviewData {
  rating: number; // 1-5 stars
  text: string;
}

/**
 * Default review data for testing
 */
export function getDefaultReviewData(): ReviewData {
  return {
    rating: 4,
    text: 'Great workplace with excellent ethical standards. The management is transparent and values employee feedback. Work-life balance is respected and the company truly cares about its employees.',
  };
}

/**
 * Generate custom review data
 */
export function generateReviewData(overrides: Partial<ReviewData> = {}): ReviewData {
  return {
    ...getDefaultReviewData(),
    ...overrides,
  };
}

/**
 * Sample review data variations
 */
export const reviewVariations = {
  positive: generateReviewData({
    rating: 5,
    text: 'Exceptional workplace! Outstanding leadership, great culture, and strong commitment to ethical practices. Highly recommend working here.',
  }),
  neutral: generateReviewData({
    rating: 3,
    text: 'Decent workplace with some good practices. Room for improvement in certain areas, but overall a fair employer.',
  }),
  detailed: generateReviewData({
    rating: 4,
    text: 'Good workplace environment with clear ethical policies. Management is generally responsive. Benefits are competitive. Some areas could use improvement but overall positive experience. Would recommend to others in the industry.',
  }),
  brief: generateReviewData({
    rating: 4,
    text: 'Good company with strong values and ethical practices.',
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
    rating: 4,
    text: `E2E test review posted at ${timestamp}. This workplace demonstrates good ethical practices and values transparency.`,
  };
}
