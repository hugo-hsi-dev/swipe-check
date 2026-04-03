import { useEffect, useState } from 'react';

import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';
import {
  readCompletedSessionHistory,
  readCompletedSessionDetail,
  readLatestCompletedSessionForDay,
  toLocalDayKey,
  type PersistedHistoryEntry,
  type PersistedSessionDetail,
} from '@/lib/local-data/session-lifecycle';

type JournalHistoryState = {
  entries: PersistedHistoryEntry[];
  isEmpty: boolean;
  isSingleEntry: boolean;
  isMultiEntry: boolean;
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

  const isEmpty = !isLoading && entries.length === 0;
  const isSingleEntry = !isLoading && entries.length === 1;
  const isMultiEntry = !isLoading && entries.length > 1;

  return { entries, isEmpty, isSingleEntry, isMultiEntry, isLoading, error };
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

function getTodayLocalDayKey(): string {
  return toLocalDayKey(new Date());
}

export function useCurrentDayCompletedSession(): {
  entry: PersistedHistoryEntry | null;
  isCurrentDay: boolean;
  isLoading: boolean;
  error: Error | null;
} {
  const [entry, setEntry] = useState<PersistedHistoryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTodayEntry() {
      try {
        const db = await getSQLiteDatabase();
        const todayKey = getTodayLocalDayKey();
        const result = await readLatestCompletedSessionForDay(db, todayKey);

        if (isMounted) {
          setEntry(result);
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

    loadTodayEntry();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    entry,
    isCurrentDay: entry !== null,
    isLoading,
    error,
  };
}
