import { useState, useEffect, useRef } from 'react';
import { X, Briefcase, GraduationCap, Award, Heart, Upload, Trash2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from 'react-i18next';

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
  onDelete?: (id: number) => void;
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
  onDelete?: (id: number) => void;
}

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { firstName: string; lastName: string; bio?: string }) => void;
}

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl?: string;
  onUpload: (file: File) => void;
  onDelete?: () => void;
  isUploading?: boolean;
}

// Modal Base Component
function Modal({ isOpen, onClose, title, children }: ModalProps): React.JSX.Element | null {
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
export function EditBioModal({ isOpen, onClose, initialBio = '', onSave }: EditBioModalProps): React.JSX.Element {
  const [bio, setBio] = useState<string>(initialBio);
  const { t } = useTranslation('common');

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
    <Modal isOpen={isOpen} onClose={onClose} title={t('profile.about.modal.title')}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('profile.about.modal.bioLabel')}
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder={t('profile.about.modal.placeholder')}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {t('profile.about.modal.characterCount', { count: bio.length })}
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            {t('profile.actions.cancel')}
          </Button>
          <Button onClick={handleSave}>{t('profile.actions.saveChanges')}</Button>
        </div>
      </div>
    </Modal>
  );
}

// Experience Modal
export function ExperienceModal({ isOpen, onClose, experience, onSave }: ExperienceModalProps): React.JSX.Element {
  const [formData, setFormData] = useState<Experience & { current: boolean }>({
    company: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    current: false,
  });
  const { t } = useTranslation('common');

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
      title={experience ? t('profile.experience.modal.editTitle') : t('profile.experience.modal.addTitle')}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">
              {t('profile.experience.modal.fields.company.label')}{' '}
              <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('profile.experience.modal.fields.company.placeholder')}
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">
              {t('profile.experience.modal.fields.position.label')}{' '}
              <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('profile.experience.modal.fields.position.placeholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('profile.experience.modal.fields.startDate.label')}{' '}
              <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('profile.experience.modal.fields.endDate.label')}
            </label>
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
              <span className="text-sm font-medium">
                {t('profile.experience.modal.fields.current.label')}
              </span>
            </label>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">
              {t('profile.experience.modal.fields.description.label')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder={t('profile.experience.modal.fields.description.placeholder')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t('profile.actions.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid()}>
            {experience
              ? t('profile.experience.modal.submitEdit')
              : t('profile.experience.modal.submitAdd')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Education Modal
export function EducationModal({ isOpen, onClose, education, onSave }: EducationModalProps): React.JSX.Element {
  const [formData, setFormData] = useState<Education & { current: boolean }>({
    school: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: '',
    current: false,
  });
  const { t } = useTranslation('common');

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
      title={education ? t('profile.education.modal.editTitle') : t('profile.education.modal.addTitle')}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">
              {t('profile.education.modal.fields.school.label')}{' '}
              <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={formData.school}
                onChange={(e) => handleChange('school', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('profile.education.modal.fields.school.placeholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('profile.education.modal.fields.degree.label')}{' '}
              <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.degree}
              onChange={(e) => handleChange('degree', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('profile.education.modal.fields.degree.placeholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('profile.education.modal.fields.field.label')}{' '}
              <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.field}
              onChange={(e) => handleChange('field', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('profile.education.modal.fields.field.placeholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('profile.education.modal.fields.startDate.label')}{' '}
              <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('profile.education.modal.fields.endDate.label')}
            </label>
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
              <span className="text-sm font-medium">
                {t('profile.education.modal.fields.current.label')}
              </span>
            </label>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">
              {t('profile.education.modal.fields.description.label')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder={t('profile.education.modal.fields.description.placeholder')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t('profile.actions.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid()}>
            {education
              ? t('profile.education.modal.submitEdit')
              : t('profile.education.modal.submitAdd')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Skill Modal
export function SkillModal({ isOpen, onClose, skill, onSave, onDelete }: SkillModalProps): React.JSX.Element {
  const [name, setName] = useState<string>('');
  const { t } = useTranslation('common');

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={skill ? t('profile.skills.modal.editTitle') : t('profile.skills.modal.addTitle')}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('profile.skills.modal.fields.name.label')}{' '}
            <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('profile.skills.modal.fields.name.placeholder')}
            />
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <div>
            {skill?.id && onDelete && (
              <Button 
                variant="outline" 
                onClick={() => {
                  onDelete(skill.id!);
                  onClose();
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('profile.skills.modal.delete')}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              {t('profile.actions.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={!name}>
              {skill ? t('profile.skills.modal.submitEdit') : t('profile.skills.modal.submitAdd')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Interest Modal
export function InterestModal({ isOpen, onClose, interest, onSave, onDelete }: InterestModalProps): React.JSX.Element {
  const [name, setName] = useState<string>('');
  const { t } = useTranslation('common');

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={interest ? t('profile.interests.modal.editTitle') : t('profile.interests.modal.addTitle')}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('profile.interests.modal.fields.name.label')}{' '}
            <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Heart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('profile.interests.modal.fields.name.placeholder')}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t('profile.interests.modal.helper')}
          </p>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <div>
            {interest?.id && onDelete && (
              <Button
                variant="outline"
                onClick={() => {
                  onDelete(interest.id!);
                  onClose();
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('profile.interests.modal.delete')}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              {t('profile.actions.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={!name}>
              {interest ? t('profile.interests.modal.submitEdit') : t('profile.interests.modal.submitAdd')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Create Profile Modal
export function CreateProfileModal({ isOpen, onClose, onSave }: CreateProfileModalProps): React.JSX.Element {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const { t } = useTranslation('common');

  const handleSave = () => {
    if (firstName.trim() && lastName.trim()) {
      onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim() || undefined,
      });
      onClose();
    }
  };

  const handleClose = () => {
    setFirstName('');
    setLastName('');
    setBio('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('profile.create.title')}>
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground">
            {t('profile.create.description')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('profile.create.fields.firstName.label')} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('profile.create.fields.firstName.placeholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('profile.create.fields.lastName.label')} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('profile.create.fields.lastName.placeholder')}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t('profile.create.fields.bio.label')}
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t('profile.create.fields.bio.placeholder')}
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {t('profile.create.helper')}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            {t('profile.actions.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!firstName.trim() || !lastName.trim()}>
            {t('profile.create.submit')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Image Upload Modal
export function ImageUploadModal({ 
  isOpen, 
  onClose, 
  currentImageUrl, 
  onUpload, 
  onDelete, 
  isUploading = false 
}: ImageUploadModalProps): React.JSX.Element {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation('common');

  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl(null);
    }
  }, [isOpen]);

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const files = event.dataTransfer.files;
    if (files?.[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = () => {
    if (fileInputRef.current?.files?.[0]) {
      onUpload(fileInputRef.current.files[0]);
    }
  };

  const handleClose = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('profile.imageModal.title')}>
      <div className="space-y-6">
        {/* Current Image */}
        {currentImageUrl && !previewUrl && (
          <div className="text-center">
            <Avatar className="h-32 w-32 mx-auto mb-4">
              <AvatarImage src={currentImageUrl} alt={t('profile.imageModal.current')} />
              <AvatarFallback>
                <Camera className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">{t('profile.imageModal.current')}</p>
          </div>
        )}

        {/* Preview */}
        {previewUrl && (
          <div className="text-center">
            <Avatar className="h-32 w-32 mx-auto mb-4">
              <AvatarImage src={previewUrl} alt={t('profile.imageModal.preview')} />
              <AvatarFallback>
                <Camera className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">{t('profile.imageModal.preview')}</p>
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">{t('profile.imageModal.uploadTitle')}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {t('profile.imageModal.uploadDescription')}
          </p>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {t('profile.imageModal.chooseFile')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {t('profile.imageModal.fileTypes')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {currentImageUrl && onDelete && (
              <Button 
                variant="outline" 
                onClick={onDelete}
                disabled={isUploading}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('profile.imageModal.removePhoto')}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              {t('profile.actions.cancel')}
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!previewUrl || isUploading}
            >
              {isUploading ? t('profile.imageModal.uploading') : t('profile.imageModal.upload')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
