import { useSearchParams } from 'react-router';
import { type JobType, type EthicalTag } from '@/types/job';

const FIXED_SALARY_RANGE: [number, number] = [10, 1000];

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const selectedEthicalTags = (searchParams.get('ethicalTags')?.split(',').filter(Boolean) || []) as EthicalTag[];
  const selectedJobTypes = (searchParams.get('jobTypes')?.split(',').filter(Boolean) || []) as JobType[];
  const salaryRange: [number, number] = [
    Number(searchParams.get('minSalary')) || FIXED_SALARY_RANGE[0],
    Number(searchParams.get('maxSalary')) || FIXED_SALARY_RANGE[1],
  ];
  const companyNameFilter = searchParams.get('companyName') || '';
  const isRemoteOnly = searchParams.get('isRemote') === 'true';
  const isDisabilityInclusive = searchParams.get('isDisabilityInclusive') === 'true';

  // Update functions
  const setEthicalTags = (tags: EthicalTag[]) => {
    setSearchParams((prev) => {
      if (tags.length > 0) {
        prev.set('ethicalTags', tags.join(','));
      } else {
        prev.delete('ethicalTags');
      }
      return prev;
    });
  };

  const setJobTypes = (jobTypes: JobType[]) => {
    setSearchParams((prev) => {
      if (jobTypes.length > 0) {
        prev.set('jobTypes', jobTypes.join(','));
      } else {
        prev.delete('jobTypes');
      }
      return prev;
    });
  };

  const setSalaryRange = (range: [number, number]) => {
    setSearchParams((prev) => {
      if (range[0] !== FIXED_SALARY_RANGE[0] || range[1] !== FIXED_SALARY_RANGE[1]) {
        prev.set('minSalary', String(range[0]));
        prev.set('maxSalary', String(range[1]));
      } else {
        prev.delete('minSalary');
        prev.delete('maxSalary');
      }
      return prev;
    });
  };

  const setCompanyName = (companyName: string) => {
    setSearchParams((prev) => {
      if (companyName) {
        prev.set('companyName', companyName);
      } else {
        prev.delete('companyName');
      }
      return prev;
    });
  };

  const setIsRemote = (isRemote: boolean) => {
    setSearchParams((prev) => {
      if (isRemote) {
        prev.set('isRemote', 'true');
      } else {
        prev.delete('isRemote');
      }
      return prev;
    });
  };

  const setIsDisabilityInclusive = (isDisabilityInclusive: boolean) => {
    setSearchParams((prev) => {
      if (isDisabilityInclusive) {
        prev.set('isDisabilityInclusive', 'true');
      } else {
        prev.delete('isDisabilityInclusive');
      }
      return prev;
    });
  };

  const resetFilters = () => {
    setSearchParams((prev) => {
      prev.delete('ethicalTags');
      prev.delete('jobTypes');
      prev.delete('minSalary');
      prev.delete('maxSalary');
      prev.delete('companyName');
      prev.delete('isRemote');
      prev.delete('isDisabilityInclusive');
      return prev;
    });
  };

  return {
    selectedEthicalTags,
    selectedJobTypes,
    salaryRange,
    companyNameFilter,
    isRemoteOnly,
    isDisabilityInclusive,
    setEthicalTags,
    setJobTypes,
    setSalaryRange,
    setCompanyName,
    setIsRemote,
    setIsDisabilityInclusive,
    resetFilters,
  };
}
