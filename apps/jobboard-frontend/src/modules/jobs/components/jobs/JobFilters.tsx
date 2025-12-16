import { useTranslation } from 'react-i18next';
import { Checkbox } from '@shared/components/ui/checkbox';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Separator } from '@shared/components/ui/separator';
import { Slider } from '@shared/components/ui/slider';
import { MultiSelectDropdown } from '@shared/components/ui/multi-select-dropdown';
import { cn } from '@shared/lib/utils';
import { useFilters } from '@shared/hooks/useFilters';

const BASE_SALARY_RANGE: [number, number] = [40, 120];

type JobFiltersProps = {
  className?: string;
};

export function JobFilters({
  className,
}: JobFiltersProps) {
  const { t } = useTranslation('common');
  const {
    selectedEthicalTags,
    salaryRange,
    companyNameFilter,
    isRemoteOnly,
    isDisabilityInclusive,
    setEthicalTags,
    setSalaryRange,
    setCompanyName,
    setIsRemote,
    setIsDisabilityInclusive,
  } = useFilters();
  const filtersContent = (
    <div className={cn('space-y-6', className)}>
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('jobs.filters.ethicalTags')}</h3>
        <MultiSelectDropdown
          selectedTags={selectedEthicalTags}
          onTagsChange={setEthicalTags}
          placeholder={t('jobs.filters.selectEthicalTags')}
        />
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('jobs.filters.salary')}</h3>
          <span className="text-sm text-muted-foreground">
            {t('jobs.filters.salaryRangeValue', { min: salaryRange[0], max: salaryRange[1] })}
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
          aria-label={t('jobs.filters.salary')}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('jobs.filters.salaryEndpoint', { value: BASE_SALARY_RANGE[0] })}</span>
          <span>{t('jobs.filters.salaryEndpoint', { value: BASE_SALARY_RANGE[1] })}</span>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('jobs.filters.workArrangement')}</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 rounded-md px-2 py-1">
            <Checkbox
              id="filter-remote"
              checked={isRemoteOnly}
              onCheckedChange={(checked) => setIsRemote(checked === true)}
              aria-label={t('jobs.filters.remoteOnly')}
            />
            <Label htmlFor="filter-remote" className="text-sm">
              {t('jobs.filters.remoteOnly')}
            </Label>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t('jobs.filters.inclusivity')}</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 rounded-md px-2 py-1">
            <Checkbox
              id="filter-disability-inclusive"
              checked={isDisabilityInclusive}
              onCheckedChange={(checked) => setIsDisabilityInclusive(checked === true)}
              aria-label={t('jobs.filters.disabilityInclusive')}
            />
            <Label htmlFor="filter-disability-inclusive" className="text-sm">
              {t('jobs.filters.disabilityInclusive')}
            </Label>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">{t('jobs.filters.companyName')}</h3>
        <Input
          value={companyNameFilter}
          onChange={(event) => setCompanyName(event.target.value)}
          placeholder={t('jobs.filters.companyNamePlaceholder')}
          aria-label={t('jobs.filters.companyName')}
        />
      </section>
    </div>
  );

  return filtersContent;
}

