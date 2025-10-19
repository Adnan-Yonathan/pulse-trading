'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import { cn, formatPercentage, formatTimeAgo, getRankColor, getPercentageColor, generateAvatarInitials } from '@/lib/utils';
import type { Submission } from '@/lib/supabase';

interface LeaderboardProps {
  submissions: Submission[];
  currentUserId?: string;
}

interface TopPerformer {
  rank: number;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    prestige_level: number;
  };
  percentage_gain: number;
  submitted_at: string;
}

export default function Leaderboard({ submissions, currentUserId }: LeaderboardProps) {
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [regularLeaderboard, setRegularLeaderboard] = useState<Submission[]>([]);

  useEffect(() => {
    // Sort submissions by percentage gain (descending) and submission time (ascending for ties)
    const sortedSubmissions = [...submissions].sort((a, b) => {
      if (b.percentage_gain !== a.percentage_gain) {
        return b.percentage_gain - a.percentage_gain;
      }
      return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    });

    // Top 3 performers for podium
    const top3 = sortedSubmissions.slice(0, 3).map((submission, index) => ({
      rank: index + 1,
      user: submission.user!,
      percentage_gain: submission.percentage_gain,
      submitted_at: submission.submitted_at,
    }));

    // Rest of the leaderboard (rank 4+)
    const rest = sortedSubmissions.slice(3);

    setTopPerformers(top3);
    setRegularLeaderboard(rest);
  }, [submissions]);

  const getPodiumIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-prestige-platinum" />;
      case 2:
        return <Medal className="w-7 h-7 text-prestige-gold" />;
      case 3:
        return <Award className="w-7 h-7 text-prestige-silver" />;
      default:
        return null;
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return 'h-48'; // 200px
      case 2:
      case 3:
        return 'h-40'; // 160px
      default:
        return 'h-32';
    }
  };

  const getPodiumWidth = (rank: number) => {
    switch (rank) {
      case 1:
        return 'w-[35%]';
      case 2:
      case 3:
        return 'w-[30%]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      {topPerformers.length > 0 && (
        <div className="flex items-end justify-center space-x-3">
          {topPerformers.map((performer) => (
            <motion.div
              key={performer.rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: performer.rank * 0.1 }}
              className={cn(
                'bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-4 flex flex-col items-center relative',
                getPodiumHeight(performer.rank),
                getPodiumWidth(performer.rank),
                performer.rank === 1 && 'shadow-robinhood-glow'
              )}
            >
              {/* Prestige Badge */}
              <div className="absolute top-2 right-2">
                {getPodiumIcon(performer.rank)}
              </div>

              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-robinhood-border flex items-center justify-center mb-2">
                {performer.user.avatar_url ? (
                  <img
                    src={performer.user.avatar_url}
                    alt={performer.user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-robinhood-text-primary font-semibold text-lg">
                    {generateAvatarInitials(performer.user.username)}
                  </span>
                )}
              </div>

              {/* Username */}
              <h3 className="text-robinhood-text-primary font-semibold text-center mb-1">
                {performer.user.username}
              </h3>

              {/* Percentage Gain */}
              <div
                className={cn(
                  'font-sf-pro-rounded text-2xl font-medium',
                  getPercentageColor(performer.percentage_gain)
                )}
              >
                {formatPercentage(performer.percentage_gain)}
              </div>

              {/* Prestige Level */}
              {(performer.user.prestige_level ?? 0) > 0 && (
                <div className="flex items-center mt-1">
                  <Star className="w-3 h-3 text-prestige-gold mr-1" />
                  <span className="text-robinhood-caption text-robinhood-text-secondary">
                    Prestige {performer.user.prestige_level}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Regular Leaderboard Table */}
      {regularLeaderboard.length > 0 && (
        <div className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood overflow-hidden">
          <div className="px-4 py-3 border-b border-robinhood-border">
            <h2 className="text-robinhood-h2 text-robinhood-text-primary">
              Leaderboard
            </h2>
          </div>
          
          <div className="divide-y divide-robinhood-border">
            {regularLeaderboard.map((submission, index) => {
              const rank = index + 4; // Starting from rank 4
              const isCurrentUser = currentUserId === submission.user_id;
              
              return (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'px-4 py-3 flex items-center space-x-4 hover:bg-robinhood-hover transition-colors',
                    isCurrentUser && 'bg-robinhood-green/10 border-l-4 border-robinhood-green'
                  )}
                >
                  {/* Rank */}
                  <div className="w-10 text-center">
                    <span
                      className={cn(
                        'font-semibold text-sm',
                        getRankColor(rank)
                      )}
                    >
                      #{rank}
                    </span>
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
                      <span className="text-robinhood-text-primary font-medium text-sm">
                        {generateAvatarInitials(submission.user?.username || 'U')}
                      </span>
                    )}
                  </div>

                  {/* Username */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-robinhood-text-primary font-medium truncate">
                        {submission.user?.username}
                      </span>
                      {(submission.user?.prestige_level ?? 0) > 0 && (
                        <Star className="w-3 h-3 text-prestige-gold flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Percentage Gain */}
                  <div className="text-right">
                    <div
                      className={cn(
                        'font-sf-pro-rounded text-robinhood-number font-medium',
                        getPercentageColor(submission.percentage_gain)
                      )}
                    >
                      {formatPercentage(submission.percentage_gain)}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="text-right text-robinhood-caption text-robinhood-text-secondary">
                    {formatTimeAgo(new Date(submission.submitted_at))}
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <span className="text-robinhood-text-primary font-medium">
                      {submission.points}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {submissions.length === 0 && (
        <div className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-8 text-center">
          <Trophy className="w-16 h-16 text-robinhood-text-secondary mx-auto mb-4" />
          <h3 className="text-robinhood-h2 text-robinhood-text-primary mb-2">
            No submissions yet
          </h3>
          <p className="text-robinhood-text-secondary">
            Be the first to submit your trading performance today!
          </p>
        </div>
      )}
    </div>
  );
}
