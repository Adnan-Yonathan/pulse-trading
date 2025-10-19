'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, LogIn, TrendingUp, Trophy, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if user exists in database
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.trim())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking user:', fetchError);
        setError('Error checking user. Please try again.');
        return;
      }

      if (existingUser) {
        // User exists, log them in
        onLogin(username.trim());
        onClose();
      } else {
        // User doesn't exist, create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            whop_user_id: `local-${Date.now()}`, // Temporary ID for local users
            username: username.trim(),
            avatar_url: null,
            prestige_level: 0,
            total_wins: 0,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          setError('Error creating account. Please try again.');
          return;
        }

        // Log in the new user
        onLogin(username.trim());
        onClose();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Track Performance",
      description: "Submit your daily trading gains"
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      title: "Earn Badges",
      description: "Unlock prestige badges for top performance"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Compete",
      description: "See how you rank against other traders"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-4 max-w-md mx-auto bg-robinhood-black border border-robinhood-border rounded-robinhood shadow-robinhood z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-robinhood-border">
                <div className="flex items-center space-x-3">
                  <User className="w-6 h-6 text-robinhood-green" />
                  <h2 className="text-robinhood-h1 text-robinhood-text-primary">
                    Join Pulse Trades
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-robinhood-hover rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-robinhood-text-secondary" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-robinhood-text-primary font-semibold mb-3">
                    Start tracking your trading performance
                  </h3>
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="text-robinhood-green">
                          {feature.icon}
                        </div>
                        <div>
                          <p className="text-robinhood-text-primary font-medium text-sm">
                            {feature.title}
                          </p>
                          <p className="text-robinhood-text-secondary text-xs">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-robinhood-text-primary font-medium mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full bg-robinhood-card-bg border border-robinhood-border rounded-robinhood px-4 py-3 text-robinhood-text-primary placeholder-robinhood-text-secondary focus:outline-none focus:ring-2 focus:ring-robinhood-green focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-robinhood px-3 py-2">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !username.trim()}
                    className="w-full bg-robinhood-green hover:bg-robinhood-green/90 disabled:bg-robinhood-text-secondary disabled:cursor-not-allowed text-robinhood-black font-semibold px-4 py-3 rounded-robinhood transition-colors flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-robinhood-black border-t-transparent rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In / Create Account</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Info */}
                <div className="mt-6 p-4 bg-robinhood-card-bg border border-robinhood-border rounded-robinhood">
                  <p className="text-robinhood-text-secondary text-sm">
                    <strong className="text-robinhood-text-primary">Note:</strong> Enter your username to sign in or create a new account. 
                    If you're a community owner, you'll automatically get admin access.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
