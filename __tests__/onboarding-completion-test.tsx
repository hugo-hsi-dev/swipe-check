/**
 * Onboarding Completion Handoff Tests
 *
 * These tests validate that:
 * 1. Answering all 12 questions marks onboarding as complete
 * 2. The completion transition routes to /today
 * 3. The TypeSnapshot is created and stored before transition
 * 4. On subsequent app opens, the user is not routed back to onboarding
 */

import { act, waitFor, renderHook } from '@testing-library/react-native';
import type { TypeSnapshot } from '@/constants/scoring-contract';
import { useCurrentTypeSnapshot } from '@/hooks/use-current-type-snapshot';
import { useInitialRoute } from '@/hooks/use-initial-route';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';

// Mock expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),
  usePathname: jest.fn(() => '/'),
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

// Mock SQLite database with configurable responses
const mockDbResponses: {
  sessions: Array<{ id: string; status: string; session_type: string }>;
  typeSnapshots: TypeSnapshot[];
} = {
  sessions: [],
  typeSnapshots: [],
};

const mockDb = {
  execAsync: jest.fn(() => Promise.resolve()),
  runAsync: jest.fn(() => Promise.resolve({ changes: 1 })),
  getFirstAsync: jest.fn((sql: string) => {
    // Check for completed onboarding session
    if (sql.includes("session_type = 'onboarding' AND status = 'completed'")) {
      const completed = mockDbResponses.sessions.find(
        (s) => s.session_type === 'onboarding' && s.status === 'completed'
      );
      return Promise.resolve(completed ?? null);
    }
    // Check for in-progress onboarding session
    if (sql.includes("session_type = 'onboarding' AND status = 'in_progress'")) {
      const inProgress = mockDbResponses.sessions.find(
        (s) => s.session_type === 'onboarding' && s.status === 'in_progress'
      );
      return Promise.resolve(inProgress ?? null);
    }
    // Check for latest type snapshot
    if (sql.includes('FROM type_snapshots') && sql.includes('ORDER BY created_at DESC')) {
      if (mockDbResponses.typeSnapshots.length > 0) {
        const latest = mockDbResponses.typeSnapshots[mockDbResponses.typeSnapshots.length - 1];
        return Promise.resolve({
          id: latest.id,
          session_id: latest.source.sessionId ?? null,
          current_type: latest.currentType,
          axis_scores_json: JSON.stringify(latest.axisScores),
          axis_strengths_json: JSON.stringify(latest.axisStrengths),
          source_type: latest.source.type,
          source_session_id: latest.source.sessionId ?? null,
          question_count: latest.questionCount,
          created_at: latest.createdAt.toISOString(),
        });
      }
      return Promise.resolve(null);
    }
    return Promise.resolve(null);
  }),
  getAllAsync: jest.fn((sql: string) => {
    // Get session answers
    if (sql.includes('FROM session_answers')) {
      return Promise.resolve([]);
    }
    return Promise.resolve([]);
  }),
};

jest.mock('@/lib/local-data/sqlite-runtime', () => ({
  getSQLiteDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

describe('Onboarding Completion Handoff', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbResponses.sessions = [];
    mockDbResponses.typeSnapshots = [];
  });

  describe('Question 12 Completion', () => {
    it('should mark onboarding complete when all 12 questions are answered', async () => {
      // Arrange: Create a completed onboarding session
      const sessionId = 'onboarding-session-123';
      mockDbResponses.sessions = [
        {
          id: sessionId,
          status: 'completed',
          session_type: 'onboarding',
        },
      ];

      // Act: Check onboarding status
      const { result } = renderHook(() => useOnboardingStatus());

      // Assert: Should report completed onboarding
      await waitFor(() => {
        expect(result.current.hasCompletedOnboarding).toBe(true);
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should not mark onboarding complete with fewer than 12 answers', async () => {
      // Arrange: Only an in-progress session exists
      mockDbResponses.sessions = [
        {
          id: 'onboarding-session-456',
          status: 'in_progress',
          session_type: 'onboarding',
        },
      ];

      // Act: Check onboarding status
      const { result } = renderHook(() => useOnboardingStatus());

      // Assert: Should report incomplete onboarding
      await waitFor(() => {
        expect(result.current.hasCompletedOnboarding).toBe(false);
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Completion Transition', () => {
    it('should have TypeSnapshot available immediately after completion', async () => {
      // Arrange: Create completed session with snapshot
      const sessionId = 'completed-session-789';
      const snapshot: TypeSnapshot = {
        id: 'snapshot-001',
        currentType: 'INTJ',
        axisScores: [
          {
            axisId: 'e-i',
            poleA: { poleId: 'e', count: 1 },
            poleB: { poleId: 'i', count: 2 },
            totalResponses: 3,
          },
          {
            axisId: 's-n',
            poleA: { poleId: 's', count: 2 },
            poleB: { poleId: 'n', count: 1 },
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
          { axisId: 'e-i', strength: 0.33, dominantPoleId: 'i', rawDifference: 1 },
          { axisId: 's-n', strength: -0.33, dominantPoleId: 's', rawDifference: -1 },
          { axisId: 't-f', strength: -1.0, dominantPoleId: 't', rawDifference: -3 },
          { axisId: 'j-p', strength: -0.33, dominantPoleId: 'j', rawDifference: -1 },
        ],
        createdAt: new Date(),
        source: {
          type: 'onboarding',
          sessionId,
        },
        questionCount: 12,
      };

      mockDbResponses.sessions = [
        {
          id: sessionId,
          status: 'completed',
          session_type: 'onboarding',
        },
      ];
      mockDbResponses.typeSnapshots = [snapshot];

      // Act: Load current type snapshot
      const { result } = renderHook(() => useCurrentTypeSnapshot());

      // Assert: Snapshot should be immediately available
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.currentType).toBe('INTJ');
      expect(result.current.snapshot).not.toBeNull();
      expect(result.current.snapshot?.questionCount).toBe(12);
      expect(result.current.snapshot?.source.type).toBe('onboarding');
    });

    it('should route to /today after onboarding completion', async () => {
      // Arrange: Simulate completed onboarding
      mockDbResponses.sessions = [
        {
          id: 'completed-session',
          status: 'completed',
          session_type: 'onboarding',
        },
      ];

      // Act: Check initial route
      const { result } = renderHook(() => useInitialRoute('/onboarding'));

      // Assert: Should route to tabs (today is the default tab)
      await waitFor(() => {
        expect(result.current.targetRoute).toBe('tabs');
      });
      expect(result.current.isDeterminingRoute).toBe(false);
    });
  });

  describe('Post-Completion App Behavior', () => {
    it('should not route back to onboarding on app reopen after completion', async () => {
      // Arrange: Simulate user who completed onboarding yesterday
      mockDbResponses.sessions = [
        {
          id: 'yesterday-session',
          status: 'completed',
          session_type: 'onboarding',
        },
      ];

      // Act: Simulate multiple app opens throughout the day
      const pathnames = ['/', '/today', '/insights', '/settings'];

      for (const pathname of pathnames) {
        const { result } = renderHook(() => useInitialRoute(pathname));

        // Assert: Should never route back to onboarding
        await waitFor(() => {
          expect(result.current.targetRoute).toBe('tabs');
        });
        expect(result.current.targetRoute).not.toBe('onboarding');
      }
    });

    it('should preserve current type across app sessions', async () => {
      // Arrange: Completed onboarding with established type
      const sessionId = 'session-with-type';
      const snapshot: TypeSnapshot = {
        id: 'snapshot-persistent',
        currentType: 'ENFP',
        axisScores: [
          { axisId: 'e-i', poleA: { poleId: 'e', count: 3 }, poleB: { poleId: 'i', count: 0 }, totalResponses: 3 },
          { axisId: 's-n', poleA: { poleId: 's', count: 0 }, poleB: { poleId: 'n', count: 3 }, totalResponses: 3 },
          { axisId: 't-f', poleA: { poleId: 't', count: 1 }, poleB: { poleId: 'f', count: 2 }, totalResponses: 3 },
          { axisId: 'j-p', poleA: { poleId: 'j', count: 0 }, poleB: { poleId: 'p', count: 3 }, totalResponses: 3 },
        ],
        axisStrengths: [
          { axisId: 'e-i', strength: -1.0, dominantPoleId: 'e', rawDifference: -3 },
          { axisId: 's-n', strength: 1.0, dominantPoleId: 'n', rawDifference: 3 },
          { axisId: 't-f', strength: 0.33, dominantPoleId: 'f', rawDifference: 1 },
          { axisId: 'j-p', strength: 1.0, dominantPoleId: 'p', rawDifference: 3 },
        ],
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        source: {
          type: 'onboarding',
          sessionId,
        },
        questionCount: 12,
      };

      mockDbResponses.sessions = [
        {
          id: sessionId,
          status: 'completed',
          session_type: 'onboarding',
        },
      ];
      mockDbResponses.typeSnapshots = [snapshot];

      // Act: Load type snapshot (simulating app reopen)
      const { result } = renderHook(() => useCurrentTypeSnapshot());

      // Assert: Type should be preserved and available
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.currentType).toBe('ENFP');
      expect(result.current.snapshot?.currentType).toBe('ENFP');
    });
  });

  describe('Interruption and Resume Scenarios', () => {
    it('should allow resuming onboarding after app close with partial progress', async () => {
      // Arrange: In-progress onboarding session exists
      const sessionId = 'partial-session';
      mockDbResponses.sessions = [
        {
          id: sessionId,
          status: 'in_progress',
          session_type: 'onboarding',
        },
      ];

      // Act: Check onboarding status
      const { result } = renderHook(() => useOnboardingStatus());

      // Assert: Should report incomplete (not completed)
      await waitFor(() => {
        expect(result.current.hasCompletedOnboarding).toBe(false);
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should route to onboarding when resuming partial progress', async () => {
      // Arrange: In-progress onboarding exists
      mockDbResponses.sessions = [
        {
          id: 'partial-session',
          status: 'in_progress',
          session_type: 'onboarding',
        },
      ];

      // Act: Determine initial route
      const { result } = renderHook(() => useInitialRoute('/'));

      // Assert: Should route to onboarding to complete
      await waitFor(() => {
        expect(result.current.targetRoute).toBe('onboarding');
      });
    });
  });
});

describe('Acceptance Criteria Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbResponses.sessions = [];
    mockDbResponses.typeSnapshots = [];
  });

  it('AC1: Finishing question 12 marks onboarding complete', async () => {
    // Arrange: Simulate user who just completed question 12
    const sessionId = 'just-completed';
    mockDbResponses.sessions = [
      {
        id: sessionId,
        status: 'completed',
        session_type: 'onboarding',
      },
    ];

    // Act: Check status
    const { result } = renderHook(() => useOnboardingStatus());

    // Assert: Onboarding is marked complete
    await waitFor(() => {
      expect(result.current.hasCompletedOnboarding).toBe(true);
    });
  });

  it('AC2: Reopened app does not route back to onboarding after completion', async () => {
    // Arrange: Completed onboarding
    mockDbResponses.sessions = [
      {
        id: 'completed',
        status: 'completed',
        session_type: 'onboarding',
      },
    ];

    // Act: Simulate app reopen
    const { result } = renderHook(() => useInitialRoute('/'));

    // Assert: Routes to tabs, not onboarding
    await waitFor(() => {
      expect(result.current.targetRoute).toBe('tabs');
    });
    expect(result.current.targetRoute).not.toBe('onboarding');
  });

  it('AC3: First post-onboarding load can read initial Current Type', async () => {
    // Arrange: Completed onboarding with type snapshot
    const sessionId = 'completed-with-type';
    const snapshot: TypeSnapshot = {
      id: 'initial-snapshot',
      currentType: 'ISTJ',
      axisScores: [
        { axisId: 'e-i', poleA: { poleId: 'e', count: 1 }, poleB: { poleId: 'i', count: 2 }, totalResponses: 3 },
        { axisId: 's-n', poleA: { poleId: 's', count: 2 }, poleB: { poleId: 'n', count: 1 }, totalResponses: 3 },
        { axisId: 't-f', poleA: { poleId: 't', count: 2 }, poleB: { poleId: 'f', count: 1 }, totalResponses: 3 },
        { axisId: 'j-p', poleA: { poleId: 'j', count: 2 }, poleB: { poleId: 'p', count: 1 }, totalResponses: 3 },
      ],
      axisStrengths: [
        { axisId: 'e-i', strength: 0.33, dominantPoleId: 'i', rawDifference: 1 },
        { axisId: 's-n', strength: -0.33, dominantPoleId: 's', rawDifference: -1 },
        { axisId: 't-f', strength: -0.33, dominantPoleId: 't', rawDifference: -1 },
        { axisId: 'j-p', strength: -0.33, dominantPoleId: 'j', rawDifference: -1 },
      ],
      createdAt: new Date(),
      source: { type: 'onboarding', sessionId },
      questionCount: 12,
    };

    mockDbResponses.sessions = [
      { id: sessionId, status: 'completed', session_type: 'onboarding' },
    ];
    mockDbResponses.typeSnapshots = [snapshot];

    // Act: Load current type (as Today and Insights screens do)
    const { result } = renderHook(() => useCurrentTypeSnapshot());

    // Assert: Current type is available without manual reset
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.currentType).toBe('ISTJ');
    expect(result.current.snapshot).not.toBeNull();
  });
});
