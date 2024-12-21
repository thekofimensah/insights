import { supabase } from '@/lib/db/client';
import type { SocialStream, SocialStreamInsert } from './types';

export async function getSocialStreams(
  coinId: string,
  source: string,
  limit = 50
): Promise<SocialStream[]> {
  const { data, error } = await supabase
    .from('social_streams')
    .select('*')
    .eq('coin_id', coinId)
    .eq('source', source)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function addSocialStream(stream: SocialStreamInsert): Promise<void> {
  const { error } = await supabase
    .from('social_streams')
    .insert(stream);

  if (error) throw error;
}