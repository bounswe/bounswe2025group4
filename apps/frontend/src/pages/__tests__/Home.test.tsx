import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import HomePage from '../Home';

// Mock the DailyQuote component to isolate the test
vi.mock('../../components/DailyQuote', () => ({
  DailyQuote: () => <div data-testid="daily-quote">Mocked Daily Quote</div>,
}));

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', {
        name: /find your next ethical career move/i,
      })
    ).toBeInTheDocument();
  });

  it('displays the secondary description text', () => {
    render(<HomePage />);

    expect(
      screen.getByText(/connect with employers who share your values/i)
    ).toBeInTheDocument();
  });

  it('renders the DailyQuote component', () => {
    render(<HomePage />);

    expect(screen.getByTestId('daily-quote')).toBeInTheDocument();
  });
});
