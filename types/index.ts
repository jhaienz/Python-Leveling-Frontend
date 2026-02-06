// User Types
export type Tier = 'Newbie' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  studentId: string;
  name: string;
  email?: string;
  level: number;
  xp: number;
  xpRequired: number;
  xpProgress: number;
  coins: number;
  tier: Tier;
  tierColor: string;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  level: number;
  tier: Tier;
}

// Challenge Types
export interface TestCase {
  input: string;
  expectedOutput?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  problemStatement: string;
  starterCode: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  baseXpReward: number;
  bonusCoins: number;
  testCases: TestCase[];
  evaluationPrompt?: string;
  weekNumber?: number;
  year?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Submission Types
export type SubmissionStatus = 'PENDING' | 'EVALUATING' | 'PASSED' | 'FAILED' | 'ERROR';

export interface AIAnalysis {
  correctness: number;
  codeQuality: number;
  efficiency: number;
  style: number;
}

export interface Submission {
  id: string;
  userId?: string | { name: string; studentId: string };
  challengeId: string | { title: string; difficulty: number };
  code: string;
  explanation?: string;
  explanationLanguage?: string;
  status: SubmissionStatus;
  aiScore?: number;
  aiFeedback?: string;
  aiAnalysis?: AIAnalysis;
  aiSuggestions?: string[];
  xpEarned?: number;
  coinsEarned?: number;
  // Review fields
  isReviewed?: boolean;
  reviewedAt?: string;
  explanationScore?: number;
  reviewerFeedback?: string;
  bonusXpFromReview?: number;
  bonusCoinsFromReview?: number;
  createdAt: string;
  evaluatedAt?: string;
}

export interface ReviewSubmissionInput {
  explanationScore: number;
  bonusXp?: number;
  bonusCoins?: number;
  feedback?: string;
}

export interface SubmissionStats {
  total: number;
  passed: number;
  failed: number;
  pending: number;
  totalXpEarned: number;
  totalCoinsEarned: number;
  averageScore: number;
}

// Shop Types
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  coinPrice: number;
  stock: number | null;
  minLevel: number;
  isActive?: boolean;
  canAfford?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Purchase {
  id: string;
  itemId: string | ShopItem;
  quantity: number;
  totalCost: number;
  redemptionCode: string;
  isRedeemed?: boolean;
  redeemedAt?: string;
  createdAt: string;
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  author?: { name: string };
  authorId?: string;
  isPinned: boolean;
  isPublished?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Transaction Types
export type TransactionType = 'LEVEL_UP_REWARD' | 'CHALLENGE_BONUS' | 'SHOP_PURCHASE' | 'ADMIN_GRANT';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  balance: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}

export interface TransactionSummary {
  totalEarned: number;
  totalSpent: number;
  byType: Record<TransactionType, number>;
}

// API Response Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
