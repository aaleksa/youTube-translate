'use client';

import { useEffect, useRef } from 'react';
import { getAccessToken, getStoredUser } from '../lib/v2/tokenStorage';
import { useAuth } from './auth/AuthProvider';

/**
 * Dev-only: recover from HMR leaving React state out of sync with localStorage tokens.
 */
export default function DevSessionRecovery() {
  const { enabled, ready, user } = useAuth();
  const reloaded = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !enabled || !ready || user) {
      return;
    }

    const token = getAccessToken();
    const storedUser = getStoredUser();
    if (!token || !storedUser || reloaded.current) {
      return;
    }

    reloaded.current = true;
    window.location.reload();
  }, [enabled, ready, user]);

  return null;
}
