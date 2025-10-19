'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Star, 
  Calendar,
  Target,
  Award,
  BarChart3,
  LineChart
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { cn, formatPercentage, formatTimeAgo, getPercentageColor, generateAvatarInitials } from '@/lib/utils';
import type { Submission, PrestigeBadge } from '@/lib/supabase';

interface PersonalDashboardProps {
  userId: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    prestige_level: number;
    total_wins: number;
  };
  submissions: Submission[];
  badges: PrestigeBadge[];
}

interface UserStats {
  totalSubmissions: number;
  totalWins: number;
  averageGain: number;
  bestDay: number;
  worstDay: number;
  currentStreak: number;
  winRate: number;
  consistencyScore: number;
}

export default function PersonalDashboard({ 
  userId, 
  user, 
  submissions, 
  badges 
}: PersonalDashboardProps) {
  const [stats, setStats] = useState<UserStats>({
    totalSubmissions: 0,
    totalWins: 0,
    averageGain: 0,
    bestDay: 0,
    worstDay: 0,
    currentStreak: 0,
    winRate: 0,
    consistencyScore: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    calculateStats();
    generateChartData();
  }, [submissions, selectedPeriod]);

  const calculateStats = () => {
    if (submissions.length === 0) return;

    const totalSubmissions = submissions.length;
    const totalWins = submissions.filter(s => s.percentage_gain > 0).length;
    const averageGain = submissions.reduce((sum, s) => sum + s.percentage_gain, 0) / totalSubmissions;
    const bestDay = Math.max(...submissions.map(s => s.percentage_gain));
    const worstDay = Math.min(...submissions.map(s => s.percentage_gain));
    const winRate = (totalWins / totalSubmissions) * 100;

    // Calculate current streak
    let currentStreak = 0;
    const sortedSubmissions = [...submissions].sort((a, b) => 
      new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime()
    );
    
    for (const submission of sortedSubmissions) {
      if (submission.percentage_gain > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate consistency score (based on submission frequency and variance)
    const variance = submissions.reduce((sum, s) => 
      sum + Math.pow(s.percentage_gain - averageGain, 2), 0
    ) / totalSubmissions;
    const consistencyScore = Math.max(0, 100 - Math.sqrt(variance) * 10);

    setStats({
      totalSubmissions,
      totalWins,
      averageGain,
      bestDay,
      worstDay,
      currentStreak,
      winRate,
      consistencyScore,
    });
  };

  const generateChartData = () => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySubmission = submissions.find(s => s.submission_date === dateStr);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        gain: daySubmission?.percentage_gain || 0,
        hasSubmission: !!daySubmission,
      });
    }

    setChartData(data);
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'platinum':
        return '💎';
      case 'gold':
        return '🥇';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '⭐';
    }
  };

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'platinum':
        return 'text-prestige-platinum';
      case 'gold':
        return 'text-prestige-gold';
      case 'silver':
        return 'text-prestige-silver';
      case 'bronze':
        return 'text-prestige-bronze';
      default:
        return 'text-robinhood-text-secondary';
    }
  };

  return (
    <div className="min-h-screen bg-robinhood-black p-4 space-y-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-robinhood-border flex items-center justify-center">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-robinhood-text-primary font-semibold text-xl">
                  {generateAvatarInitials(user.username)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-robinhood-h1 text-robinhood-text-primary">
                @{user.username}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Star className="w-4 h-4 text-prestige-gold" />
                <span className="text-robinhood-text-secondary">
                  Prestige {user.prestige_level} • {user.total_wins} wins
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-robinhood-text-secondary" />
              <span className="text-robinhood-caption text-robinhood-text-secondary">
                Total Submissions
              </span>
            </div>
            <div className="text-2xl font-bold text-robinhood-text-primary">
              {stats.totalSubmissions}
            </div>
          </div>

          <div className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-4 h-4 text-prestige-gold" />
              <span className="text-robinhood-caption text-robinhood-text-secondary">
                Win Rate
              </span>
            </div>
            <div className="text-2xl font-bold text-robinhood-text-primary">
              {stats.winRate.toFixed(1)}%
            </div>
          </div>

          <div className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-robinhood-green" />
              <span className="text-robinhood-caption text-robinhood-text-secondary">
                Best Day
              </span>
            </div>
            <div className={cn(
              "text-2xl font-bold",
              getPercentageColor(stats.bestDay)
            )}>
              {formatPercentage(stats.bestDay)}
            </div>
          </div>

          <div className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="w-4 h-4 text-robinhood-red" />
              <span className="text-robinhood-caption text-robinhood-text-secondary">
                Worst Day
              </span>
            </div>
            <div className={cn(
              "text-2xl font-bold",
              getPercentageColor(stats.worstDay)
            )}>
              {formatPercentage(stats.worstDay)}
            </div>
          </div>
        </motion.div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-robinhood-h2 text-robinhood-text-primary">
              Performance Chart
            </h2>
            <div className="flex space-x-2">
              {(['7d', '30d', '90d'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                    selectedPeriod === period
                      ? 'bg-robinhood-green text-robinhood-text-primary'
                      : 'bg-robinhood-border text-robinhood-text-secondary hover:bg-robinhood-hover'
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9D9D9D"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9D9D9D"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1C1E',
                    border: '1px solid #2C2C2E',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                  }}
                  formatter={(value: number) => [formatPercentage(value), 'Gain']}
                />
                <Line
                  type="monotone"
                  dataKey="gain"
                  stroke="#00C805"
                  strokeWidth={2}
                  dot={{ fill: '#00C805', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#00C805', strokeWidth: 2 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-6"
        >
          <h2 className="text-robinhood-h2 text-robinhood-text-primary mb-6">
            Achievements
          </h2>
          
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center p-4 bg-robinhood-border rounded-lg"
                >
                  <div className="text-3xl mb-2">
                    {getBadgeIcon(badge.badge_type)}
                  </div>
                  <div className={cn(
                    'text-sm font-medium capitalize',
                    getBadgeColor(badge.badge_type)
                  )}>
                    {badge.badge_type}
                  </div>
                  <div className="text-xs text-robinhood-text-secondary mt-1">
                    Rank #{badge.rank_achieved}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-16 h-16 text-robinhood-text-secondary mx-auto mb-4" />
              <p className="text-robinhood-text-secondary">
                No achievements yet. Start trading to earn your first badge!
              </p>
            </div>
          )}
        </motion.div>

        {/* Recent Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-6"
        >
          <h2 className="text-robinhood-h2 text-robinhood-text-primary mb-6">
            Recent Submissions
          </h2>
          
          {submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.slice(0, 10).map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 bg-robinhood-border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-robinhood-text-secondary" />
                    <span className="text-robinhood-text-primary">
                      {new Date(submission.submission_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={cn(
                    'font-semibold',
                    getPercentageColor(submission.percentage_gain)
                  )}>
                    {formatPercentage(submission.percentage_gain)}
                  </div>
                  <div className="text-robinhood-text-secondary text-sm">
                    {submission.points} points
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 text-robinhood-text-secondary mx-auto mb-4" />
              <p className="text-robinhood-text-secondary">
                No submissions yet. Start tracking your performance!
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
