import { useState, /*useEffect*/ } from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AboutSection } from '@/components/profile/AboutSection';
import { ExperienceSection } from '@/components/profile/ExperienceSection';
import { EducationSection } from '@/components/profile/EducationSection';
import { SkillsSection } from '@/components/profile/SkillsSection';
import { InterestsSection } from '@/components/profile/InterestsSection';
import { ActivityTab } from '@/components/profile/ActivityTab';
import { PostsTab } from '@/components/profile/PostsTab';
import {
  EditBioModal,
  ExperienceModal,
  EducationModal,
  SkillModal,
  InterestModal,
} from '@/components/profile/ProfileEditModals';
import type { Profile, Activity, Post } from '@/types/profile.types';
//import { profileService } from '@/services/profile.service';
//import { useAuth } from '@/contexts/AuthContext';
//import CenteredLoader from '@/components/CenteredLoader';

const mockProfile: Profile = {
  id: 1,
  userId: 1,
  firstName: 'Sophia',
  lastName: 'Carter',
  bio: 'Experienced product designer with a passion for creating user-centered digital experiences. Skilled in user research, wireframing, prototyping, and visual design. Committed to continuous learning and growth in the field.',
  imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  educations: [
    {
      id: 1,
      school: 'State University',
      degree: 'Bachelor of Science',
      field: 'Design',
      startDate: '2016-09-01',
      endDate: '2020-06-01',
      description: '',
    },
  ],
  experiences: [
    {
      id: 1,
      company: 'Tech Innovators Inc.',
      position: 'Product Designer',
      description:
        'Led design for a major product redesign, resulting in a 20% increase in user engagement.',
      startDate: '2020-01-01',
      endDate: '',
    },
    {
      id: 2,
      company: 'Design Solutions Co.',
      position: 'Design Intern',
      description:
        'Contributed to the design of a new mobile app, focusing on user research and interaction design.',
      startDate: '2019-06-01',
      endDate: '2020-12-01',
    },
  ],
  skills: [
    { id: 1, name: 'User Research', level: 'ADVANCED' },
    { id: 2, name: 'Wireframing', level: 'ADVANCED' },
    { id: 3, name: 'Prototyping', level: 'INTERMEDIATE' },
    { id: 4, name: 'Visual Design', level: 'ADVANCED' },
    { id: 5, name: 'Interaction Design', level: 'ADVANCED' },
    { id: 6, name: 'Usability Testing', level: 'INTERMEDIATE' },
  ],
  interests: [
    { id: 1, name: 'Sustainable Design' },
    { id: 2, name: 'Ethical Tech' },
    { id: 3, name: 'Accessibility' },
    { id: 4, name: 'User Advocacy' },
    { id: 5, name: 'Design Systems' },
    { id: 6, name: 'Inclusive Design' },
  ],
  createdAt: '2021-01-15T00:00:00Z',
  updatedAt: '2024-10-15T00:00:00Z',
};

const mockActivity: Activity[] = [
  {
    id: 1,
    type: 'application',
    text: 'Applied to Senior Product Designer at Innovation Labs',
    date: '2 days ago',
  },
  {
    id: 2,
    type: 'forum',
    text: "Posted a thread on forum: 'Best practices for accessibility in design'",
    date: '5 days ago',
  },
  {
    id: 3,
    type: 'comment',
    text: "Made a comment on 'Remote work strategies for designers'",
    date: '1 week ago',
  },
  {
    id: 4,
    type: 'like',
    text: "Liked a comment on 'Design system implementation'",
    date: '1 week ago',
  },
  {
    id: 5,
    type: 'application',
    text: 'Applied to UX Designer at Creative Studio',
    date: '2 weeks ago',
  },
];

const mockPosts: Post[] = [
  {
    id: 1,
    title: 'How to improve user research techniques',
    replies: 12,
    likes: 45,
    date: '3 days ago',
  },
  {
    id: 2,
    title: 'My journey into product design',
    replies: 8,
    likes: 32,
    date: '1 week ago',
  },
  {
    id: 3,
    title: 'Tools I use daily as a designer',
    replies: 24,
    likes: 67,
    date: '2 weeks ago',
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'about' | 'activity' | 'posts'>('about');
  const [profile, setProfile] = useState<Profile | null>(mockProfile);
  //const [loading, setLoading] = useState(false);
  //const [error, setError] = useState<string | null>(null);
  //const { user } = useAuth();

  // Modal states
  const [modals, setModals] = useState({
    bio: false,
    experience: false,
    education: false,
    skill: false,
    interest: false,
  });
  const [editingItem, setEditingItem] = useState<any>(null);

  const openModal = (type: string, item?: any) => {
    setEditingItem(item || null);
    setModals({ ...modals, [type]: true });
  };

  const closeModal = (type: string) => {
    setModals({ ...modals, [type]: false });
    setEditingItem(null);
  };

  // Handlers for saving data
  const handleSaveBio = (bio: string) => {
    console.log('Saving bio:', bio);
    setProfile((prev) => (prev ? { ...prev, bio } : null));
    // TODO: Call API to update bio
  };

  const handleSaveExperience = (data: any) => {
    console.log('Saving experience:', data);
    if (data.id) {
      // Update existing
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          experiences: prev.experiences.map((exp) =>
            exp.id === data.id ? { ...exp, ...data } : exp
          ),
        };
      });
    } else {
      // Add new
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          experiences: [
            ...prev.experiences,
            { ...data, id: Date.now() }, // Temporary ID
          ],
        };
      });
    }
    // TODO: Call API
  };

  const handleSaveEducation = (data: any) => {
    console.log('Saving education:', data);
    if (data.id) {
      // Update existing
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          educations: prev.educations.map((edu) =>
            edu.id === data.id ? { ...edu, ...data } : edu
          ),
        };
      });
    } else {
      // Add new
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          educations: [
            ...prev.educations,
            { ...data, id: Date.now() },
          ],
        };
      });
    }
    // TODO: Call API
  };

  const handleSaveSkill = (data: any) => {
    console.log('Saving skill:', data);
    if (data.id) {
      // Update existing
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          skills: prev.skills.map((skill) =>
            skill.id === data.id ? { ...skill, ...data } : skill
          ),
        };
      });
    } else {
      // Add new
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          skills: [
            ...prev.skills,
            { ...data, id: Date.now() },
          ],
        };
      });
    }
    // TODO: Call API
  };

  const handleSaveInterest = (data: any) => {
    console.log('Saving interest:', data);
    if (data.id) {
      // Update existing
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          interests: prev.interests.map((interest) =>
            interest.id === data.id ? { ...interest, ...data } : interest
          ),
        };
      });
    } else {
      // Add new
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          interests: [
            ...prev.interests,
            { ...data, id: Date.now() },
          ],
        };
      });
    }
    // TODO: Call API
  };

  /*if (loading) {
    return <CenteredLoader />;
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-6 text-center">
          <p className="font-medium">Failed to load profile</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }*/

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-muted rounded-lg p-6 text-center">
          <p className="font-medium">No profile found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please create your profile to continue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-16">
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <ProfileHeader
          firstName={profile.firstName}
          lastName={profile.lastName}
          imageUrl={profile.imageUrl}
          createdAt={profile.createdAt}
          experiences={profile.experiences}
          onEditImage={() => console.log('Edit image')}
        />

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'about'
                  ? 'border-green-600 text-green-600 font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-green-600 text-green-600 font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'posts'
                  ? 'border-green-600 text-green-600 font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Posts
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <AboutSection
                bio={profile.bio}
                onEdit={() => openModal('bio')}
              />

              <ExperienceSection
                experiences={profile.experiences}
                onAdd={() => openModal('experience')}
                onEdit={(id) => {
                  const exp = profile.experiences.find((e) => e.id === id);
                  console.log('Editing experience:', exp);
                  openModal('experience', exp);
                }}
              />

              <EducationSection
                educations={profile.educations}
                onAdd={() => openModal('education')}
                onEdit={(id) => {
                  const edu = profile.educations.find((e) => e.id === id);
                  openModal('education', edu);
                }}
              />
            </div>

            <div className="space-y-6">
              <SkillsSection
                skills={profile.skills}
                onAdd={() => openModal('skill')}
                onEdit={(id) => {
                  const skill = profile.skills.find((s) => s.id === id);
                  openModal('skill', skill);
                }}
              />

              <InterestsSection
                interests={profile.interests}
                onAdd={() => openModal('interest')}
                onEdit={(id) => {
                  const interest = profile.interests.find((i) => i.id === id);
                  openModal('interest', interest);
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'activity' && <ActivityTab activities={mockActivity} />}
        {activeTab === 'posts' && <PostsTab posts={mockPosts} />}
      </div>

      {/* Modals */}
      <EditBioModal
        isOpen={modals.bio}
        onClose={() => closeModal('bio')}
        initialBio={profile.bio}
        onSave={handleSaveBio}
      />

      <ExperienceModal
        isOpen={modals.experience}
        onClose={() => closeModal('experience')}
        experience={editingItem}
        onSave={handleSaveExperience}
      />

      <EducationModal
        isOpen={modals.education}
        onClose={() => closeModal('education')}
        education={editingItem}
        onSave={handleSaveEducation}
      />

      <SkillModal
        isOpen={modals.skill}
        onClose={() => closeModal('skill')}
        skill={editingItem}
        onSave={handleSaveSkill}
      />

      <InterestModal
        isOpen={modals.interest}
        onClose={() => closeModal('interest')}
        interest={editingItem}
        onSave={handleSaveInterest}
      />
    </div>
  );
}