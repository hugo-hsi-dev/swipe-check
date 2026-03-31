import { useEffect, useState } from 'react';

import { hasCompletedOnboardingSession } from '@/lib/local-data/session-lifecycle';
import { openDatabaseAsync } from 'expo-sqlite';

import type { LocalDatabaseAdapter } from '@/lib/local-data/bootstrap';

class ExpoSQLiteAdapter implements LocalDatabaseAdapter {
  constructor(private readonly db: Awaited<ReturnType<typeof openDatabaseAsync>>) {}

  execAsync(sql: string): Promise<void> {
    return this.db.execAsync(sql);
  }

  runAsync(sql: string, ...params: (string | number | null)[]): Promise<unknown> {
    return this.db.runAsync(sql, ...params);
  }

  getFirstAsync<T>(sql: string, ...params: (string | number | null)[]): Promise<T | null> {
    return this.db.getFirstAsync<T>(sql, ...params);
  }

  getAllAsync<T>(sql: string, ...params: (string | number | null)[]): Promise<T[]> {
    return this.db.getAllAsync<T>(sql, ...params);
  }
}

export type InitialRouteState = {
  /** True while checking where to route the user */
  isDeterminingRoute: boolean;
  /** Error if routing determination failed */
  routeError: Error | null;
  /** Where the user should be routed: 'onboarding' | 'tabs' | null if not determined yet */
  targetRoute: 'onboarding' | 'tabs' | null;
};

/**
 * Hook to determine initial routing based on user state.
 * - New users (no completed onboarding) → 'onboarding'
 * - Returning users (completed onboarding) → 'tabs'
 */
export function useInitialRoute(): InitialRouteState {
  const [state, setState] = useState<InitialRouteState>({
    isDeterminingRoute: true,
    routeError: null,
    targetRoute: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function determineRoute() {
      try {
        const db = await openDatabaseAsync('swipe-check.db');
        await db.execAsync('PRAGMA foreign_keys = ON;');
        const adapter = new ExpoSQLiteAdapter(db);

        const hasCompletedOnboarding = await hasCompletedOnboardingSession(adapter);

        if (isMounted) {
          setState({
            isDeterminingRoute: false,
            routeError: null,
            targetRoute: hasCompletedOnboarding ? 'tabs' : 'onboarding',
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            isDeterminingRoute: false,
            routeError: error instanceof Error ? error : new Error(String(error)),
            targetRoute: null,
          });
        }
      }
    }

    determineRoute();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
