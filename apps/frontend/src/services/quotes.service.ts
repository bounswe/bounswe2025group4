import { useQuery } from '@tanstack/react-query';
import { Quote } from '../types/quote';
import { apiClient } from './api';

class QuotesService {
  async fetchTodayQuote(): Promise<Quote> {
    const response = await apiClient.get<Quote>('/quote/today');
    return response.data;
  }
}

export const quotesService = new QuotesService();

/* React Query Hook */

export const useTodayQuote = () => {
  return useQuery<Quote>({
    queryKey: ['todayQuote'],
    queryFn: quotesService.fetchTodayQuote,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};
