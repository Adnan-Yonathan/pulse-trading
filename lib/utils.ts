import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function getPrestigeBadgeColor(badgeType: string): string {
  switch (badgeType) {
    case 'platinum':
      return 'text-prestige-platinum';
    case 'gold':
      return 'text-prestige-gold';
    case 'silver':
      return 'text-prestige-silver';
    case 'bronze':
      return 'text-prestige-bronze';
    default:
      return 'text-robinhood-text-secondary';
  }
}

export function getPrestigeBadgeIcon(badgeType: string): string {
  switch (badgeType) {
    case 'platinum':
      return '💎';
    case 'gold':
      return '🥇';
    case 'silver':
      return '🥈';
    case 'bronze':
      return '🥉';
    default:
      return '⭐';
  }
}

export function validatePercentage(value: string): { isValid: boolean; error?: string } {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }
  
  if (num < -100) {
    return { isValid: false, error: 'Percentage cannot be less than -100%' };
  }
  
  if (num > 1000) {
    return { isValid: false, error: 'Percentage cannot be greater than 1000%' };
  }
  
  return { isValid: true };
}

export function getRankDisplay(rank: number): string {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
}

export function getRankColor(rank: number): string {
  if (rank === 1) return 'text-prestige-platinum';
  if (rank === 2) return 'text-prestige-gold';
  if (rank === 3) return 'text-prestige-silver';
  return 'text-robinhood-text-secondary';
}

export function getPercentageColor(percentage: number): string {
  if (percentage > 0) return 'text-robinhood-green';
  if (percentage < 0) return 'text-robinhood-red';
  return 'text-robinhood-text-secondary';
}

export function getNextResetTime(): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

export function getTimeUntilReset(): string {
  const resetTime = getNextResetTime();
  const now = new Date();
  const diffInMs = resetTime.getTime() - now.getTime();
  
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}

export function generateAvatarInitials(username: string): string {
  return username
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
