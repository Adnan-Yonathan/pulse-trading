'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StockTicker from '@/components/StockTicker';
import Leaderboard from '@/components/Leaderboard';
import SubmissionModal from '@/components/SubmissionModal';
import PersonalPerformanceCard from '@/components/PersonalPerformanceCard';
import { supabase, type Submission } from '@/lib/supabase';

export default function Page() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | undefined>();

  // Mock current user - replace with actual Whop user data
  useEffect(() => {
    // TODO: Get actual user from Whop SDK
    setCurrentUser({
      id: 'user-123',
      username: 'trader_mike',
      avatar_url: undefined,
      isAdmin: false,
    });
  }, []);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        
        // TODO: Replace with actual Supabase query
        // const { data, error } = await supabase
        //   .from('submissions')
        //   .select(`
        //     *,
        //     user:users(*)
        //   `)
        //   .eq('submission_date', new Date().toISOString().split('T')[0])
        //   .order('percentage_gain', { ascending: false });
        
        // Mock data for now
        const mockSubmissions: Submission[] = [
          {
            id: '1',
            user_id: 'user-1',
            percentage_gain: 12.5,
            points: 12,
            submission_date: new Date().toISOString().split('T')[0],
            submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            is_flagged: false,
            user: {
              id: 'user-1',
              whop_user_id: 'whop-1',
              username: 'crypto_king',
              avatar_url: undefined,
              prestige_level: 3,
              total_wins: 15,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
          {
            id: '2',
            user_id: 'user-2',
            percentage_gain: 8.7,
            points: 8,
            submission_date: new Date().toISOString().split('T')[0],
            submitted_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            is_flagged: false,
            user: {
              id: 'user-2',
              whop_user_id: 'whop-2',
              username: 'stock_master',
              avatar_url: undefined,
              prestige_level: 2,
              total_wins: 8,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
          {
            id: '3',
            user_id: 'user-3',
            percentage_gain: 5.2,
            points: 5,
            submission_date: new Date().toISOString().split('T')[0],
            submitted_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            is_flagged: false,
            user: {
              id: 'user-3',
              whop_user_id: 'whop-3',
              username: 'day_trader',
              avatar_url: undefined,
              prestige_level: 1,
              total_wins: 3,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        ];
        
        setSubmissions(mockSubmissions);
        
        // Find current user's submission
        const userSubmission = mockSubmissions.find(
          s => s.user_id === currentUser?.id
        );
        setCurrentSubmission(userSubmission);
        
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchLeaderboard();
    }
  }, [currentUser]);

  const handleSubmitPerformance = async (data: { percentage: number; proofFile?: File }) => {
    try {
      // TODO: Implement actual submission logic
      console.log('Submitting performance:', data);
      
      // Mock submission
      const newSubmission: Submission = {
        id: Date.now().toString(),
        user_id: currentUser.id,
        percentage_gain: data.percentage,
        points: Math.max(0, Math.floor(data.percentage)),
        submission_date: new Date().toISOString().split('T')[0],
        submitted_at: new Date().toISOString(),
        is_flagged: false,
        user: currentUser,
      };
      
      setSubmissions(prev => [newSubmission, ...prev]);
      setCurrentSubmission(newSubmission);
      
      // TODO: Upload proof file to Supabase Storage if provided
      if (data.proofFile) {
        console.log('Uploading proof file:', data.proofFile.name);
      }
      
    } catch (error) {
      console.error('Submission failed:', error);
      throw error;
    }
  };

  const getCurrentUserRank = () => {
    if (!currentSubmission) return undefined;
    
    const sortedSubmissions = [...submissions].sort((a, b) => {
      if (b.percentage_gain !== a.percentage_gain) {
        return b.percentage_gain - a.percentage_gain;
      }
      return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    });
    
    return sortedSubmissions.findIndex(s => s.id === currentSubmission.id) + 1;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-robinhood-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-robinhood-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-robinhood-text-secondary">Loading Pulse Trades...</p>
					</div>
				</div>
    );
  }

  return (
    <div className="min-h-screen bg-robinhood-black">
      {/* Stock Ticker */}
      <StockTicker />
      
      {/* Main Content */}
      <div className="px-4 py-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-robinhood-h1 text-robinhood-text-primary mb-2">
              Pulse Trades
            </h1>
            <p className="text-robinhood-text-secondary">
              Daily trading performance leaderboard
					</p>
				</div>
          
          {/* Leaderboard */}
          <Leaderboard 
            submissions={submissions} 
            currentUserId={currentUser?.id}
          />
        </motion.div>
			</div>
      
      {/* Personal Performance Card */}
      <PersonalPerformanceCard
        currentSubmission={currentSubmission}
        currentRank={getCurrentUserRank()}
        onOpenSubmission={() => setIsSubmissionModalOpen(true)}
        isAdmin={currentUser?.isAdmin}
      />
      
      {/* Submission Modal */}
      <SubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        onSubmit={handleSubmitPerformance}
        currentSubmission={currentSubmission}
      />
		</div>
	);
}
