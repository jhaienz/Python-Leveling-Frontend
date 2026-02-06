import { api } from "./client";
import type { Challenge, PaginatedResponse } from "@/types";

export async function getCurrentChallenge(): Promise<Challenge> {
  const response = await api.get<Challenge | { data: Challenge }>(
    "/challenges/current",
  );
  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }
  return response as Challenge;
}

// Get all active challenges for students
export async function getActiveChallenges(): Promise<Challenge[]> {
  const response = await api.get<Challenge[] | PaginatedResponse<Challenge>>(
    "/challenges/active",
  );
  // Handle both array and paginated response
  if (Array.isArray(response)) {
    return response;
  }
  if (response && "data" in response) {
    return response.data;
  }
  return [];
}

// Admin endpoints
export async function listChallenges(
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedResponse<Challenge>> {
  return api.get<PaginatedResponse<Challenge>>(
    `/challenges?page=${page}&limit=${limit}`,
  );
}

export interface CreateChallengeInput {
  title: string;
  description: string;
  problemStatement: string;
  starterCode: string;
  testCases: { input: string; expectedOutput?: string }[];
  evaluationPrompt?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  baseXpReward: number;
  bonusCoins: number;
  weekNumber?: number;
  year?: number;
  isActive?: boolean;
}

export async function createChallenge(
  data: CreateChallengeInput,
): Promise<Challenge> {
  return api.post<Challenge>("/challenges", data);
}

export async function getChallenge(id: string): Promise<Challenge> {
  return api.get<Challenge>(`/challenges/${id}`);
}

export async function updateChallenge(
  id: string,
  data: Partial<CreateChallengeInput>,
): Promise<Challenge> {
  return api.patch<Challenge>(`/challenges/${id}`, data);
}

export async function deleteChallenge(id: string): Promise<void> {
  return api.delete(`/challenges/${id}`);
}

export async function activateChallenge(id: string): Promise<Challenge> {
  return api.post<Challenge>(`/challenges/${id}/activate`);
}

export async function deactivateChallenge(id: string): Promise<Challenge> {
  return api.post<Challenge>(`/challenges/${id}/deactivate`);
}
