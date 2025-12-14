import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Search, X, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Badge } from '@shared/components/ui/badge';
import { Checkbox } from '@shared/components/ui/checkbox';
import { Label } from '@shared/components/ui/label';
import { Separator } from '@shared/components/ui/separator';
import { Slider } from '@shared/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@shared/components/ui/sheet';
import { cn } from '@shared/lib/utils';
import {
  useMentorsQuery,
  useMentorProfileQuery,
  useMenteeMentorshipsQuery,
} from '@modules/mentorship/services/mentorship.service';
import { convertMentorProfileToMentor } from '@shared/utils/mentorship.utils';
import { profileService } from '@modules/profile/services/profile.service';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import CenteredError from '@shared/components/common/CenteredError';
import { normalizeApiError } from '@shared/utils/error-handler';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import type { Mentor } from '@shared/types/mentor';
import type { MentorProfileDetailDTO } from '@/modules/shared/types/api.types';
import type { PublicProfile } from '@shared/types/profile.types';
import MentorCard from '../components/mentorship/MentorCard';

const MentorshipPage = () => {
  const { t } = useTranslation('common');
  const { isAuthenticated, user } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxRating, setMaxRating] = useState<number>(5);
  const [ratingRange, setRatingRange] = useState<[number, number]>([0, 5]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [minReviews, setMinReviews] = useState<number>(0);
  const [minYearsOfExperience, setMinYearsOfExperience] = useState<number>(0);
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const mentorsQuery = useMentorsQuery();
  const mentorProfileQuery = useMentorProfileQuery(user?.id, Boolean(user?.id));
  const menteeMentorshipsQuery = useMenteeMentorshipsQuery(user?.id, Boolean(user?.id));
  const [hasMentorProfile, setHasMentorProfile] = useState(false);
  const [requestedMentorIds, setRequestedMentorIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setHasMentorProfile(Boolean(mentorProfileQuery.data));
  }, [mentorProfileQuery.data]);

  useEffect(() => {
    if (menteeMentorshipsQuery.data) {
      const mentorIds = new Set(
        menteeMentorshipsQuery.data
          .filter(
            (m) =>
              m.requestStatus === 'PENDING' ||
              m.requestStatus === 'ACCEPTED' ||
              m.reviewStatus === 'ACTIVE'
          )
          .map((m) => m.mentorId)
      );
      setRequestedMentorIds(mentorIds);
    }
  }, [menteeMentorshipsQuery.data]);

  useEffect(() => {
    const fetchMentors = async () => {
      if (!mentorsQuery.data) return;
      try {
        setIsProfileLoading(true);
        setError(null);
        const backendMentors = mentorsQuery.data;

        const mentorProfilesMap: Record<string, { imageUrl?: string; profile?: PublicProfile }> = {};
        await Promise.all(
          backendMentors.map(async (mentor: MentorProfileDetailDTO) => {
            try {
              const mentorId = parseInt(mentor.id, 10);
              if (!isNaN(mentorId)) {
                const profile = await profileService.getPublicProfile(mentorId);
                mentorProfilesMap[mentor.id] = {
                  imageUrl: profile.imageUrl,
                  profile: {
                    userId: profile.userId,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    bio: profile.bio,
                    experiences: profile.experiences,
                    educations: profile.educations,
                    skills: profile.skills,
                    interests: profile.interests,
                  },
                };
              }
            } catch (err: any) {
              if (err?.response?.status !== 404 && err?.code !== 'ERR_NETWORK') {
                console.warn(`Could not fetch profile for mentor ${mentor.id}:`, err);
              }
              mentorProfilesMap[mentor.id] = {};
            }
          })
        );

        const convertedMentors = backendMentors.map((mentor) =>
          convertMentorProfileToMentor(
            mentor,
            mentorProfilesMap[mentor.id]?.imageUrl,
            mentorProfilesMap[mentor.id]?.profile
          )
        );

        // Store all mentors including own profile
        setMentors(convertedMentors);
      } catch (err) {
        const normalized = normalizeApiError(err, t('mentorship.errors.loadFailed'));
        setError(normalized.friendlyMessage);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchMentors();
  }, [mentorsQuery.data, user?.id, t]);

  useEffect(() => {
    if (mentorsQuery.error) {
      const normalized = normalizeApiError(mentorsQuery.error, t('mentorship.errors.loadFailed'));
      setError(normalized.friendlyMessage);
    }
  }, [mentorsQuery.error, t]);
  
  // Predefined filter options (not just from DB)
  const predefinedExpertise = [
    'Software Engineering', 'Web Development', 'Mobile Development', 'Data Science',
    'Machine Learning', 'AI', 'DevOps', 'Cloud Computing', 'Cybersecurity',
    'Product Management', 'UI/UX Design', 'Marketing', 'Sales', 'Finance',
    'Business Strategy', 'Leadership', 'Career Development', 'Entrepreneurship'
  ];

  const predefinedSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
    'Angular', 'Vue.js', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes',
    'Git', 'Agile', 'Scrum', 'Project Management', 'Communication', 'Team Leadership'
  ];

  const predefinedInterests = [
    'Technology', 'Startups', 'Open Source', 'Mentoring', 'Teaching',
    'Innovation', 'Research', 'Writing', 'Public Speaking', 'Networking',
    'Community Building', 'Social Impact', 'Sustainability', 'Diversity & Inclusion'
  ];

  // Get all unique tags from mentors (combine with predefined)
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>(predefinedExpertise);
    mentors.forEach((mentor) => {
      mentor.tags?.forEach((tag) => tagsSet.add(tag));
      mentor.specialties?.forEach((spec) => tagsSet.add(spec));
    });
    return Array.from(tagsSet).sort();
  }, [mentors]);

  // Combine predefined with DB skills
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>(predefinedSkills);
    mentors.forEach((mentor) => {
      mentor.skills?.forEach((skill) => skillsSet.add(skill));
    });
    return Array.from(skillsSet).sort();
  }, [mentors]);

  // Combine predefined with DB interests
  const allInterests = useMemo(() => {
    const interestsSet = new Set<string>(predefinedInterests);
    mentors.forEach((mentor) => {
      mentor.interests?.forEach((interest) => interestsSet.add(interest));
    });
    return Array.from(interestsSet).sort();
  }, [mentors]);
  
  const filteredMentors = useMemo(() => {
    let filtered = mentors;

    // Filter own profile if user is mentor (always hide own profile in browse)
    if (user?.id && hasMentorProfile) {
      filtered = filtered.filter((mentor) => mentor.id !== user.id.toString());
    }

    // Add mentee's active mentors automatically
    if (menteeMentorshipsQuery.data && user?.id && !hasMentorProfile) {
      const activeMentorIds = new Set(
        menteeMentorshipsQuery.data
          .filter((m) => m.reviewStatus?.toUpperCase() === 'ACTIVE' || m.requestStatus?.toUpperCase() === 'ACCEPTED')
          .map((m) => m.mentorId.toString())
      );
      const myMentors = mentors.filter((mentor) => activeMentorIds.has(mentor.id));
      filtered = [...filtered, ...myMentors.filter((m) => !filtered.some((f) => f.id === m.id))];
    }

    // Search filter
    if (searchInput.trim()) {
    const searchLower = searchInput.toLowerCase();
      filtered = filtered.filter(
      (mentor) =>
        mentor.name.toLowerCase().includes(searchLower) ||
          mentor.title?.toLowerCase().includes(searchLower) ||
          mentor.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          mentor.specialties?.some((spec) => spec.toLowerCase().includes(searchLower))
      );
    }

    // Rating range filter
    filtered = filtered.filter(
      (mentor) => mentor.rating >= ratingRange[0] && mentor.rating <= ratingRange[1]
    );

    // Reviews filter
    if (minReviews > 0) {
      filtered = filtered.filter((mentor) => mentor.reviews >= minReviews);
    }

    // Availability filter
    if (availableOnly) {
      filtered = filtered.filter((mentor) => mentor.mentees < mentor.capacity);
    }

    // Tags filter
    if (selectedTags.size > 0) {
      filtered = filtered.filter((mentor) =>
        mentor.tags?.some((tag) => selectedTags.has(tag)) ||
        mentor.specialties?.some((spec) => selectedTags.has(spec))
      );
    }

    // Skills filter
    if (selectedSkills.size > 0) {
      filtered = filtered.filter((mentor) =>
        mentor.skills?.some((skill) => selectedSkills.has(skill))
      );
    }

    // Interests filter
    if (selectedInterests.size > 0) {
      filtered = filtered.filter((mentor) =>
        mentor.interests?.some((interest) => selectedInterests.has(interest))
      );
    }

    // Years of experience filter
    if (minYearsOfExperience > 0) {
      filtered = filtered.filter((mentor) =>
        (mentor.yearsOfExperience ?? 0) >= minYearsOfExperience
      );
    }

    return filtered;
  }, [searchInput, mentors, ratingRange, minReviews, availableOnly, selectedTags, selectedSkills, selectedInterests, minYearsOfExperience, menteeMentorshipsQuery.data, hasMentorProfile, user?.id]);

  const isLoading = mentorsQuery.isLoading || isProfileLoading;

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error) {
    return <CenteredError message={error} />;
  }

  const handleResetFilters = () => {
    setSearchInput('');
    setRatingRange([0, 5]);
    setMinReviews(0);
    setMinYearsOfExperience(0);
    setAvailableOnly(false);
    setSelectedTags(new Set());
    setSelectedSkills(new Set());
    setSelectedInterests(new Set());
  };

  const hasActiveFilters = ratingRange[0] > 0 || ratingRange[1] < 5 || minReviews > 0 || minYearsOfExperience > 0 || availableOnly || selectedTags.size > 0 || selectedSkills.size > 0 || selectedInterests.size > 0;

  // Mentor Filters Component
  const MentorFilters = () => (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('mentorship.filters.rating', 'Rating')}</h3>
          <span className="text-sm text-muted-foreground">
            {ratingRange[0].toFixed(1)} - {ratingRange[1].toFixed(1)}
          </span>
        </div>
        <Slider
          value={ratingRange}
          onValueChange={(value) => {
            if (Array.isArray(value) && value.length === 2) {
              setRatingRange([value[0], value[1]]);
            }
          }}
          min={0}
          max={5}
          step={0.1}
          className="w-full"
          aria-label={t('mentorship.filters.rating', 'Rating')}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>0.0</span>
          <span>5.0</span>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('mentorship.filters.minReviews', 'Minimum Reviews')}</h3>
        <div className="flex gap-2">
          {[0, 1, 5, 10].map((reviews) => (
            <Button
              key={reviews}
              variant={minReviews === reviews ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMinReviews(reviews)}
              className="flex-1"
            >
              {reviews === 0 ? t('mentorship.all', 'All') : `${reviews}+`}
            </Button>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('mentorship.filters.availability', 'Availability')}</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 rounded-md px-2 py-1">
            <Checkbox
              id="filter-available"
              checked={availableOnly}
              onCheckedChange={(checked) => setAvailableOnly(checked === true)}
              aria-label={t('mentorship.filters.availableOnly', 'Available Only')}
            />
            <Label htmlFor="filter-available" className="text-sm">
              {t('mentorship.filters.availableOnly', 'Available Only')}
            </Label>
          </div>
          </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('mentorship.filters.yearsOfExperience', 'Years of Experience')}</h3>
        <div className="flex gap-2">
          {[0, 1, 3, 5, 10].map((years) => (
            <Button
              key={years}
              variant={minYearsOfExperience === years ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMinYearsOfExperience(years)}
              className="flex-1"
            >
              {years === 0 ? t('mentorship.all', 'All') : `${years}+`}
            </Button>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('mentorship.filters.expertise', 'Expertise')}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {selectedTags.size > 0
                  ? `${selectedTags.size} ${t('mentorship.filters.selected', 'selected')}`
                  : t('mentorship.filters.selectExpertise', 'Select Expertise')}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0">
                {t('mentorship.filters.expertise', 'Expertise')}
              </DropdownMenuLabel>
              {selectedTags.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags(new Set())}
                  className="h-auto p-1 text-xs"
                >
                  {t('mentorship.filters.clearAll', 'Clear All')}
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            {allTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={selectedTags.has(tag)}
                onCheckedChange={(checked) => {
                  const newTags = new Set(selectedTags);
                  if (checked) {
                    newTags.add(tag);
                  } else {
                    newTags.delete(tag);
                  }
                  setSelectedTags(newTags);
                }}
                onSelect={(e) => e.preventDefault()}
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {selectedTags.size > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Array.from(selectedTags).map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                <span className="text-xs">{tag}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newTags = new Set(selectedTags);
                    newTags.delete(tag);
                    setSelectedTags(newTags);
                  }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label={t('mentorship.filters.removeTag', { tag }, `Remove ${tag}`)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('mentorship.filters.skills', 'Skills')}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {selectedSkills.size > 0
                  ? `${selectedSkills.size} ${t('mentorship.filters.selected', 'selected')}`
                  : t('mentorship.filters.selectSkills', 'Select Skills')}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0">
                {t('mentorship.filters.skills', 'Skills')}
              </DropdownMenuLabel>
              {selectedSkills.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSkills(new Set())}
                  className="h-auto p-1 text-xs"
                >
                  {t('mentorship.filters.clearAll', 'Clear All')}
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            {allSkills.map((skill) => (
              <DropdownMenuCheckboxItem
                key={skill}
                checked={selectedSkills.has(skill)}
                onCheckedChange={(checked) => {
                  const newSkills = new Set(selectedSkills);
                  if (checked) {
                    newSkills.add(skill);
                  } else {
                    newSkills.delete(skill);
                  }
                  setSelectedSkills(newSkills);
                }}
                onSelect={(e) => e.preventDefault()}
              >
                {skill}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {selectedSkills.size > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Array.from(selectedSkills).map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                <span className="text-xs">{skill}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newSkills = new Set(selectedSkills);
                    newSkills.delete(skill);
                    setSelectedSkills(newSkills);
                  }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label={t('mentorship.filters.removeTag', { tag: skill }, `Remove ${skill}`)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('mentorship.filters.interests', 'Interests')}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="truncate">
                {selectedInterests.size > 0
                  ? `${selectedInterests.size} ${t('mentorship.filters.selected', 'selected')}`
                  : t('mentorship.filters.selectInterests', 'Select Interests')}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0">
                {t('mentorship.filters.interests', 'Interests')}
              </DropdownMenuLabel>
              {selectedInterests.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInterests(new Set())}
                  className="h-auto p-1 text-xs"
                >
                  {t('mentorship.filters.clearAll', 'Clear All')}
                </Button>
          )}
        </div>
            <DropdownMenuSeparator />
            {allInterests.map((interest) => (
              <DropdownMenuCheckboxItem
                key={interest}
                checked={selectedInterests.has(interest)}
                onCheckedChange={(checked) => {
                  const newInterests = new Set(selectedInterests);
                  if (checked) {
                    newInterests.add(interest);
                  } else {
                    newInterests.delete(interest);
                  }
                  setSelectedInterests(newInterests);
                }}
                onSelect={(e) => e.preventDefault()}
              >
                {interest}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {selectedInterests.size > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Array.from(selectedInterests).map((interest) => (
              <Badge key={interest} variant="secondary" className="gap-1 pr-1">
                <span className="text-xs">{interest}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newInterests = new Set(selectedInterests);
                    newInterests.delete(interest);
                    setSelectedInterests(newInterests);
                  }}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label={t('mentorship.filters.removeTag', { tag: interest }, `Remove ${interest}`)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  return (
    <div className="bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 lg:flex-row lg:items-start lg:gap-10">
        {/* Filters Sidebar */}
        <aside className="sticky top-[88px] hidden w-72 shrink-0 self-start lg:block">
          <div className="space-y-6 p-5">
            <h2 className="text-xl font-semibold">{t('mentorship.filtersHeading', 'Filters')}</h2>
            <MentorFilters />
            <Button type="button" variant="outline" className="w-full" onClick={handleResetFilters}>
              {t('mentorship.resetFilters', 'Reset Filters')}
            </Button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {/* Become a Mentor Button - Show if authenticated and doesn't have mentor profile */}
              {isAuthenticated && !hasMentorProfile && (
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/mentorship/mentor/create">
                    {t('mentorship.becomeMentor', 'Become a Mentor')}
                  </Link>
                </Button>
              )}
              {/* Search Input */}
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="size-5" aria-hidden />
                </span>
          <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                    }
                  }}
                  placeholder={t('mentorship.searchPlaceholder') || 'Search mentors by name, expertise, or skills...'}
                  id="search-input"
                  className="h-14 rounded-lg border border-border bg-card pl-11 pr-12 text-lg"
                  aria-label={t('mentorship.searchAria', 'Search mentors')}
          />
          {searchInput && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
              onClick={() => setSearchInput('')}
                    className="absolute right-2 top-1/2 size-9 -translate-y-1/2 rounded-md text-muted-foreground hover:bg-muted"
                    aria-label={t('mentorship.clearSearch', 'Clear search')}
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                )}
              </div>
              {/* Mobile Filters Button */}
              <Button
                type="button"
                variant="outline"
                className="gap-2 lg:hidden"
                onClick={() => setIsMobileFiltersOpen(true)}
                aria-label={t('mentorship.mobileFilters.open', 'Open filters')}
              >
                <Filter className="size-4" aria-hidden />
                {t('mentorship.mobileFilters.title', 'Filters')}
                {hasActiveFilters && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    {selectedTags.size + selectedSkills.size + selectedInterests.size + (ratingRange[0] > 0 ? 1 : 0) + (ratingRange[1] < 5 ? 1 : 0) + (minReviews > 0 ? 1 : 0) + (minYearsOfExperience > 0 ? 1 : 0) + (availableOnly ? 1 : 0)}
                  </Badge>
                )}
              </Button>
        </div>
      </div>

          <div className="flex flex-col gap-6">
            <section className="flex-1 space-y-6">

      {!isAuthenticated && (
        <Card className="mb-6 gap-4 border-amber-200 bg-amber-50 py-4 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="space-y-4 px-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  {t('mentorship.authRequired.title')}
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {t('mentorship.authRequired.description')}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t('mentorship.authRequired.invitation')}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600">
                <Link to="/register">{t('mentorship.authRequired.signUp')}</Link>
              </Button>
              <Button asChild variant="outline" className="border-amber-300 dark:border-amber-700">
                <Link to="/login">{t('mentorship.authRequired.login')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredMentors.length > 0 ? (
        <div
          className={cn(
            'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2',
            !isAuthenticated && 'pointer-events-none select-none opacity-60 blur-sm'
          )}
        >
          {filteredMentors.map((mentor) => {
            const mentorIdNum = parseInt(mentor.id, 10);
            const hasRequested = !Number.isNaN(mentorIdNum) && requestedMentorIds.has(mentorIdNum);
            return <MentorCard key={mentor.id} mentor={mentor} hasRequested={hasRequested} />;
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">
              {t('mentorship.noResults') || 'No mentors found. Try adjusting your search.'}
            </p>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={handleResetFilters}>
                        {t('mentorship.resetFilters', 'Reset Filters')}
                      </Button>
                    )}
          </CardContent>
        </Card>
      )}

      {!isAuthenticated && (
        <div className="mt-6 text-center">
          <p className="mb-4 text-muted-foreground">{t('mentorship.authRequired.viewMore')}</p>
        </div>
      )}
            </section>
          </div>
        </div>

        {/* Mobile Filters Sheet */}
        <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
          <SheetContent side="left" className="w-full max-w-md overflow-y-auto">
            <SheetHeader className="px-4 pt-6">
              <SheetTitle className="text-xl font-semibold">
                {t('mentorship.mobileFilters.title', 'Filters')}
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-6">
              <MentorFilters />
            </div>
            <SheetFooter className="px-4 pb-6">
              <div className="flex gap-3 w-full">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    handleResetFilters();
                  }}
                >
                  {t('mentorship.mobileFilters.reset', 'Reset')}
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => setIsMobileFiltersOpen(false)}
                >
                  {t('mentorship.mobileFilters.apply', 'Apply')}
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MentorshipPage;
