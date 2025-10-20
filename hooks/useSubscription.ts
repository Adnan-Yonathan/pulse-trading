'use client';

import { useState, useEffect } from 'react';

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: 'free' | 'community' | null;
  expiresAt: string | null;
  isLoading: boolean;
}

export function useSubscription(userId?: string) {
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isSubscribed: false,
    plan: 'free',
    expiresAt: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkSubscription = async () => {
      if (!userId) {
        setSubscription({
          isSubscribed: false,
          plan: 'free',
          expiresAt: null,
          isLoading: false,
        });
        return;
      }

      try {
        // Fetch subscription status from database API
        const response = await fetch(`/api/subscription/${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          setSubscription({
            isSubscribed: data.isSubscribed,
            plan: data.plan,
            expiresAt: data.expiresAt,
            isLoading: false,
          });
        } else {
          // If API fails, default to free plan
          setSubscription({
            isSubscribed: false,
            plan: 'free',
            expiresAt: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setSubscription({
          isSubscribed: false,
          plan: 'free',
          expiresAt: null,
          isLoading: false,
        });
      }
    };

    checkSubscription();
  }, [userId]);

  const subscribe = async (plan: 'community', userId: string) => {
    try {
      // Call /api/checkout to get Whop checkout URL
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, plan })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to create checkout session' };
      }

      const { checkoutUrl } = await response.json();
      
      // Redirect to Whop checkout
      window.location.href = checkoutUrl;
      
      return { success: true };
    } catch (error) {
      console.error('Error subscribing:', error);
      return { success: false, error: 'Failed to process subscription' };
    }
  };

  const cancelSubscription = async (userId: string) => {
    try {
      // Call API to cancel subscription
      const response = await fetch(`/api/subscription/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to cancel subscription' };
      }
      
      // Update local state
      setSubscription({
        isSubscribed: false,
        plan: 'free',
        expiresAt: null,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, error: 'Failed to cancel subscription' };
    }
  };

  return {
    subscription,
    subscribe,
    cancelSubscription,
  };
}
