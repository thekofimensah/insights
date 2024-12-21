import { useQuery } from '@tanstack/react-query';
import { getSocialStreams } from '../services/database/socialStreams';
import { coinQueries } from '../lib/supabase/queries/coins'

export function useSocialStreams(coinId: string | null, source: 'telegram' | 'twitter') {
  return useQuery({
    queryKey: ['social-streams', coinId, source],
    queryFn: () => getSocialStreams(coinId!, source),
    enabled: !!coinId,
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 5, // 5 minutes
  });
}