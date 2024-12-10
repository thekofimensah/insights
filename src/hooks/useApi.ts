import { useQuery, useMutation } from '@tanstack/react-query';
import type { APIError } from '../services/api/errors.ts';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: APIError) => void;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export function useApi<T, TVariables = void>(
  queryKey: string[],
  apiFunction: (variables: TVariables) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    enabled = true,
    staleTime = 1000 * 60 * 5, // 5 minutes
    cacheTime = 1000 * 60 * 30, // 30 minutes
  } = options;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await apiFunction(undefined as TVariables);
      } catch (err) {
        const error = err as APIError;
        onError?.(error);
        throw error;
      }
    },
    enabled,
    staleTime,
    cacheTime,
    onSuccess,
  });

  return {
    ...query,
    error: query.error ? (query.error as Error).message : null,
  };
}

export function useApiMutation<T, TVariables>(
  apiFunction: (variables: TVariables) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const { onSuccess, onError } = options;

  const mutation = useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        return await apiFunction(variables);
      } catch (err) {
        const error = err as APIError;
        onError?.(error);
        throw error;
      }
    },
    onSuccess,
  });

  return {
    ...mutation,
    error: mutation.error ? (mutation.error as Error).message : null,
  };
}