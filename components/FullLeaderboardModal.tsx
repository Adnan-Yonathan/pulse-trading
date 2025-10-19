'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, TrendingUp, Users } from 'lucide-react';
import { supabase, type Submission } from '@/lib/supabase';
import { cn, formatPercentage, formatTimeAgo, generateAvatarInitials } from '@/lib/utils';

interface FullLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export default function FullLeaderboardModal({ 
  isOpen, 
  onClose, 
  currentUserId 
}: FullLeaderboardModalProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch full leaderboard data
  useEffect(() => {
    const fetchFullLeaderboard = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('submissions')
          .select(`
            *,
            user:users(*)
          `)
          .eq('submission_date', selectedDate)
          .order('percentage_gain', { ascending: false });

        if (error) {
          console.error('Error fetching full leaderboard:', error);
          setSubmissions([]);
        } else {
          setSubmissions(data || []);
        }
      } catch (error) {
        console.error('Error fetching full leaderboard:', error);
        setSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullLeaderboard();
  }, [isOpen, selectedDate]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-robinhood-text-secondary font-semibold">#{rank}</span>;
    }
  };

  const getPrestigeIcon = (level: number) => {
    if (level === 0) return null;
    
    return (
      <div className="w-6 h-6 rounded-full bg-robinhood-green text-robinhood-black flex items-center justify-center text-xs font-bold">
        {level}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-4 bg-robinhood-black border border-robinhood-border rounded-robinhood shadow-robinhood z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-robinhood-border">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-6 h-6 text-robinhood-green" />
                  <h2 className="text-robinhood-h1 text-robinhood-text-primary">
                    Full Leaderboard
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-robinhood-hover rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-robinhood-text-secondary" />
                </button>
              </div>

              {/* Date Selector */}
              <div className="p-4 border-b border-robinhood-border">
                <div className="flex items-center space-x-4">
                  <label className="text-robinhood-text-primary font-medium">
                    Date:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-robinhood-card-bg border border-robinhood-border rounded-robinhood px-3 py-2 text-robinhood-text-primary focus:outline-none focus:ring-2 focus:ring-robinhood-green"
                  />
                  <div className="flex items-center space-x-2 text-robinhood-text-secondary">
                    <Users className="w-4 h-4" />
                    <span>{submissions.length} traders</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-robinhood-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-robinhood-text-secondary">Loading leaderboard...</p>
                    </div>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-robinhood-text-secondary mx-auto mb-4" />
                      <p className="text-robinhood-text-secondary">No submissions for this date</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="space-y-3">
                      {submissions.map((submission, index) => {
                        const rank = index + 1;
                        const isCurrentUser = submission.user_id === currentUserId;
                        
                        return (
                          <motion.div
                            key={submission.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "flex items-center space-x-4 p-4 rounded-robinhood border transition-colors",
                              isCurrentUser 
                                ? "bg-robinhood-green/10 border-robinhood-green" 
                                : "bg-robinhood-card-bg border-robinhood-border hover:bg-robinhood-hover"
                            )}
                          >
                            {/* Rank */}
                            <div className="flex items-center justify-center w-12">
                              {getRankIcon(rank)}
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-robinhood-border flex items-center justify-center">
                              {submission.user?.avatar_url ? (
                                <img
                                  src={submission.user.avatar_url}
                                  alt={submission.user.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-robinhood-text-primary font-semibold text-sm">
                                  {generateAvatarInitials(submission.user?.username || 'U')}
                                </span>
                              )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-robinhood-text-primary font-semibold truncate">
                                  @{submission.user?.username}
                                </p>
                                {getPrestigeIcon(submission.user?.prestige_level || 0)}
                                {isCurrentUser && (
                                  <span className="text-xs bg-robinhood-green text-robinhood-black px-2 py-1 rounded-full font-medium">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-robinhood-text-secondary text-sm">
                                {formatTimeAgo(new Date(submission.submitted_at))}
                              </p>
                            </div>

                            {/* Performance */}
                            <div className="text-right">
                              <p className={cn(
                                "text-lg font-bold",
                                submission.percentage_gain >= 0 
                                  ? "text-robinhood-green" 
                                  : "text-red-500"
                              )}>
                                {formatPercentage(submission.percentage_gain)}
                              </p>
                              <p className="text-robinhood-text-secondary text-sm">
                                {submission.points} pts
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-robinhood-border">
                <div className="flex items-center justify-between text-sm text-robinhood-text-secondary">
                  <span>Showing {submissions.length} traders</span>
                  <span>Updated {formatTimeAgo(new Date())}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
