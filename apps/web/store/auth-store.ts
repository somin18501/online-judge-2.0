'use client';

import { create } from 'zustand';
import type { PublicUser } from '@au/types';
import { api } from '@/lib/api/endpoints';

interface AuthState {
  user: PublicUser | null;
  status: 'idle' | 'loading' | 'ready';
  setUser: (user: PublicUser | null) => void;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',
  setUser: (user) => set({ user, status: 'ready' }),
  hydrate: async () => {
    if (get().status === 'loading') return;
    set({ status: 'loading' });
    try {
      const res = await api.auth.session();
      set({ user: res.user, status: 'ready' });
    } catch {
      set({ user: null, status: 'ready' });
    }
  },
  logout: async () => {
    try {
      await api.auth.logout();
    } finally {
      set({ user: null, status: 'ready' });
    }
  },
}));
