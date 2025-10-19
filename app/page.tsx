'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
// import { useIframeSdk } from '@whop/react';
import StockTicker from '@/components/StockTicker';
import Leaderboard from '@/components/Leaderboard';
import SubmissionModal from '@/components/SubmissionModal';
import PersonalPerformanceCard from '@/components/PersonalPerformanceCard';
import UserMenu from '@/components/UserMenu';
import PersonalDashboard from '@/components/PersonalDashboard';
import AdminPanel from '@/components/AdminPanel';
import LoginPrompt from '@/components/LoginPrompt';
import { supabase, type Submission, type User } from '@/lib/supabase';
import { 
  syncWhopUserToDatabase, 
  checkUserAdminAccess, 
  getUserTodaySubmission,
  getUserCurrentRank,
  getUserPrestigeBadges,
  type WhopUser 
} from '@/lib/user-sync';

export default function Page() {
  // const iframeSdk = useIframeSdk();
  const [whopUser, setWhopUser] = useState<any>(null);
  const [whopLoading, setWhopLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | undefined>();
  const [showPersonalDashboard, setShowPersonalDashboard] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [userRank, setUserRank] = useState(0);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Mock user for development - replace with real Whop authentication
  useEffect(() => {
    const getUser = async () => {
      try {
        // TODO: Replace with real Whop authentication
        // For now, simulate a logged-in user
        const mockUser = {
          id: 'whop-user-123',
          username: 'trader_mike',
          name: 'Mike Trader',
          profile_image_url: undefined,
        };
        setWhopUser(mockUser);
      } catch (error) {
        console.error('Error getting user:', error);
        setWhopUser(null);
      } finally {
        setWhopLoading(false);
      }
    };

    getUser();
  }, []);

  // Sync Whop user to database and set up user data
  useEffect(() => {
    const setupUser = async () => {
      if (!whopUser) {
        setCurrentUser(null);
        setIsAdmin(false);
        return;
      }

      try {
        // Create a mock database user for now (since tables might not exist)
        const mockDbUser: User = {
          id: 'db-user-123',
          whop_user_id: whopUser.id,
          username: whopUser.username,
          avatar_url: whopUser.profile_image_url,
          prestige_level: 0,
          total_wins: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setCurrentUser(mockDbUser);
        setIsAdmin(false); // Mock admin status
        setCurrentSubmission(undefined);
        setUserRank(0);
        setUserBadges([]);

        // Try to sync with database (optional - won't block if it fails)
        try {
          const dbUser = await syncWhopUserToDatabase({
            id: whopUser.id,
            username: whopUser.username,
            name: whopUser.name,
            profile_image_url: whopUser.profile_image_url,
          });

          if (dbUser) {
            setCurrentUser(dbUser);

            // Check if user is admin (company owner)
            const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
            if (companyId) {
              const adminAccess = await checkUserAdminAccess(whopUser.id, companyId);
              setIsAdmin(adminAccess);
            }

            // Get user's current submission and rank
            const todaySubmission = await getUserTodaySubmission(dbUser.id);
            setCurrentSubmission(todaySubmission);

            const rank = await getUserCurrentRank(dbUser.id);
            setUserRank(rank);

            // Get user's badges
            const badges = await getUserPrestigeBadges(dbUser.id);
            setUserBadges(badges);
          }
        } catch (dbError) {
          console.warn('Database sync failed, using mock data:', dbError);
          // Continue with mock data
        }
      } catch (error) {
        console.error('Error setting up user:', error);
        // Set fallback user data
        const fallbackUser: User = {
          id: 'fallback-user',
          whop_user_id: whopUser.id,
          username: whopUser.username,
          avatar_url: whopUser.profile_image_url,
          prestige_level: 0,
          total_wins: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCurrentUser(fallbackUser);
        setIsAdmin(false);
      }
    };

    setupUser();
  }, [whopUser]);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch from database first
        try {
          const today = new Date().toISOString().split('T')[0];
          
          const { data, error } = await supabase
            .from('submissions')
            .select(`
              *,
              user:users(*)
            `)
            .eq('submission_date', today)
            .order('percentage_gain', { ascending: false });

          if (error) {
            console.warn('Database query failed, using mock data:', error);
            throw error;
          }
          
          setSubmissions(data || []);
          return;
        } catch (dbError) {
          // Fallback to mock data if database is not set up
          console.warn('Using mock leaderboard data');
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
        }
        
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
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

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

  // Show loading state
  if (whopLoading || isLoading) {
	return (
      <div className="min-h-screen bg-robinhood-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-robinhood-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-robinhood-text-secondary">Loading Pulse Trades...</p>
        </div>
				</div>
    );
  }

  // Show login prompt if no user
  if (!whopUser) {
    return <LoginPrompt onLogin={() => window.location.reload()} />;
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
          <div className="relative">
            {/* User Menu - Positioned absolutely in top right */}
            {currentUser && (
              <div className="absolute top-0 right-0 z-10">
                <UserMenu
                  user={currentUser}
                  isAdmin={isAdmin}
                  onOpenPersonalDashboard={() => setShowPersonalDashboard(true)}
                  onOpenAdminPanel={() => setShowAdminPanel(true)}
                />
							</div>
						)}
            
            {/* Centered Hero Section */}
            <div className="text-center">
              <h1 className="text-robinhood-h1 text-robinhood-text-primary mb-2">
                Pulse Trades
              </h1>
              <p className="text-robinhood-text-secondary">
                Daily trading performance leaderboard
						</p>
					</div>
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
        currentRank={userRank}
        onOpenSubmission={() => setIsSubmissionModalOpen(true)}
        isAdmin={isAdmin}
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
                  badges={userBadges}
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
                  isAdmin={isAdmin}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
		</div>
	);
}
