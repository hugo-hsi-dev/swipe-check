import { useEffect, useState } from 'react';

import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';
import {
  readCompletedSessionHistory,
  readCompletedSessionDetail,
  type PersistedHistoryEntry,
  type PersistedSessionDetail,
} from '@/lib/local-data/session-lifecycle';

type JournalHistoryState = {
  entries: PersistedHistoryEntry[];
  isLoading: boolean;
  error: Error | null;
};

export function useJournalHistory(limit?: number): JournalHistoryState {
  const [entries, setEntries] = useState<PersistedHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        const db = await getSQLiteDatabase();
        const history = await readCompletedSessionHistory(db, limit);

        if (isMounted) {
          setEntries(history);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [limit]);

  return { entries, isLoading, error };
}

type JournalEntryDetailState = {
  detail: PersistedSessionDetail | null;
  isLoading: boolean;
  error: Error | null;
};

export function useJournalEntryDetail(sessionId: string | null): JournalEntryDetailState {
  const [detail, setDetail] = useState<PersistedSessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      if (!sessionId) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const db = await getSQLiteDatabase();
        const result = await readCompletedSessionDetail(db, sessionId);

        if (isMounted) {
          setDetail(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  return { detail, isLoading, error };
}
