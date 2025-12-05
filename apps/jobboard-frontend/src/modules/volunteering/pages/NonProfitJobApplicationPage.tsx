import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { ChevronRight, Upload, X, FileText, Heart } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Label } from '@shared/components/ui/label';
import { Badge } from '@shared/components/ui/badge';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import { cn } from '@shared/lib/utils';
import type { JobPostResponse } from '@shared/types/api.types';
import { getJobById } from '@modules/jobs/services/jobs.service';
import { createApplication, uploadCv, getApplicationsByJobSeeker } from '@modules/applications/services/applications.service';
import { useAuth } from '@/modules/auth/contexts/AuthContext';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export default function NonProfitJobApplicationPage() {
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

  // Form fields
  const [coverLetter, setCoverLetter] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchJobAndCheckApplication = async () => {
      if (!id || !user) return;

      try {
        setIsLoading(true);

        // Check if user already applied to this specific job
        const allApplications = await getApplicationsByJobSeeker(user.id);

        const hasAppliedToThisJob = allApplications.some(
          (app) => app.jobPostId === parseInt(id, 10)
        );

        if (hasAppliedToThisJob) {
          toast.info(t('nonProfitApplication.errors.alreadyApplied'));
          navigate(`/nonprofit-jobs/${id}`);
          return;
        }

        // Fetch job details
        const jobData = await getJobById(parseInt(id, 10));
        setJob(jobData);
      } catch (err) {
        console.error('Error fetching volunteer opportunity:', err);
        toast.error(t('nonProfitApplication.errors.loadJob'));
        navigate('/nonprofit-jobs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobAndCheckApplication();
  }, [id, user, t, navigate]);

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('nonProfitApplication.errors.fileTooLarge'));
      return false;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      toast.error(t('nonProfitApplication.errors.invalidFileType'));
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

    if (!id || !cvFile) {
      toast.error(t('nonProfitApplication.form.cv.required'));
      return;
    }

    try {
      setIsSubmitting(true);

      const application = await createApplication({
        jobPostId: parseInt(id, 10),
        coverLetter: coverLetter.trim() || undefined,
        specialNeeds: specialNeeds.trim() || undefined,
      });

      await uploadCv(application.id, cvFile);

      toast.success(t('nonProfitApplication.success.message'));
      navigate('/applications');
    } catch (err) {
      console.error('Error submitting volunteer application:', err);
      toast.error(t('nonProfitApplication.errors.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString(resolvedLanguage, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading || !job) {
    return <CenteredLoader />;
  }

  // Handle location display with fallbacks
  const location = job.remote 
    ? t('jobCard.remote') 
    : job.location || job.workplace.location || t('jobCard.notSpecified');

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/nonprofit-jobs" className="hover:text-foreground transition-colors">
          {t('nonProfitJobs.volunteer')}
        </Link>
        <ChevronRight className={cn('size-4', isRtl && 'rotate-180')} aria-hidden />
        <Link to={`/nonprofit-jobs/${id}`} className="hover:text-foreground transition-colors">
          {job.title}
        </Link>
        <ChevronRight className={cn('size-4', isRtl && 'rotate-180')} aria-hidden />
        <span className="text-foreground">{t('nonProfitApplication.breadcrumb.apply')}</span>
      </nav>

      <div className="mx-auto max-w-4xl">
        {/* Header with volunteer badge */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-green-500 text-white hover:bg-green-600 flex items-center gap-1">
              <Heart className="size-3" aria-hidden />
              {t('nonProfitJobs.volunteerOpportunity')}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
            {t('nonProfitApplication.title', { jobTitle: job.title })}
          </h1>
        </div>

        {/* Opportunity Details Card */}
        <Card className="border border-border bg-card shadow-sm mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('nonProfitApplication.opportunityDetails.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('nonProfitApplication.opportunityDetails.organization')}:</span>
                <span className="ml-2 font-medium">{job.workplace.companyName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('nonProfitApplication.opportunityDetails.location')}:</span>
                <span className="ml-2 font-medium">{location}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('nonProfitApplication.opportunityDetails.type')}:</span>
                <span className="ml-2 font-medium text-green-600">{t('nonProfitApplication.opportunityDetails.volunteer')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('nonProfitApplication.opportunityDetails.postedOn', { date: formatDate(job.postedDate) })}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Volunteer Application Form */}
        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6 lg:p-8">
            <h2 className="text-xl font-semibold mb-2">{t('nonProfitApplication.form.title')}</h2>
            <p className="text-muted-foreground mb-6">{t('nonProfitApplication.form.subtitle')}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Motivation Letter */}
              <div>
                <Label htmlFor="coverLetter" className="text-base font-medium">
                  {t('nonProfitApplication.form.motivationLetter.label')}
                </Label>
                <textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value.slice(0, 2000))}
                  placeholder={t('nonProfitApplication.form.motivationLetter.placeholder')}
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px] resize-y"
                  maxLength={2000}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('nonProfitApplication.form.motivationLetter.characterCount', { count: coverLetter.length })}
                </p>
              </div>

              {/* Special Needs */}
              <div>
                <Label htmlFor="specialNeeds" className="text-base font-medium">
                  {t('nonProfitApplication.form.specialNeeds.label')}
                </Label>
                <textarea
                  id="specialNeeds"
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value.slice(0, 500))}
                  placeholder={t('nonProfitApplication.form.specialNeeds.placeholder')}
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y"
                  maxLength={500}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('nonProfitApplication.form.specialNeeds.characterCount', { count: specialNeeds.length })}
                </p>
              </div>

              {/* Resume/CV Upload */}
              <div>
                <Label className="text-base font-medium">
                  {t('nonProfitApplication.form.cv.label')} <span className="text-destructive">*</span>
                </Label>

                {!cvFile ? (
                  <div
                    className={cn(
                      'mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                      'border-border hover:border-green-500 bg-green-50/50 dark:bg-green-950/20',
                      isSubmitting && 'opacity-50 cursor-not-allowed'
                    )}
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                  >
                    <Upload className="mx-auto h-12 w-12 text-green-600 mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('nonProfitApplication.form.cv.dragDrop')}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                    >
                      {t('nonProfitApplication.form.cv.chooseFile')}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('nonProfitApplication.form.cv.fileTypes')}
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
                  <div className="mt-2 border border-green-200 rounded-lg p-4 bg-green-50/50 dark:bg-green-950/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-green-600" />
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
                  onClick={() => navigate(`/nonprofit-jobs/${id}`)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {t('nonProfitApplication.form.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !cvFile}
                  className="w-full sm:w-auto sm:ml-auto bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? t('nonProfitApplication.form.submitting') : t('nonProfitApplication.form.submit')}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
