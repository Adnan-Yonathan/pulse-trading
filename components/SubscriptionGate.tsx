'use client';

import { motion } from 'framer-motion';
import { Lock, Star, TrendingUp } from 'lucide-react';

interface SubscriptionGateProps {
  feature: string;
  onUpgrade: () => void;
}

export default function SubscriptionGate({ feature, onUpgrade }: SubscriptionGateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-robinhood-card-bg border border-robinhood-border rounded-robinhood p-8 text-center"
    >
      <div className="w-16 h-16 bg-robinhood-border rounded-full flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-robinhood-text-secondary" />
      </div>
      
      <h3 className="text-robinhood-h2 text-robinhood-text-primary mb-2">
        Community Access Required
      </h3>
      
      <p className="text-robinhood-text-secondary mb-6 max-w-md mx-auto">
        {feature} is available with Community Access. Upgrade to submit your trades, 
        track your performance, and compete with other traders.
      </p>

      <div className="bg-robinhood-green/10 border border-robinhood-green/20 rounded-robinhood p-4 mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Star className="w-5 h-5 text-robinhood-green" />
          <span className="text-robinhood-green font-semibold">Community Access</span>
        </div>
        <div className="text-2xl font-bold text-robinhood-text-primary mb-1">$49</div>
        <div className="text-robinhood-text-secondary text-sm">per month</div>
      </div>

      <div className="space-y-3 mb-6 text-left max-w-sm mx-auto">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-4 h-4 text-robinhood-green flex-shrink-0" />
          <span className="text-robinhood-text-primary text-sm">Submit your trading performance</span>
        </div>
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-4 h-4 text-robinhood-green flex-shrink-0" />
          <span className="text-robinhood-text-primary text-sm">Upload proof images</span>
        </div>
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-4 h-4 text-robinhood-green flex-shrink-0" />
          <span className="text-robinhood-text-primary text-sm">Personal dashboard & analytics</span>
        </div>
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-4 h-4 text-robinhood-green flex-shrink-0" />
          <span className="text-robinhood-text-primary text-sm">Prestige system & badges</span>
        </div>
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-4 h-4 text-robinhood-green flex-shrink-0" />
          <span className="text-robinhood-text-primary text-sm">Community leaderboard access</span>
        </div>
      </div>

      <button
        onClick={onUpgrade}
        className="w-full bg-robinhood-green text-robinhood-black py-3 px-6 rounded-robinhood font-semibold hover:bg-robinhood-green/90 transition-colors"
      >
        Upgrade to Community Access
      </button>

      <p className="text-robinhood-text-secondary text-xs mt-4">
        Cancel anytime • No long-term commitments
      </p>
    </motion.div>
  );
}
