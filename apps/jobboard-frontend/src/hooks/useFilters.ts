import { useSearchParams } from 'react-router';
import { type JobType, type Policy } from '@/types/job';

const BASE_SALARY_RANGE: [number, number] = [40, 120];

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const selectedPolicies = (searchParams.get('policies')?.split(',').filter(Boolean) || []) as Policy[];
  const selectedJobTypes = (searchParams.get('jobTypes')?.split(',').filter(Boolean) || []) as JobType[];
  const salaryRange: [number, number] = [
    Number(searchParams.get('minSalary')) || BASE_SALARY_RANGE[0],
    Number(searchParams.get('maxSalary')) || BASE_SALARY_RANGE[1],
  ];
  const locationFilter = searchParams.get('location') || '';

  // Update functions
  const setPolicies = (policies: Policy[]) => {
    setSearchParams((prev) => {
      if (policies.length > 0) {
        prev.set('policies', policies.join(','));
      } else {
        prev.delete('policies');
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
      if (range[0] !== BASE_SALARY_RANGE[0] || range[1] !== BASE_SALARY_RANGE[1]) {
        prev.set('minSalary', String(range[0]));
        prev.set('maxSalary', String(range[1]));
      } else {
        prev.delete('minSalary');
        prev.delete('maxSalary');
      }
      return prev;
    });
  };

  const setLocation = (location: string) => {
    setSearchParams((prev) => {
      if (location) {
        prev.set('location', location);
      } else {
        prev.delete('location');
      }
      return prev;
    });
  };

  const resetFilters = () => {
    setSearchParams((prev) => {
      prev.delete('policies');
      prev.delete('jobTypes');
      prev.delete('minSalary');
      prev.delete('maxSalary');
      prev.delete('location');
      return prev;
    });
  };

  return {
    selectedPolicies,
    selectedJobTypes,
    salaryRange,
    locationFilter,
    setPolicies,
    setJobTypes,
    setSalaryRange,
    setLocation,
    resetFilters,
  };
}
