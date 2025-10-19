'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Globe } from 'lucide-react';

interface LeaderboardToggleProps {
  currentView: 'community' | 'global';
  onViewChange: (view: 'community' | 'global') => void;
  communityName?: string;
}

export default function LeaderboardToggle({ 
  currentView, 
  onViewChange, 
  communityName = 'Community' 
}: LeaderboardToggleProps) {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="bg-robinhood-card-bg border border-robinhood-border rounded-robinhood p-1 flex">
        <button
          onClick={() => onViewChange('community')}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200
            ${currentView === 'community' 
              ? 'bg-robinhood-green text-robinhood-black shadow-sm' 
              : 'text-robinhood-text-secondary hover:text-robinhood-text-primary hover:bg-robinhood-hover'
            }
          `}
        >
          <Users className="w-4 h-4" />
          <span>{communityName}</span>
        </button>
        <button
          onClick={() => onViewChange('global')}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200
            ${currentView === 'global' 
              ? 'bg-robinhood-green text-robinhood-black shadow-sm' 
              : 'text-robinhood-text-secondary hover:text-robinhood-text-primary hover:bg-robinhood-hover'
            }
          `}
        >
          <Globe className="w-4 h-4" />
          <span>Global</span>
        </button>
      </div>
    </div>
  );
}
