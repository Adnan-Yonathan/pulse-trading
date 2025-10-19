'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  BarChart3, 
  Settings, 
  ChevronDown,
  X,
  LogOut
} from 'lucide-react';
import { cn, generateAvatarInitials } from '@/lib/utils';

interface UserMenuProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  isAdmin: boolean;
  onOpenPersonalDashboard: () => void;
  onOpenAdminPanel: () => void;
  onLogout: () => void;
}

export default function UserMenu({ 
  user, 
  isAdmin,
  onOpenPersonalDashboard, 
  onOpenAdminPanel,
  onLogout
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Personal Dashboard',
      icon: <BarChart3 className="w-4 h-4" />,
      onClick: () => {
        onOpenPersonalDashboard();
        setIsOpen(false);
      },
      show: true,
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => {
        onOpenAdminPanel();
        setIsOpen(false);
      },
      show: isAdmin,
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <LogOut className="w-4 h-4" />,
      onClick: () => {
        onLogout();
        setIsOpen(false);
      },
      show: true,
    },
  ];

  const visibleItems = menuItems.filter(item => item.show);

  return (
    <div className="relative">
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 hover:bg-robinhood-hover rounded-lg transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-robinhood-border flex items-center justify-center">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-robinhood-text-primary font-medium text-sm">
              {generateAvatarInitials(user.username)}
            </span>
          )}
        </div>
        <span className="text-robinhood-text-primary font-medium text-sm hidden sm:block">
          @{user.username}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-robinhood-text-secondary transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-full mt-2 w-56 bg-robinhood-card-bg border border-robinhood-border rounded-robinhood shadow-robinhood z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-robinhood-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-robinhood-border flex items-center justify-center">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-robinhood-text-primary font-semibold">
                        {generateAvatarInitials(user.username)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-robinhood-text-primary font-semibold truncate">
                      @{user.username}
                    </p>
                    <p className="text-robinhood-text-secondary text-sm">
                      {isAdmin ? 'Admin' : 'Trader'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {visibleItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-robinhood-hover transition-colors"
                  >
                    <div className="text-robinhood-text-secondary">
                      {item.icon}
                    </div>
                    <span className="text-robinhood-text-primary font-medium">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-robinhood-border">
                <div className="flex items-center space-x-2 text-robinhood-text-secondary text-sm">
                  <User className="w-4 h-4" />
                  <span>Pulse Trades v1.0</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
