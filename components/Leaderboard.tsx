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
}

export default function Leaderboard({ 
  submissions, 
  currentUserId,
  communityId = 'biz_pGTqes9CAHH9yk', // Default community ID
  communityName = 'Community'
}: LeaderboardProps) {
  const [currentView, setCurrentView] = useState<'community' | 'global'>('community');

  return (
    <div className="space-y-6">
      {/* Leaderboard Toggle */}
      <LeaderboardToggle
        currentView={currentView}
        onViewChange={setCurrentView}
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