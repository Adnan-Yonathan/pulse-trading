'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, Users, TrendingUp, Shield } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'community') => void;
}

export default function PricingModal({ isOpen, onClose, onSubscribe }: PricingModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (plan: 'community') => {
    setIsLoading(true);
    try {
      await onSubscribe(plan);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative max-w-4xl w-full bg-robinhood-card-bg rounded-robinhood overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-robinhood-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-robinhood-h1 text-robinhood-text-primary">
                      Choose Your Plan
                    </h2>
                    <p className="text-robinhood-text-secondary mt-1">
                      Unlock the full potential of Pulse Trades
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-robinhood-hover rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-robinhood-text-secondary" />
                  </button>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Free Plan */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-robinhood-card-bg border border-robinhood-border rounded-robinhood p-6 relative"
                  >
                    <div className="text-center">
                      <h3 className="text-robinhood-h2 text-robinhood-text-primary mb-2">
                        Free Viewer
                      </h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-robinhood-text-primary">$0</span>
                        <span className="text-robinhood-text-secondary ml-2">/month</span>
                      </div>
                      <p className="text-robinhood-text-secondary mb-6">
                        Perfect for tracking the market
                      </p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-robinhood-green flex-shrink-0" />
                        <span className="text-robinhood-text-primary">View all leaderboards</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-robinhood-green flex-shrink-0" />
                        <span className="text-robinhood-text-primary">See trading performance</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-robinhood-green flex-shrink-0" />
                        <span className="text-robinhood-text-primary">View proof images</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-robinhood-green flex-shrink-0" />
                        <span className="text-robinhood-text-primary">Real-time updates</span>
                      </li>
                    </ul>

                    <button
                      disabled
                      className="w-full py-3 px-4 bg-robinhood-border text-robinhood-text-secondary rounded-robinhood font-semibold cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  </motion.div>

                  {/* Community Plan */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-robinhood-card-bg border-2 border-robinhood-green rounded-robinhood p-6 relative"
                  >
                    {/* Popular Badge */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-robinhood-green text-robinhood-black px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>Most Popular</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="text-robinhood-h2 text-robinhood-text-primary mb-2">
                        Community Access
                      </h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-robinhood-green">$49</span>
                        <span className="text-robinhood-text-secondary ml-2">/month</span>
                      </div>
                      <p className="text-robinhood-text-secondary mb-6">
                        Join the trading community
                      </p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-robinhood-green flex-shrink-0" />
                        <span className="text-robinhood-text-primary">Everything in Free</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-robinhood-green flex-shrink-0" />
                        <span className="text-robinhood-text-primary">Submit your trades</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-robinhood-green flex-shrink-0" />
                        <span className="text-robinhood-text-primary">Upload proof images</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-robinhood-green flex-shrink-0" />
                        <span className="text-robinhood-text-primary">Personal dashboard</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-robinhood-green flex-shrink-0" />
                        <span className="text-robinhood-text-primary">Prestige system</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-robinhood-green flex-shrink-0" />
                        <span className="text-robinhood-text-primary">Community leaderboard</span>
                      </li>
                    </ul>

                    <button
                      onClick={() => handleSubscribe('community')}
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-robinhood-green text-robinhood-black rounded-robinhood font-semibold hover:bg-robinhood-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Processing...' : 'Subscribe Now'}
                    </button>
                  </motion.div>
                </div>

                {/* Features Comparison */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 bg-robinhood-card-bg border border-robinhood-border rounded-robinhood p-6"
                >
                  <h3 className="text-robinhood-h3 text-robinhood-text-primary mb-4 text-center">
                    Feature Comparison
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-robinhood-border rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-6 h-6 text-robinhood-text-secondary" />
                      </div>
                      <h4 className="text-robinhood-text-primary font-semibold mb-2">Trading Performance</h4>
                      <p className="text-robinhood-text-secondary text-sm">
                        Track and compare your trading results with the community
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-robinhood-border rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-robinhood-text-secondary" />
                      </div>
                      <h4 className="text-robinhood-text-primary font-semibold mb-2">Community Access</h4>
                      <p className="text-robinhood-text-secondary text-sm">
                        Join exclusive trading communities and compete with peers
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-robinhood-border rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-6 h-6 text-robinhood-text-secondary" />
                      </div>
                      <h4 className="text-robinhood-text-primary font-semibold mb-2">Verified Results</h4>
                      <p className="text-robinhood-text-secondary text-sm">
                        Submit proof images to verify your trading performance
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Footer */}
                <div className="mt-6 text-center">
                  <p className="text-robinhood-text-secondary text-sm">
                    Cancel anytime • No long-term commitments • Secure payment processing
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
