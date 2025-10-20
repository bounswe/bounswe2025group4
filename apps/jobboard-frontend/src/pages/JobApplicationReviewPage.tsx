import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Download, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { getApplicationById, approveApplication, rejectApplication } from '@/services/applications.service';
import type { JobApplicationResponse } from '@/types/api.types';
import CenteredLoader from '@/components/CenteredLoader';

export default function JobApplicationReviewPage() {
  const { jobId, applicationId } = useParams<{ jobId: string; applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<JobApplicationResponse | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!applicationId) return;

      try {
        setIsLoading(true);
        setError(null);
        const appData = await getApplicationById(parseInt(applicationId, 10));
        setApplication(appData);
      } catch (err) {
        console.error('Error fetching application:', err);
        setError('Failed to load application details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  const handleApprove = async () => {
    if (!applicationId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await approveApplication(parseInt(applicationId, 10), feedback || undefined);
      navigate(`/employer/jobs/${jobId}`);
    } catch (err) {
      console.error('Error approving application:', err);
      setError('Failed to approve application. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!applicationId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await rejectApplication(parseInt(applicationId, 10), feedback || undefined);
      navigate(`/employer/jobs/${jobId}`);
    } catch (err) {
      console.error('Error rejecting application:', err);
      setError('Failed to reject application. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleDownload = (type: 'resume' | 'coverLetter') => {
    // TODO: Implement actual download functionality when API supports it
    console.log(`Downloading ${type}`);
  };

  // Format date
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error && !application) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">Error Loading Application</h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button asChild className="mt-6">
          <Link to={`/employer/jobs/${jobId}`}>Back to Job</Link>
        </Button>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
            Application for {application.title}
          </h1>
          <p className="mt-2 text-muted-foreground">
            at {application.company}
          </p>
        </div>

        <div className="space-y-6">
          {/* Applicant Information */}
          <Card className="border border-border bg-card shadow-sm">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Applicant Information</h2>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar className="size-20 self-center rounded-md sm:self-start">
                  <AvatarFallback className="rounded-md text-lg font-semibold">
                    {application.applicantName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {application.applicantName}
                    </p>
                    <p className="text-sm text-muted-foreground">Status: {application.status}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Applied {formatDate(application.appliedDate)}
                </div>
              </div>
            </div>
          </Card>

          {/* Special Needs */}
          {application.specialNeeds && (
            <Card className="border border-border bg-card shadow-sm">
              <div className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Special Needs or Accommodations</h2>
                <p className="text-sm text-muted-foreground">{application.specialNeeds}</p>
              </div>
            </Card>
          )}

          {/* Application Materials */}
          <Card className="border border-border bg-card shadow-sm">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Application Materials</h2>
              <p className="text-sm text-muted-foreground">
                Application materials (resume, cover letter) are stored with the backend but not yet exposed via this API endpoint.
              </p>
            </div>
          </Card>

          {/* Existing Feedback */}
          {application.feedback && (
            <Card className="border border-border bg-card shadow-sm">
              <div className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Existing Feedback</h2>
                <p className="text-sm text-muted-foreground">{application.feedback}</p>
              </div>
            </Card>
          )}

          {/* Decision */}
          <Card className="border border-border bg-card shadow-sm">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Decision</h2>
              {error && (
                <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="feedback" className="text-sm font-medium">
                    Feedback (optional)
                  </Label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback for the applicant"
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Reject'}
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Approve'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
