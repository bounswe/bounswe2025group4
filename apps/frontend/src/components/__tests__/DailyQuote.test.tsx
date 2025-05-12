import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import { DailyQuote } from '../DailyQuote';

// Define the Quote type based on what the component expects
interface Quote {
  q: string;
  a?: string;
}

// Create mock functions with proper types
const mockQuoteService = {
  data: { q: 'Test quote text', a: 'Test Author' } as Quote | undefined,
  isLoading: false,
  isError: false,
};

// Mock the quotes service
vi.mock('../../services/quotes.service', () => ({
  useTodayQuote: () => mockQuoteService,
}));

describe('DailyQuote', () => {
  // Reset mocks before each test
  beforeEach(() => {
    // Reset to default values
    mockQuoteService.data = { q: 'Test quote text', a: 'Test Author' };
    mockQuoteService.isLoading = false;
    mockQuoteService.isError = false;
  });

  it('renders quote and author when data is available', () => {
    render(<DailyQuote />);

    expect(screen.getByText('Test quote text')).toBeInTheDocument();
    expect(screen.getByText('– Test Author')).toBeInTheDocument();
  });

  it('shows loading skeleton when data is loading', () => {
    // Override the mock for this test
    mockQuoteService.data = undefined;
    mockQuoteService.isLoading = true;

    render(<DailyQuote />);

    // Check for skeletons by their class name instead of role
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays error message when there is an error', () => {
    // Override the mock for this test
    mockQuoteService.data = undefined;
    mockQuoteService.isError = true;

    render(<DailyQuote />);

    expect(
      screen.getByText(/Failed to load today's inspiration/i)
    ).toBeInTheDocument();
  });

  it('shows anonymous when author is missing', () => {
    // Override the mock for this test
    mockQuoteService.data = { q: 'A quote without an author' };

    render(<DailyQuote />);

    expect(screen.getByText('A quote without an author')).toBeInTheDocument();
    expect(screen.getByText('– Anonymous')).toBeInTheDocument();
  });
});
