'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Submission } from '@/lib/supabase';

interface UseRealtimeLeaderboardProps {
  date?: string;
  enabled?: boolean;
}

export function useRealtimeLeaderboard({ 
  date = new Date().toISOString().split('T')[0], 
  enabled = true 
}: UseRealtimeLeaderboardProps = {}) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchLeaderboard();

    // Set up real-time subscription
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions',
          filter: `submission_date=eq.${date}`,
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to leaderboard updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to leaderboard updates');
          setError('Failed to connect to real-time updates');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date, enabled]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          user:users(*)
        `)
        .eq('submission_date', date)
        .order('percentage_gain', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Failed to fetch leaderboard data');
        return;
      }

      setSubmissions(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeUpdate = async (payload: any) => {
    console.log('Handling real-time update:', payload);
    
    // Refresh the entire leaderboard to ensure consistency
    // In a production app, you might want to be more granular
    await fetchLeaderboard();
  };

  const addSubmission = async (submission: Omit<Submission, 'id' | 'submitted_at' | 'user'>) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .insert(submission)
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) {
        console.error('Error adding submission:', error);
        throw error;
      }

      // The real-time subscription will handle updating the UI
      return data;
    } catch (err) {
      console.error('Error adding submission:', err);
      throw err;
    }
  };

  const updateSubmission = async (id: string, updates: Partial<Submission>) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) {
        console.error('Error updating submission:', error);
        throw error;
      }

      // The real-time subscription will handle updating the UI
      return data;
    } catch (err) {
      console.error('Error updating submission:', err);
      throw err;
    }
  };

  const deleteSubmission = async (id: string) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting submission:', error);
        throw error;
      }

      // The real-time subscription will handle updating the UI
    } catch (err) {
      console.error('Error deleting submission:', err);
      throw err;
    }
  };

  return {
    submissions,
    loading,
    error,
    addSubmission,
    updateSubmission,
    deleteSubmission,
    refetch: fetchLeaderboard,
  };
}
