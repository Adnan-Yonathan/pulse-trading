'use client';

import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubscriptionCancelPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/');
  };

  const handleTryAgain = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-robinhood-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-robinhood-card-bg rounded-robinhood p-8 text-center"
      >
        <div className="space-y-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          
          <div>
            <h1 className="text-robinhood-h1 text-robinhood-text-primary mb-2">
              Subscription Cancelled
            </h1>
            <p className="text-robinhood-text-secondary">
              No worries! You can still view the leaderboard and see other traders' performance. 
              You can upgrade to Community Access anytime to start submitting your own trades.
            </p>
          </div>

          <div className="bg-robinhood-border/50 rounded-robinhood p-4">
            <h3 className="text-robinhood-text-primary font-semibold mb-2">
              Free Features Available:
            </h3>
            <ul className="text-sm text-robinhood-text-secondary space-y-1">
              <li>• View all leaderboards</li>
              <li>• See trading performance</li>
              <li>• View proof images</li>
              <li>• Real-time updates</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              className="w-full bg-robinhood-green text-robinhood-black py-3 px-6 rounded-robinhood font-semibold hover:bg-robinhood-green/90 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <button
              onClick={handleGoBack}
              className="w-full bg-robinhood-card-bg border border-robinhood-border text-robinhood-text-primary py-3 px-6 rounded-robinhood font-semibold hover:bg-robinhood-hover transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue as Free User</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
