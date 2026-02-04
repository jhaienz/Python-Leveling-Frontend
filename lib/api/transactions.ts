import { api } from './client';
import type { Transaction, TransactionSummary, PaginatedResponse } from '@/types';

export async function getMyTransactions(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Transaction>> {
  return api.get<PaginatedResponse<Transaction>>(`/transactions?page=${page}&limit=${limit}`);
}

export async function getTransactionSummary(): Promise<TransactionSummary> {
  return api.get<TransactionSummary>('/transactions/summary');
}
