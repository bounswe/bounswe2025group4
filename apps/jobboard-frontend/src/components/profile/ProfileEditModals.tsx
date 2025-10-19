import { useState, useEffect, type JSX } from 'react';
import { X, Briefcase, GraduationCap, Award, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface EditBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBio?: string;
  onSave: (bio: string) => void;
}

interface Experience {
  id?: number;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience?: Experience | null;
  onSave: (experience: Experience & { current?: boolean }) => void;
}

interface Education {
  id?: number;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  education?: Education | null;
  onSave: (education: Education & { current?: boolean }) => void;
}

interface Skill {
  id?: number;
  name: string;
}

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill?: Skill | null;
  onSave: (skill: Skill) => void;
}

interface Interest {
  id?: number;
  name: string;
}

interface InterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  interest?: Interest | null;
  onSave: (interest: Interest) => void;
}

// Modal Base Component
function Modal({ isOpen, onClose, title, children }: ModalProps): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Edit Bio Modal
export function EditBioModal({ isOpen, onClose, initialBio = '', onSave }: EditBioModalProps): JSX.Element {
  const [bio, setBio] = useState<string>(initialBio);

  useEffect(() => {
    if (isOpen) {
      setBio(initialBio);
    }
  }, [isOpen, initialBio]);

  const handleSave = (): void => {
    onSave(bio);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit About">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Tell us about yourself..."
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {bio.length} / 1000 characters
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
}

// Experience Modal
export function ExperienceModal({ isOpen, onClose, experience, onSave }: ExperienceModalProps): JSX.Element {
  const [formData, setFormData] = useState<Experience & { current: boolean }>({
    company: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    current: false,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        company: experience?.company || '',
        position: experience?.position || '',
        description: experience?.description || '',
        startDate: experience?.startDate || '',
        endDate: experience?.endDate || '',
        current: !experience?.endDate || false,
      });
    }
  }, [isOpen, experience]);

  const handleChange = (field: keyof typeof formData, value: string | boolean): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (): void => {
    const saveData: Experience & { current?: boolean } = { ...formData };
    if (experience?.id) {
      saveData.id = experience.id;
    }
    onSave(saveData);
    onClose();
  };

  const isFormValid = (): boolean => {
    return !!(formData.company && formData.position && formData.startDate);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={experience ? 'Edit Experience' : 'Add Experience'}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">
              Company <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Company name"
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">
              Position <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Job title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Start Date <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              disabled={formData.current}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div className="col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.current}
                onChange={(e) => {
                  handleChange('current', e.target.checked);
                  if (e.target.checked) handleChange('endDate', '');
                }}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm font-medium">I currently work here</span>
            </label>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Describe your role and achievements..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid()}>
            {experience ? 'Save Changes' : 'Add Experience'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Education Modal
export function EducationModal({ isOpen, onClose, education, onSave }: EducationModalProps): JSX.Element {
  const [formData, setFormData] = useState<Education & { current: boolean }>({
    school: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: '',
    current: false,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        school: education?.school || '',
        degree: education?.degree || '',
        field: education?.field || '',
        startDate: education?.startDate || '',
        endDate: education?.endDate || '',
        description: education?.description || '',
        current: !education?.endDate || false,
      });
    }
  }, [isOpen, education]);

  const handleChange = (field: keyof typeof formData, value: string | boolean): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (): void => {
    const saveData: Education & { current?: boolean } = { ...formData };
    if (education?.id) {
      saveData.id = education.id;
    }
    onSave(saveData);
    onClose();
  };

  const isFormValid = (): boolean => {
    return !!(formData.school && formData.degree && formData.field && formData.startDate);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={education ? 'Edit Education' : 'Add Education'}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">
              School <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={formData.school}
                onChange={(e) => handleChange('school', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="School name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Degree <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.degree}
              onChange={(e) => handleChange('degree', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Bachelor of Science"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Field of Study <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.field}
              onChange={(e) => handleChange('field', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Computer Science"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Start Date <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              disabled={formData.current}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div className="col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.current}
                onChange={(e) => {
                  handleChange('current', e.target.checked);
                  if (e.target.checked) handleChange('endDate', '');
                }}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm font-medium">I currently study here</span>
            </label>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Activities, achievements, coursework..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid()}>
            {education ? 'Save Changes' : 'Add Education'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Skill Modal
export function SkillModal({ isOpen, onClose, skill, onSave }: SkillModalProps): JSX.Element {
  const [name, setName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setName(skill?.name || '');
    }
  }, [isOpen, skill]);

  const handleSave = (): void => {
    const saveData: Skill = { name };
    if (skill?.id) {
      saveData.id = skill.id;
    }
    onSave(saveData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={skill ? 'Edit Skill' : 'Add Skill'}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Skill Name <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., JavaScript, Project Management"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name}>
            {skill ? 'Save Changes' : 'Add Skill'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Interest Modal
export function InterestModal({ isOpen, onClose, interest, onSave }: InterestModalProps): JSX.Element {
  const [name, setName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setName(interest?.name || '');
    }
  }, [isOpen, interest]);

  const handleSave = (): void => {
    const saveData: Interest = { name };
    if (interest?.id) {
      saveData.id = interest.id;
    }
    onSave(saveData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={interest ? 'Edit Interest' : 'Add Interest'}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Interest <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Heart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Sustainable Design, Open Source"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Add topics or areas you're passionate about
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name}>
            {interest ? 'Save Changes' : 'Add Interest'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}