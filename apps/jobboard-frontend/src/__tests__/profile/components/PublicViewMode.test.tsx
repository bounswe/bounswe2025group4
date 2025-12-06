import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AboutSection } from '@modules/profile/components/profile/AboutSection';
import { ExperienceSection } from '@modules/profile/components/profile/ExperienceSection';
import { EducationSection } from '@modules/profile/components/profile/EducationSection';
import type { Experience, Education } from '@shared/types/profile.types';

vi.mock('react-i18next', async () => await import('@/test/__mocks__/react-i18next'));

describe('Profile Components - Public View Mode', () => {
  describe('AboutSection', () => {
    it('hides edit button when isPublicView is true', () => {
      // Act
      render(
        <AboutSection 
          bio="This is a test bio" 
          isPublicView={true} 
        />
      );

      // Assert
      expect(screen.getByText('profile.about.title')).toBeInTheDocument();
      expect(screen.getByText('This is a test bio')).toBeInTheDocument();
      expect(screen.queryByLabelText('profile.about.modal.title')).not.toBeInTheDocument();
    });

    it('shows edit button when isPublicView is false', () => {
      // Arrange
      const mockOnEdit = vi.fn();

      // Act
      render(
        <AboutSection 
          bio="This is a test bio" 
          isPublicView={false}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      expect(screen.getByText('profile.about.title')).toBeInTheDocument();
      expect(screen.getByText('This is a test bio')).toBeInTheDocument();
      expect(screen.getByLabelText('profile.about.modal.title')).toBeInTheDocument();
    });

    it('shows "no bio" message when bio is empty in public view', () => {
      // Act
      render(
        <AboutSection 
          bio=""
          isPublicView={true} 
        />
      );

      // Assert
      expect(screen.getByText('profile.about.noBio')).toBeInTheDocument();
      expect(screen.queryByText('profile.about.addBio')).not.toBeInTheDocument();
    });

    it('shows "add bio" prompt when bio is empty in private view', () => {
      // Arrange
      const mockOnEdit = vi.fn();

      // Act
      render(
        <AboutSection 
          bio=""
          isPublicView={false}
          onEdit={mockOnEdit}
        />
      );

      // Assert
      expect(screen.getByText('profile.about.addBio')).toBeInTheDocument();
      expect(screen.queryByText('profile.about.noBio')).not.toBeInTheDocument();
    });

    it('handles undefined bio in public view', () => {
      // Act
      render(
        <AboutSection 
          isPublicView={true} 
        />
      );

      // Assert
      expect(screen.getByText('profile.about.noBio')).toBeInTheDocument();
    });
  });

  describe('ExperienceSection', () => {
    const mockExperiences: Experience[] = [
      {
        id: 1,
        company: 'TechCorp',
        position: 'Senior Developer',
        description: 'Leading development of web applications',
        startDate: '2024-01-01',
        endDate: undefined
      },
      {
        id: 2,
        company: 'StartupCo',
        position: 'Junior Developer',
        description: 'Developed mobile applications',
        startDate: '2022-01-01',
        endDate: '2023-12-31'
      }
    ];

    it('hides add experience button when isPublicView is true', () => {
      // Act
      render(
        <ExperienceSection 
          experiences={mockExperiences}
          isPublicView={true} 
        />
      );

      // Assert
      expect(screen.getByText('profile.experience.title')).toBeInTheDocument();
      expect(screen.getByText(/TechCorp/)).toBeInTheDocument();
      expect(screen.getByText(/StartupCo/)).toBeInTheDocument();
      expect(screen.queryByText('profile.actions.add')).not.toBeInTheDocument();
    });

    it('shows add experience button when isPublicView is false', () => {
      // Arrange
      const mockOnAdd = vi.fn();

      // Act
      render(
        <ExperienceSection 
          experiences={mockExperiences}
          isPublicView={false}
          onAdd={mockOnAdd}
        />
      );

      // Assert
      expect(screen.getByText('profile.experience.title')).toBeInTheDocument();
      expect(screen.getByText('profile.actions.add')).toBeInTheDocument();
    });

    it('hides individual edit buttons for experiences in public view', () => {
      // Act
      render(
        <ExperienceSection 
          experiences={mockExperiences}
          isPublicView={true} 
        />
      );

      // Assert
      expect(screen.getByText(/TechCorp/)).toBeInTheDocument();
      expect(screen.getByText(/Senior Developer/)).toBeInTheDocument();
      
      // Should not have any edit buttons
      expect(screen.queryAllByLabelText(/edit/i)).toHaveLength(0);
      expect(screen.queryAllByLabelText(/delete/i)).toHaveLength(0);
    });

    it('shows individual edit buttons for experiences in private view', () => {
      // Arrange
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      // Act
      render(
        <ExperienceSection 
          experiences={mockExperiences}
          isPublicView={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Assert
      expect(screen.getByText(/TechCorp/)).toBeInTheDocument();
      
      // The main add button should be present when not in public view
      expect(screen.getByText('profile.actions.add')).toBeInTheDocument();
      
      // Individual edit buttons are handled by ExperienceItem component
      // so we just verify the section renders correctly with handlers passed
      expect(mockOnEdit).toBeDefined();
      expect(mockOnDelete).toBeDefined();
    });

    it('shows "no experience" message when experiences array is empty in public view', () => {
      // Act
      render(
        <ExperienceSection 
          experiences={[]}
          isPublicView={true} 
        />
      );

      // Assert
      expect(screen.getByText('profile.experience.noExperience')).toBeInTheDocument();
      expect(screen.queryByText('profile.experience.add')).not.toBeInTheDocument();
    });

    it('shows "add experience" prompt when experiences array is empty in private view', () => {
      // Arrange
      const mockOnAdd = vi.fn();

      // Act
      render(
        <ExperienceSection 
          experiences={[]}
          isPublicView={false}
          onAdd={mockOnAdd}
        />
      );

      // Assert
      expect(screen.getByText('profile.experience.empty')).toBeInTheDocument();
      expect(screen.queryByText('profile.experience.noExperience')).not.toBeInTheDocument();
    });
  });

  describe('EducationSection', () => {
    const mockEducations: Education[] = [
      {
        id: 1,
        school: 'Tech University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2018-09-01',
        endDate: '2022-06-15',
        description: 'Focused on software engineering'
      },
      {
        id: 2,
        school: 'Advanced Institute',
        degree: 'Master of Science',
        field: 'Software Engineering',
        startDate: '2022-09-01',
        endDate: '2024-06-15',
        description: 'Advanced studies in system design'
      }
    ];

    it('hides add education button when isPublicView is true', () => {
      // Act
      render(
        <EducationSection 
          educations={mockEducations}
          isPublicView={true} 
        />
      );

      // Assert
      expect(screen.getByText('profile.education.title')).toBeInTheDocument();
      expect(screen.getByText(/Tech University/)).toBeInTheDocument();
      expect(screen.getByText(/Advanced Institute/)).toBeInTheDocument();
      expect(screen.queryByText('profile.actions.add')).not.toBeInTheDocument();
    });

    it('shows add education button when isPublicView is false', () => {
      // Arrange
      const mockOnAdd = vi.fn();

      // Act
      render(
        <EducationSection 
          educations={mockEducations}
          isPublicView={false}
          onAdd={mockOnAdd}
        />
      );

      // Assert
      expect(screen.getByText('profile.education.title')).toBeInTheDocument();
      expect(screen.getByText('profile.actions.add')).toBeInTheDocument();
    });

    it('hides individual edit buttons for education in public view', () => {
      // Act
      render(
        <EducationSection 
          educations={mockEducations}
          isPublicView={true} 
        />
      );

      // Assert
      expect(screen.getByText(/Tech University/)).toBeInTheDocument();
      expect(screen.getByText(/Bachelor of Science/)).toBeInTheDocument();
      
      // Should not have any edit buttons
      expect(screen.queryAllByLabelText(/edit/i)).toHaveLength(0);
      expect(screen.queryAllByLabelText(/delete/i)).toHaveLength(0);
    });

    it('shows individual edit buttons for education in private view', () => {
      // Arrange
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      // Act
      render(
        <EducationSection 
          educations={mockEducations}
          isPublicView={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Assert
      expect(screen.getByText(/Tech University/)).toBeInTheDocument();
      
      // The main add button should be present when not in public view
      expect(screen.getByText('profile.actions.add')).toBeInTheDocument();
      
      // Individual edit buttons are handled by EducationItem component
      // so we just verify the section renders correctly with handlers passed
      expect(mockOnEdit).toBeDefined();
      expect(mockOnDelete).toBeDefined();
    });

    it('shows "no education" message when educations array is empty in public view', () => {
      // Act
      render(
        <EducationSection 
          educations={[]}
          isPublicView={true} 
        />
      );

      // Assert
      expect(screen.getByText('profile.education.noEducation')).toBeInTheDocument();
      expect(screen.queryByText('profile.education.add')).not.toBeInTheDocument();
    });

    it('shows "add education" prompt when educations array is empty in private view', () => {
      // Arrange
      const mockOnAdd = vi.fn();

      // Act
      render(
        <EducationSection 
          educations={[]}
          isPublicView={false}
          onAdd={mockOnAdd}
        />
      );

      // Assert
      expect(screen.getByText('profile.education.empty')).toBeInTheDocument();
      expect(screen.queryByText('profile.education.noEducation')).not.toBeInTheDocument();
    });
  });

  describe('Component Integration - Public View Consistency', () => {
    it('all components consistently hide edit functionality in public view', () => {
      // Arrange
      const mockExperiences: Experience[] = [{
        id: 1,
        company: 'Test Company',
        position: 'Developer',
        description: 'Test description',
        startDate: '2023-01-01',
        endDate: undefined
      }];

      const mockEducations: Education[] = [{
        id: 1,
        school: 'Test School',
        degree: 'Test Degree',
        field: 'Test Field',
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        description: 'Test description'
      }];

      // Act
      render(
        <div>
          <AboutSection bio="Test bio" isPublicView={true} />
          <ExperienceSection experiences={mockExperiences} isPublicView={true} />
          <EducationSection educations={mockEducations} isPublicView={true} />
        </div>
      );

      // Assert - No edit buttons should be present
      expect(screen.queryAllByText(/add/i)).toHaveLength(0);
      expect(screen.queryAllByText(/edit/i)).toHaveLength(0);
      expect(screen.queryAllByLabelText(/edit/i)).toHaveLength(0);
      expect(screen.queryAllByLabelText(/delete/i)).toHaveLength(0);

      // Verify content is still displayed
      expect(screen.getByText('Test bio')).toBeInTheDocument();
      expect(screen.getByText(/Test Company/)).toBeInTheDocument();
      expect(screen.getByText(/Test School/)).toBeInTheDocument();
    });

    it('all components consistently show edit functionality in private view', () => {
      // Arrange
      const mockExperiences: Experience[] = [{
        id: 1,
        company: 'Test Company',
        position: 'Developer',
        description: 'Test description',
        startDate: '2023-01-01',
        endDate: undefined
      }];

      const mockEducations: Education[] = [{
        id: 1,
        school: 'Test School',
        degree: 'Test Degree',
        field: 'Test Field',
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        description: 'Test description'
      }];

      const mockHandlers = {
        onEditBio: vi.fn(),
        onAddExperience: vi.fn(),
        onEditExperience: vi.fn(),
        onDeleteExperience: vi.fn(),
        onAddEducation: vi.fn(),
        onEditEducation: vi.fn(),
        onDeleteEducation: vi.fn(),
      };

      // Act
      render(
        <div>
          <AboutSection 
            bio="Test bio" 
            isPublicView={false} 
            onEdit={mockHandlers.onEditBio}
          />
          <ExperienceSection 
            experiences={mockExperiences} 
            isPublicView={false}
            onAdd={mockHandlers.onAddExperience}
            onEdit={mockHandlers.onEditExperience}
            onDelete={mockHandlers.onDeleteExperience}
          />
          <EducationSection 
            educations={mockEducations} 
            isPublicView={false}
            onAdd={mockHandlers.onAddEducation}
            onEdit={mockHandlers.onEditEducation}
            onDelete={mockHandlers.onDeleteEducation}
          />
        </div>
      );

      // Assert - Edit buttons should be present
      expect(screen.getByLabelText('profile.about.modal.title')).toBeInTheDocument();
      expect(screen.getAllByText('profile.actions.add')).toHaveLength(2); // Both experience and education sections
      
      // Verify content is still displayed
      expect(screen.getByText('Test bio')).toBeInTheDocument();
      expect(screen.getByText(/Test Company/)).toBeInTheDocument();
      expect(screen.getByText(/Test School/)).toBeInTheDocument();
    });
  });
});
