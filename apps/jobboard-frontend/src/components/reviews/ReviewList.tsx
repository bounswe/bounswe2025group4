import { ReviewCard } from './ReviewCard';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { Review } from '@/types/review.types';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { getCompanyReviews, markReviewHelpful, markReviewNotHelpful } from '@/services/reviews.service';

interface ReviewListProps {
  companyId: number;
  initialReviews?: Review[];
  reviewsPerPage?: number;
}

export function ReviewList({ companyId, initialReviews = [], reviewsPerPage = 5 }: ReviewListProps) {
  const { t } = useTranslation('common');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReviews(1);
  }, [companyId]);

  const loadReviews = async (pageNumber: number) => {
    setLoading(true);
    try {
      const newReviews = await getCompanyReviews(companyId, pageNumber, reviewsPerPage);
      setReviews(newReviews);
      setCurrentPage(pageNumber);

      // For mock data, we'll estimate total reviews
      // In a real app, the API should return total count
      if (newReviews.length === reviewsPerPage) {
        setTotalReviews(pageNumber * reviewsPerPage + 1); // Assume there's more
      } else {
        setTotalReviews((pageNumber - 1) * reviewsPerPage + newReviews.length);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    loadReviews(pageNumber);
    // Scroll to top of reviews section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHelpful = async (reviewId: number) => {
    try {
      await markReviewHelpful(reviewId);
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review
        )
      );
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

  const handleNotHelpful = async (reviewId: number) => {
    try {
      await markReviewNotHelpful(reviewId);
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, notHelpful: review.notHelpful + 1 } : review
        )
      );
    } catch (error) {
      console.error('Failed to mark review as not helpful:', error);
    }
  };

  const totalPages = Math.ceil(totalReviews / reviewsPerPage);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 3;
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
      }

      if (start > 2) {
        pages.push('ellipsis');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (reviews.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('reviews.noReviews')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{t('reviews.recentComments')}</h3>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('reviews.loading')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onHelpful={handleHelpful}
                onNotHelpful={handleNotHelpful}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={
                      currentPage === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={`page-${index}`}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages && handlePageChange(currentPage + 1)
                    }
                    className={
                      currentPage === totalPages
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
