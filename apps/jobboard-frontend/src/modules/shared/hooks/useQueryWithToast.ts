import { useEffect } from 'react';
import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { normalizeApiError } from '@shared/utils/error-handler';

/**
 * Wraps useQuery to surface errors via toast while keeping the fetcher pure.
 */
export function useQueryWithToast<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError> {
  const queryResult = useQuery(options);

  useEffect(() => {
    if (queryResult.isError && queryResult.error) {
      toast.error(normalizeApiError(queryResult.error as unknown).friendlyMessage);
    }
  }, [queryResult.isError, queryResult.error]);

  return queryResult;
}

