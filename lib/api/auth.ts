import { api, setToken, clearToken } from './client';
import type { AuthResponse, User } from '@/types';

export interface RegisterInput {
  name: string;
  studentId: string;
  password: string;
  email?: string;
}

export interface LoginInput {
  studentId: string;
  password: string;
}

export async function register(data: RegisterInput): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data);
  setToken(response.accessToken);
  return response;
}

export async function login(data: LoginInput): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', data);
  setToken(response.accessToken);
  return response;
}

export async function getMe(): Promise<User> {
  return api.get<User>('/auth/me');
}

export function logout(): void {
  clearToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
