'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubscriptionSuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-robinhood-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-robinhood-card-bg rounded-robinhood p-8 text-center"
      >
        {isLoading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 border-4 border-robinhood-green border-t-transparent rounded-full animate-spin mx-auto" />
            <h1 className="text-robinhood-h1 text-robinhood-text-primary">
              Processing...
            </h1>
            <p className="text-robinhood-text-secondary">
              Setting up your community access
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-robinhood-green rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-robinhood-black" />
            </div>
            
            <div>
              <h1 className="text-robinhood-h1 text-robinhood-text-primary mb-2">
                Welcome to Community Access!
              </h1>
              <p className="text-robinhood-text-secondary">
                Your subscription is now active. You can start submitting your trades and competing on the leaderboard.
              </p>
            </div>

            <div className="bg-robinhood-green/10 border border-robinhood-green/20 rounded-robinhood p-4">
              <h3 className="text-robinhood-text-primary font-semibold mb-2">
                What's Next?
              </h3>
              <ul className="text-sm text-robinhood-text-secondary space-y-1">
                <li>• Submit your daily trading performance</li>
                <li>• Upload proof images for verification</li>
                <li>• Compete on the community leaderboard</li>
                <li>• Track your progress in your dashboard</li>
              </ul>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-robinhood-green text-robinhood-black py-3 px-6 rounded-robinhood font-semibold hover:bg-robinhood-green/90 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Start Trading</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
