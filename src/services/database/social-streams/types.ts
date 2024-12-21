import type { Database } from '@/types/supabase';

export type SocialStream = Database['public']['Tables']['social_streams']['Row'];
export type SocialStreamInsert = Database['public']['Tables']['social_streams']['Insert'];
export type SocialStreamUpdate = Database['public']['Tables']['social_streams']['Update'];