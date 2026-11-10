'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Hook that returns false during SSR and initial hydration,
 * and true immediately after client hydration completes.
 * Uses React's official useSyncExternalStore pattern to avoid
 * hydration mismatches when reading from localStorage or browser APIs.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // client snapshot after hydration
    () => false // server snapshot during SSR & hydration
  );
}
