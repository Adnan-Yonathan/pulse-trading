'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, PrestigeBadge } from '@/lib/supabase';

interface UseRealtimeUserProps {
  userId: string;
  enabled?: boolean;
}

export function useRealtimeUser({ userId, enabled = true }: UseRealtimeUserProps) {
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<PrestigeBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !userId) return;

    // Initial fetch
    fetchUserData();

    // Set up real-time subscription for user updates
    const userChannel = supabase
      .channel('user-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log('User update received:', payload);
          handleUserUpdate(payload);
        }
      )
      .subscribe();

    // Set up real-time subscription for badge updates
    const badgeChannel = supabase
      .channel('badge-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prestige_badges',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Badge update received:', payload);
          handleBadgeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(badgeChannel);
    };
  }, [userId, enabled]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        setError('Failed to fetch user data');
        return;
      }

      // Fetch user badges
      const { data: badgeData, error: badgeError } = await supabase
        .from('prestige_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (badgeError) {
        console.error('Error fetching badges:', badgeError);
        setError('Failed to fetch badge data');
        return;
      }

      setUser(userData);
      setBadges(badgeData || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = async (payload: any) => {
    console.log('Handling user update:', payload);
    
    if (payload.eventType === 'UPDATE' && payload.new) {
      setUser(payload.new);
    }
  };

  const handleBadgeUpdate = async (payload: any) => {
    console.log('Handling badge update:', payload);
    
    if (payload.eventType === 'INSERT' && payload.new) {
      // New badge earned
      setBadges(prev => [payload.new, ...prev]);
      
      // You could trigger a notification here
      console.log('New badge earned:', payload.new);
    } else if (payload.eventType === 'DELETE' && payload.old) {
      // Badge removed (shouldn't happen in normal flow)
      setBadges(prev => prev.filter(badge => badge.id !== payload.old.id));
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }

      // The real-time subscription will handle updating the UI
      return data;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  return {
    user,
    badges,
    loading,
    error,
    updateUser,
    refetch: fetchUserData,
  };
}
