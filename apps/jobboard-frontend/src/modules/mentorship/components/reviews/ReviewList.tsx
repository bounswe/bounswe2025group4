import { ReviewCard } from './ReviewCard';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@shared/components/ui/pagination';
import type { ReviewResponse, ReviewListParams } from '@shared/types/workplace.types';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { getWorkplaceReviews } from '@modules/mentorship/services/reviews.service';
import type { ReactNode } from 'react';

interface ReviewListProps {
  workplaceId: number;
  canReply?: boolean;
  filters?: Omit<ReviewListParams, 'page' | 'size'>;
  reviewsPerPage?: number;
  actions?: ReactNode;
  onTotalsChange?: (total: number) => void;
  onReviewUpdate?: (reviewId: number, updates: Partial<ReviewResponse>) => void;
}

export function ReviewList({
  workplaceId,
  canReply,
  filters,
  reviewsPerPage = 10,
  actions,
  onTotalsChange,
  onReviewUpdate,
}: ReviewListProps) {
  const { t } = useTranslation('common');
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReviews(0);
  }, [workplaceId, filters]);

  const loadReviews = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await getWorkplaceReviews(workplaceId, {
        page: pageNumber,
        size: reviewsPerPage,
        ...filters,
      });
      setReviews(response.content);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      onTotalsChange?.(response.totalElements);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    loadReviews(pageNumber);
    // Scroll to top of reviews section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReviewUpdate = () => {
    // Reload current page to reflect changes
    loadReviews(currentPage);
  };

  const handleHelpfulUpdate = (
    reviewId: number,
    newHelpfulCount: number,
    helpfulByUser?: boolean,
  ) => {
    // Update the specific review's helpful count and user state in local state
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId
          ? { ...review, helpfulCount: newHelpfulCount, helpfulByUser }
          : review,
      ),
    );
    // Notify parent component if needed
    onReviewUpdate?.(reviewId, { helpfulCount: newHelpfulCount, helpfulByUser });
  };

  // Generate page numbers for pagination (0-indexed to 1-indexed for display)
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);

      if (currentPage <= 1) {
        end = 2;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 1) {
        pages.push('ellipsis');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 2) {
        pages.push('ellipsis');
      }

      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">{t('reviews.recentComments')}</h3>
        <div className="flex flex-wrap items-center gap-3">
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          <p className="text-sm text-muted-foreground">
            {t('reviews.totalReviews', { count: totalElements })}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('reviews.loading')}</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('reviews.noReviews')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                workplaceId={workplaceId}
                review={review}
                canReply={canReply}
                onUpdate={handleReviewUpdate}
                onHelpfulUpdate={handleHelpfulUpdate}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 0 && handlePageChange(currentPage - 1)}
                    className={
                      currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={`page-${index}`}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => handlePageChange(page as number)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {(page as number) + 1}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages - 1 && handlePageChange(currentPage + 1)
                    }
                    className={
                      currentPage === totalPages - 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
