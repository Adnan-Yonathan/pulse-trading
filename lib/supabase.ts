import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client
export const createServerClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Database types
export interface User {
  id: string;
  whop_user_id: string;
  username: string;
  avatar_url?: string;
  prestige_level: number;
  total_wins: number;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  percentage_gain: number;
  points: number;
  proof_url?: string;
  submission_date: string;
  submitted_at: string;
  is_flagged: boolean;
  user?: User;
}

export interface PrestigeBadge {
  id: string;
  user_id: string;
  badge_type: 'platinum' | 'gold' | 'silver' | 'bronze';
  earned_at: string;
  rank_achieved: number;
}

export interface LeaderboardReset {
  id: string;
  reset_at: string;
  reset_by: string;
  submissions_count: number;
  average_gain: number;
}

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}
