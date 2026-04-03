import { useEffect, useState } from 'react';

import { readAllTypeSnapshots, readLatestTypeSnapshot } from '@/lib/local-data/session-lifecycle';
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
        const [latestSnapshot, allSnapshots] = await Promise.all([
          readLatestTypeSnapshot(db),
          readAllTypeSnapshots(db),
        ]);

        if (!isMounted) return;

        if (!latestSnapshot || allSnapshots.length === 0) {
          setState({ status: 'empty' });
          return;
        }

        if (allSnapshots.length === 1) {
          setState({
            status: 'sparse',
            latestType: latestSnapshot.currentType,
            latestSnapshot,
            history: allSnapshots,
          });
          return;
        }

        setState({
          status: 'populated',
          latestType: latestSnapshot.currentType,
          latestSnapshot,
          history: allSnapshots,
        });
      } catch (caught) {
        console.error('Failed to load insights data:', caught);
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