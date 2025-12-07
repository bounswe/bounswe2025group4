export interface ReviewRatings {
  culture: number;
  benefits: number;
  workLifeBalance: number;
  management: number;
  careerGrowth: number;
}

export interface Review {
  id: number;
  companyId: number;
  userId: number;
  username: string;
  isAnonymous: boolean;
  ratings: ReviewRatings;
  overallRating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  notHelpful: number;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  categoryAverages: ReviewRatings;
}

export interface EthicalCommitment {
  id: string;
  label: string;
}

export interface JobOpening {
  id: number;
  title: string;
  department: string;
  location: string;
  image: string;
}

export interface Company {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  logo: string;
  employeeCount: string;
  industry: string;
  location: string;
  aboutUs: string;
  ethicalCommitments: EthicalCommitment[];
  jobOpenings: JobOpening[];
}

export interface CreateReviewRequest {
  companyId: number;
  isAnonymous: boolean;
  ratings: ReviewRatings;
  comment: string;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  review?: Review;
}
