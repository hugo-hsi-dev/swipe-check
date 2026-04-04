/**
 * useInsightsData Hook Tests
 *
 * Validates the Insights hook state machine across all loading, empty, error, sparse, and populated states.
 *
 * Acceptance Criteria:
 * - Loading state is correctly emitted on first render
 * - Empty state is emitted when no snapshots exist
 * - Error state is emitted when DB access fails
 * - Sparse state is emitted when exactly one snapshot exists
 * - Populated state is emitted when multiple snapshots exist
 */

import { waitFor, renderHook } from '@testing-library/react-native';
import type { TypeSnapshot } from '@/constants/scoring-contract';

jest.mock('@/lib/local-data/sqlite-runtime', () => ({
  getSQLiteDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

const mockDb = {
  execAsync: jest.fn(() => Promise.resolve()),
  runAsync: jest.fn(() => Promise.resolve({ changes: 1 })),
  getFirstAsync: jest.fn() as jest.Mock,
  getAllAsync: jest.fn(() => Promise.resolve([])) as jest.Mock,
};

import { useInsightsData } from '@/hooks/use-insights-data';

function createMockSnapshot({
  id,
  currentType,
  questionCount,
  sourceType,
  sessionId,
}: {
  id: string;
  currentType: string;
  questionCount: number;
  sourceType: 'onboarding' | 'daily' | 'manual';
  sessionId?: string;
}): TypeSnapshot {
  return {
    id,
    currentType,
    axisScores: [
      {
        axisId: 'e-i',
        poleA: { poleId: 'e', count: 0 },
        poleB: { poleId: 'i', count: 3 },
        totalResponses: 3,
      },
      {
        axisId: 's-n',
        poleA: { poleId: 's', count: 1 },
        poleB: { poleId: 'n', count: 2 },
        totalResponses: 3,
      },
      {
        axisId: 't-f',
        poleA: { poleId: 't', count: 3 },
        poleB: { poleId: 'f', count: 0 },
        totalResponses: 3,
      },
      {
        axisId: 'j-p',
        poleA: { poleId: 'j', count: 2 },
        poleB: { poleId: 'p', count: 1 },
        totalResponses: 3,
      },
    ],
    axisStrengths: [
      { axisId: 'e-i', strength: 1.0, dominantPoleId: 'i', rawDifference: 3 },
      { axisId: 's-n', strength: 0.33, dominantPoleId: 'n', rawDifference: 1 },
      { axisId: 't-f', strength: -1.0, dominantPoleId: 't', rawDifference: -3 },
      { axisId: 'j-p', strength: -0.33, dominantPoleId: 'j', rawDifference: -1 },
    ],
    createdAt: new Date('2024-04-01T10:00:00Z'),
    source: { type: sourceType, sessionId },
    questionCount,
  };
}

function mapSnapshotRow(snapshot: TypeSnapshot) {
  return {
    id: snapshot.id,
    session_id: snapshot.source.sessionId ?? null,
    current_type: snapshot.currentType,
    axis_scores_json: JSON.stringify(snapshot.axisScores),
    axis_strengths_json: JSON.stringify(snapshot.axisStrengths),
    source_type: snapshot.source.type,
    source_session_id: snapshot.source.sessionId ?? null,
    question_count: snapshot.questionCount,
    created_at: snapshot.createdAt.toISOString(),
  };
}

describe('useInsightsData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Loading State', () => {
    it('should emit loading state on first render', () => {
      const { result } = renderHook(() => useInsightsData());

      expect(result.current.status).toBe('loading');
    });
  });

  describe('Empty State', () => {
    it('should emit empty state when no snapshots exist', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      const { result } = renderHook(() => useInsightsData());

      await waitFor(() => {
        expect(result.current.status).toBe('empty');
      });

      expect(result.current).toEqual({ status: 'empty' });
    });
  });

  describe('Error State', () => {
    it('should emit error state when DB access fails', async () => {
      const error = new Error('Database connection failed');
      mockDb.getAllAsync.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useInsightsData());

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current).toEqual({ status: 'error', error });
    });

    it('should wrap non-error errors', async () => {
      const nonError = 'Database connection failed';
      mockDb.getAllAsync.mockRejectedValueOnce(nonError);

      const { result } = renderHook(() => useInsightsData());

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current).toEqual({
        status: 'error',
        error: new Error(nonError),
      });
    });
  });

  describe('Sparse State', () => {
    it('should emit sparse state when exactly one snapshot exists', async () => {
      const snapshot = createMockSnapshot({
        id: 'snap-001',
        sessionId: 'session-001',
        currentType: 'INTJ',
        questionCount: 12,
        sourceType: 'onboarding',
      });

      mockDb.getAllAsync.mockResolvedValueOnce([mapSnapshotRow(snapshot)]);

      const { result } = renderHook(() => useInsightsData());

      await waitFor(() => {
        expect(result.current.status).toBe('sparse');
      });

      expect(result.current).toEqual({
        status: 'sparse',
        latestType: 'INTJ',
        latestSnapshot: snapshot,
        history: [snapshot],
      });
    });
  });

  describe('Populated State', () => {
    it('should emit populated state when multiple snapshots exist', async () => {
      const snapshot1 = createMockSnapshot({
        id: 'snap-001',
        sessionId: 'session-001',
        currentType: 'INTJ',
        questionCount: 12,
        sourceType: 'onboarding',
      });

      const snapshot2 = createMockSnapshot({
        id: 'snap-002',
        sessionId: 'session-002',
        currentType: 'ENTJ',
        questionCount: 4,
        sourceType: 'daily',
      });

      mockDb.getAllAsync.mockResolvedValueOnce([mapSnapshotRow(snapshot1), mapSnapshotRow(snapshot2)]);

      const { result } = renderHook(() => useInsightsData());

      await waitFor(() => {
        expect(result.current.status).toBe('populated');
      });

      expect(result.current).toEqual({
        status: 'populated',
        latestType: 'ENTJ',
        latestSnapshot: snapshot2,
        history: [snapshot1, snapshot2],
      });
    });
  });

  describe('Race Condition Prevention', () => {
    it('should guarantee latestSnapshot matches first element of sorted history', async () => {
      const snapshot1 = createMockSnapshot({
        id: 'snap-001',
        sessionId: 'session-001',
        currentType: 'INTJ',
        questionCount: 12,
        sourceType: 'onboarding',
      });

      const snapshot2 = createMockSnapshot({
        id: 'snap-002',
        sessionId: 'session-002',
        currentType: 'ENTJ',
        questionCount: 4,
        sourceType: 'daily',
      });

      const snapshot3 = createMockSnapshot({
        id: 'snap-003',
        sessionId: 'session-003',
        currentType: 'ESTJ',
        questionCount: 4,
        sourceType: 'daily',
      });

      mockDb.getAllAsync.mockResolvedValueOnce([mapSnapshotRow(snapshot1), mapSnapshotRow(snapshot2), mapSnapshotRow(snapshot3)]);

      const { result } = renderHook(() => useInsightsData());

      await waitFor(() => {
        expect(result.current.status).toBe('populated');
      });

      const state = result.current;
      if (state.status === 'populated') {
        const sortedHistory = [...state.history].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id.localeCompare(a.id)
        );
        expect(state.latestSnapshot).toEqual(sortedHistory[0]);
        expect(state.latestType).toBe(sortedHistory[0].currentType);
      }
    });
  });
});