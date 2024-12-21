import { supabase } from '../client'
import type { SocialStream } from '../types'
import { debugDB } from '@/utils/debug'

/**
 * Get recent social streams for a coin
 */
export async function getSocialStreams(
  coinId: string,
  source: 'telegram' | 'twitter',
  limit = 50
): Promise<SocialStream[]> {
  debugDB('Fetching %s streams for coin: %s', source, coinId)
  const { data, error } = await supabase
    .from('social_streams')
    .select('*')
    .eq('coin_id', coinId)
    .eq('source', source)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}