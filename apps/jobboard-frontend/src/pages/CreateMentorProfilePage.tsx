import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createMentorProfile, updateMentorProfile, getMentorProfile } from '@/services/mentorship.service';
import { useAuth } from '@/contexts/AuthContext';
import type { CreateMentorProfileDTO, UpdateMentorProfileDTO } from '@/types/api.types';
import { profileService } from '@/services/profile.service';
import type { Profile } from '@/types/profile.types';
import CenteredLoader from '@/components/CenteredLoader';

type MentorProfileFormData = {
  expertise: string[]; // Mentor'a özel expertise (skills'ten farklı)
  maxMentees: string;
};

export default function CreateMentorProfilePage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('userId') !== null;
  const editUserId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!, 10) : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(isEditMode);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoadingUserProfile, setIsLoadingUserProfile] = useState(true);
  const [formData, setFormData] = useState<MentorProfileFormData>({
    expertise: [],
    maxMentees: '',
  });
  const [expertiseInput, setExpertiseInput] = useState('');

  const handleAddExpertise = () => {
    const trimmed = expertiseInput.trim();
    if (trimmed && !formData.expertise.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, trimmed],
      }));
      setExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(e => e !== expertise),
    }));
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoadingUserProfile(true);
        const profile = await profileService.getMyProfile();
        setUserProfile(profile);
      } catch (err) {
        // Profile might not exist, that's okay
        console.warn('Could not load user profile:', err);
      } finally {
        setIsLoadingUserProfile(false);
      }
    };

    loadUserProfile();
  }, []);

  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!isEditMode || !editUserId) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        setIsLoadingProfile(true);
        const existingProfile = await getMentorProfile(editUserId);
        
        if (!existingProfile) {
          // Profile doesn't exist, stay in create mode
          setIsLoadingProfile(false);
          return;
        }
        
        setFormData(prev => ({
          ...prev,
          expertise: existingProfile.expertise || [],
          maxMentees: existingProfile.maxMentees?.toString() || '',
        }));
      } catch (err) {
        console.error('Error loading mentor profile:', err);
        toast.error(t('mentorship.createMentorProfile.errorLoading') || 'Failed to load mentor profile');
        navigate('/mentorship');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadExistingProfile();
  }, [isEditMode, editUserId, navigate, t]);




  const validateForm = (): boolean => {
    if (formData.expertise.length === 0) {
      toast.error(t('mentorship.createMentorProfile.expertiseRequired'));
      return false;
    }

    const maxMenteesNum = parseInt(formData.maxMentees, 10);
    if (isNaN(maxMenteesNum) || maxMenteesNum < 1) {
      toast.error(t('mentorship.createMentorProfile.maxMenteesInvalid'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const maxMenteesNum = parseInt(formData.maxMentees, 10);
      
      if (isEditMode && editUserId) {
        // Update existing profile
        const updateData: UpdateMentorProfileDTO = {
          expertise: formData.expertise,
          maxMentees: maxMenteesNum,
        };
        
        await updateMentorProfile(editUserId, updateData);
        toast.success(t('mentorship.createMentorProfile.updateSuccess') || 'Mentor profile updated successfully!');
        navigate(`/mentorship/${editUserId}`);
      } else {
        // Create new profile
        const requestData: CreateMentorProfileDTO = {
          expertise: formData.expertise,
          maxMentees: maxMenteesNum,
        };

        await createMentorProfile(requestData);
        toast.success(t('mentorship.createMentorProfile.success'));
        navigate('/mentorship');
      }
    } catch (err: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} mentor profile:`, err);
      
      // Check if error is "already exists" (only for create mode)
      if (!isEditMode) {
        const errorMessage = err?.response?.data?.message || err?.message || '';
        const isAlreadyExists = 
          err?.response?.status === 409 || 
          errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('already exist');
        
        if (isAlreadyExists) {
          toast.error(t('mentorship.createMentorProfile.alreadyExists') || 'You already have a mentor profile. Please update your existing profile instead.');
          setHasExistingProfile(true);
          return;
        }
      }
      
      const errorMessage = err?.response?.data?.message || err?.message || t('mentorship.createMentorProfile.error');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  const isProfileComplete = userProfile && userProfile.bio && userProfile.bio.trim().length > 0;

  if (isLoadingProfile || isLoadingUserProfile) {
    return <CenteredLoader />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {isEditMode 
              ? (t('mentorship.createMentorProfile.editTitle') || 'Edit Mentor Profile')
              : t('mentorship.createMentorProfile.title')
            }
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isEditMode
              ? (t('mentorship.createMentorProfile.editSubtitle') || 'Update your mentor profile information')
              : t('mentorship.createMentorProfile.subtitle')
            }
          </p>
        </div>

        {/* Warning if profile is incomplete - Show this instead of form */}
        {!isEditMode && !isProfileComplete && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    {t('mentorship.createMentorProfile.profileIncompleteTitle') || 'Complete Your Profile First'}
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-4 max-w-md">
                    {t('mentorship.createMentorProfile.profileIncompleteMessage') || 'Please complete your profile (add a bio) before becoming a mentor.'}
                  </p>
                  <Button
                    onClick={() => navigate('/profile')}
                    className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                  >
                    {t('mentorship.createMentorProfile.completeProfile') || 'Complete Profile'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warning if profile already exists - Show this instead of form */}
        {hasExistingProfile && !isProfileComplete ? null : hasExistingProfile ? (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    {t('mentorship.createMentorProfile.alreadyExistsTitle') || 'Mentor Profile Already Exists'}
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-4 max-w-md">
                    {t('mentorship.createMentorProfile.alreadyExistsMessage') || 'You already have a mentor profile. To update your profile, please use the edit option.'}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={async () => {
                        // Navigate to view profile page
                        if (user?.id) {
                          try {
                            const { getMentorProfile } = await import('@/services/mentorship.service');
                            const profile = await getMentorProfile(user.id);
                            if (profile) {
                              navigate(`/mentorship/${profile.id}`);
                            } else {
                              navigate('/mentorship');
                            }
                          } catch (err) {
                            // If profile not found, just go to mentorship page
                            console.error('Error fetching mentor profile:', err);
                            navigate('/mentorship');
                          }
                        } else {
                          navigate('/mentorship');
                        }
                      }}
                      className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                    >
                      {t('mentorship.createMentorProfile.viewProfile') || 'View My Profile'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/mentorship')}
                      className="border-amber-300 dark:border-amber-700"
                    >
                      {t('mentorship.createMentorProfile.backToMentors') || 'Back to Mentors'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !isProfileComplete ? null : (
          <>
            {/* Form Card */}
        <Card className="border border-border bg-card shadow-sm">
          <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-6">
            {/* Expertise (Mentor-specific) */}
            <div>
              <Label htmlFor="expertise" className="text-sm font-semibold">
                {t('mentorship.createMentorProfile.expertise')} *
              </Label>
              <p className="text-sm text-muted-foreground mt-1 mb-2">
                {t('mentorship.createMentorProfile.expertiseHint')}
              </p>
              <div className="flex gap-2 mb-2">
                <Input
                  id="expertise"
                  type="text"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExpertise();
                    }
                  }}
                  placeholder={t('mentorship.createMentorProfile.expertisePlaceholder')}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddExpertise}
                  variant="outline"
                >
                  {t('mentorship.createMentorProfile.add')}
                </Button>
              </div>
              
              {/* Selected Expertise Tags */}
              {formData.expertise.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.expertise.map((expertise) => (
                    <Badge
                      key={expertise}
                      variant="secondary"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5"
                    >
                      <span>{expertise}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(expertise)}
                        className="hover:text-destructive ml-0.5 rounded-full hover:bg-destructive/20 p-0.5"
                        aria-label={`Remove ${expertise}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>


            {/* Max Mentees */}
            <div>
              <Label htmlFor="maxMentees" className="text-sm font-semibold">
                {t('mentorship.createMentorProfile.maxMentees')} *
              </Label>
              <p className="text-sm text-muted-foreground mt-1 mb-2">
                {t('mentorship.createMentorProfile.maxMenteesHint')}
              </p>
              <Input
                id="maxMentees"
                type="number"
                min="1"
                value={formData.maxMentees}
                onChange={(e) => setFormData(prev => ({ ...prev, maxMentees: e.target.value }))}
                placeholder={t('mentorship.createMentorProfile.maxMenteesPlaceholder')}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/mentorship')}
                className="flex-1"
              >
                {t('mentorship.createMentorProfile.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting
                  ? (isEditMode 
                      ? (t('mentorship.createMentorProfile.updating') || 'Updating...')
                      : t('mentorship.createMentorProfile.submitting')
                    )
                  : (isEditMode
                      ? (t('mentorship.createMentorProfile.update') || 'Update Profile')
                      : t('mentorship.createMentorProfile.submit')
                    )
                }
              </Button>
            </div>
          </form>
        </Card>
          </>
        )}
      </div>
    </div>
  );
}

