'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { cn, formatPercentage, getTimeUntilReset, getPercentageColor } from '@/lib/utils';
import type { Submission } from '@/lib/supabase';

interface PersonalPerformanceCardProps {
  currentSubmission?: Submission;
  currentRank?: number;
  previousRank?: number;
  onOpenSubmission: () => void;
  isAdmin?: boolean;
}

export default function PersonalPerformanceCard({
  currentSubmission,
  currentRank,
  previousRank,
  onOpenSubmission,
  isAdmin = false,
}: PersonalPerformanceCardProps) {
  const [timeUntilReset, setTimeUntilReset] = useState(getTimeUntilReset());

  // Update countdown every minute
  useState(() => {
    const interval = setInterval(() => {
      setTimeUntilReset(getTimeUntilReset());
    }, 60000);
    return () => clearInterval(interval);
  });

  const rankChange = previousRank && currentRank ? previousRank - currentRank : 0;
  const hasImproved = rankChange > 0;
  const hasDeclined = rankChange < 0;

  const getRankChangeIcon = () => {
    if (hasImproved) {
      return <TrendingUp className="w-4 h-4 text-robinhood-green" />;
    }
    if (hasDeclined) {
      return <TrendingDown className="w-4 h-4 text-robinhood-red" />;
    }
    return null;
  };

  const getRankChangeText = () => {
    if (hasImproved) {
      return `↑ ${rankChange}`;
    }
    if (hasDeclined) {
      return `↓ ${Math.abs(rankChange)}`;
    }
    return null;
  };

  const getRankChangeColor = () => {
    if (hasImproved) return 'text-robinhood-green';
    if (hasDeclined) return 'text-robinhood-red';
    return 'text-robinhood-text-secondary';
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 bg-robinhood-card-bg border-t border-robinhood-border backdrop-blur-lg z-30"
    >
      <div className="px-4 py-4 space-y-3">
        {/* Your Position */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-robinhood-text-primary font-semibold">
              Your Position
            </span>
            {isAdmin && (
              <span className="px-2 py-1 bg-robinhood-green/20 text-robinhood-green text-xs rounded-full">
                Admin
              </span>
            )}
          </div>
          
          {currentRank && (
            <div className="flex items-center space-x-2">
              <span className="text-robinhood-text-primary font-bold text-lg">
                #{currentRank}
              </span>
              {rankChange !== 0 && (
                <div className={cn('flex items-center space-x-1', getRankChangeColor())}>
                  {getRankChangeIcon()}
                  <span className="text-sm font-medium">
                    {getRankChangeText()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Performance Display */}
        {currentSubmission ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  'text-2xl font-sf-pro-rounded font-bold',
                  getPercentageColor(currentSubmission.percentage_gain)
                )}
              >
                {formatPercentage(currentSubmission.percentage_gain)}
              </div>
              <div className="text-robinhood-text-secondary text-sm">
                {currentSubmission.points} points
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-robinhood-text-secondary text-sm">
              <Clock className="w-4 h-4" />
              <span>Reset in {timeUntilReset}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-robinhood-text-secondary">
              No submission today
            </div>
            <div className="flex items-center space-x-2 text-robinhood-text-secondary text-sm">
              <Clock className="w-4 h-4" />
              <span>Reset in {timeUntilReset}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={onOpenSubmission}
          className="w-full py-3 bg-robinhood-green hover:bg-robinhood-green/90 active:scale-95 rounded-robinhood-lg font-semibold text-robinhood-text-primary transition-all"
        >
          {currentSubmission ? 'Edit Today\'s P/L' : 'Submit Today\'s P/L'}
        </button>
      </div>
    </motion.div>
  );
}
