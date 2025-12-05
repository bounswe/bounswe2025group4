import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useReviewHelpful } from '../useReviewHelpful';
import type { ReviewResponse } from '@/types/workplace.types';

const mockMarkReviewHelpful = vi.fn();

vi.mock('@/services/reviews.service', () => ({
  markReviewHelpful: (...args: unknown[]) => mockMarkReviewHelpful(...args),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const baseReview: ReviewResponse = {
  id: 1,
  workplaceId: 10,
  userId: 20,
  anonymous: false,
  helpfulCount: 0,
  overallRating: 4,
  ethicalPolicyRatings: {},
  createdAt: '2025-12-05T17:52:06.771Z',
  updatedAt: '2025-12-05T17:52:06.771Z',
};

describe('useReviewHelpful', () => {
  beforeEach(() => {
    mockMarkReviewHelpful.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes from provided count and helpfulByUser', () => {
    const { result } = renderHook(() =>
      useReviewHelpful({
        workplaceId: 10,
        reviewId: 1,
        initialHelpfulCount: 5,
        initialUserVoted: true,
      }),
    );

    expect(result.current.helpfulCount).toBe(5);
    expect(result.current.userVoted).toBe(true);
  });

  it('marks helpful and syncs response state', async () => {
    mockMarkReviewHelpful.mockResolvedValue({
      ...baseReview,
      helpfulCount: 6,
      helpfulByUser: true,
    });

    const { result } = renderHook(() =>
      useReviewHelpful({
        workplaceId: 10,
        reviewId: 1,
        initialHelpfulCount: 5,
        initialUserVoted: false,
      }),
    );

    await act(async () => {
      await result.current.toggleHelpful();
    });

    expect(mockMarkReviewHelpful).toHaveBeenCalledWith(10, 1);
    expect(result.current.helpfulCount).toBe(6);
    expect(result.current.userVoted).toBe(true);
  });

  it('removes helpful when user clicks again', async () => {
    mockMarkReviewHelpful.mockResolvedValue({
      ...baseReview,
      helpfulCount: 4,
      helpfulByUser: false,
    });

    const { result } = renderHook(() =>
      useReviewHelpful({
        workplaceId: 10,
        reviewId: 1,
        initialHelpfulCount: 5,
        initialUserVoted: true,
      }),
    );

    await act(async () => {
      await result.current.toggleHelpful();
    });

    expect(mockMarkReviewHelpful).toHaveBeenCalledWith(10, 1);
    expect(result.current.helpfulCount).toBe(4);
    expect(result.current.userVoted).toBe(false);
  });

  it('reverts optimistic update on error', async () => {
    mockMarkReviewHelpful.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() =>
      useReviewHelpful({
        workplaceId: 10,
        reviewId: 1,
        initialHelpfulCount: 2,
        initialUserVoted: false,
      }),
    );

    await act(async () => {
      await result.current.toggleHelpful();
    });

    expect(result.current.helpfulCount).toBe(2);
    expect(result.current.userVoted).toBe(false);
  });
});

