'use client';

import { useState } from 'react';
import LeaderboardToggle from './LeaderboardToggle';
import CommunityLeaderboard from './CommunityLeaderboard';
import GlobalLeaderboard from './GlobalLeaderboard';
import type { Submission } from '@/lib/supabase';

interface LeaderboardProps {
  submissions: Submission[];
  currentUserId?: string;
  communityId?: string;
  communityName?: string;
  onViewChange?: (view: 'community' | 'global') => void;
}

export default function Leaderboard({ 
  submissions, 
  currentUserId,
  communityId = 'biz_pGTqes9CAHH9yk', // Default community ID
  communityName = 'Community',
  onViewChange
}: LeaderboardProps) {
  const [currentView, setCurrentView] = useState<'community' | 'global'>('community');

  const handleViewChange = (view: 'community' | 'global') => {
    setCurrentView(view);
    onViewChange?.(view);
  };

  return (
    <div className="space-y-6">
      {/* Leaderboard Toggle */}
      <LeaderboardToggle
        currentView={currentView}
        onViewChange={handleViewChange}
        communityName={communityName}
      />

      {/* Render appropriate leaderboard */}
      {currentView === 'community' ? (
        <CommunityLeaderboard
          submissions={submissions}
          currentUserId={currentUserId}
          communityId={communityId}
        />
      ) : (
        <GlobalLeaderboard
          submissions={submissions}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}