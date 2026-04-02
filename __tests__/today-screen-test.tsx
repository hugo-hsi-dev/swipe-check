/**
 * Today Screen Tests
 *
 * Validates the Today tab handles all daily session states correctly:
 * 1. Empty state - no session started (fresh start for the day)
 * 2. In-progress state - session started but not completed
 * 3. Completed state - session completed with answers and current type displayed
 *
 * Acceptance Criteria:
 * - First open after onboarding lands in the correct Today state
 * - Reopening later the same day does not create a second session
 * - The completed state clearly shows today's review data and current type
 */

import { waitFor, renderHook } from '@testing-library/react-native';
import type { TypeSnapshot } from '@/constants/scoring-contract';
import type {
  PersistedSession,
  PersistedSessionAnswer,
} from '@/lib/local-data/session-lifecycle';

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
  usePathname: jest.fn(() => '/today'),
  useGlobalSearchParams: jest.fn(() => ({})),
  Redirect: jest.fn(() => null),
  Stack: {
    Screen: jest.fn(() => null),
  },
  Tabs: Object.assign(
    jest.fn(({ children }: { children: React.ReactNode }) => children),
    {
      Screen: jest.fn(() => null),
    }
  ),
}));

// Mock color scheme
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

// Mock database state that can be configured per test
const mockDbState: {
  todaysSession: PersistedSession | null;
  todaysAnswers: PersistedSessionAnswer[];
  todaysSnapshot: TypeSnapshot | null;
  currentTypeSnapshot: TypeSnapshot | null;
} = {
  todaysSession: null,
  todaysAnswers: [],
  todaysSnapshot: null,
  currentTypeSnapshot: null,
};

// Track if a new session was created
let sessionCreated = false;

const mockDb = {
  execAsync: jest.fn(() => Promise.resolve()),
  runAsync: jest.fn((sql: string, ...params: unknown[]) => {
    // Track session creation
    if (sql.includes('INSERT INTO sessions')) {
      sessionCreated = true;
    }
    return Promise.resolve({ changes: 1 });
  }),
  getFirstAsync: jest.fn((sql: string, ...params: unknown[]) => {
    // Check for today's daily session
    if (sql.includes("session_type = 'daily'") && sql.includes('local_day_key = ?')) {
      return Promise.resolve(
        mockDbState.todaysSession
          ? {
              id: mockDbState.todaysSession.id,
              session_type: mockDbState.todaysSession.type,
              status: mockDbState.todaysSession.status,
              local_day_key: mockDbState.todaysSession.localDayKey,
              started_at: mockDbState.todaysSession.startedAt,
              completed_at: mockDbState.todaysSession.completedAt,
              created_at: mockDbState.todaysSession.createdAt,
              updated_at: mockDbState.todaysSession.updatedAt,
            }
          : null
      );
    }
    // Check for session-specific type snapshot (must come before general snapshot check)
    if (sql.includes('FROM type_snapshots') && sql.includes('WHERE session_id = ?')) {
      if (mockDbState.todaysSnapshot && params[0] === mockDbState.todaysSnapshot.source.sessionId) {
        return Promise.resolve({
          id: mockDbState.todaysSnapshot.id,
          session_id: mockDbState.todaysSnapshot.source.sessionId ?? null,
          current_type: mockDbState.todaysSnapshot.currentType,
          axis_scores_json: JSON.stringify(mockDbState.todaysSnapshot.axisScores),
          axis_strengths_json: JSON.stringify(mockDbState.todaysSnapshot.axisStrengths),
          source_type: mockDbState.todaysSnapshot.source.type,
          source_session_id: mockDbState.todaysSnapshot.source.sessionId ?? null,
          question_count: mockDbState.todaysSnapshot.questionCount,
          created_at: mockDbState.todaysSnapshot.createdAt.toISOString(),
        });
      }
      return Promise.resolve(null);
    }
    // Check for latest type snapshot (no WHERE clause for session_id)
    if (sql.includes('FROM type_snapshots') && sql.includes('ORDER BY created_at DESC') && !sql.includes('WHERE session_id = ?')) {
      if (mockDbState.currentTypeSnapshot) {
        return Promise.resolve({
          id: mockDbState.currentTypeSnapshot.id,
          session_id: mockDbState.currentTypeSnapshot.source.sessionId ?? null,
          current_type: mockDbState.currentTypeSnapshot.currentType,
          axis_scores_json: JSON.stringify(mockDbState.currentTypeSnapshot.axisScores),
          axis_strengths_json: JSON.stringify(mockDbState.currentTypeSnapshot.axisStrengths),
          source_type: mockDbState.currentTypeSnapshot.source.type,
          source_session_id: mockDbState.currentTypeSnapshot.source.sessionId ?? null,
          question_count: mockDbState.currentTypeSnapshot.questionCount,
          created_at: mockDbState.currentTypeSnapshot.createdAt.toISOString(),
        });
      }
      return Promise.resolve(null);
    }
    return Promise.resolve(null);
  }),
  getAllAsync: jest.fn((sql: string, ...params: unknown[]) => {
    // Return session answers
    if (sql.includes('FROM session_answers') && sql.includes('WHERE session_id = ?')) {
      return Promise.resolve(
        mockDbState.todaysAnswers.map((a) => ({
          session_id: a.sessionId,
          question_id: a.questionId,
          answer: a.answer,
          answered_at: a.answeredAt,
        }))
      );
    }
    return Promise.resolve([]);
  }),
};

jest.mock('@/lib/local-data/sqlite-runtime', () => ({
  getSQLiteDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

// Import hooks after mocks
import { useDailySession } from '@/hooks/use-daily-session';
import { useCurrentTypeSnapshot } from '@/hooks/use-current-type-snapshot';
import { useTodaysSessionDetail } from '@/hooks/use-todays-session-detail';

describe('Today Screen - Daily Session States', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionCreated = false;
    // Reset state to empty
    mockDbState.todaysSession = null;
    mockDbState.todaysAnswers = [];
    mockDbState.todaysSnapshot = null;
    mockDbState.currentTypeSnapshot = null;
  });

  describe('Empty State - No Session Started', () => {
    it('should return null session when no session exists', async () => {
      // Arrange: No session for today
      mockDbState.todaysSession = null;

      // Act: Load daily session hook
      const { result } = renderHook(() => useDailySession());

      // Assert: Session is null
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.todaysSession).toBeNull();
    });

    it('should return null detail when no session exists', async () => {
      // Arrange: No session for today
      mockDbState.todaysSession = null;

      // Act: Load today's session detail hook
      const { result } = renderHook(() => useTodaysSessionDetail());

      // Assert: Detail is null
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.detail).toBeNull();
    });

    it('should make current type available when onboarding is completed', async () => {
      // Arrange: No daily session but completed onboarding with type
      mockDbState.todaysSession = null;
      mockDbState.currentTypeSnapshot = {
        id: 'onboarding-snapshot',
        currentType: 'INTJ',
        axisScores: [
          { axisId: 'e-i', poleA: { poleId: 'e', count: 0 }, poleB: { poleId: 'i', count: 3 }, totalResponses: 3 },
          { axisId: 's-n', poleA: { poleId: 's', count: 1 }, poleB: { poleId: 'n', count: 2 }, totalResponses: 3 },
          { axisId: 't-f', poleA: { poleId: 't', count: 3 }, poleB: { poleId: 'f', count: 0 }, totalResponses: 3 },
          { axisId: 'j-p', poleA: { poleId: 'j', count: 2 }, poleB: { poleId: 'p', count: 1 }, totalResponses: 3 },
        ],
        axisStrengths: [
          { axisId: 'e-i', strength: 1.0, dominantPoleId: 'i', rawDifference: 3 },
          { axisId: 's-n', strength: 0.33, dominantPoleId: 'n', rawDifference: 1 },
          { axisId: 't-f', strength: -1.0, dominantPoleId: 't', rawDifference: -3 },
          { axisId: 'j-p', strength: -0.33, dominantPoleId: 'j', rawDifference: -1 },
        ],
        createdAt: new Date(),
        source: { type: 'onboarding', sessionId: 'onboarding-session' },
        questionCount: 12,
      };

      // Act: Load hooks
      const { result: sessionResult } = renderHook(() => useDailySession());
      const { result: typeResult } = renderHook(() => useCurrentTypeSnapshot());

      await waitFor(() => {
        expect(sessionResult.current.isLoading).toBe(false);
      });
      await waitFor(() => {
        expect(typeResult.current.isLoading).toBe(false);
      });

      // Assert: Empty session state with type available
      expect(sessionResult.current.todaysSession).toBeNull();
      expect(typeResult.current.currentType).toBe('INTJ');
    });
  });

  describe('In-Progress State - Session Started but Not Completed', () => {
    it('should return in-progress session', async () => {
      // Arrange: Session exists but is in progress
      mockDbState.todaysSession = {
        id: 'in-progress-session',
        type: 'daily',
        status: 'in_progress',
        localDayKey: new Date().toISOString().split('T')[0],
        startedAt: new Date().toISOString(),
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDbState.todaysAnswers = [];

      // Act: Load daily session hook
      const { result } = renderHook(() => useDailySession());

      // Assert: Returns in-progress session
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.todaysSession).not.toBeNull();
      expect(result.current.todaysSession?.status).toBe('in_progress');
    });

    it('should return session detail with no answers', async () => {
      // Arrange: Session in progress with no answers
      mockDbState.todaysSession = {
        id: 'in-progress-session',
        type: 'daily',
        status: 'in_progress',
        localDayKey: new Date().toISOString().split('T')[0],
        startedAt: new Date().toISOString(),
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDbState.todaysAnswers = [];

      // Act: Load today's session detail hook
      const { result } = renderHook(() => useTodaysSessionDetail());

      // Assert: Returns detail with empty answers
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.detail).not.toBeNull();
      expect(result.current.detail?.session.status).toBe('in_progress');
      expect(result.current.detail?.answers).toHaveLength(0);
    });

    it('should return session detail with partial answers', async () => {
      // Arrange: Session in progress with some answers
      mockDbState.todaysSession = {
        id: 'in-progress-session',
        type: 'daily',
        status: 'in_progress',
        localDayKey: new Date().toISOString().split('T')[0],
        startedAt: new Date().toISOString(),
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDbState.todaysAnswers = [
        {
          sessionId: 'in-progress-session',
          questionId: 'q-daily-1',
          answer: 'agree',
          answeredAt: new Date().toISOString(),
        },
        {
          sessionId: 'in-progress-session',
          questionId: 'q-daily-2',
          answer: 'disagree',
          answeredAt: new Date().toISOString(),
        },
      ];

      // Act: Load today's session detail hook
      const { result } = renderHook(() => useTodaysSessionDetail());

      // Assert: Returns detail with answers
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.detail?.answers).toHaveLength(2);
    });

    it('should return null snapshot for in-progress session', async () => {
      // Arrange: Session in progress (no snapshot yet)
      mockDbState.todaysSession = {
        id: 'in-progress-session',
        type: 'daily',
        status: 'in_progress',
        localDayKey: new Date().toISOString().split('T')[0],
        startedAt: new Date().toISOString(),
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDbState.todaysAnswers = [];
      mockDbState.todaysSnapshot = null;

      // Act: Load today's session detail hook
      const { result } = renderHook(() => useTodaysSessionDetail());

      // Assert: Returns detail with null snapshot
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.detail?.snapshot).toBeNull();
    });
  });

  describe('Completed State - Session Finished', () => {
    it('should return completed session', async () => {
      // Arrange: Session is completed
      mockDbState.todaysSession = {
        id: 'completed-session',
        type: 'daily',
        status: 'completed',
        localDayKey: new Date().toISOString().split('T')[0],
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Act: Load daily session hook
      const { result } = renderHook(() => useDailySession());

      // Assert: Returns completed session
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.todaysSession?.status).toBe('completed');
    });

    it('should return session detail with answers', async () => {
      // Arrange: Session completed with answers
      mockDbState.todaysSession = {
        id: 'completed-session',
        type: 'daily',
        status: 'completed',
        localDayKey: new Date().toISOString().split('T')[0],
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDbState.todaysAnswers = [
        {
          sessionId: 'completed-session',
          questionId: 'q-daily-1',
          answer: 'agree',
          answeredAt: new Date(Date.now() - 3000000).toISOString(),
        },
        {
          sessionId: 'completed-session',
          questionId: 'q-daily-2',
          answer: 'disagree',
          answeredAt: new Date(Date.now() - 2000000).toISOString(),
        },
        {
          sessionId: 'completed-session',
          questionId: 'q-daily-3',
          answer: 'agree',
          answeredAt: new Date(Date.now() - 1000000).toISOString(),
        },
      ];

      // Act: Load today's session detail hook
      const { result } = renderHook(() => useTodaysSessionDetail());

      // Assert: Returns detail with all answers
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.detail?.answers).toHaveLength(3);
    });

    it('should return session detail with type snapshot', async () => {
      // Arrange: Session completed with snapshot
      mockDbState.todaysSession = {
        id: 'completed-session',
        type: 'daily',
        status: 'completed',
        localDayKey: new Date().toISOString().split('T')[0],
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDbState.todaysSnapshot = {
        id: 'daily-snapshot',
        currentType: 'INFJ',
        axisScores: [
          { axisId: 'e-i', poleA: { poleId: 'e', count: 0 }, poleB: { poleId: 'i', count: 1 }, totalResponses: 1 },
          { axisId: 's-n', poleA: { poleId: 's', count: 1 }, poleB: { poleId: 'n', count: 0 }, totalResponses: 1 },
          { axisId: 't-f', poleA: { poleId: 't', count: 1 }, poleB: { poleId: 'f', count: 0 }, totalResponses: 1 },
          { axisId: 'j-p', poleA: { poleId: 'j', count: 0 }, poleB: { poleId: 'p', count: 1 }, totalResponses: 1 },
        ],
        axisStrengths: [
          { axisId: 'e-i', strength: 1.0, dominantPoleId: 'i', rawDifference: 1 },
          { axisId: 's-n', strength: -1.0, dominantPoleId: 's', rawDifference: -1 },
          { axisId: 't-f', strength: -1.0, dominantPoleId: 't', rawDifference: -1 },
          { axisId: 'j-p', strength: 1.0, dominantPoleId: 'p', rawDifference: 1 },
        ],
        createdAt: new Date(),
        source: { type: 'daily', sessionId: 'completed-session' },
        questionCount: 3,
      };

      // Act: Load today's session detail hook
      const { result } = renderHook(() => useTodaysSessionDetail());

      // Assert: Returns detail with snapshot
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.detail?.snapshot).not.toBeNull();
      expect(result.current.detail?.snapshot?.currentType).toBe('INFJ');
    });

    it('should include answer values in session detail', async () => {
      // Arrange: Session completed with answers
      mockDbState.todaysSession = {
        id: 'completed-session',
        type: 'daily',
        status: 'completed',
        localDayKey: new Date().toISOString().split('T')[0],
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDbState.todaysAnswers = [
        {
          sessionId: 'completed-session',
          questionId: 'q-daily-1',
          answer: 'agree',
          answeredAt: new Date().toISOString(),
        },
        {
          sessionId: 'completed-session',
          questionId: 'q-daily-2',
          answer: 'disagree',
          answeredAt: new Date().toISOString(),
        },
      ];

      // Act: Load today's session detail hook
      const { result } = renderHook(() => useTodaysSessionDetail());

      // Assert: Returns answers with correct values
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.detail?.answers[0].answer).toBe('agree');
      expect(result.current.detail?.answers[1].answer).toBe('disagree');
    });
  });

  describe('Reopening Same Day - No Duplicate Sessions', () => {
    it('should return existing in-progress session when reopening app same day', async () => {
      // Arrange: Session was started earlier today
      const existingSession: PersistedSession = {
        id: 'existing-session',
        type: 'daily',
        status: 'in_progress',
        localDayKey: new Date().toISOString().split('T')[0],
        startedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        completedAt: null,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
      };
      mockDbState.todaysSession = existingSession;
      mockDbState.todaysAnswers = [
        {
          sessionId: 'existing-session',
          questionId: 'q-daily-1',
          answer: 'agree',
          answeredAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];

      // Act: Load hooks as if reopening the app
      const { result: sessionResult } = renderHook(() => useDailySession());
      const { result: detailResult } = renderHook(() => useTodaysSessionDetail());

      await waitFor(() => {
        expect(sessionResult.current.isLoading).toBe(false);
      });
      await waitFor(() => {
        expect(detailResult.current.isLoading).toBe(false);
      });

      // Assert: Returns the existing session (not a new one)
      expect(sessionResult.current.todaysSession?.id).toBe('existing-session');
      expect(detailResult.current.detail?.session.id).toBe('existing-session');
      expect(detailResult.current.detail?.answers).toHaveLength(1);
    });

    it('should return completed session when reopening after completion', async () => {
      // Arrange: Session was completed earlier today
      const completedSession: PersistedSession = {
        id: 'completed-session',
        type: 'daily',
        status: 'completed',
        localDayKey: new Date().toISOString().split('T')[0],
        startedAt: new Date(Date.now() - 7200000).toISOString(),
        completedAt: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      };
      mockDbState.todaysSession = completedSession;
      mockDbState.todaysAnswers = [
        {
          sessionId: 'completed-session',
          questionId: 'q-daily-1',
          answer: 'agree',
          answeredAt: new Date(Date.now() - 7000000).toISOString(),
        },
      ];
      mockDbState.todaysSnapshot = {
        id: 'daily-snapshot',
        currentType: 'ESTJ',
        axisScores: [
          { axisId: 'e-i', poleA: { poleId: 'e', count: 1 }, poleB: { poleId: 'i', count: 0 }, totalResponses: 1 },
          { axisId: 's-n', poleA: { poleId: 's', count: 1 }, poleB: { poleId: 'n', count: 0 }, totalResponses: 1 },
          { axisId: 't-f', poleA: { poleId: 't', count: 1 }, poleB: { poleId: 'f', count: 0 }, totalResponses: 1 },
          { axisId: 'j-p', poleA: { poleId: 'j', count: 1 }, poleB: { poleId: 'p', count: 0 }, totalResponses: 1 },
        ],
        axisStrengths: [
          { axisId: 'e-i', strength: -1.0, dominantPoleId: 'e', rawDifference: -1 },
          { axisId: 's-n', strength: -1.0, dominantPoleId: 's', rawDifference: -1 },
          { axisId: 't-f', strength: -1.0, dominantPoleId: 't', rawDifference: -1 },
          { axisId: 'j-p', strength: -1.0, dominantPoleId: 'j', rawDifference: -1 },
        ],
        createdAt: new Date(),
        source: { type: 'daily', sessionId: 'completed-session' },
        questionCount: 3,
      };

      // Act: Load hooks as if reopening the app
      const { result: sessionResult } = renderHook(() => useDailySession());
      const { result: detailResult } = renderHook(() => useTodaysSessionDetail());

      await waitFor(() => {
        expect(sessionResult.current.isLoading).toBe(false);
      });
      await waitFor(() => {
        expect(detailResult.current.isLoading).toBe(false);
      });

      // Assert: Returns the completed session with all data
      expect(sessionResult.current.todaysSession?.status).toBe('completed');
      expect(detailResult.current.detail?.snapshot?.currentType).toBe('ESTJ');
    });

    it('should create a new session only when explicitly starting and none exists', async () => {
      // Arrange: No session exists
      mockDbState.todaysSession = null;
      sessionCreated = false;

      // Act: Start a new session
      const { result } = renderHook(() => useDailySession());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Start the session
      await result.current.startTodaysSession();

      // Assert: A new session was created
      expect(sessionCreated).toBe(true);
    });
  });

  describe('Type Snapshot After Daily Session', () => {
    it('should show updated type after completing daily session', async () => {
      // Arrange: Completed daily session with type snapshot
      mockDbState.todaysSession = {
        id: 'daily-completed',
        type: 'daily',
        status: 'completed',
        localDayKey: new Date().toISOString().split('T')[0],
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDbState.todaysSnapshot = {
        id: 'updated-type',
        currentType: 'ENFP',
        axisScores: [
          { axisId: 'e-i', poleA: { poleId: 'e', count: 1 }, poleB: { poleId: 'i', count: 0 }, totalResponses: 1 },
          { axisId: 's-n', poleA: { poleId: 's', count: 0 }, poleB: { poleId: 'n', count: 1 }, totalResponses: 1 },
          { axisId: 't-f', poleA: { poleId: 't', count: 0 }, poleB: { poleId: 'f', count: 1 }, totalResponses: 1 },
          { axisId: 'j-p', poleA: { poleId: 'j', count: 0 }, poleB: { poleId: 'p', count: 1 }, totalResponses: 1 },
        ],
        axisStrengths: [
          { axisId: 'e-i', strength: -1.0, dominantPoleId: 'e', rawDifference: -1 },
          { axisId: 's-n', strength: 1.0, dominantPoleId: 'n', rawDifference: 1 },
          { axisId: 't-f', strength: 1.0, dominantPoleId: 'f', rawDifference: 1 },
          { axisId: 'j-p', strength: 1.0, dominantPoleId: 'p', rawDifference: 1 },
        ],
        createdAt: new Date(),
        source: { type: 'daily', sessionId: 'daily-completed' },
        questionCount: 3,
      };
      // The daily snapshot is also the current type
      mockDbState.currentTypeSnapshot = mockDbState.todaysSnapshot;

      // Act: Load hooks
      const { result: detailResult } = renderHook(() => useTodaysSessionDetail());
      const { result: typeResult } = renderHook(() => useCurrentTypeSnapshot());

      await waitFor(() => {
        expect(detailResult.current.isLoading).toBe(false);
      });
      await waitFor(() => {
        expect(typeResult.current.isLoading).toBe(false);
      });

      // Assert: Both show the updated type
      expect(detailResult.current.detail?.snapshot?.currentType).toBe('ENFP');
      expect(typeResult.current.currentType).toBe('ENFP');
    });
  });
});
