'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { getMe } from '@/lib/api/auth';

// Helper to set cookie
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

// Helper to remove cookie
function removeCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  initialize: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,

      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        setCookie('token', token, 7); // Also set as cookie for middleware
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      clearAuth: () => {
        localStorage.removeItem('token');
        removeCookie('token'); // Also remove cookie
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      initialize: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          removeCookie('token'); // Ensure cookie is also cleared
          set({ isLoading: false, isInitialized: true });
          return;
        }

        try {
          const user = await getMe();
          setCookie('token', token, 7); // Sync cookie with localStorage
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } catch {
          localStorage.removeItem('token');
          removeCookie('token'); // Also remove cookie
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
      }),
    }
  )
);
