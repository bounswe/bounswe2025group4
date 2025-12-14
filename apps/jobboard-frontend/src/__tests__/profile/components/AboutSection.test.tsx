import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AboutSection } from '@modules/profile/components/profile/AboutSection';

vi.mock('react-i18next', async () => await import('@/__tests__/__mocks__/react-i18next'));

describe('AboutSection (unit)', () => {
  it('renders bio text when provided', () => {
    render(<AboutSection bio="Seasoned explorer of code" />);

    expect(screen.getByText('profile.about.title')).toBeInTheDocument();
    expect(screen.getByText('Seasoned explorer of code')).toBeInTheDocument();
  });

  it('shows add-bio prompt and triggers edit when no bio', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    render(<AboutSection onEdit={onEdit} />);

    expect(screen.getByText('profile.about.addBio')).toBeInTheDocument();

    await user.click(screen.getByText('profile.about.addBio'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is pressed', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    render(<AboutSection bio="Testing bio" onEdit={onEdit} />);

    await user.click(screen.getByLabelText('profile.about.modal.title'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
