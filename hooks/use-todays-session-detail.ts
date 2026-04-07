import { useCallback, useEffect, useState } from 'react';

import type { TypeSnapshot } from '@/constants/scoring-contract';
import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';
import {
  getDailySessionForLocalDay,
  readSessionAnswers,
  readSessionTypeSnapshot,
  toLocalDayKey,
  type PersistedSession,
  type PersistedSessionAnswer,
} from '@/lib/local-data/session-lifecycle';

export type TodaysSessionDetail = {
  /** The daily session for today */
  session: PersistedSession;
  /** Answers submitted for today's session */
  answers: PersistedSessionAnswer[];
  /** Type snapshot for today's session (null if not completed) */
  snapshot: TypeSnapshot | null;
};

export type TodaysSessionDetailState = {
  /** Today's session detail, or null if no session exists for today */
  detail: TodaysSessionDetail | null;
  /** Whether the data is still loading */
  isLoading: boolean;
  /** Error if loading failed */
  error: Error | null;
};

/**
 * Hook to read today's daily session detail with answers and snapshot.
 *
 * Provides a completed-session read model that exposes:
 * - The daily session for today (in-progress or completed)
 * - All answers submitted for today's session
 * - The type snapshot if the session is completed
 *
 * This supports review flows by giving access to the full session state.
 * Same-day lookups return the existing session without creating duplicates.
 */
export function useTodaysSessionDetail(): TodaysSessionDetailState {
  const [detail, setDetail] = useState<TodaysSessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const db = await getSQLiteDatabase();
      const todayKey = toLocalDayKey(new Date());
      const session = await getDailySessionForLocalDay(db, todayKey);

      if (session) {
        const [answers, snapshot] = await Promise.all([
          readSessionAnswers(db, session.id),
          readSessionTypeSnapshot(db, session.id),
        ]);

        setDetail({
          session,
          answers,
          snapshot,
        });
      } else {
        setDetail(null);
      }
    } catch (err) {
      const errorInstance = err instanceof Error ? err : new Error(String(err));
      setError(errorInstance);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  return { detail, isLoading, error };
}
