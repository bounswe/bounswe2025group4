import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getJobById } from '@/services/jobs.service';
import { getApplications } from '@/services/applications.service';
import type { JobPostResponse, JobApplicationResponse } from '@/types/api.types';
import CenteredLoader from '@/components/CenteredLoader';

export default function EmployerJobPostDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jobPost, setJobPost] = useState<JobPostResponse | null>(null);
  const [applications, setApplications] = useState<JobApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobAndApplications = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const jobId = parseInt(id, 10);

        // Fetch job details and applications in parallel
        const [jobData, applicationsData] = await Promise.all([
          getJobById(jobId),
          getApplications({ jobPostId: jobId }),
        ]);

        setJobPost(jobData);
        setApplications(applicationsData);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobAndApplications();
  }, [id]);

  const formatSalary = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()} per year`;
  };

  // Format date from ISO string
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Applied today';
    if (diffDays === 1) return 'Applied 1 day ago';
    return `Applied ${diffDays} days ago`;
  };

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error || !jobPost) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">
          {error ? 'Error Loading Job' : 'Job not found'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {error || "The job you're looking for doesn't exist or has been removed."}
        </p>
        <Button asChild className="mt-6">
          <Link to="/employer/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // Parse contact info
  let contactInfo: { name?: string; email?: string } = {};
  try {
    contactInfo = typeof jobPost.contact === 'string' && jobPost.contact.startsWith('{')
      ? JSON.parse(jobPost.contact)
      : { email: jobPost.contact };
  } catch {
    contactInfo = { email: jobPost.contact };
  }

  const ethicalTags = jobPost.ethicalTags ? jobPost.ethicalTags.split(',').map((tag) => tag.trim()) : [];

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/employer/dashboard" className="hover:text-foreground transition-colors">
          Jobs
        </Link>
        <ChevronRight className="size-4" aria-hidden />
        <span className="text-foreground">{jobPost.title}</span>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl">
        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground lg:text-4xl">{jobPost.title}</h1>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate(`/employer/jobs/${id}/edit`)}
              >
                <Edit className="size-4" />
                Edit Job Post
              </Button>
            </div>

            {/* Job Description */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">Job Description</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{jobPost.description}</p>
            </section>

            {/* Salary Range */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">Salary Range</h2>
              <p className="mt-3 text-muted-foreground">
                {formatSalary(jobPost.minSalary, jobPost.maxSalary)}
              </p>
            </section>

            {/* Location */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">Location</h2>
              <p className="mt-3 text-muted-foreground">
                {jobPost.remote ? 'Remote' : jobPost.location}
                {jobPost.remote && jobPost.location && ` (${jobPost.location})`}
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                Contact Information
              </h2>
              <p className="mt-3 text-muted-foreground">
                {contactInfo.name && `${contactInfo.name}: `}
                {contactInfo.email}
              </p>
            </section>

            {/* Ethical Tags */}
            {ethicalTags.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground lg:text-2xl">Ethical Policies</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ethicalTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block rounded-md bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Inclusive Opportunity */}
            {jobPost.inclusiveOpportunity && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                  Inclusive Opportunity
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  This position is designated as an inclusive opportunity, welcoming candidates from diverse backgrounds.
                </p>
              </section>
            )}

            {/* Applications Received */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground lg:text-2xl">
                Applications Received ({applications.length})
              </h2>
              {applications.length === 0 ? (
                <p className="text-muted-foreground">No applications received yet.</p>
              ) : (
                <div className="space-y-3">
                  {applications.map((application) => (
                    <Card key={application.id} className="border border-border bg-background">
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="size-12 rounded-md">
                            <AvatarFallback className="rounded-md text-sm font-semibold">
                              {application.applicantName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{application.applicantName}</p>
                            <p className="text-sm text-muted-foreground">{application.title}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(application.appliedDate)}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/employer/jobs/${id}/applications/${application.id}`)}
                        >
                          View Application
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
