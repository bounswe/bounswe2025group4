export type BadgeCode =
  // Forum Badges
  | 'FIRST_VOICE'
  | 'COMMUNITY_PILLAR'
  | 'CONVERSATION_STARTER'
  | 'DISCUSSION_DRIVER'
  | 'HELPFUL'
  | 'VALUABLE_CONTRIBUTOR'
  // Job Post Badges (Employer)
  | 'FIRST_LISTING'
  | 'HIRING_MACHINE'
  // Job Application Badges (Job Seeker)
  | 'FIRST_STEP'
  | 'PERSISTENT'
  | 'HIRED'
  | 'CAREER_STAR'
  // Mentor Badges
  | 'GUIDE'
  | 'FIRST_MENTEE'
  | 'DEDICATED_MENTOR'
  // Mentee Badges
  | 'SEEKING_GUIDANCE'
  | 'MENTORED'
  | 'FEEDBACK_GIVER';

export type BadgeCategory = 'Forum' | 'Job Post' | 'Job Application' | 'Mentor' | 'Mentee';

export interface BadgeDefinition {
  code: BadgeCode;
  name: string;
  description: string;
  criteria: string;
  threshold: number;
  category: BadgeCategory;
}

export const BADGE_DEFINITIONS: Record<BadgeCode, BadgeDefinition> = {
  // Forum Badges
  FIRST_VOICE: {
    code: 'FIRST_VOICE',
    name: 'First Voice',
    description: 'Published your first forum post',
    criteria: 'Create your first forum post',
    threshold: 1,
    category: 'Forum',
  },
  COMMUNITY_PILLAR: {
    code: 'COMMUNITY_PILLAR',
    name: 'Community Pillar',
    description: 'A foundational voice with 25 posts',
    criteria: 'Create 25 forum posts',
    threshold: 25,
    category: 'Forum',
  },
  CONVERSATION_STARTER: {
    code: 'CONVERSATION_STARTER',
    name: 'Conversation Starter',
    description: 'Made your first comment',
    criteria: 'Comment on a forum post',
    threshold: 1,
    category: 'Forum',
  },
  DISCUSSION_DRIVER: {
    code: 'DISCUSSION_DRIVER',
    name: 'Discussion Driver',
    description: 'Driving discussions with 50 comments',
    criteria: 'Make 50 comments',
    threshold: 50,
    category: 'Forum',
  },
  HELPFUL: {
    code: 'HELPFUL',
    name: 'Helpful',
    description: 'Your comments helped 10 people',
    criteria: 'Receive 10 upvotes on your comments',
    threshold: 10,
    category: 'Forum',
  },
  VALUABLE_CONTRIBUTOR: {
    code: 'VALUABLE_CONTRIBUTOR',
    name: 'Valuable Contributor',
    description: 'Received 50 upvotes for helpful content',
    criteria: 'Receive 50 upvotes on your comments',
    threshold: 50,
    category: 'Forum',
  },

  // Job Post Badges (Employer)
  FIRST_LISTING: {
    code: 'FIRST_LISTING',
    name: 'First Listing',
    description: 'Posted your first job listing',
    criteria: 'Create your first job post',
    threshold: 1,
    category: 'Job Post',
  },
  HIRING_MACHINE: {
    code: 'HIRING_MACHINE',
    name: 'Hiring Machine',
    description: 'Posted 15 job listings',
    criteria: 'Create 15 job posts',
    threshold: 15,
    category: 'Job Post',
  },

  // Job Application Badges (Job Seeker)
  FIRST_STEP: {
    code: 'FIRST_STEP',
    name: 'First Step',
    description: 'Submitted your first job application',
    criteria: 'Apply to your first job',
    threshold: 1,
    category: 'Job Application',
  },
  PERSISTENT: {
    code: 'PERSISTENT',
    name: 'Persistent',
    description: 'Submitted 15 job applications',
    criteria: 'Apply to 15 jobs',
    threshold: 15,
    category: 'Job Application',
  },
  HIRED: {
    code: 'HIRED',
    name: 'Hired!',
    description: 'Got your first job offer',
    criteria: 'Get accepted for a job',
    threshold: 1,
    category: 'Job Application',
  },
  CAREER_STAR: {
    code: 'CAREER_STAR',
    name: 'Career Star',
    description: 'Received 5 job offers',
    criteria: 'Get accepted for 5 jobs',
    threshold: 5,
    category: 'Job Application',
  },

  // Mentor Badges
  GUIDE: {
    code: 'GUIDE',
    name: 'Guide',
    description: 'Created your mentor profile',
    criteria: 'Create a mentor profile',
    threshold: 1,
    category: 'Mentor',
  },
  FIRST_MENTEE: {
    code: 'FIRST_MENTEE',
    name: 'First Mentee',
    description: 'Accepted your first mentee',
    criteria: 'Accept your first mentorship request',
    threshold: 1,
    category: 'Mentor',
  },
  DEDICATED_MENTOR: {
    code: 'DEDICATED_MENTOR',
    name: 'Dedicated Mentor',
    description: 'Accepted 5 mentees',
    criteria: 'Accept 5 mentorship requests',
    threshold: 5,
    category: 'Mentor',
  },

  // Mentee Badges
  SEEKING_GUIDANCE: {
    code: 'SEEKING_GUIDANCE',
    name: 'Seeking Guidance',
    description: 'Requested your first mentorship',
    criteria: 'Send your first mentorship request',
    threshold: 1,
    category: 'Mentee',
  },
  MENTORED: {
    code: 'MENTORED',
    name: 'Mentored',
    description: 'Got accepted by a mentor',
    criteria: 'Get accepted by a mentor',
    threshold: 1,
    category: 'Mentee',
  },
  FEEDBACK_GIVER: {
    code: 'FEEDBACK_GIVER',
    name: 'Feedback Giver',
    description: 'Left your first mentor review',
    criteria: 'Review a mentor',
    threshold: 1,
    category: 'Mentee',
  },
};

export const BADGE_CATEGORIES: BadgeCategory[] = [
  'Forum',
  'Job Post',
  'Job Application',
  'Mentor',
  'Mentee',
];

export const getBadgesByCategory = (category: BadgeCategory): BadgeDefinition[] => {
  return Object.values(BADGE_DEFINITIONS).filter((badge) => badge.category === category);
};

export const getAllBadges = (): BadgeDefinition[] => {
  return Object.values(BADGE_DEFINITIONS);
};
