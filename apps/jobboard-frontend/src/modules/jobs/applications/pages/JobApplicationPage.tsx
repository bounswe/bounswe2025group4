import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { ChevronRight, Upload, X, FileText } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Label } from '@shared/components/ui/label';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import { cn } from '@shared/lib/utils';
import { applicationsKeys, jobsKeys } from '@shared/lib/query-keys';
import { normalizeApiError } from '@shared/utils/error-handler';
import { useJobQuery } from '@modules/jobs/services/jobs.service';
import {
  createApplication,
  uploadCv,
  useApplicationsByJobSeekerQuery,
} from '@modules/jobs/applications/services/applications.service';
import { useAuth } from '@/modules/auth/contexts/AuthContext';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export default function JobApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const jobId = id ? parseInt(id, 10) : undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t, i18n } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasRedirectedRef = useRef(false);

  const {
    data: job,
    isLoading: isJobLoading,
    isError: isJobError,
  } = useJobQuery(jobId, Boolean(jobId));

  const {
    data: userApplications,
    isLoading: isApplicationsLoading,
  } = useApplicationsByJobSeekerQuery(user?.id, Boolean(user?.id));

  // Form fields
  const [coverLetter, setCoverLetter] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    if (!jobId || !userApplications || hasRedirectedRef.current) return;

    const hasAppliedToThisJob = userApplications.some((app) => app.jobPostId === jobId);

    if (hasAppliedToThisJob) {
      hasRedirectedRef.current = true;
      toast.info(t('applications.job.errors.alreadyApplied'));
      navigate(`/jobs/${id}`);
    }
  }, [id, jobId, navigate, t, userApplications]);

  const submitApplicationMutation = useMutation({
    mutationFn: async ({
      coverLetter: coverLetterValue,
      specialNeeds: specialNeedsValue,
      file,
    }: {
      coverLetter?: string;
      specialNeeds?: string;
      file: File;
    }) => {
      if (!jobId) {
        throw new Error('Missing job id');
      }
      const application = await createApplication({
        jobPostId: jobId,
        coverLetter: coverLetterValue,
        specialNeeds: specialNeedsValue,
      });

      await uploadCv(application.id, file);
      return application;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: applicationsKeys.all });
      if (jobId) {
        await queryClient.invalidateQueries({ queryKey: jobsKeys.detail(jobId) });
      }
      toast.success(t('applications.job.success.message'));
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });

  const isSubmitting = submitApplicationMutation.isPending;

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('applications.job.errors.fileTooLarge'));
      return false;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      toast.error(t('applications.job.errors.invalidFileType'));
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      setCvFile(file);
    } else {
      handleRemoveFile();
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (validateFile(file)) {
      setCvFile(file);
    } else {
      handleRemoveFile();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = () => {
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobId || !cvFile) {
      toast.error(t('applications.job.form.cv.required'));
      return;
    }

    try {
      await submitApplicationMutation.mutateAsync({
        coverLetter: coverLetter.trim() || undefined,
        specialNeeds: specialNeeds.trim() || undefined,
        file: cvFile,
      });
      navigate('/applications');
    } catch (err) {
      console.error('Error submitting application:', err);
      // Error toast is handled in the mutation
    }
  };

  const formatSalary = (min: number, max: number) => {
    return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString(resolvedLanguage, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isLoading = isJobLoading || isApplicationsLoading;

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (isJobError || !job) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">{t('applications.job.errors.loadJob')}</h1>
        <Button asChild className="mt-6">
          <Link to="/jobs">{t('applications.job.breadcrumb.jobs')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/jobs" className="hover:text-foreground transition-colors">
          {t('applications.job.breadcrumb.jobs')}
        </Link>
        <ChevronRight className={cn('size-4', isRtl && 'rotate-180')} aria-hidden />
        <Link to={`/jobs/${id}`} className="hover:text-foreground transition-colors">
          {job.title}
        </Link>
        <ChevronRight className={cn('size-4', isRtl && 'rotate-180')} aria-hidden />
        <span className="text-foreground">{t('applications.job.breadcrumb.apply')}</span>
      </nav>

      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-8">
          {t('applications.job.title', { jobTitle: job.title })}
        </h1>

        {/* Job Details Card */}
        <Card className="border border-border bg-card shadow-sm mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('applications.job.jobDetails.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('applications.job.jobDetails.company')}:</span>
                <span className="ml-2 font-medium">{job.workplace.companyName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('applications.job.jobDetails.location')}:</span>
                <span className="ml-2 font-medium">
                  {job.remote ? t('applications.job.jobDetails.remote') : job.location}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('applications.job.jobDetails.salary')}:</span>
                <span className="ml-2 font-medium">{formatSalary(job.minSalary, job.maxSalary)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('applications.job.jobDetails.postedOn', { date: formatDate(job.postedDate) })}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Application Form */}
        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6 lg:p-8">
            <h2 className="text-xl font-semibold mb-6">{t('applications.job.form.title')}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Letter */}
              <div>
                <Label htmlFor="coverLetter" className="text-base font-medium">
                  {t('applications.job.form.coverLetter.label')}
                </Label>
                <textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value.slice(0, 2000))}
                  placeholder={t('applications.job.form.coverLetter.placeholder')}
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px] resize-y"
                  maxLength={2000}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('applications.job.form.coverLetter.characterCount', { count: coverLetter.length })}
                </p>
              </div>

              {/* Special Needs */}
              <div>
                <Label htmlFor="specialNeeds" className="text-base font-medium">
                  {t('applications.job.form.specialNeeds.label')}
                </Label>
                <textarea
                  id="specialNeeds"
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value.slice(0, 500))}
                  placeholder={t('applications.job.form.specialNeeds.placeholder')}
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y"
                  maxLength={500}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('applications.job.form.specialNeeds.characterCount', { count: specialNeeds.length })}
                </p>
              </div>

              {/* CV Upload */}
              <div>
                <Label className="text-base font-medium">
                  {t('applications.job.form.cv.label')} <span className="text-destructive">*</span>
                </Label>

                {!cvFile ? (
                  <div
                    className={cn(
                      'mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                      'border-border hover:border-primary bg-muted/50',
                      isSubmitting && 'opacity-50 cursor-not-allowed'
                    )}
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                  >
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('applications.job.form.cv.dragDrop')}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                    >
                      {t('applications.job.form.cv.chooseFile')}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('applications.job.form.cv.fileTypes')}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </div>
                ) : (
                  <div className="mt-2 border border-border rounded-lg p-4 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{cvFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(cvFile.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/jobs/${id}`)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !cvFile}
                  className="w-full sm:w-auto sm:ml-auto"
                >
                  {isSubmitting ? t('applications.job.form.submitting') : t('applications.job.form.submit')}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}

