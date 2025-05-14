import { render, screen } from '@testing-library/react';
import BadgeDisplay from '../BadgeDisplay';
import { describe, expect, it } from 'vitest';
import { Badge } from '../../../types/profile';

// Extended Badge type to match what the component expects
interface ExtendedBadge extends Badge {
  icon: string;
  earnedAt: string;
}

describe('BadgeDisplay', () => {
  const mockBadges: ExtendedBadge[] = [
    {
      id: 1,
      name: 'Top Contributor',
      description: 'Awarded to users who contribute actively',
      imageUrl: '/badges/top-contributor.png',
      icon: '/badges/top-contributor.png', // Component uses icon prop
      earnedAt: '2025-04-15T10:30:00Z',
    },
    {
      id: 2,
      name: 'Quick Responder',
      description: 'Responds to queries within 24 hours',
      imageUrl: '/badges/quick-responder.png',
      icon: '/badges/quick-responder.png', // Component uses icon prop
      earnedAt: '2025-03-10T14:20:00Z',
    },
  ];

  it('renders empty state message when no badges are provided', () => {
    render(<BadgeDisplay badges={[]} />);

    expect(screen.getByText('Badges')).toBeInTheDocument();
    expect(
      screen.getByText(
        'No badges earned yet. Participate in the community to earn badges!'
      )
    ).toBeInTheDocument();
  });

  it('renders badges with names when badges are provided', () => {
    render(<BadgeDisplay badges={mockBadges as Badge[]} />);

    expect(screen.getByText('Badges')).toBeInTheDocument();
    expect(screen.getAllByText('Top Contributor').length).toBe(2);
    expect(screen.getAllByText('Quick Responder').length).toBe(2);
  });

  it('renders badges without labels when showLabels is false', () => {
    render(<BadgeDisplay badges={mockBadges as Badge[]} showLabels={false} />);

    expect(screen.getByText('Badges')).toBeInTheDocument();
    expect(screen.queryByText('Top Contributor')).not.toBeInTheDocument();
    expect(screen.queryByText('Quick Responder')).not.toBeInTheDocument();

    // Check for avatar elements instead
    const avatars = document.querySelectorAll('.MuiAvatar-root');
    expect(avatars.length).toBe(2);
  });

  it('renders badges with correct size based on size prop', () => {
    render(<BadgeDisplay badges={mockBadges as Badge[]} size="small" />);

    // Check for small chips
    const smallChips = document.querySelectorAll('.MuiChip-sizeSmall');
    expect(smallChips.length).toBe(2);
  });

  it('renders badges with medium size by default', () => {
    render(<BadgeDisplay badges={mockBadges as Badge[]} />);

    // Chips should not have small size class
    const smallChips = document.querySelectorAll('.MuiChip-sizeSmall');
    expect(smallChips.length).toBe(0);

    // Should have regular chips
    const chips = document.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBe(2);
  });
});
