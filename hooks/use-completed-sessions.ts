import { useEffect, useState } from 'react';

import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';
import {
  readCompletedSessionHistory,
  type PersistedHistoryEntry,
} from '@/lib/local-data/session-lifecycle';

export function useCompletedSessions(): {
  sessions: PersistedHistoryEntry[];
  isLoading: boolean;
} {
  const [sessions, setSessions] = useState<PersistedHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSessions() {
      try {
        const db = await getSQLiteDatabase();
        const history = await readCompletedSessionHistory(db, 50);

        if (isMounted) {
          setSessions(history);
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

  return { sessions, isLoading };
}
