import { useEffect, useState } from 'react';

import { hasCompletedOnboardingSession } from '@/lib/local-data/session-lifecycle';
import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';

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
        const db = await getSQLiteDatabase();
        const hasCompletedOnboarding = await hasCompletedOnboardingSession(db);

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
