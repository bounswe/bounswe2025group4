// TypeScript types for Job Listing features

export interface Company {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  // Add other relevant company fields
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  ethicalPolicies: string[]; // e.g., ['fair-wage', 'equal-opportunity']
  company: Company;
  postedDate: string; // ISO Date string
  // Add other relevant job fields
}

export interface JobFilters {
  query?: string; // Search term
  ethicalPolicies?: string[];
  minSalary?: number;
  maxSalary?: number;
  companyId?: string;
  employmentType?: string[];
  location?: string;
  // Add other filter fields
  page?: number;
  limit?: number;
}

export interface JobListResponse {
  jobs: Job[];
  totalCount: number;
  // Add pagination info if needed (totalPages, currentPage)
}

export interface ApplicationData {
  coverLetter: string;
  resumeFile?: File; // Or resume URL
  // Add other application fields
}
