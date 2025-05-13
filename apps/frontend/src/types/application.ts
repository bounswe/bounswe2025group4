export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Application {
  id: string;
  title: string;
  company: string;
  applicantName: string;
  jobSeekerId: number;
  jobPostingId: number;
  status: ApplicationStatus;
  feedback: string;
  submissionDate: Date;
}
