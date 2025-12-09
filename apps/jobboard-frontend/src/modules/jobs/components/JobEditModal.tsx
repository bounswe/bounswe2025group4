import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Checkbox } from '@shared/components/ui/checkbox';
import { RequiredMark } from '@shared/components/ui/required-mark';
import type { EmployerWorkplaceBrief } from '@shared/types/workplace.types';

const WorkplaceSelector = lazy(() => import('@/modules/workplace/components/WorkplaceSelector'));

export type JobPostFormData = {
  title: string;
  description: string;
  workplaceId: number | null;
  remote: boolean;
  minSalary: string;
  maxSalary: string;
  contact: string;
  inclusiveOpportunity: boolean;
  nonProfit: boolean;
};

export interface JobEditModalProps {
  formData: JobPostFormData;
  onChange: (data: Partial<JobPostFormData>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  error?: string | null;
  isSubmitting?: boolean;
}

/**
 * Presentational form used inside the job edit modal.
 * State management, optimistic updates, and request handling are owned by the parent.
 */
export default function JobEditModal({
  formData,
  onChange,
  onSubmit,
  onCancel,
  error,
  isSubmitting = false,
}: JobEditModalProps) {
  const { t } = useTranslation('common');

  const handleWorkplaceChange = (workplaceId: number, _workplace: EmployerWorkplaceBrief) => {
    onChange({ workplaceId });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title" className="text-sm font-semibold">
          <span className="inline-flex items-start gap-0.5">
            {t('employer.createJob.jobTitle', { defaultValue: 'Job Title' })}
            <RequiredMark />
          </span>
        </Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={t('employer.createJob.jobTitlePlaceholder', {
            defaultValue: 'eg: Senior Product Manager',
          })}
          className="mt-2"
          required
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-semibold">
          <span className="inline-flex items-start gap-0.5">
            {t('employer.createJob.jobDescription', { defaultValue: 'Job Description' })}
            <RequiredMark />
          </span>
        </Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder={t('employer.createJob.jobDescriptionPlaceholder', {
            defaultValue:
              'Provide a detailed description of the role, responsibilities, qualifications, and company culture',
          })}
          className="mt-2 w-full min-h-[150px] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
      </div>

      <div>
        <Label className="text-sm font-semibold">
          <span className="inline-flex items-start gap-0.5">
            {t('employer.createJob.workplace', { defaultValue: 'Workplace' })}
            <RequiredMark />
          </span>
        </Label>
        <p className="text-xs text-muted-foreground mt-1 mb-2">
          {t('employer.createJob.workplaceDescription', {
            defaultValue: 'Select the workplace this job belongs to',
          })}
        </p>
        <Suspense fallback={<div className="mt-2 h-10 rounded-md bg-muted animate-pulse" />}>
          <WorkplaceSelector
            value={formData.workplaceId ?? undefined}
            onChange={handleWorkplaceChange}
            className="mt-2"
          />
        </Suspense>
      </div>

      <div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="remote"
            checked={formData.remote}
            onCheckedChange={(checked) =>
              onChange({ remote: Boolean(checked) })
            }
            className="mt-0.5"
          />
          <div className="flex-1">
            <Label htmlFor="remote" className="text-sm font-medium cursor-pointer">
              {t('employer.createJob.remoteWork', { defaultValue: 'Remote Work Available' })}
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('employer.createJob.remoteWorkDescription', {
                defaultValue: 'Check this if the position offers remote work options',
              })}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="nonProfit"
            checked={formData.nonProfit}
            onCheckedChange={(checked) =>
              onChange({
                nonProfit: Boolean(checked),
                minSalary: checked ? '' : formData.minSalary,
                maxSalary: checked ? '' : formData.maxSalary,
              })
            }
            className="mt-0.5"
          />
          <div className="flex-1">
            <Label htmlFor="nonProfit" className="text-sm font-medium cursor-pointer">
              {t('employer.createJob.nonProfit', { defaultValue: 'Non-Profit Organization' })}
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('employer.createJob.nonProfitDescription', {
                defaultValue: 'Mark this as a volunteer opportunity from a non-profit organization focused on social impact',
              })}
            </p>
          </div>
        </div>
      </div>

      {!formData.nonProfit && (
        <div>
          <Label className="text-sm font-semibold">
            {t('employer.createJob.salaryRange', { defaultValue: 'Salary Range (USD)' })}
          </Label>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="minSalary" className="text-xs text-muted-foreground">
                {t('employer.createJob.minimum', { defaultValue: 'Minimum' })}
              </Label>
              <Input
                id="minSalary"
                type="number"
                value={formData.minSalary}
                onChange={(e) => onChange({ minSalary: e.target.value })}
                placeholder={t('employer.createJob.minSalaryPlaceholder', {
                  defaultValue: 'e.g., 80000',
                })}
                className="mt-1"
                required={!formData.nonProfit}
              />
            </div>
            <div>
              <Label htmlFor="maxSalary" className="text-xs text-muted-foreground">
                {t('employer.createJob.maximum', { defaultValue: 'Maximum' })}
              </Label>
              <Input
                id="maxSalary"
                type="number"
                value={formData.maxSalary}
                onChange={(e) => onChange({ maxSalary: e.target.value })}
                placeholder={t('employer.createJob.maxSalaryPlaceholder', {
                  defaultValue: 'e.g., 120000',
                })}
                className="mt-1"
                required={!formData.nonProfit}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="contactEmail" className="text-sm font-semibold">
          <span className="inline-flex items-start gap-0.5">
            {t('employer.createJob.contactEmail', { defaultValue: 'Contact Email' })}
            <RequiredMark />
          </span>
        </Label>
        <Input
          id="contactEmail"
          type="email"
          value={formData.contact}
          onChange={(e) => onChange({ contact: e.target.value })}
          placeholder={t('employer.createJob.contactEmailPlaceholder', {
            defaultValue: 'eg: hiring@company.com',
          })}
          className="mt-2"
          required
        />
      </div>

      <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="inclusiveOpportunity"
            checked={formData.inclusiveOpportunity}
            onCheckedChange={(checked) =>
              onChange({
                inclusiveOpportunity: Boolean(checked),
              })
            }
            className="mt-0.5"
          />
          <div className="flex-1">
            <Label htmlFor="inclusiveOpportunity" className="text-sm font-semibold cursor-pointer">
              {t('employer.createJob.inclusiveOpportunity', {
                defaultValue: 'Inclusive Opportunity',
              })}
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('employer.createJob.inclusiveOpportunityDescription', {
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
          onClick={onCancel}
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
  );
}

