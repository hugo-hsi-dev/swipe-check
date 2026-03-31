import { useEffect, useState } from 'react';

import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';
import { hasCompletedOnboardingSession } from '@/lib/local-data/session-lifecycle';

export function useOnboardingStatus(): {
  hasCompletedOnboarding: boolean | null;
  isLoading: boolean;
} {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkOnboarding() {
      try {
        const db = await getSQLiteDatabase();
        const completed = await hasCompletedOnboardingSession(db);

        if (isMounted) {
          setHasCompletedOnboarding(completed);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        if (isMounted) {
          setHasCompletedOnboarding(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void checkOnboarding();

    return () => {
      isMounted = false;
    };
  }, []);

  return { hasCompletedOnboarding, isLoading };
}
