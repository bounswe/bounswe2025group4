export type Policy =
  | 'Fair Labor Practices'
  | 'Environmental Sustainability'
  | 'Diversity & Inclusion';

export type JobType = 'Full-time' | 'Part-time' | 'Contract';

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  policies: Policy[];
  type: JobType[];
  minSalary: number;
  maxSalary: number;
  logoUrl?: string;
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

