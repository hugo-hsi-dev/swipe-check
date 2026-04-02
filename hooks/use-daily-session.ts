import { useCallback, useEffect, useState } from 'react';

import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';
import {
  getDailySessionForLocalDay,
  getOrCreateDailySessionForLocalDay,
  toLocalDayKey,
  type PersistedSession,
} from '@/lib/local-data/session-lifecycle';

export type DailySessionController = {
  /** Today's daily session, or null if not yet created */
  todaysSession: PersistedSession | null;
  /** Whether the data is still loading */
  isLoading: boolean;
  /** Start or resume today's daily session */
  startTodaysSession: () => Promise<void>;
  /** Refresh today's session from storage (useful after writing answers) */
  refresh: () => Promise<void>;
};

/**
 * Hook to manage today's daily session.
 *
 * Provides:
 * - Access to today's daily session (if it exists)
 * - Ability to start/resume today's session
 * - Refresh capability to reload after answers are written
 *
 * The session is keyed by local calendar day, ensuring only one session per day.
 * Same-day lookups return the existing session instead of creating duplicates.
 */
export function useDailySession(): DailySessionController {
  const [todaysSession, setTodaysSession] = useState<PersistedSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    setIsLoading(true);

    try {
      const db = await getSQLiteDatabase();
      const todayKey = toLocalDayKey(new Date());
      const session = await getDailySessionForLocalDay(db, todayKey);
      setTodaysSession(session);
    } catch (error) {
      console.error('Failed to load daily session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      if (isMounted) {
        await loadSession();
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [loadSession]);

  const startTodaysSession = useCallback(async () => {
    try {
      const db = await getSQLiteDatabase();
      const todayKey = toLocalDayKey(new Date());
      const session = await getOrCreateDailySessionForLocalDay(db, todayKey);
      setTodaysSession(session);
    } catch (error) {
      console.error('Failed to start daily session:', error);
      throw error;
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  return { todaysSession, isLoading, startTodaysSession, refresh };
}
