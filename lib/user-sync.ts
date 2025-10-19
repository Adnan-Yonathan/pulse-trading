import { supabase } from './supabase';
import { whopSdk } from './whop-sdk';
import type { User } from './supabase';

export interface WhopUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
}

export interface CompanyAccess {
  hasAccess: boolean;
  accessLevel: 'admin' | 'customer' | 'no_access';
}

/**
 * Sync a Whop user to the Supabase database
 * Creates a new user record if they don't exist, updates if they do
 */
export async function syncWhopUserToDatabase(whopUser: WhopUser): Promise<User | null> {
  try {
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('whop_user_id', whopUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return null;
    }

    const userData = {
      whop_user_id: whopUser.id,
      username: whopUser.username,
      avatar_url: whopUser.profile_image_url || null,
      prestige_level: 0,
      total_wins: 0,
      updated_at: new Date().toISOString(),
    };

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(userData)
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return null;
      }

      return updatedUser;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return null;
      }

      return newUser;
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    return null;
  }
}

/**
 * Check if a user has admin access to a company
 */
export async function checkUserAdminAccess(userId: string, companyId: string): Promise<boolean> {
  try {
    if (!whopSdk) {
      console.warn('Whop SDK not available');
      return false;
    }

    const result = await whopSdk.access.checkIfUserHasAccessToCompany({
      userId,
      companyId,
    });

    return result.hasAccess && result.accessLevel === 'admin';
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

/**
 * Get user's current submission for today
 */
export async function getUserTodaySubmission(userId: string): Promise<any> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('submission_date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user submission:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user submission:', error);
    return null;
  }
}

/**
 * Get user's current rank in today's leaderboard
 */
export async function getUserCurrentRank(userId: string): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get all submissions for today ordered by percentage gain
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('user_id, percentage_gain')
      .eq('submission_date', today)
      .order('percentage_gain', { ascending: false });

    if (error) {
      console.error('Error fetching leaderboard for rank:', error);
      return 0;
    }

    // Find user's rank (1-based)
    const userIndex = submissions?.findIndex(sub => sub.user_id === userId);
    return userIndex !== undefined && userIndex >= 0 ? userIndex + 1 : 0;
  } catch (error) {
    console.error('Error getting user rank:', error);
    return 0;
  }
}

/**
 * Get user's prestige badges
 */
export async function getUserPrestigeBadges(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('prestige_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
}
