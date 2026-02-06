import { api } from './client';
import type { Submission, SubmissionStats, PaginatedResponse, ReviewSubmissionInput } from '@/types';

export interface SubmitCodeInput {
  challengeId: string;
  code: string;
  explanation: string;
  explanationLanguage: string;
}

export interface SubmitCodeResponse {
  id: string;
  status: string;
  message: string;
}

export async function submitCode(data: SubmitCodeInput): Promise<SubmitCodeResponse> {
  return api.post<SubmitCodeResponse>('/submissions', data);
}

export async function getMySubmissions(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Submission>> {
  return api.get<PaginatedResponse<Submission>>(`/submissions?page=${page}&limit=${limit}`);
}

export async function getSubmission(id: string): Promise<Submission> {
  return api.get<Submission>(`/submissions/${id}`);
}

export async function getSubmissionStats(): Promise<SubmissionStats> {
  return api.get<SubmissionStats>('/submissions/stats');
}

// Admin endpoints
export async function getChallengeSubmissions(
  challengeId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Submission>> {
  return api.get<PaginatedResponse<Submission>>(
    `/submissions/challenge/${challengeId}?page=${page}&limit=${limit}`
  );
}

export async function getPendingReviews(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Submission>> {
  return api.get<PaginatedResponse<Submission>>(
    `/submissions/pending-reviews?page=${page}&limit=${limit}`
  );
}

export interface ReviewResponse {
  message: string;
  submission: Submission;
}

export async function reviewSubmission(
  id: string,
  data: ReviewSubmissionInput
): Promise<ReviewResponse> {
  return api.post<ReviewResponse>(`/submissions/${id}/review`, data);
}
