import { useState, useEffect, useRef, type JSX } from 'react';
import { X, Briefcase, GraduationCap, Award, Heart, Upload, Trash2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
export function SkillModal({ isOpen, onClose, skill, onSave, onDelete }: SkillModalProps): JSX.Element {
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
                Delete Skill
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name}>
              {skill ? 'Save Changes' : 'Add Skill'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Interest Modal
export function InterestModal({ isOpen, onClose, interest, onSave, onDelete }: InterestModalProps): JSX.Element {
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
                Delete Interest
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name}>
              {interest ? 'Save Changes' : 'Add Interest'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Create Profile Modal
export function CreateProfileModal({ isOpen, onClose, onSave }: CreateProfileModalProps): JSX.Element {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');

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
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Your Profile">
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground">
            Welcome! Let's create your professional profile to get started.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">First Name *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Last Name *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio (Optional)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tell us about yourself..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Share a brief description about yourself and your professional background
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!firstName.trim() || !lastName.trim()}>
            Create Profile
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
}: ImageUploadModalProps): JSX.Element {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl(null);
    }
  }, [isOpen]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Profile Picture">
      <div className="space-y-6">
        {/* Current Image */}
        {currentImageUrl && !previewUrl && (
          <div className="text-center">
            <Avatar className="h-32 w-32 mx-auto mb-4">
              <AvatarImage src={currentImageUrl} alt="Current profile" />
              <AvatarFallback>
                <Camera className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">Current profile picture</p>
          </div>
        )}

        {/* Preview */}
        {previewUrl && (
          <div className="text-center">
            <Avatar className="h-32 w-32 mx-auto mb-4">
              <AvatarImage src={previewUrl} alt="Preview" />
              <AvatarFallback>
                <Camera className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">Preview</p>
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
          <p className="text-lg font-medium mb-2">Upload a photo</p>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop or click to browse
          </p>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground mt-2">
            PNG, JPG up to 10MB
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
                Remove Photo
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!previewUrl || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}