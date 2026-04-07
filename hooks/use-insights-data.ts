import { useEffect, useState } from 'react';

import { readAllTypeSnapshots } from '@/lib/local-data/session-lifecycle';
import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';
import type { TypeSnapshot } from '@/constants/scoring-contract';

export type InsightsDataState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; error: Error }
  | { status: 'sparse'; latestType: string; latestSnapshot: TypeSnapshot; history: TypeSnapshot[] }
  | { status: 'populated'; latestType: string; latestSnapshot: TypeSnapshot; history: TypeSnapshot[] };

export function useInsightsData(): InsightsDataState {
  const [state, setState] = useState<InsightsDataState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const db = await getSQLiteDatabase();
        const allSnapshots = await readAllTypeSnapshots(db);

        if (!isMounted) return;

        if (allSnapshots.length === 0) {
          setState({ status: 'empty' });
          return;
        }

        const sortedHistory = [...allSnapshots].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id.localeCompare(a.id)
        );

        const latestSnapshot = sortedHistory[0];
        const latestType = latestSnapshot.currentType;

        if (allSnapshots.length === 1) {
          setState({
            status: 'sparse',
            latestType,
            latestSnapshot,
            history: allSnapshots,
          });
          return;
        }

        setState({
          status: 'populated',
          latestType,
          latestSnapshot,
          history: allSnapshots,
        });
      } catch (caught) {
        const err = caught instanceof Error ? caught : new Error(String(caught));
        if (isMounted) {
          setState({ status: 'error', error: err });
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}