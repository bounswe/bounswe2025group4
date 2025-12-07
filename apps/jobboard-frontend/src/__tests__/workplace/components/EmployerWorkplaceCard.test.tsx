import { render, screen } from '@testing-library/react';
import { EmployerWorkplaceCard } from '@/modules/workplace/components/EmployerWorkplaceCard';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import type { EmployerWorkplaceBrief } from '@shared/types/workplace.types';

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockEmployerWorkplace: EmployerWorkplaceBrief = {
  role: 'ADMIN',
  workplace: {
    id: 1,
    companyName: 'My Company',
    imageUrl: 'https://example.com/logo.jpg',
    sector: 'Finance',
    location: 'London, UK',
    shortDescription: 'Finance solutions',
    overallAvg: 4.0,
    ethicalTags: [],
    ethicalAverages: {}
  }
};

describe('EmployerWorkplaceCard', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <EmployerWorkplaceCard 
          workplace={mockEmployerWorkplace.workplace} 
          role={mockEmployerWorkplace.role} 
        />
      </BrowserRouter>
    );
  };

  it('renders workplace information', () => {
    renderComponent();
    expect(screen.getByText('My Company')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });

  it('renders role badge', () => {
    renderComponent();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    renderComponent();
    expect(screen.getByRole('link', { name: /workplace\.settings/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /workplace\.manageRequests/i })).toBeInTheDocument();
  });

  it('links point to correct locations', () => {
    renderComponent();
    
    const settingsLink = screen.getByRole('link', { name: /workplace\.settings/i });
    expect(settingsLink).toHaveAttribute('href', '/employer/workplace/1/settings');

    const requestsLink = screen.getByRole('link', { name: /workplace\.manageRequests/i });
    expect(requestsLink).toHaveAttribute('href', '/employer/workplace/1/requests');
  });
});
