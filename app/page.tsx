'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import StockTicker from '@/components/StockTicker';
import Leaderboard from '@/components/Leaderboard';
import SubmissionModal from '@/components/SubmissionModal';
import PersonalPerformanceCard from '@/components/PersonalPerformanceCard';
import UserMenu from '@/components/UserMenu';
import PersonalDashboard from '@/components/PersonalDashboard';
import AdminPanel from '@/components/AdminPanel';
import { supabase, type Submission } from '@/lib/supabase';

export default function Page() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | undefined>();
  const [showPersonalDashboard, setShowPersonalDashboard] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

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
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-robinhood-h1 text-robinhood-text-primary mb-2">
                Pulse Trades
              </h1>
              <p className="text-robinhood-text-secondary">
                Daily trading performance leaderboard
              </p>
            </div>
            {currentUser && (
              <UserMenu
                user={currentUser}
                onOpenPersonalDashboard={() => setShowPersonalDashboard(true)}
                onOpenAdminPanel={() => setShowAdminPanel(true)}
              />
            )}
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

      {/* Personal Dashboard Modal */}
      <AnimatePresence>
        {showPersonalDashboard && currentUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setShowPersonalDashboard(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-4xl bg-robinhood-black z-50 overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-robinhood-h1 text-robinhood-text-primary">
                    Personal Dashboard
                  </h2>
                  <button
                    onClick={() => setShowPersonalDashboard(false)}
                    className="p-2 hover:bg-robinhood-hover rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-robinhood-text-secondary" />
                  </button>
                </div>
                <PersonalDashboard
                  userId={currentUser.id}
                  user={currentUser}
                  submissions={submissions}
                  badges={[]} // TODO: Fetch actual badges
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {showAdminPanel && currentUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setShowAdminPanel(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-6xl bg-robinhood-black z-50 overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-robinhood-h1 text-robinhood-text-primary">
                    Admin Panel
                  </h2>
                  <button
                    onClick={() => setShowAdminPanel(false)}
                    className="p-2 hover:bg-robinhood-hover rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-robinhood-text-secondary" />
                  </button>
                </div>
                <AdminPanel
                  submissions={submissions}
                  users={[currentUser]} // TODO: Fetch all users
                  isAdmin={currentUser.isAdmin}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
		</div>
	);
}
