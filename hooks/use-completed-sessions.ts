import { useEffect, useState, useCallback } from 'react';

import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';
import {
  readCompletedSessionHistory,
  type PersistedHistoryEntry,
  type Cursor,
} from '@/lib/local-data/session-lifecycle';

export function useCompletedSessions(): {
  sessions: PersistedHistoryEntry[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
} {
  const [sessions, setSessions] = useState<PersistedHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<Cursor | undefined>(undefined);
  const PAGE_SIZE = 25;

  useEffect(() => {
    let isMounted = true;

    async function loadSessions() {
      try {
        const db = await getSQLiteDatabase();
        const result = await readCompletedSessionHistory(db, PAGE_SIZE, undefined);

        if (isMounted) {
          setSessions(result.entries);
          setHasMore(result.hasMore);
          setCursor(result.nextCursor);
        }
      } catch (error) {
        console.error('Failed to load completed sessions:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSessions();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const db = await getSQLiteDatabase();
      const result = await readCompletedSessionHistory(db, PAGE_SIZE, cursor);

      setSessions((prev) => [...prev, ...result.entries]);
      setHasMore(result.hasMore);
      setCursor(result.nextCursor);
    } catch (error) {
      console.error('Failed to load more sessions:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, cursor]);

  return { sessions, isLoading, hasMore, loadMore, isLoadingMore };
}
