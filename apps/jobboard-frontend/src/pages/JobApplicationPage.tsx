import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ChevronRight, Upload, X, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import CenteredLoader from '@/components/CenteredLoader';
import { cn } from '@/lib/utils';
import type { JobPostResponse } from '@/types/api.types';
import { getJobById } from '@/services/jobs.service';
import { createApplication, uploadCv, getApplications } from '@/services/applications.service';
import { useAuth } from '@/contexts/AuthContext';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export default function JobApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage ?? i18n.language;
  const isRtl = i18n.dir(resolvedLanguage) === 'rtl';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [job, setJob] = useState<JobPostResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  // Form fields
  const [coverLetter, setCoverLetter] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Success state
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchJobAndCheckApplication = async () => {
      if (!id || !user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch job details
        const jobData = await getJobById(parseInt(id, 10));
        setJob(jobData);

        // Check if user already applied
        const applications = await getApplications({
          jobPostId: parseInt(id, 10),
          jobSeekerId: user.id,
        });

        if (applications.length > 0) {
          setAlreadyApplied(true);
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(t('jobApplication.errors.loadJob'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobAndCheckApplication();
  }, [id, user, t]);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return t('jobApplication.errors.fileTooLarge');
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return t('jobApplication.errors.invalidFileType');
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setCvFile(null);
      return;
    }

    setFileError(null);
    setCvFile(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setCvFile(null);
      return;
    }

    setFileError(null);
    setCvFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = () => {
    setCvFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !cvFile) {
      setFileError(t('jobApplication.form.cv.required'));
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Step 1: Create application
      const application = await createApplication({
        jobPostId: parseInt(id, 10),
        coverLetter: coverLetter.trim() || undefined,
        specialNeeds: specialNeeds.trim() || undefined,
      });

      // Step 2: Upload CV
      await uploadCv(application.id, cvFile);

      // Show success message
      setIsSuccess(true);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(t('jobApplication.errors.submitFailed'));
      setIsSubmitting(false);
    }
  };

  const formatSalary = (min: number, max: number) => {
    return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
  };


  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error && !job) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">{t('jobApplication.errors.loadJob')}</h1>
        <Button asChild className="mt-6">
          <Link to="/jobs">{t('jobApplication.breadcrumb.jobs')}</Link>
        </Button>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  // Success screen
  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-12" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t('jobApplication.success.title')}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t('jobApplication.success.message')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/applications">{t('jobApplication.success.viewApplications')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/jobs">{t('jobApplication.success.backToJobs')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Already applied screen
  if (alreadyApplied) {
    return (
      <div className="container mx-auto px-4 py-12" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t('jobApplication.alreadyApplied.title')}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t('jobApplication.alreadyApplied.message')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/applications">{t('jobApplication.alreadyApplied.viewApplication')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/jobs">{t('jobApplication.alreadyApplied.backToJobs')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/jobs" className="hover:text-foreground transition-colors">
          {t('jobApplication.breadcrumb.jobs')}
        </Link>
        <ChevronRight className={cn('size-4', isRtl && 'rotate-180')} aria-hidden />
        <Link to={`/jobs/${id}`} className="hover:text-foreground transition-colors">
          {job.title}
        </Link>
        <ChevronRight className={cn('size-4', isRtl && 'rotate-180')} aria-hidden />
        <span className="text-foreground">{t('jobApplication.breadcrumb.apply')}</span>
      </nav>

      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-8">
          {t('jobApplication.title', { jobTitle: job.title })}
        </h1>

        {/* Job Details Card */}
        <Card className="border border-border bg-card shadow-sm mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('jobApplication.jobDetails.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('jobApplication.jobDetails.company')}:</span>
                <span className="ml-2 font-medium">{job.company}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('jobApplication.jobDetails.location')}:</span>
                <span className="ml-2 font-medium">
                  {job.remote ? t('jobApplication.jobDetails.remote') : job.location}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('jobApplication.jobDetails.salary')}:</span>
                <span className="ml-2 font-medium">{formatSalary(job.minSalary, job.maxSalary)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('jobApplication.jobDetails.postedOn', { date: format(new Date(job.postedDate), 'MMMM d, yyyy') })}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Application Form */}
        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6 lg:p-8">
            <h2 className="text-xl font-semibold mb-6">{t('jobApplication.form.title')}</h2>

            {error && (
              <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Letter */}
              <div>
                <Label htmlFor="coverLetter" className="text-base font-medium">
                  {t('jobApplication.form.coverLetter.label')}
                </Label>
                <textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value.slice(0, 2000))}
                  placeholder={t('jobApplication.form.coverLetter.placeholder')}
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px] resize-y"
                  maxLength={2000}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('jobApplication.form.coverLetter.characterCount', { count: coverLetter.length })}
                </p>
              </div>

              {/* Special Needs */}
              <div>
                <Label htmlFor="specialNeeds" className="text-base font-medium">
                  {t('jobApplication.form.specialNeeds.label')}
                </Label>
                <textarea
                  id="specialNeeds"
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value.slice(0, 500))}
                  placeholder={t('jobApplication.form.specialNeeds.placeholder')}
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y"
                  maxLength={500}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('jobApplication.form.specialNeeds.characterCount', { count: specialNeeds.length })}
                </p>
              </div>

              {/* CV Upload */}
              <div>
                <Label className="text-base font-medium">
                  {t('jobApplication.form.cv.label')} <span className="text-destructive">*</span>
                </Label>

                {!cvFile ? (
                  <div
                    className={cn(
                      'mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                      fileError ? 'border-destructive bg-destructive/5' : 'border-border hover:border-primary bg-muted/50',
                      isSubmitting && 'opacity-50 cursor-not-allowed'
                    )}
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                  >
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('jobApplication.form.cv.dragDrop')}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                    >
                      {t('jobApplication.form.cv.chooseFile')}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('jobApplication.form.cv.fileTypes')}
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

                {fileError && (
                  <p className="mt-2 text-sm text-destructive">{fileError}</p>
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
                  {t('jobApplication.form.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !cvFile}
                  className="w-full sm:w-auto sm:ml-auto"
                >
                  {isSubmitting ? t('jobApplication.form.submitting') : t('jobApplication.form.submit')}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
