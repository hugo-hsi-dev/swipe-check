import { useEffect, useState } from 'react';

import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';
import { readLatestTypeSnapshot } from '@/lib/local-data/session-lifecycle';
import type { TypeSnapshot } from '@/constants/scoring-contract';

export function useCurrentTypeSnapshot(): {
  currentType: string | null;
  snapshot: TypeSnapshot | null;
  isLoading: boolean;
} {
  const [snapshot, setSnapshot] = useState<TypeSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSnapshot() {
      try {
        const db = await getSQLiteDatabase();
        const latestSnapshot = await readLatestTypeSnapshot(db);

        if (isMounted) {
          setSnapshot(latestSnapshot);
        }
      } catch (_error) {
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSnapshot();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    currentType: snapshot?.currentType ?? null,
    snapshot,
    isLoading,
  };
}
