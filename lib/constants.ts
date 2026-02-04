import type { Tier } from '@/types';

// Tier colors mapping
export const TIER_COLORS: Record<Tier, string> = {
  Newbie: '#808080',      // Gray
  Beginner: '#32CD32',    // Green
  Intermediate: '#1E90FF', // Blue
  Advanced: '#9932CC',    // Purple
  Expert: '#FFD700',      // Gold
  Master: '#FF4500',      // Orange
};

// Tier level ranges
export const TIER_RANGES: Record<Tier, [number, number]> = {
  Newbie: [0, 10],
  Beginner: [11, 20],
  Intermediate: [21, 30],
  Advanced: [31, 40],
  Expert: [41, 50],
  Master: [51, 60],
};

// Difficulty labels
export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard',
};

// Difficulty colors
export const DIFFICULTY_COLORS: Record<number, string> = {
  1: 'bg-green-500',
  2: 'bg-lime-500',
  3: 'bg-yellow-500',
  4: 'bg-orange-500',
  5: 'bg-red-500',
};

// Transaction type labels
export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  LEVEL_UP_REWARD: 'Level Up Reward',
  CHALLENGE_BONUS: 'Challenge Bonus',
  SHOP_PURCHASE: 'Shop Purchase',
  ADMIN_GRANT: 'Admin Grant',
};

// Submission status colors
export const SUBMISSION_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  EVALUATING: 'bg-blue-500',
  PASSED: 'bg-green-500',
  FAILED: 'bg-red-500',
  ERROR: 'bg-gray-500',
};

// Navigation items for sidebar
export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/challenge', label: 'Challenge', icon: 'Code2' },
  { href: '/submissions', label: 'Submissions', icon: 'FileCode' },
  { href: '/shop', label: 'Shop', icon: 'ShoppingBag' },
  { href: '/leaderboard', label: 'Leaderboard', icon: 'Trophy' },
  { href: '/announcements', label: 'Announcements', icon: 'Megaphone' },
  { href: '/transactions', label: 'Transactions', icon: 'Receipt' },
  { href: '/profile', label: 'Profile', icon: 'User' },
] as const;

export const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: 'LayoutDashboard' },
  { href: '/admin/challenges', label: 'Challenges', icon: 'Code2' },
  { href: '/admin/shop', label: 'Shop Items', icon: 'ShoppingBag' },
  { href: '/admin/announcements', label: 'Announcements', icon: 'Megaphone' },
  { href: '/admin/users', label: 'Users', icon: 'Users' },
  { href: '/admin/purchases', label: 'Redemptions', icon: 'Ticket' },
] as const;
