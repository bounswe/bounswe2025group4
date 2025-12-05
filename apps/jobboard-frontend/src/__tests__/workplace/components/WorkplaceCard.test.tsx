import { render, screen, fireEvent } from '@testing-library/react';
import { WorkplaceCard } from '@modules/workplace/components/workplace/WorkplaceCard';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import type { WorkplaceBriefResponse } from '@shared/types/workplace.types';

const mockWorkplace: WorkplaceBriefResponse = {
  id: 1,
  companyName: 'Test Company',
  imageUrl: 'https://example.com/image.jpg',
  sector: 'Technology',
  location: 'New York, NY',
  shortDescription: 'A great place to work',
  overallAvg: 4.5,
  ethicalTags: ['Sustainability', 'Diversity'],
  ethicalAverages: { 'Sustainability': 4.0, 'Diversity': 5.0 }
};

describe('WorkplaceCard', () => {
  const renderComponent = (props = {}) => {
    return render(
      <BrowserRouter>
        <WorkplaceCard workplace={mockWorkplace} {...props} />
      </BrowserRouter>
    );
  };

  it('renders workplace information correctly', () => {
    renderComponent();

    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('New York, NY')).toBeInTheDocument();
    expect(screen.getByText('A great place to work')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('renders ethical tags', () => {
    renderComponent();

    expect(screen.getByText('Sustainability')).toBeInTheDocument();
    expect(screen.getByText('Diversity')).toBeInTheDocument();
  });

  it('renders placeholder image when imageUrl is missing', () => {
    const workplaceWithoutImage = { ...mockWorkplace, imageUrl: undefined };
    render(
      <BrowserRouter>
        <WorkplaceCard workplace={workplaceWithoutImage} />
      </BrowserRouter>
    );

    // Check for the building icon container or fallback behavior
    // Since we can't easily query the icon by text, we can check that the img tag is NOT present
    const images = screen.queryAllByRole('img');
    // Note: Lucide icons are SVGs, not img tags usually, unless using an img src.
    // The component uses an img tag for the profile image.
    expect(images.length).toBe(0);
  });

  it('navigates to workplace detail on click', () => {
    renderComponent();
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/workplace/1');
  });

  it('calls onClick handler if provided', () => {
    const handleClick = vi.fn();
    renderComponent({ onClick: handleClick });

    // The card content is wrapped in a div that has the click handler when onClick is passed
    // However, looking at the component code:
    // <Card ... onClick={onClick}>
    
    // We can find the card by text and click it
    fireEvent.click(screen.getByText('Test Company'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
