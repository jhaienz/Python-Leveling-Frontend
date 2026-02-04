import { api } from './client';
import type { User, LeaderboardEntry, PaginatedResponse } from '@/types';

export async function getProfile(): Promise<User> {
  return api.get<User>('/users/profile');
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  return api.get<LeaderboardEntry[]>(`/users/leaderboard?limit=${limit}`);
}

// Admin endpoints
export async function listUsers(page: number = 1, limit: number = 20): Promise<PaginatedResponse<User>> {
  return api.get<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`);
}

export interface GrantCoinsInput {
  amount: number;
  reason: string;
}

export async function grantCoins(userId: string, data: GrantCoinsInput): Promise<User> {
  return api.post<User>(`/users/${userId}/grant-coins`, data);
}
