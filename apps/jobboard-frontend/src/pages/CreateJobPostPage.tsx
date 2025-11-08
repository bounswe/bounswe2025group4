import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { createJob } from '@/services/jobs.service';
import type { CreateJobPostRequest } from '@/types/api.types';
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

import { useTranslation } from 'react-i18next';

export default function CreateJobPostPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requestData: CreateJobPostRequest = {
        title: formData.title,
        description: formData.description,
        company: formData.company,
        location: formData.location,
        remote: formData.remote,
        minSalary: parseInt(formData.minSalary, 10),
        maxSalary: parseInt(formData.maxSalary, 10),
        contact: formData.contactEmail,
        ethicalTags: formData.ethicalTags.join(', '),
        inclusiveOpportunity: formData.inclusiveOpportunity,
      };

      await createJob(requestData);
      toast.success(t('createJob.submitSuccess'));
      navigate('/employer/dashboard');
    } catch (err) {
      console.error('Error creating job:', err);
      toast.error(t('createJob.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
            {t('createJob.title')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('createJob.subtitle')}
          </p>
        </div>

        {/* Form Card */}
        <Card className="border border-border bg-card shadow-sm">
          <form onSubmit={handleSubmit} className="p-4 lg:p-6">
            {/* Job Title */}
            <div className="mb-4">
              <Label htmlFor="title" className="text-sm font-semibold">
                {t('createJob.jobTitle')}
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('createJob.jobTitlePlaceholder')}
                className="mt-2"
                required
              />
            </div>

            {/* Job Description */}
            <div className="mb-4">
              <Label htmlFor="description" className="text-sm font-semibold">
                {t('createJob.jobDescription')}
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('createJob.jobDescriptionPlaceholder')}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px] resize-y"
                required
              />
            </div>

            {/* Company Name */}
            <div className="mb-4">
              <Label htmlFor="company" className="text-sm font-semibold">
                {t('createJob.companyName')}
              </Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder={t('createJob.companyNamePlaceholder')}
                className="mt-2"
                required
              />
            </div>

            {/* Location */}
            <div className="mb-4">
              <Label htmlFor="location" className="text-sm font-semibold">
                {t('createJob.location')}
              </Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('createJob.locationPlaceholder')}
                className="mt-2"
                required
              />
            </div>

            {/* Remote Work */}
            <div className="mb-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="remote"
                  checked={formData.remote}
                  onCheckedChange={() => setFormData({ ...formData, remote: !formData.remote })}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="remote" className="text-sm font-medium cursor-pointer">
                    {t('createJob.remoteWork')}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('createJob.remoteWorkDescription')}
                  </p>
                </div>
              </div>
            </div>

            {/* Salary Range */}
            <div className="mb-4">
              <Label className="text-sm font-semibold">{t('createJob.salaryRange')}</Label>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="minSalary" className="text-xs text-muted-foreground">
                    {t('createJob.minimum')}
                  </Label>
                  <Input
                    id="minSalary"
                    type="number"
                    value={formData.minSalary}
                    onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                    placeholder={t('createJob.minSalaryPlaceholder')}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxSalary" className="text-xs text-muted-foreground">
                    {t('createJob.maximum')}
                  </Label>
                  <Input
                    id="maxSalary"
                    type="number"
                    value={formData.maxSalary}
                    onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                    placeholder={t('createJob.maxSalaryPlaceholder')}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Email */}
            <div className="mb-4">
              <Label htmlFor="contactEmail" className="text-sm font-semibold">
                {t('createJob.contactEmail')}
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder={t('createJob.contactEmailPlaceholder')}
                className="mt-2"
                required
              />
            </div>

            {/* Ethical Tags */}
            <div className="mb-4">
              <Label className="text-sm font-semibold">{t('createJob.ethicalTags')}</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                {t('createJob.ethicalTagsDescription')}
              </p>
              <MultiSelectDropdown
                selectedTags={formData.ethicalTags}
                onTagsChange={(tags) => setFormData({ ...formData, ethicalTags: tags })}
                placeholder={t('createJob.ethicalTagsPlaceholder')}
              />
            </div>

            {/* Inclusive Opportunity for People with Disabilities */}
            <div className="mb-6 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="inclusiveOpportunity"
                  checked={formData.inclusiveOpportunity}
                  onCheckedChange={() =>
                    setFormData({ ...formData, inclusiveOpportunity: !formData.inclusiveOpportunity })
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="inclusiveOpportunity" className="text-sm font-semibold cursor-pointer">
                    {t('createJob.inclusiveOpportunity')}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('createJob.inclusiveOpportunityDescription')}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? t('createJob.submitting') : t('createJob.submit')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
