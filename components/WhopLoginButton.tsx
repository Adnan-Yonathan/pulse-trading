'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, ExternalLink } from 'lucide-react';

interface WhopLoginButtonProps {
  onLogin: () => void;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function WhopLoginButton({ 
  onLogin, 
  isLoading = false, 
  variant = 'primary',
  size = 'md',
  className = ''
}: WhopLoginButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleWhopLogin = () => {
    // Get the current origin for the redirect URI
    const redirectUri = `${window.location.origin}/api/auth/callback/whop`;
    const clientId = process.env.NEXT_PUBLIC_WHOP_CLIENT_ID;
    
    if (!clientId) {
      console.error('NEXT_PUBLIC_WHOP_CLIENT_ID is not set');
      alert('OAuth configuration error: Client ID not found. Please check your environment variables.');
      return;
    }
    
    // Whop OAuth URL - Updated to use the correct API endpoint
    const whopAuthUrl = new URL('https://api.whop.com/v5/oauth/authorize');
    whopAuthUrl.searchParams.set('client_id', clientId);
    whopAuthUrl.searchParams.set('redirect_uri', redirectUri);
    whopAuthUrl.searchParams.set('response_type', 'code');
    whopAuthUrl.searchParams.set('scope', 'read:user');
    whopAuthUrl.searchParams.set('state', 'pulse-trades-auth');
    
    const finalUrl = whopAuthUrl.toString();
    
    // Redirect to Whop OAuth
    window.location.href = finalUrl;
  };

  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-robinhood transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-robinhood-green";
  
  const variantClasses = {
    primary: "bg-robinhood-green hover:bg-robinhood-green/90 text-robinhood-black shadow-robinhood",
    secondary: "bg-robinhood-card-bg border border-robinhood-border text-robinhood-text-primary hover:bg-robinhood-hover"
  };
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.button
      onClick={handleWhopLogin}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          <span>Connecting to Whop...</span>
        </>
      ) : (
        <>
          <LogIn className="w-5 h-5 mr-2" />
          <span>Login with Whop</span>
          <motion.div
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ExternalLink className="w-4 h-4 ml-2" />
          </motion.div>
        </>
      )}
    </motion.button>
  );
}
