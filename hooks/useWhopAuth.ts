'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface WhopUser {
  id: string;
  username: string;
  email: string;
  profile_image_url?: string;
  name: string;
}

export function useWhopAuth() {
  const [user, setUser] = useState<WhopUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for authentication success/error in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const errorParam = urlParams.get('error');

    if (authStatus === 'success') {
      // Clear URL params and reload user data
      router.replace(window.location.pathname);
      checkAuthStatus();
    } else if (errorParam) {
      setError(`Authentication failed: ${errorParam}`);
      setIsLoading(false);
      // Clear error from URL
      router.replace(window.location.pathname);
    }
  }, [router]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user data exists in cookies
      const userDataCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('whop_user_data='));

      if (userDataCookie) {
        const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setError('Failed to check authentication status');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear cookies
      document.cookie = 'whop_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'whop_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'whop_user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Clear local state
      setUser(null);
      setError(null);
      
      // Optionally call logout endpoint to revoke tokens
      try {
        await fetch('/api/auth/callback/whop/logout', { method: 'POST' });
      } catch (error) {
        console.warn('Logout endpoint failed:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/callback/whop/refresh', {
        method: 'POST',
      });

      if (response.ok) {
        await checkAuthStatus();
        return true;
      } else {
        // Refresh failed, user needs to login again
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  };

  return {
    user,
    isLoading,
    error,
    logout,
    refreshToken,
    isAuthenticated: !!user,
  };
}
