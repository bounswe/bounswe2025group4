import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { cn } from '@/lib/utils';
import { type JobType } from '@/types/job';
import { useFilters } from '@/hooks/useFilters';

const jobTypeOptions: JobType[] = ['Full-time', 'Part-time', 'Contract'];

const BASE_SALARY_RANGE: [number, number] = [40, 120];

const jobTypeLabelKeyMap: Record<JobType, string> = {
  'Full-time': 'jobFilters.jobTypeOptions.fullTime',
  'Part-time': 'jobFilters.jobTypeOptions.partTime',
  'Contract': 'jobFilters.jobTypeOptions.contract',
};

type JobFiltersProps = {
  className?: string;
};

export function JobFilters({
  className,
}: JobFiltersProps) {
  const { t } = useTranslation('common');
  const {
    selectedEthicalTags,
    selectedJobTypes,
    salaryRange,
    locationFilter,
    setEthicalTags,
    setJobTypes,
    setSalaryRange,
    setLocation,
  } = useFilters();
  const filtersContent = (
    <div className={cn('space-y-6', className)}>
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('jobFilters.ethicalTags')}</h3>
        <MultiSelectDropdown
          selectedTags={selectedEthicalTags}
          onTagsChange={setEthicalTags}
          placeholder={t('jobFilters.selectEthicalTags')}
        />
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('jobFilters.salary')}</h3>
          <span className="text-sm text-muted-foreground">
            {t('jobFilters.salaryRangeValue', { min: salaryRange[0], max: salaryRange[1] })}
          </span>
        </div>
        <Slider
          value={salaryRange}
          onValueChange={(value) => {
            if (Array.isArray(value) && value.length === 2) {
              setSalaryRange([value[0], value[1]]);
            }
          }}
          min={BASE_SALARY_RANGE[0]}
          max={BASE_SALARY_RANGE[1]}
          step={5}
          className="w-full bg-green-500"
          aria-label={t('jobFilters.salary')}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('jobFilters.salaryEndpoint', { value: BASE_SALARY_RANGE[0] })}</span>
          <span>{t('jobFilters.salaryEndpoint', { value: BASE_SALARY_RANGE[1] })}</span>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('jobFilters.jobType')}</h3>
        <div className="space-y-2">
          {jobTypeOptions.map((jobType) => {
            const id = `job-type-${jobType.replace(/\s+/g, '-').toLowerCase()}`;
            return (
              <div key={jobType} className="flex items-center space-x-3 rounded-md px-2 py-1">
                <Checkbox
                  id={id}
                  checked={selectedJobTypes.includes(jobType)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setJobTypes([...selectedJobTypes, jobType]);
                    } else {
                      setJobTypes(selectedJobTypes.filter((t) => t !== jobType));
                    }
                  }}
                  aria-label={t(jobTypeLabelKeyMap[jobType])}
                />
                <Label htmlFor={id} className="text-sm">
                  {t(jobTypeLabelKeyMap[jobType])}
                </Label>
              </div>
            );
          })}
        </div>
      </section>

      <Separator />

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">{t('jobFilters.location')}</h3>
        <Input
          value={locationFilter}
          onChange={(event) => setLocation(event.target.value)}
          placeholder={t('jobFilters.locationPlaceholder')}
          aria-label={t('jobFilters.location')}
        />
      </section>
    </div>
  );

  return filtersContent;
}
