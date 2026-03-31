import { useCallback, useEffect, useState } from 'react';

import { hasCompletedOnboardingSession, startOrResumeOnboardingSession, completeSession } from '@/lib/local-data/session-lifecycle';
import { openDatabaseAsync } from 'expo-sqlite';

import type { LocalDatabaseAdapter } from '@/lib/local-data/bootstrap';

class ExpoSQLiteAdapter implements LocalDatabaseAdapter {
  constructor(private readonly db: Awaited<ReturnType<typeof openDatabaseAsync>>) {}

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

type OnboardingSessionState = {
  hasCompletedOnboarding: boolean | null;
  isLoading: boolean;
  error: Error | null;
};

export function useOnboardingSession(): OnboardingSessionState & {
  completeOnboarding: () => Promise<void>;
  refreshOnboardingStatus: () => Promise<void>;
} {
  const [state, setState] = useState<OnboardingSessionState>({
    hasCompletedOnboarding: null,
    isLoading: true,
    error: null,
  });

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const db = await openDatabaseAsync('swipe-check.db');
      await db.execAsync('PRAGMA foreign_keys = ON;');
      const adapter = new ExpoSQLiteAdapter(db);
      
      const hasCompleted = await hasCompletedOnboardingSession(adapter);
      
      setState({
        hasCompletedOnboarding: hasCompleted,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        hasCompletedOnboarding: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const db = await openDatabaseAsync('swipe-check.db');
      await db.execAsync('PRAGMA foreign_keys = ON;');
      const adapter = new ExpoSQLiteAdapter(db);
      
      // Start or get existing onboarding session
      const session = await startOrResumeOnboardingSession(adapter);
      
      // Mark it as complete
      await completeSession(adapter, session.id);
      
      setState({
        hasCompletedOnboarding: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      throw error;
    }
  }, []);

  const refreshOnboardingStatus = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return {
    ...state,
    completeOnboarding,
    refreshOnboardingStatus,
  };
}
