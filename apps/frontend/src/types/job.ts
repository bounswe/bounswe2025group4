// TypeScript types for Job Listing features

export interface JobPost {
  id: number;
  employerId: number;
  title: string;
  description: string;
  company: string;
  location: string;
  remote: boolean;
  ethicalTags: string[];
  minSalary: number;
  maxSalary: number;
  status: string;
}

export interface JobFilters {
  title?: string;
  companyName?: string;
  ethicalTags?: string[];
  minSalary?: number;
  maxSalary?: number;
  isRemote?: boolean;
}

export interface JobListResponse {
  jobs: JobPost[];
}
