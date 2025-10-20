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
        // Check local storage first for demo purposes
        const localSubscription = localStorage.getItem(`subscription_${userId}`);
        if (localSubscription) {
          const parsed = JSON.parse(localSubscription);
          const isExpired = parsed.expiresAt && new Date(parsed.expiresAt) < new Date();
          
          setSubscription({
            isSubscribed: !isExpired,
            plan: isExpired ? 'free' : parsed.plan,
            expiresAt: parsed.expiresAt,
            isLoading: false,
          });
          return;
        }

        // TODO: Replace with actual API call to check subscription status
        // const response = await fetch(`/api/subscription/${userId}`);
        // const data = await response.json();
        
        // For now, default to free plan
        setSubscription({
          isSubscribed: false,
          plan: 'free',
          expiresAt: null,
          isLoading: false,
        });
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
      // TODO: Replace with actual payment processing
      // For demo purposes, simulate a successful subscription
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now
      
      const subscriptionData = {
        plan,
        expiresAt: expiresAt.toISOString(),
        subscribedAt: new Date().toISOString(),
      };

      // Store in local storage for demo
      localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscriptionData));

      setSubscription({
        isSubscribed: true,
        plan,
        expiresAt: expiresAt.toISOString(),
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error('Error subscribing:', error);
      return { success: false, error: 'Failed to process subscription' };
    }
  };

  const cancelSubscription = async (userId: string) => {
    try {
      // TODO: Replace with actual API call to cancel subscription
      localStorage.removeItem(`subscription_${userId}`);
      
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
