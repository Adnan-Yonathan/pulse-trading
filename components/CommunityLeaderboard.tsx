'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Users, Clock } from 'lucide-react';
import { cn, formatPercentage, formatTimeAgo, generateAvatarInitials, getRankColor, getPercentageColor } from '@/lib/utils';
import type { Submission } from '@/lib/supabase';
import ProofImageViewer from './ProofImageViewer';

interface CommunityLeaderboardProps {
  submissions: Submission[];
  currentUserId?: string;
  communityId: string;
}

export default function CommunityLeaderboard({ 
  submissions, 
  currentUserId,
  communityId 
}: CommunityLeaderboardProps) {
  const [communitySubmissions, setCommunitySubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityLeaderboard = async () => {
      try {
        setIsLoading(true);
        
        // Filter submissions by community ID
        const filtered = submissions.filter(submission => 
          submission.community_id === communityId && submission.is_verified
        );
        
        // Sort by percentage gain (descending) and submission time (ascending for ties)
        const sorted = filtered.sort((a, b) => {
          if (b.percentage_gain !== a.percentage_gain) {
            return b.percentage_gain - a.percentage_gain;
          }
          return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
        });
        
        setCommunitySubmissions(sorted);
      } catch (error) {
        console.error('Error fetching community leaderboard:', error);
        setCommunitySubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityLeaderboard();
  }, [submissions, communityId]);

  const getRankDisplay = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getPodiumPosition = (index: number) => {
    if (index === 0) return 'first';
    if (index === 1) return 'second';
    if (index === 2) return 'third';
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-robinhood-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-robinhood-text-secondary text-sm">Loading community leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      {communitySubmissions.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-6"
        >
          <h2 className="text-robinhood-h2 text-robinhood-text-primary mb-6 text-center">
            Community Champions
          </h2>
          <div className="flex items-end justify-center space-x-4">
            {/* 2nd Place */}
            {communitySubmissions[1] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center space-y-3"
              >
                <div className="relative">
                  {communitySubmissions[1].user?.avatar_url ? (
                    <img
                      src={communitySubmissions[1].user.avatar_url}
                      alt={communitySubmissions[1].user.username}
                      className="w-16 h-16 rounded-full object-cover border-2 border-robinhood-border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-robinhood-border flex items-center justify-center border-2 border-robinhood-border">
                      <span className="text-robinhood-text-primary font-semibold text-lg">
                        {generateAvatarInitials(communitySubmissions[1].user?.username || 'U')}
                      </span>
                    </div>
                  )}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-robinhood-border rounded-full flex items-center justify-center">
                    <span className="text-robinhood-text-primary text-xs font-bold">2</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-robinhood-text-primary font-semibold">
                    @{communitySubmissions[1].user?.username}
                  </p>
                  <p className={cn('text-sm font-bold', getPercentageColor(communitySubmissions[1].percentage_gain))}>
                    {formatPercentage(communitySubmissions[1].percentage_gain)}
                  </p>
                </div>
                <div className="w-20 h-20 bg-robinhood-border rounded-lg flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-robinhood-text-secondary" />
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {communitySubmissions[0] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center space-y-3"
              >
                <div className="relative">
                  {communitySubmissions[0].user?.avatar_url ? (
                    <img
                      src={communitySubmissions[0].user.avatar_url}
                      alt={communitySubmissions[0].user.username}
                      className="w-20 h-20 rounded-full object-cover border-2 border-robinhood-green"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-robinhood-border flex items-center justify-center border-2 border-robinhood-green">
                      <span className="text-robinhood-text-primary font-semibold text-xl">
                        {generateAvatarInitials(communitySubmissions[0].user?.username || 'U')}
                      </span>
                    </div>
                  )}
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-robinhood-green rounded-full flex items-center justify-center">
                    <span className="text-robinhood-black text-sm font-bold">1</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-robinhood-text-primary font-semibold">
                    @{communitySubmissions[0].user?.username}
                  </p>
                  <p className={cn('text-lg font-bold', getPercentageColor(communitySubmissions[0].percentage_gain))}>
                    {formatPercentage(communitySubmissions[0].percentage_gain)}
                  </p>
                </div>
                <div className="w-24 h-24 bg-robinhood-green rounded-lg flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-robinhood-black" />
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {communitySubmissions[2] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center space-y-3"
              >
                <div className="relative">
                  {communitySubmissions[2].user?.avatar_url ? (
                    <img
                      src={communitySubmissions[2].user.avatar_url}
                      alt={communitySubmissions[2].user.username}
                      className="w-16 h-16 rounded-full object-cover border-2 border-robinhood-border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-robinhood-border flex items-center justify-center border-2 border-robinhood-border">
                      <span className="text-robinhood-text-primary font-semibold text-lg">
                        {generateAvatarInitials(communitySubmissions[2].user?.username || 'U')}
                      </span>
                    </div>
                  )}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-robinhood-border rounded-full flex items-center justify-center">
                    <span className="text-robinhood-text-primary text-xs font-bold">3</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-robinhood-text-primary font-semibold">
                    @{communitySubmissions[2].user?.username}
                  </p>
                  <p className={cn('text-sm font-bold', getPercentageColor(communitySubmissions[2].percentage_gain))}>
                    {formatPercentage(communitySubmissions[2].percentage_gain)}
                  </p>
                </div>
                <div className="w-20 h-20 bg-robinhood-border rounded-lg flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-robinhood-text-secondary" />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Full Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood overflow-hidden"
      >
        <div className="p-6 border-b border-robinhood-border">
          <h2 className="text-robinhood-h2 text-robinhood-text-primary">
            Community Leaderboard
          </h2>
          <p className="text-robinhood-text-secondary mt-1">
            {communitySubmissions.length} verified submissions
          </p>
        </div>

        {communitySubmissions.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-robinhood-text-secondary mx-auto mb-3" />
            <p className="text-robinhood-text-secondary">
              No community submissions yet. Be the first to submit your trading performance!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-robinhood-border">
                  <th className="text-left py-4 px-6 text-robinhood-text-secondary font-medium">
                    Rank
                  </th>
                  <th className="text-left py-4 px-6 text-robinhood-text-secondary font-medium">
                    Trader
                  </th>
                  <th className="text-left py-4 px-6 text-robinhood-text-secondary font-medium">
                    Performance
                  </th>
                  <th className="text-left py-4 px-6 text-robinhood-text-secondary font-medium">
                    Time
                  </th>
                  <th className="text-left py-4 px-6 text-robinhood-text-secondary font-medium">
                    Proof
                  </th>
                </tr>
              </thead>
              <tbody>
                {communitySubmissions.map((submission, index) => (
                  <motion.tr
                    key={submission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'border-b border-robinhood-border hover:bg-robinhood-hover transition-colors',
                      submission.user_id === currentUserId && 'bg-robinhood-green/10'
                    )}
                  >
                    <td className="py-4 px-6">
                      <span className={cn(
                        'font-bold text-lg',
                        getRankColor(index + 1)
                      )}>
                        {getRankDisplay(index)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        {submission.user?.avatar_url ? (
                          <img
                            src={submission.user.avatar_url}
                            alt={submission.user.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-robinhood-border flex items-center justify-center">
                            <span className="text-robinhood-text-primary font-semibold text-sm">
                              {generateAvatarInitials(submission.user?.username || 'U')}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-robinhood-text-primary font-semibold">
                            @{submission.user?.username}
                          </p>
                          <p className="text-robinhood-text-secondary text-sm">
                            Level {submission.user?.prestige_level || 0}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-robinhood-text-secondary" />
                        <span className={cn(
                          'font-bold text-lg',
                          getPercentageColor(submission.percentage_gain)
                        )}>
                          {formatPercentage(submission.percentage_gain)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2 text-robinhood-text-secondary">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {formatTimeAgo(new Date(submission.submitted_at))}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <ProofImageViewer
                        proofUrl={submission.proof_url}
                        username={submission.user?.username || 'Unknown'}
                        percentageGain={submission.percentage_gain}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
