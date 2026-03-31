import { useEffect, useState } from 'react';

import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';
import {
  getDailySessionForLocalDay,
  getOrCreateDailySessionForLocalDay,
  toLocalDayKey,
  type PersistedSession,
} from '@/lib/local-data/session-lifecycle';

export function useDailySession(): {
  todaysSession: PersistedSession | null;
  isLoading: boolean;
  startTodaysSession: () => Promise<void>;
} {
  const [todaysSession, setTodaysSession] = useState<PersistedSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const db = await getSQLiteDatabase();
        const todayKey = toLocalDayKey(new Date());
        const session = await getDailySessionForLocalDay(db, todayKey);

        if (isMounted) {
          setTodaysSession(session);
        }
      } catch (error) {
        console.error('Failed to load daily session:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function startTodaysSession() {
    try {
      const db = await getSQLiteDatabase();
      const todayKey = toLocalDayKey(new Date());
      const session = await getOrCreateDailySessionForLocalDay(db, todayKey);
      setTodaysSession(session);
    } catch (error) {
      console.error('Failed to start daily session:', error);
      throw error;
    }
  }

  return { todaysSession, isLoading, startTodaysSession };
}
