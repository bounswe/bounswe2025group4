import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import CenteredLoader from '@/components/CenteredLoader';
import { getJobById, updateJob } from '@/services/jobs.service';
import type { UpdateJobPostRequest, JobPostResponse } from '@/types/api.types';
import type { EthicalTag } from '@/types/job';

type JobPostFormData = {
  title: string;
  description: string;
  company: string;
  location: string;
  remote: boolean;
  minSalary: string;
  maxSalary: string;
  contactEmail: string;
  ethicalTags: EthicalTag[];
  inclusiveOpportunity: boolean;
};

function parseContact(contact: JobPostResponse['contact']): { email: string } {
  if (!contact) {
    return { email: '' };
  }

  if (contact.startsWith('{')) {
    try {
      const parsed = JSON.parse(contact) as { email?: string };
      if (parsed.email) {
        return { email: parsed.email };
      }
    } catch {
      // fall back to returning the raw contact string
    }
  }

  return { email: contact };
}

export default function EmployerEditJobPostPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const [formData, setFormData] = useState<JobPostFormData>({
    title: '',
    description: '',
    company: '',
    location: '',
    remote: false,
    minSalary: '',
    maxSalary: '',
    contactEmail: '',
    ethicalTags: [],
    inclusiveOpportunity: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) {
        setError(
          t('editJob.missingId', {
            defaultValue: 'Missing job id.',
          })
        );
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const job = await getJobById(parseInt(jobId, 10));

        const { email } = parseContact(job.contact ?? '');
        const tags = job.ethicalTags
          ? (job.ethicalTags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean) as EthicalTag[])
          : [];

        setFormData({
          title: job.title ?? '',
          description: job.description ?? '',
          company: job.company ?? '',
          location: job.location ?? '',
          remote: job.remote ?? false,
          minSalary: job.minSalary?.toString() ?? '',
          maxSalary: job.maxSalary?.toString() ?? '',
          contactEmail: email,
          ethicalTags: tags,
          inclusiveOpportunity: job.inclusiveOpportunity ?? false,
        });
      } catch (err) {
        console.error('Error loading job post for edit:', err);
        setError(
          t('editJob.loadError', {
            defaultValue: 'Failed to load job details. Please try again later.',
          })
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [jobId, t]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!jobId) {
      setError(
        t('editJob.missingId', {
          defaultValue: 'Missing job id.',
        })
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const requestData: UpdateJobPostRequest = {
        title: formData.title,
        description: formData.description,
        company: formData.company,
        location: formData.location,
        remote: formData.remote,
        contact: formData.contactEmail,
        ethicalTags: formData.ethicalTags.join(', '),
        inclusiveOpportunity: formData.inclusiveOpportunity,
        minSalary: formData.minSalary ? parseInt(formData.minSalary, 10) : undefined,
        maxSalary: formData.maxSalary ? parseInt(formData.maxSalary, 10) : undefined,
      };

      await updateJob(parseInt(jobId, 10), requestData);
      navigate(`/employer/jobs/${jobId}`);
    } catch (err) {
      console.error('Error updating job post:', err);
      setError(
        t('editJob.submitError', {
          defaultValue: 'Failed to update job posting. Please try again.',
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <CenteredLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
            {t('editJob.title', { defaultValue: 'Edit Job Posting' })}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('editJob.subtitle', {
              defaultValue: 'Update the information below to keep your job opportunity current.',
            })}
          </p>
        </div>

        <Card className="border border-border bg-card shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4 p-4 lg:p-6">
            <div>
              <Label htmlFor="title" className="text-sm font-semibold">
                {t('createJob.jobTitle', { defaultValue: 'Job Title' })}
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('createJob.jobTitlePlaceholder', {
                  defaultValue: 'eg: Senior Product Manager',
                })}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-semibold">
                {t('createJob.jobDescription', { defaultValue: 'Job Description' })}
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('createJob.jobDescriptionPlaceholder', {
                  defaultValue:
                    'Provide a detailed description of the role, responsibilities, qualifications, and company culture',
                })}
                className="mt-2 w-full min-h-[150px] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div>
              <Label htmlFor="company" className="text-sm font-semibold">
                {t('createJob.companyName', { defaultValue: 'Company Name' })}
              </Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder={t('createJob.companyNamePlaceholder', {
                  defaultValue: 'eg: Tech Innovators Inc.',
                })}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-semibold">
                {t('createJob.location', { defaultValue: 'Location' })}
              </Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('createJob.locationPlaceholder', {
                  defaultValue: 'eg: San Francisco, CA',
                })}
                className="mt-2"
                required
              />
            </div>

            <div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="remote"
                  checked={formData.remote}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, remote: Boolean(checked) })
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="remote" className="text-sm font-medium cursor-pointer">
                    {t('createJob.remoteWork', { defaultValue: 'Remote Work Available' })}
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('createJob.remoteWorkDescription', {
                      defaultValue: 'Check this if the position offers remote work options',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">
                {t('createJob.salaryRange', { defaultValue: 'Salary Range (USD)' })}
              </Label>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="minSalary" className="text-xs text-muted-foreground">
                    {t('createJob.minimum', { defaultValue: 'Minimum' })}
                  </Label>
                  <Input
                    id="minSalary"
                    type="number"
                    value={formData.minSalary}
                    onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                    placeholder={t('createJob.minSalaryPlaceholder', {
                      defaultValue: 'e.g., 80000',
                    })}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxSalary" className="text-xs text-muted-foreground">
                    {t('createJob.maximum', { defaultValue: 'Maximum' })}
                  </Label>
                  <Input
                    id="maxSalary"
                    type="number"
                    value={formData.maxSalary}
                    onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                    placeholder={t('createJob.maxSalaryPlaceholder', {
                      defaultValue: 'e.g., 120000',
                    })}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="contactEmail" className="text-sm font-semibold">
                {t('createJob.contactEmail', { defaultValue: 'Contact Email' })}
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder={t('createJob.contactEmailPlaceholder', {
                  defaultValue: 'eg: hiring@company.com',
                })}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">
                {t('createJob.ethicalTags', { defaultValue: 'Ethical Policies' })}
              </Label>
              <p className="mt-1 mb-3 text-xs text-muted-foreground">
                {t('createJob.ethicalTagsDescription', {
                  defaultValue:
                    'Select the ethical policies or programs that apply to this job opportunity.',
                })}
              </p>
              <MultiSelectDropdown
                selectedTags={formData.ethicalTags}
                onTagsChange={(tags) => setFormData({ ...formData, ethicalTags: tags })}
                placeholder={t('createJob.ethicalTagsPlaceholder', {
                  defaultValue: 'Select ethical policies',
                })}
              />
            </div>

            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="inclusiveOpportunity"
                  checked={formData.inclusiveOpportunity}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      inclusiveOpportunity: Boolean(checked),
                    })
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="inclusiveOpportunity" className="text-sm font-semibold cursor-pointer">
                    {t('createJob.inclusiveOpportunity', {
                      defaultValue: 'Inclusive Opportunity',
                    })}
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('createJob.inclusiveOpportunityDescription', {
                      defaultValue:
                        'Highlight this job as welcoming candidates from diverse backgrounds.',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-destructive bg-destructive/10 p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/employer/jobs/${jobId ?? ''}`)}
                disabled={isSubmitting}
              >
                {t('editJob.cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t('editJob.saving', { defaultValue: 'Saving...' })
                  : t('editJob.save', { defaultValue: 'Save Changes' })}
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <Link
            to={`/employer/jobs/${jobId ?? ''}`}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            {t('editJob.backToDetails', { defaultValue: 'Back to job details' })}
          </Link>
        </div>
      </div>
    </div>
  );
}
