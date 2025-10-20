export type EthicalTag =
  // Compensation & Benefits
  | 'Salary Transparency'
  | 'Equal Pay Policy'
  | 'Living Wage Employer'
  | 'Comprehensive Health Insurance'
  | 'Performance-Based Bonus'
  | 'Retirement Plan Support'
  | 'Paid Parental Leave'
  // Work-Life Balance
  | 'Flexible Hours'
  | 'Remote-Friendly'
  | 'No After-Hours Work Culture'
  | 'Mental Health Support'
  | 'Generous Paid Time Off'
  // Diversity & Inclusion
  | 'Inclusive Hiring Practices'
  | 'Diverse Leadership'
  | 'LGBTQ+ Friendly Workplace'
  | 'Disability-Inclusive Workplace'
  | 'Supports Women in Leadership'
  // Career Development
  | 'Mentorship Program'
  | 'Learning & Development Budget'
  | 'Transparent Promotion Paths'
  | 'Internal Mobility'
  // Environmental & Social Impact
  | 'Sustainability-Focused'
  | 'Ethical Supply Chain'
  | 'Community Volunteering'
  | 'Certified B-Corporation';

export type EthicalTagCategory =
  | 'Compensation & Benefits'
  | 'Work-Life Balance'
  | 'Diversity & Inclusion'
  | 'Career Development'
  | 'Environmental & Social Impact';

export const ETHICAL_TAGS_BY_CATEGORY: Record<EthicalTagCategory, EthicalTag[]> = {
  'Compensation & Benefits': [
    'Salary Transparency',
    'Equal Pay Policy',
    'Living Wage Employer',
    'Comprehensive Health Insurance',
    'Performance-Based Bonus',
    'Retirement Plan Support',
    'Paid Parental Leave',
  ],
  'Work-Life Balance': [
    'Flexible Hours',
    'Remote-Friendly',
    'No After-Hours Work Culture',
    'Mental Health Support',
    'Generous Paid Time Off',
  ],
  'Diversity & Inclusion': [
    'Inclusive Hiring Practices',
    'Diverse Leadership',
    'LGBTQ+ Friendly Workplace',
    'Disability-Inclusive Workplace',
    'Supports Women in Leadership',
  ],
  'Career Development': [
    'Mentorship Program',
    'Learning & Development Budget',
    'Transparent Promotion Paths',
    'Internal Mobility',
  ],
  'Environmental & Social Impact': [
    'Sustainability-Focused',
    'Ethical Supply Chain',
    'Community Volunteering',
    'Certified B-Corporation',
  ],
};

export type JobType = 'Full-time' | 'Part-time' | 'Contract';

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  ethicalTags: EthicalTag[];
  type: JobType[];
  minSalary: number;
  maxSalary: number;
  logoUrl?: string;
  inclusiveOpportunity: boolean;
};

// Extended job type for job details from API
export type JobDetail = {
  id: number;
  employerId: number;
  title: string;
  description: string;
  company: string;
  location: string;
  remote: boolean;
  ethicalTags: string;
  inclusiveOpportunity: boolean;
  minSalary: number;
  maxSalary: number;
  contact: string;
  postedDate: string;
};

