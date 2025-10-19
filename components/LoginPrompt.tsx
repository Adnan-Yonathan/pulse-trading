'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, Trophy, BarChart3 } from 'lucide-react';

interface LoginPromptProps {
  onSignIn: () => void;
  onCreateAccount: () => void;
}

export default function LoginPrompt({ onSignIn, onCreateAccount }: LoginPromptProps) {
  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Track Performance",
      description: "Submit your daily trading gains and compete with the community"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Earn Badges",
      description: "Unlock prestige badges for consistent top performance"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Leaderboard",
      description: "See how you rank against other traders in real-time"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Personal Dashboard",
      description: "Track your progress with detailed statistics and charts"
    }
  ];

  return (
    <div className="min-h-screen bg-robinhood-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-robinhood-h1 text-robinhood-text-primary mb-4">
            Pulse Trades
          </h1>
          <p className="text-robinhood-text-secondary text-lg">
            Join the ultimate trading performance leaderboard
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-robinhood-card-bg rounded-robinhood p-6 border border-robinhood-border"
            >
              <div className="text-robinhood-green mb-3 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-robinhood-text-primary font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-robinhood-text-secondary text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <button
            onClick={onSignIn}
            className="w-full bg-robinhood-green hover:bg-robinhood-green/90 text-robinhood-black font-semibold px-8 py-4 rounded-robinhood transition-colors shadow-robinhood"
          >
            Sign In
          </button>
          <button
            onClick={onCreateAccount}
            className="w-full bg-robinhood-card-bg border border-robinhood-border text-robinhood-text-primary font-semibold px-8 py-4 rounded-robinhood transition-colors hover:bg-robinhood-hover"
          >
            Create Account
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-robinhood-text-secondary text-sm mt-6"
        >
          Sign in with your existing account or create a new one to start tracking your trading performance
        </motion.p>
      </motion.div>
    </div>
  );
}
