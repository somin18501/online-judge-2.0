'use client';

import { useEffect } from 'react';
import type { PublicUser } from '@au/types';
import { useAuthStore } from '@/store/auth-store';

/**
 * Synchronously seeds the auth store with the server-rendered session result
 * (so the first client paint already reflects auth state) and then
 * re-hydrates in the background so stale cookies get refreshed.
 */
export function AuthBootstrap({ initialUser }: { initialUser: PublicUser | null }): null {
  const setUser = useAuthStore((s) => s.setUser);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    setUser(initialUser);
    void hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
