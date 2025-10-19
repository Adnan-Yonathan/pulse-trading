'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  Target,
  Zap,
  Crown,
  Gem,
  Medal,
  Shield,
  Flame,
  CheckCircle
} from 'lucide-react';
import { cn, getPrestigeBadgeColor, getPrestigeBadgeIcon } from '@/lib/utils';
import type { PrestigeBadge } from '@/lib/supabase';

interface PrestigeSystemProps {
  userId: string;
  currentPrestigeLevel: number;
  badges: PrestigeBadge[];
  onBadgeEarned?: (badge: PrestigeBadge) => void;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirement: string;
  badgeType: 'platinum' | 'gold' | 'silver' | 'bronze';
  isEarned: boolean;
  progress?: number;
  maxProgress?: number;
}

export default function PrestigeSystem({ 
  userId, 
  currentPrestigeLevel, 
  badges, 
  onBadgeEarned 
}: PrestigeSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showNewBadge, setShowNewBadge] = useState<PrestigeBadge | null>(null);

  useEffect(() => {
    generateAchievements();
  }, [badges, currentPrestigeLevel]);

  const generateAchievements = () => {
    const earnedBadgeTypes = new Set(badges.map(b => b.badge_type));
    
    const allAchievements: Achievement[] = [
      {
        id: 'first_win',
        name: 'First Victory',
        description: 'Win your first daily leaderboard',
        icon: <Trophy className="w-6 h-6" />,
        requirement: 'Achieve 1st place once',
        badgeType: 'platinum',
        isEarned: earnedBadgeTypes.has('platinum'),
      },
      {
        id: 'top_3',
        name: 'Podium Finish',
        description: 'Finish in the top 3',
        icon: <Medal className="w-6 h-6" />,
        requirement: 'Achieve 2nd or 3rd place',
        badgeType: 'gold',
        isEarned: earnedBadgeTypes.has('gold'),
      },
      {
        id: 'top_10',
        name: 'Top Performer',
        description: 'Finish in the top 10',
        icon: <Award className="w-6 h-6" />,
        requirement: 'Achieve top 10 finish',
        badgeType: 'silver',
        isEarned: earnedBadgeTypes.has('silver'),
      },
      {
        id: 'consistent',
        name: 'Consistency King',
        description: 'Submit for 7 consecutive days',
        icon: <Target className="w-6 h-6" />,
        requirement: 'Submit for 7 days in a row',
        badgeType: 'bronze',
        isEarned: earnedBadgeTypes.has('bronze'),
      },
      {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Win 5 days in a row',
        icon: <Flame className="w-6 h-6" />,
        requirement: 'Win 5 consecutive days',
        badgeType: 'platinum',
        isEarned: false,
      },
      {
        id: 'big_winner',
        name: 'Big Winner',
        description: 'Achieve +20% gain in a single day',
        icon: <Zap className="w-6 h-6" />,
        requirement: 'Achieve +20% in one day',
        badgeType: 'gold',
        isEarned: false,
      },
      {
        id: 'prestige_5',
        name: 'Prestige Master',
        description: 'Reach Prestige Level 5',
        icon: <Crown className="w-6 h-6" />,
        requirement: 'Reach Prestige Level 5',
        badgeType: 'platinum',
        isEarned: currentPrestigeLevel >= 5,
      },
      {
        id: 'prestige_10',
        name: 'Legendary Trader',
        description: 'Reach Prestige Level 10',
        icon: <Gem className="w-6 h-6" />,
        requirement: 'Reach Prestige Level 10',
        badgeType: 'platinum',
        isEarned: currentPrestigeLevel >= 10,
      },
    ];

    setAchievements(allAchievements);
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'platinum':
        return <Crown className="w-8 h-8 text-prestige-platinum" />;
      case 'gold':
        return <Trophy className="w-8 h-8 text-prestige-gold" />;
      case 'silver':
        return <Medal className="w-8 h-8 text-prestige-silver" />;
      case 'bronze':
        return <Award className="w-8 h-8 text-prestige-bronze" />;
      default:
        return <Star className="w-8 h-8 text-robinhood-text-secondary" />;
    }
  };

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'platinum':
        return 'border-prestige-platinum bg-prestige-platinum/10';
      case 'gold':
        return 'border-prestige-gold bg-prestige-gold/10';
      case 'silver':
        return 'border-prestige-silver bg-prestige-silver/10';
      case 'bronze':
        return 'border-prestige-bronze bg-prestige-bronze/10';
      default:
        return 'border-robinhood-border bg-robinhood-border/10';
    }
  };

  const getPrestigeLevelInfo = (level: number) => {
    if (level >= 10) return { title: 'Legendary Trader', color: 'text-prestige-platinum', icon: <Gem className="w-6 h-6" /> };
    if (level >= 5) return { title: 'Prestige Master', color: 'text-prestige-gold', icon: <Crown className="w-6 h-6" /> };
    if (level >= 3) return { title: 'Elite Trader', color: 'text-prestige-silver', icon: <Shield className="w-6 h-6" /> };
    if (level >= 1) return { title: 'Rising Star', color: 'text-prestige-bronze', icon: <Star className="w-6 h-6" /> };
    return { title: 'Novice Trader', color: 'text-robinhood-text-secondary', icon: <Target className="w-6 h-6" /> };
  };

  const currentLevelInfo = getPrestigeLevelInfo(currentPrestigeLevel);
  const nextLevelInfo = getPrestigeLevelInfo(currentPrestigeLevel + 1);

  return (
    <div className="space-y-6">
      {/* Current Prestige Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-robinhood-h2 text-robinhood-text-primary">
            Prestige System
          </h2>
          <div className="flex items-center space-x-2">
            {currentLevelInfo.icon}
            <span className={cn('font-semibold', currentLevelInfo.color)}>
              {currentLevelInfo.title}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-robinhood-text-primary">
              {currentPrestigeLevel}
            </div>
            <div className="text-sm text-robinhood-text-secondary">
              Current Level
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-robinhood-text-secondary">
                Progress to Level {currentPrestigeLevel + 1}
              </span>
              <span className="text-sm text-robinhood-text-secondary">
                {badges.length} / {currentPrestigeLevel + 1} badges
              </span>
            </div>
            <div className="w-full bg-robinhood-border rounded-full h-2">
              <div 
                className="bg-robinhood-green h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (badges.length / (currentPrestigeLevel + 1)) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-robinhood-text-secondary mt-1">
              Next: {nextLevelInfo.title}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Earned Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-6"
      >
        <h3 className="text-robinhood-h2 text-robinhood-text-primary mb-4">
          Earned Badges
        </h3>
        
        {badges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  'flex flex-col items-center p-4 rounded-lg border-2',
                  getBadgeColor(badge.badge_type)
                )}
              >
                {getBadgeIcon(badge.badge_type)}
                <div className="mt-2 text-center">
                  <div className={cn(
                    'text-sm font-semibold capitalize',
                    getPrestigeBadgeColor(badge.badge_type)
                  )}>
                    {badge.badge_type}
                  </div>
                  <div className="text-xs text-robinhood-text-secondary">
                    Rank #{badge.rank_achieved}
                  </div>
                  <div className="text-xs text-robinhood-text-secondary">
                    {new Date(badge.earned_at).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-robinhood-text-secondary mx-auto mb-4" />
            <p className="text-robinhood-text-secondary">
              No badges earned yet. Start trading to earn your first badge!
            </p>
          </div>
        )}
      </motion.div>

      {/* Available Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-6"
      >
        <h3 className="text-robinhood-h2 text-robinhood-text-primary mb-4">
          Available Achievements
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'flex items-center space-x-4 p-4 rounded-lg border',
                achievement.isEarned
                  ? 'border-robinhood-green bg-robinhood-green/10'
                  : 'border-robinhood-border bg-robinhood-border/10'
              )}
            >
              <div className={cn(
                'p-3 rounded-full',
                achievement.isEarned
                  ? 'bg-robinhood-green text-robinhood-text-primary'
                  : 'bg-robinhood-border text-robinhood-text-secondary'
              )}>
                {achievement.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className={cn(
                    'font-semibold',
                    achievement.isEarned ? 'text-robinhood-text-primary' : 'text-robinhood-text-secondary'
                  )}>
                    {achievement.name}
                  </h4>
                  {achievement.isEarned && (
                    <CheckCircle className="w-4 h-4 text-robinhood-green" />
                  )}
                </div>
                <p className="text-sm text-robinhood-text-secondary mb-1">
                  {achievement.description}
                </p>
                <p className="text-xs text-robinhood-text-secondary">
                  {achievement.requirement}
                </p>
                {achievement.progress !== undefined && achievement.maxProgress && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-robinhood-text-secondary mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress} / {achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-robinhood-border rounded-full h-1">
                      <div 
                        className="bg-robinhood-green h-1 rounded-full transition-all duration-300"
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Prestige Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-6"
      >
        <h3 className="text-robinhood-h2 text-robinhood-text-primary mb-4">
          Prestige Benefits
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <Crown className="w-8 h-8 text-prestige-platinum mx-auto mb-2" />
            <h4 className="font-semibold text-robinhood-text-primary mb-1">
              Exclusive Badges
            </h4>
            <p className="text-sm text-robinhood-text-secondary">
              Unlock unique badges and recognition
            </p>
          </div>
          
          <div className="text-center p-4">
            <Shield className="w-8 h-8 text-prestige-gold mx-auto mb-2" />
            <h4 className="font-semibold text-robinhood-text-primary mb-1">
              Priority Support
            </h4>
            <p className="text-sm text-robinhood-text-secondary">
              Get faster support and exclusive features
            </p>
          </div>
          
          <div className="text-center p-4">
            <Star className="w-8 h-8 text-prestige-silver mx-auto mb-2" />
            <h4 className="font-semibold text-robinhood-text-primary mb-1">
              Community Status
            </h4>
            <p className="text-sm text-robinhood-text-secondary">
              Show your trading expertise to the community
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
