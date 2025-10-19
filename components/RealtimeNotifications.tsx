'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Bell, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn, formatPercentage } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'badge_earned' | 'rank_change' | 'new_leader' | 'achievement' | 'system';
  title: string;
  message: string;
  icon: React.ReactNode;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface RealtimeNotificationsProps {
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
}

export default function RealtimeNotifications({ 
  userId, 
  onNotificationClick 
}: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load notifications from localStorage on mount
    const savedNotifications = localStorage.getItem(`notifications_${userId}`);
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(parsed);
      setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
    }

    // Set up real-time listeners for different notification types
    // This would typically connect to your real-time system
    setupRealtimeListeners();
  }, [userId]);

  const setupRealtimeListeners = () => {
    // Example: Listen for badge earned events
    // In a real implementation, this would connect to your real-time system
    // For now, we'll simulate with a demo notification
    setTimeout(() => {
      addNotification({
        type: 'badge_earned',
        title: 'Badge Earned!',
        message: 'You earned a Bronze badge for finishing in the top 10!',
        icon: <Trophy className="w-5 h-5" />,
        data: { badgeType: 'bronze', rank: 8 }
      });
    }, 5000);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount(prev => prev + 1);

    // Save to localStorage
    const updatedNotifications = [newNotification, ...notifications.slice(0, 49)];
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updatedNotifications));

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(newNotification.id);
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Update localStorage
    const updatedNotifications = notifications.filter(n => n.id !== id);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updatedNotifications));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Update localStorage
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    // Update localStorage
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updatedNotifications));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'badge_earned':
        return <Trophy className="w-5 h-5 text-prestige-gold" />;
      case 'rank_change':
        return <TrendingUp className="w-5 h-5 text-robinhood-green" />;
      case 'new_leader':
        return <Star className="w-5 h-5 text-prestige-platinum" />;
      case 'achievement':
        return <CheckCircle className="w-5 h-5 text-robinhood-green" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-robinhood-text-secondary" />;
      default:
        return <Bell className="w-5 h-5 text-robinhood-text-secondary" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'badge_earned':
        return 'border-l-prestige-gold bg-prestige-gold/10';
      case 'rank_change':
        return 'border-l-robinhood-green bg-robinhood-green/10';
      case 'new_leader':
        return 'border-l-prestige-platinum bg-prestige-platinum/10';
      case 'achievement':
        return 'border-l-robinhood-green bg-robinhood-green/10';
      case 'system':
        return 'border-l-robinhood-text-secondary bg-robinhood-border/10';
      default:
        return 'border-l-robinhood-border bg-robinhood-border/10';
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 hover:bg-robinhood-hover rounded-full transition-colors"
        >
          <Bell className="w-6 h-6 text-robinhood-text-primary" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-robinhood-red text-robinhood-text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </button>

        {/* Notification Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-robinhood-card-bg border border-robinhood-border rounded-robinhood shadow-robinhood z-50 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-robinhood-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-robinhood-text-primary font-semibold">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-robinhood-green text-sm hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-robinhood-border">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          'p-4 border-l-4 hover:bg-robinhood-hover transition-colors cursor-pointer',
                          getNotificationColor(notification.type),
                          !notification.read && 'bg-robinhood-border/20'
                        )}
                        onClick={() => {
                          markAsRead(notification.id);
                          onNotificationClick?.(notification);
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-robinhood-text-primary">
                                {notification.title}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(notification.id);
                                }}
                                className="text-robinhood-text-secondary hover:text-robinhood-text-primary"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-sm text-robinhood-text-secondary mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-robinhood-text-secondary mt-2">
                              {notification.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-robinhood-text-secondary mx-auto mb-3" />
                    <p className="text-robinhood-text-secondary">
                      No notifications yet
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.slice(0, 3).map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              className={cn(
                'bg-robinhood-card-bg border border-robinhood-border rounded-robinhood shadow-robinhood p-4 w-80',
                getNotificationColor(notification.type)
              )}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-robinhood-text-primary">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-robinhood-text-secondary mt-1">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="text-robinhood-text-secondary hover:text-robinhood-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
