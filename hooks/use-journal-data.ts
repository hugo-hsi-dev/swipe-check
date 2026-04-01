import { useEffect, useState } from 'react';

import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import type { LocalDatabaseAdapter } from '@/lib/local-data/bootstrap';
import {
  readCompletedSessionHistory,
  readCompletedSessionDetail,
  type PersistedHistoryEntry,
  type PersistedSessionDetail,
} from '@/lib/local-data/session-lifecycle';

class ExpoSQLiteAdapter implements LocalDatabaseAdapter {
  constructor(private readonly db: SQLiteDatabase) {}

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

async function openAdapter(dbName = 'swipe-check.db'): Promise<ExpoSQLiteAdapter> {
  const db = await openDatabaseAsync(dbName);
  await db.execAsync('PRAGMA foreign_keys = ON;');
  return new ExpoSQLiteAdapter(db);
}

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
        const adapter = await openAdapter();
        const history = await readCompletedSessionHistory(adapter, limit);

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
        const adapter = await openAdapter();
        const result = await readCompletedSessionDetail(adapter, sessionId);

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
