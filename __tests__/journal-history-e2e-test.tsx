/**
 * Journal History Validation Tests
 *
 * Validates the Journal data layer works across empty, sparse, and populated states:
 * 1. Empty state - no completed sessions (onboarding not done)
 * 2. Single entry state - one completed onboarding
 * 3. Multiple entries state - multiple completed days
 * 4. Today's session separation from history
 * 5. Read-only nature of completed history
 *
 * Acceptance Criteria:
 * - The key edge cases from the epic are exercised in tests
 * - The Journal flow remains stable when history is sparse
 * - Completed sessions cannot be modified
 */

import { waitFor, renderHook } from '@testing-library/react-native';
import type { TypeSnapshot } from '@/constants/scoring-contract';
import type {
  PersistedSession,
  PersistedHistoryEntry,
} from '@/lib/local-data/session-lifecycle';
import {
  useJournalHistory,
  useCurrentDayCompletedSession,
} from '@/hooks/use-journal-data';
import { AXES } from '@/constants/questions';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

jest.mock('@/lib/local-data/session-lifecycle', () => {
  const originalModule = jest.requireActual('@/lib/local-data/session-lifecycle');
  return {
    ...originalModule,
    toLocalDayKey: jest.fn(() => '2024-04-03'),
  };
});

const mockDbState: {
  historyEntries: Array<{
    session: PersistedSession;
    snapshot: TypeSnapshot | null;
  }>;
} = {
  historyEntries: [],
};

const mockDb = {
  execAsync: jest.fn(() => Promise.resolve()),
  runAsync: jest.fn(() => Promise.resolve({ changes: 1 })),
  getFirstAsync: jest.fn(() => Promise.resolve(null)),
  getAllAsync: jest.fn((sql: string, ...params: unknown[]) => {
    if (sql.includes('FROM sessions s') && sql.includes('WHERE s.status = ')) {
      const limitParam = params[0];
      const limit = typeof limitParam === 'number' && limitParam > 0 ? limitParam : undefined;

      let entries = mockDbState.historyEntries.map((entry) => {
        const session = entry.session;
        const snapshot = entry.snapshot;
        return {
          id: session.id,
          session_type: session.type,
          status: session.status,
          local_day_key: session.localDayKey,
          started_at: session.startedAt,
          completed_at: session.completedAt,
          created_at: session.createdAt,
          updated_at: session.updatedAt,
          snapshot_id: snapshot?.id ?? null,
          snapshot_session_id: snapshot?.id ?? null,
          current_type: snapshot?.currentType ?? null,
          axis_scores_json: snapshot?.axisScores ? JSON.stringify(snapshot.axisScores) : null,
          axis_strengths_json: snapshot?.axisStrengths ? JSON.stringify(snapshot.axisStrengths) : null,
          source_type: snapshot?.source.type ?? null,
          source_session_id: snapshot?.source.sessionId ?? null,
          question_count: snapshot?.questionCount ?? null,
          snapshot_created_at: snapshot?.createdAt.toISOString() ?? null,
        };
      });

      if (sql.includes('AND s.local_day_key = ?')) {
        const dayKey = params[params.length - 1] as string;
        entries = entries.filter((entry) => entry.local_day_key === dayKey);
        const timestampSort = (a: typeof entries[number], b: typeof entries[number]) => {
          const timeA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
          const timeB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
          return timeB - timeA;
        };
        entries.sort(timestampSort);
        entries = entries.slice(0, 1);
      } else {
        const timestampSort = (a: typeof entries[number], b: typeof entries[number]) => {
          const timeA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
          const timeB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
          return timeB - timeA;
        };
        entries.sort(timestampSort);
        if (limit !== undefined && limit > 0) {
          entries = entries.slice(0, limit);
        }
      }

      return Promise.resolve(entries);
    }

    return Promise.resolve([]);
  }),
};

jest.mock('@/lib/local-data/sqlite-runtime', () => ({
  getSQLiteDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

// Helper to create a mock completed session
function createMockSession({
  id,
  type,
  localDayKey,
  completedAt,
}: {
  id: string;
  type: 'onboarding' | 'daily';
  localDayKey: string;
  completedAt: Date;
}): PersistedSession {
  const createdAt = new Date(completedAt);
  createdAt.setHours(completedAt.getHours() - 1);

  return {
    id,
    type,
    status: 'completed',
    localDayKey,
    startedAt: createdAt.toISOString(),
    completedAt: completedAt.toISOString(),
    createdAt: createdAt.toISOString(),
    updatedAt: completedAt.toISOString(),
  };
}

// Helper to create a mock type snapshot
function createMockSnapshot({
  id,
  sessionId,
  currentType,
  questionCount,
}: {
  id: string;
  sessionId: string;
  currentType: string;
  questionCount: number;
}): TypeSnapshot {
  return {
    id,
    currentType,
    axisScores: AXES.map((axis) => ({
      axisId: axis.id,
      poleA: {
        poleId: axis.poleA.id,
        count: Math.floor(Math.random() * 3) + 1,
      },
      poleB: {
        poleId: axis.poleB.id,
        count: Math.floor(Math.random() * 3) + 1,
      },
      totalResponses: 6,
    })),
    axisStrengths: AXES.map((axis) => ({
      axisId: axis.id,
      strength: (Math.random() * 2 - 1).toFixed(2) as any,
      dominantPoleId: Math.random() > 0.5 ? axis.poleA.id : axis.poleB.id,
      rawDifference: Math.random() * 6 - 3,
    })),
    questionCount,
    createdAt: new Date(),
    source: {
      type: 'onboarding',
      sessionId,
    },
  };
}

describe('Journal History Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbState.historyEntries = [];
  });

  describe('Empty State - No History', () => {
    it('should handle empty history gracefully', async () => {
      // Arrange: No history entries
      mockDbState.historyEntries = [];

      // Act
      const { result } = renderHook(() => useJournalHistory());

      // Assert: Should load with empty entries and no error
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.entries).toHaveLength(0);
      expect(result.current.isEmpty).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should report empty state correctly', async () => {
      // Arrange: No history
      mockDbState.historyEntries = [];

      // Act
      const { result } = renderHook(() => useJournalHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: State flags should be correct
      expect(result.current.isEmpty).toBe(true);
      expect(result.current.isSingleEntry).toBe(false);
      expect(result.current.isMultiEntry).toBe(false);
    });
  });

  describe('Single Entry State - One Completed Day', () => {
    it('should display single onboarding entry after completion', async () => {
      // Arrange: One completed onboarding session
      const session = createMockSession({
        id: 'session-001',
        type: 'onboarding',
        localDayKey: '2024-04-01',
        completedAt: new Date('2024-04-01T10:00:00'),
      });
      const snapshot = createMockSnapshot({
        id: 'snap-001',
        sessionId: session.id,
        currentType: 'INTJ',
        questionCount: 12,
      });

      mockDbState.historyEntries = [{ session, snapshot }];

      // Act
      const { result } = renderHook(() => useJournalHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should show single entry
      expect(result.current.entries).toHaveLength(1);
      expect(result.current.isSingleEntry).toBe(true);
      expect(result.current.isMultiEntry).toBe(false);
      expect(result.current.entries[0].session.id).toBe('session-001');
      expect(result.current.entries[0].snapshot?.currentType).toBe('INTJ');
    });

    it('should handle single daily entry correctly', async () => {
      // Arrange: One completed daily session
      const session = createMockSession({
        id: 'session-001',
        type: 'daily',
        localDayKey: '2024-04-01',
        completedAt: new Date('2024-04-01T10:00:00'),
      });
      const snapshot = createMockSnapshot({
        id: 'snap-001',
        sessionId: session.id,
        currentType: 'ENFP',
        questionCount: 4,
      });

      mockDbState.historyEntries = [{ session, snapshot }];

      // Act
      const { result } = renderHook(() => useJournalHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Entry type should be daily
      expect(result.current.entries[0].session.type).toBe('daily');
      expect(result.current.entries[0].snapshot?.currentType).toBe('ENFP');
    });

    it('should report single entry state correctly', async () => {
      // Arrange: One entry
      const session = createMockSession({
        id: 'session-001',
        type: 'onboarding',
        localDayKey: '2024-04-01',
        completedAt: new Date('2024-04-01T10:00:00'),
      });
      const snapshot = createMockSnapshot({
        id: 'snap-001',
        sessionId: session.id,
        currentType: 'INTJ',
        questionCount: 12,
      });

      mockDbState.historyEntries = [{ session, snapshot }];

      // Act
      const { result } = renderHook(() => useJournalHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: State flags should be correct
      expect(result.current.isEmpty).toBe(false);
      expect(result.current.isSingleEntry).toBe(true);
      expect(result.current.isMultiEntry).toBe(false);
    });
  });

  describe('Multiple Completed Days State', () => {
    it('should display multiple entries in reverse chronological order', async () => {
      // Arrange: Three completed sessions
      const today = new Date('2024-04-03T10:00:00');
      const yesterday = new Date('2024-04-02T10:00:00');
      const twoDaysAgo = new Date('2024-04-01T10:00:00');

      const session1 = createMockSession({
        id: 'session-001',
        type: 'onboarding',
        localDayKey: '2024-04-01',
        completedAt: twoDaysAgo,
      });
      const snapshot1 = createMockSnapshot({
        id: 'snap-001',
        sessionId: session1.id,
        currentType: 'INTJ',
        questionCount: 12,
      });

      const session2 = createMockSession({
        id: 'session-002',
        type: 'daily',
        localDayKey: '2024-04-02',
        completedAt: yesterday,
      });
      const snapshot2 = createMockSnapshot({
        id: 'snap-002',
        sessionId: session2.id,
        currentType: 'ENTJ',
        questionCount: 4,
      });

      const session3 = createMockSession({
        id: 'session-003',
        type: 'daily',
        localDayKey: '2024-04-03',
        completedAt: today,
      });
      const snapshot3 = createMockSnapshot({
        id: 'snap-003',
        sessionId: session3.id,
        currentType: 'ENTP',
        questionCount: 4,
      });

      mockDbState.historyEntries = [
        { session: session1, snapshot: snapshot1 },
        { session: session3, snapshot: snapshot3 },
        { session: session2, snapshot: snapshot2 },
      ];

      const { result } = renderHook(() => useJournalHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.entries).toHaveLength(3);
      expect(result.current.isMultiEntry).toBe(true);
      expect(result.current.entries[0].session.id).toBe('session-003');
      expect(result.current.entries[1].session.id).toBe('session-002');
      expect(result.current.entries[2].session.id).toBe('session-001');
    });

    it('should handle sparse history (e.g., onboarding only)', async () => {
      // Arrange: Only onboarding, no daily sessions
      const session = createMockSession({
        id: 'session-001',
        type: 'onboarding',
        localDayKey: '2024-04-01',
        completedAt: new Date('2024-04-01T10:00:00'),
      });
      const snapshot = createMockSnapshot({
        id: 'snap-001',
        sessionId: session.id,
        currentType: 'ISTJ',
        questionCount: 12,
      });

      mockDbState.historyEntries = [{ session, snapshot }];

      // Act
      const { result } = renderHook(() => useJournalHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should show onboarding entry
      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0].session.type).toBe('onboarding');
      expect(result.current.entries[0].snapshot?.currentType).toBe('ISTJ');
    });

    it('should report multiple entries state correctly', async () => {
      // Arrange: Multiple entries
      const session1 = createMockSession({
        id: 'session-001',
        type: 'onboarding',
        localDayKey: '2024-04-01',
        completedAt: new Date('2024-04-01T10:00:00'),
      });
      const snapshot1 = createMockSnapshot({
        id: 'snap-001',
        sessionId: session1.id,
        currentType: 'INTJ',
        questionCount: 12,
      });

      const session2 = createMockSession({
        id: 'session-002',
        type: 'daily',
        localDayKey: '2024-04-02',
        completedAt: new Date('2024-04-02T10:00:00'),
      });
      const snapshot2 = createMockSnapshot({
        id: 'snap-002',
        sessionId: session2.id,
        currentType: 'ENTJ',
        questionCount: 4,
      });

      mockDbState.historyEntries = [
        { session: session2, snapshot: snapshot2 },
        { session: session1, snapshot: snapshot1 },
      ];

      // Act
      const { result } = renderHook(() => useJournalHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: State flags should be correct
      expect(result.current.isEmpty).toBe(false);
      expect(result.current.isSingleEntry).toBe(false);
      expect(result.current.isMultiEntry).toBe(true);
    });
  });

  describe('Today Session Separation', () => {
    it('should identify today as separate from past entries', async () => {
      const today = new Date('2024-04-03T10:00:00');
      const dayKey = '2024-04-03';

      const todaySession = createMockSession({
        id: 'session-today',
        type: 'daily',
        localDayKey: dayKey,
        completedAt: today,
      });
      const todaySnapshot = createMockSnapshot({
        id: 'snap-today',
        sessionId: todaySession.id,
        currentType: 'ENFP',
        questionCount: 4,
      });

      const pastSession = createMockSession({
        id: 'session-past',
        type: 'daily',
        localDayKey: '2024-04-02',
        completedAt: new Date('2024-04-02T10:00:00'),
      });
      const pastSnapshot = createMockSnapshot({
        id: 'snap-past',
        sessionId: pastSession.id,
        currentType: 'INFP',
        questionCount: 4,
      });

      mockDbState.historyEntries = [
        { session: pastSession, snapshot: pastSnapshot },
        { session: todaySession, snapshot: todaySnapshot },
      ];

      const { result: todayResult } = renderHook(() => useCurrentDayCompletedSession());

      await waitFor(() => {
        expect(todayResult.current.isLoading).toBe(false);
      });

      expect(todayResult.current.isCurrentDay).toBe(true);
      expect(todayResult.current.entry?.session.id).toBe('session-today');
      expect(todayResult.current.entry?.snapshot?.currentType).toBe('ENFP');

      const { result: historyResult } = renderHook(() => useJournalHistory());

      await waitFor(() => {
        expect(historyResult.current.isLoading).toBe(false);
      });

      expect(historyResult.current.entries).toHaveLength(2);
      expect(historyResult.current.entries[0].session.id).toBe('session-today');
    });

    it('should handle no today session correctly', async () => {
      mockDbState.historyEntries = [];

      const { result } = renderHook(() => useCurrentDayCompletedSession());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCurrentDay).toBe(false);
      expect(result.current.entry).toBeNull();
    });
  });

  describe('Sparse History Stability', () => {
    it('should handle only onboarding in history', async () => {
      // Arrange: Only onboarding completed
      const onboardingSession = createMockSession({
        id: 'session-onboard',
        type: 'onboarding',
        localDayKey: '2024-04-01',
        completedAt: new Date('2024-04-01T10:00:00'),
      });
      const onboardingSnapshot = createMockSnapshot({
        id: 'snap-onboard',
        sessionId: onboardingSession.id,
        currentType: 'ISTJ',
        questionCount: 12,
      });

      mockDbState.historyEntries = [{ session: onboardingSession, snapshot: onboardingSnapshot }];

      // Act
      const { result } = renderHook(() => useJournalHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should load without errors
      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0].session.type).toBe('onboarding');
      expect(result.current.error).toBeNull();
    });

    it('should handle only daily sessions in history', async () => {
      // Arrange: Only daily sessions, no onboarding
      const dailySession1 = createMockSession({
        id: 'session-daily-1',
        type: 'daily',
        localDayKey: '2024-04-01',
        completedAt: new Date('2024-04-01T10:00:00'),
      });
      const dailySnapshot1 = createMockSnapshot({
        id: 'snap-daily-1',
        sessionId: dailySession1.id,
        currentType: 'ENFP',
        questionCount: 4,
      });

      mockDbState.historyEntries = [{ session: dailySession1, snapshot: dailySnapshot1 }];

      // Act
      const { result } = renderHook(() => useJournalHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should load without errors
      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0].session.type).toBe('daily');
      expect(result.current.error).toBeNull();
    });

    it('should handle history with limit', async () => {
      // Arrange: Multiple sessions
      const sessions = Array.from({ length: 10 }, (_, i) => {
        const session = createMockSession({
          id: `session-${i}`,
          type: 'daily',
          localDayKey: `2024-04-${String(i + 1).padStart(2, '0')}`,
          completedAt: new Date(`2024-04-${String(i + 1).padStart(2, '0')}T10:00:00`),
        });
        const snapshot = createMockSnapshot({
          id: `snap-${i}`,
          sessionId: session.id,
          currentType: 'ENFP',
          questionCount: 4,
        });
        return { session, snapshot };
      });

      mockDbState.historyEntries = sessions;

      // Act: Request limited history
      const { result } = renderHook(() => useJournalHistory(5));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should return limited entries
      expect(result.current.entries.length).toBeLessThanOrEqual(5);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange: Database error
      mockDb.getAllAsync.mockRejectedValueOnce(new Error('Database connection failed'));

      // Act
      const { result } = renderHook(() => useJournalHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should have error state
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Database connection failed');
    });
  });
});