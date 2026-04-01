import { useEffect, useState } from 'react';

import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';
import { completeSession, startOrResumeOnboardingSession } from '@/lib/local-data/session-lifecycle';
import type { PersistedSession } from '@/lib/local-data/session-lifecycle';

export function useOnboardingSession(): {
  session: PersistedSession | null;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
} {
  const [session, setSession] = useState<PersistedSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const db = await getSQLiteDatabase();
        const onboardingSession = await startOrResumeOnboardingSession(db);

        if (isMounted) {
          setSession(onboardingSession);
        }
      } catch (error) {
        console.error('Failed to initialize onboarding session:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function completeOnboarding() {
    if (!session) return;

    try {
      const db = await getSQLiteDatabase();
      await completeSession(db, session.id);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  }

  return { session, isLoading, completeOnboarding };
}
