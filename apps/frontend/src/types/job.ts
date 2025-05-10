// TypeScript types for Job Listing features

export interface JobPost {
  id: string;
  title: string;
  status: 'open' | 'closed' | 'draft'; // Example statuses
  applicationCount: number;
  employerId?: string; // Optional: To verify ownership on detail pages
  // Add other relevant properties: companyName, description, location, datePosted, salaryRange etc.
  description?: string;
  companyName?: string;
  location?: string;
  employmentType?:
    | 'Full-time'
    | 'Part-time'
    | 'Contract'
    | 'Internship'
    | 'Temporary';
  salaryMin?: number;
  salaryMax?: number;
  ethicalPolicies?: string[];
  contactEmail?: string;
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

export interface JobApplication {
  id: string;
  jobId: string; // To link back to the job
  applicantName: string;
  applicantEmail: string;
  applicationDate: string; // ISO date string or Date object
  status:
    | 'Pending'
    | 'Viewed'
    | 'Interviewing'
    | 'Offered'
    | 'Accepted'
    | 'Rejected';
  resumeUrl?: string;
  coverLetter?: string;
  feedback?: string; // Feedback given by employer to this applicant
  // Add other relevant fields: applicantId, etc.
}
