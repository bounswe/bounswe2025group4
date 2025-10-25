import type {
  Company,
  Review,
  ReviewStats,
  CreateReviewRequest,
  ReviewResponse,
} from '@/types/review.types';
import { mockCompanies, mockReviews } from '@/data/mock-companies';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  await delay(300);
  const company = mockCompanies.find((c) => c.slug === slug);
  return company || null;
}

export async function getCompanyReviews(
  companyId: number,
  page = 1,
  limit = 10
): Promise<Review[]> {
  await delay(400);
  const companyReviews = mockReviews
    .filter((r) => r.companyId === companyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const start = (page - 1) * limit;
  const end = start + limit;
  return companyReviews.slice(start, end);
}

export async function getCompanyReviewStats(companyId: number): Promise<ReviewStats> {
  await delay(300);
  const companyReviews = mockReviews.filter((r) => r.companyId === companyId);

  if (companyReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      categoryAverages: {
        culture: 0,
        benefits: 0,
        workLifeBalance: 0,
        management: 0,
        careerGrowth: 0,
      },
    };
  }

  // Calculate average overall rating
  const averageRating =
    companyReviews.reduce((sum, review) => sum + review.overallRating, 0) /
    companyReviews.length;

  // Calculate rating distribution
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  companyReviews.forEach((review) => {
    const rounded = Math.round(review.overallRating) as 1 | 2 | 3 | 4 | 5;
    ratingDistribution[rounded]++;
  });

  // Calculate category averages
  const categoryAverages = {
    culture:
      companyReviews.reduce((sum, review) => sum + review.ratings.culture, 0) /
      companyReviews.length,
    benefits:
      companyReviews.reduce((sum, review) => sum + review.ratings.benefits, 0) /
      companyReviews.length,
    workLifeBalance:
      companyReviews.reduce((sum, review) => sum + review.ratings.workLifeBalance, 0) /
      companyReviews.length,
    management:
      companyReviews.reduce((sum, review) => sum + review.ratings.management, 0) /
      companyReviews.length,
    careerGrowth:
      companyReviews.reduce((sum, review) => sum + review.ratings.careerGrowth, 0) /
      companyReviews.length,
  };

  return {
    averageRating,
    totalReviews: companyReviews.length,
    ratingDistribution,
    categoryAverages,
  };
}

export async function createReview(
  request: CreateReviewRequest
): Promise<ReviewResponse> {
  await delay(500);

  // Calculate overall rating from category ratings
  const { culture, benefits, workLifeBalance, management, careerGrowth } = request.ratings;
  const overallRating =
    (culture + benefits + workLifeBalance + management + careerGrowth) / 5;

  // Create new review (mock - in real app this would be saved to backend)
  const newReview: Review = {
    id: mockReviews.length + 1,
    companyId: request.companyId,
    userId: Math.floor(Math.random() * 1000),
    username: request.isAnonymous ? 'Anonymous' : 'Current User',
    isAnonymous: request.isAnonymous,
    ratings: request.ratings,
    overallRating,
    comment: request.comment,
    createdAt: new Date().toISOString(),
    helpful: 0,
    notHelpful: 0,
  };

  // In a real app, this would be added to the database
  mockReviews.unshift(newReview);

  return {
    success: true,
    message: 'Review submitted successfully!',
    review: newReview,
  };
}

export async function markReviewHelpful(reviewId: number): Promise<void> {
  await delay(200);
  const review = mockReviews.find((r) => r.id === reviewId);
  if (review) {
    review.helpful++;
  }
}

export async function markReviewNotHelpful(reviewId: number): Promise<void> {
  await delay(200);
  const review = mockReviews.find((r) => r.id === reviewId);
  if (review) {
    review.notHelpful++;
  }
}
