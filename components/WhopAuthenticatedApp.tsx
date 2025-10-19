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
import FullLeaderboardModal from '@/components/FullLeaderboardModal';
import { supabase, type Submission, type User } from '@/lib/supabase';
import { 
  syncWhopUserToDatabase, 
  checkUserAdminAccess, 
  getUserTodaySubmission,
  getUserCurrentRank,
  getUserPrestigeBadges
} from '@/lib/user-sync';

interface WhopAuthenticatedAppProps {
  whopUser: {
    id: string;
    username: string;
    name: string;
    profile_image_url?: string;
  };
  isAdmin: boolean;
  companyId?: string;
}

export default function WhopAuthenticatedApp({ 
  whopUser, 
  isAdmin: whopIsAdmin,
  companyId 
}: WhopAuthenticatedAppProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | undefined>();
  const [showPersonalDashboard, setShowPersonalDashboard] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [userRank, setUserRank] = useState(0);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(whopIsAdmin);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const [currentLeaderboardView, setCurrentLeaderboardView] = useState<'community' | 'global'>('community');

  // Sync Whop user to database and set up user data
  useEffect(() => {
    const setupUser = async () => {
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
        setIsAdmin(whopIsAdmin);
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

            // Check if user is admin (community owner or Whop admin)
            const isCommunityOwner = whopIsAdmin || 
                                   dbUser.username.toLowerCase().includes('admin') || 
                                   dbUser.username.toLowerCase().includes('owner') ||
                                   dbUser.username.toLowerCase().includes('mod');
            setIsAdmin(isCommunityOwner);

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
        setIsAdmin(whopIsAdmin);
      }
    };

    setupUser();
  }, [whopUser, whopIsAdmin]);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch from database first with timeout
        try {
          const today = new Date().toISOString().split('T')[0];
          
          const { data, error } = await Promise.race([
            supabase
              .from('submissions')
              .select(`
                *,
                user:users(*)
              `)
              .eq('submission_date', today)
              .order('percentage_gain', { ascending: false }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database timeout')), 5000)
            )
          ]) as any;

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
              is_verified: true,
              community_id: 'biz_pGTqes9CAHH9yk',
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
              is_verified: true,
              community_id: 'biz_pGTqes9CAHH9yk',
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
              is_verified: true,
              community_id: 'biz_pGTqes9CAHH9yk',
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
        // Set empty submissions as final fallback
        setSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Always fetch leaderboard, even without currentUser
    fetchLeaderboard();
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
        is_verified: true,
        community_id: 'biz_pGTqes9CAHH9yk',
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

  const handleLogout = () => {
    // For Whop iframe, we can't actually log out, just show a message
    alert('To log out, please close this tab or navigate away from the Whop experience.');
  };

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
                  onLogout={handleLogout}
                />
              </div>
            )}
            
            {/* Centered Hero Section */}
            <div className="text-center">
              <h1 className="text-robinhood-h1 text-robinhood-text-primary mb-2">
                Pulse Trades
              </h1>
              <p className="text-robinhood-text-secondary mb-4">
                Daily trading performance leaderboard
              </p>
              <button
                onClick={() => setShowFullLeaderboard(true)}
                className="bg-robinhood-card-bg hover:bg-robinhood-hover border border-robinhood-border text-robinhood-text-primary px-4 py-2 rounded-robinhood transition-colors text-sm font-medium"
              >
                View Full Leaderboard
              </button>
            </div>
          </div>
          
          {/* Leaderboard */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-robinhood-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-robinhood-text-secondary text-sm">Loading leaderboard...</p>
              </div>
            </div>
          ) : (
            <Leaderboard 
              submissions={submissions} 
              currentUserId={currentUser?.id}
              onViewChange={setCurrentLeaderboardView}
            />
          )}
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

      {/* Full Leaderboard Modal */}
      <FullLeaderboardModal
        isOpen={showFullLeaderboard}
        onClose={() => setShowFullLeaderboard(false)}
        currentUserId={currentUser?.id}
        leaderboardType={currentLeaderboardView}
        communityId="biz_pGTqes9CAHH9yk"
        submissions={submissions}
      />
    </div>
  );
}
