import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

vi.mock('react-i18next', async () => await import('@/test/__mocks__/react-i18next'));
import { ProfileHeader } from '@modules/profile/components/profile/ProfileHeader';

const baseProps = {
  firstName: 'John',
  lastName: 'Doe',
  createdAt: '2023-05-01T00:00:00Z',
  postsCount: 3,
  badgesCount: 1,
};

describe('ProfileHeader (unit)', () => {
  it('renders core fields and uses translation keys with current role', () => {
    render(
      <ProfileHeader
        {...baseProps}
        experiences={[
          { id: 1, company: 'Tech Corp', position: 'Engineer', startDate: '2022-01-01' },
        ]}
      />,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('profile.header.currentRole')).toBeInTheDocument();
    expect(screen.getByText('profile.header.joined')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByLabelText('profile.header.actions.editImage')).toBeInTheDocument();
  });

  it('falls back to open to opportunities copy when no active job', () => {
    render(
      <ProfileHeader
        {...baseProps}
        experiences={[
          { id: 1, company: 'Old Corp', position: 'Analyst', startDate: '2019-01-01', endDate: '2020-01-01' },
        ]}
      />,
    );

    expect(screen.getByText('profile.header.openToOpportunities')).toBeInTheDocument();
  });

  it('calls edit image handler when button is clicked', () => {
    const onEditImage = vi.fn();
    render(
      <ProfileHeader
        {...baseProps}
        experiences={[]}
        onEditImage={onEditImage}
      />,
    );

    fireEvent.click(screen.getByLabelText('profile.header.actions.editImage'));
    expect(onEditImage).toHaveBeenCalledTimes(1);
  });
});
