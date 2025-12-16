import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SkillsSection } from '@modules/profile/components/profile/SkillsSection';

vi.mock('react-i18next', async () => await import('@/__tests__/__mocks__/react-i18next'));

const sampleSkills = [
  { id: 1, name: 'TypeScript', level: 'Advanced' },
  { id: 2, name: 'React', level: 'Advanced' },
];

describe('SkillsSection (unit)', () => {
  it('renders skills and edit buttons', () => {
    render(<SkillsSection skills={sampleSkills} />);

    expect(screen.getByText('profile.skills.title')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('invokes onEdit for a skill', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    render(<SkillsSection skills={sampleSkills} onEdit={onEdit} />);

    const reactChip = screen.getByText('React').closest('div')!;
    const editButton = within(reactChip).getByRole('button');

    await user.click(editButton);
    expect(onEdit).toHaveBeenCalledWith(2);
  });

  it('shows empty state and handles add actions', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(<SkillsSection skills={[]} onAdd={onAdd} />);

    expect(screen.getByText('profile.skills.empty')).toBeInTheDocument();

    await user.click(screen.getByText('profile.skills.empty'));
    expect(onAdd).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'profile.actions.add' }));
    expect(onAdd).toHaveBeenCalledTimes(2);
  });
});
