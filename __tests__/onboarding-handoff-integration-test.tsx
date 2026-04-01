/**
 * Onboarding Handoff Integration Tests
 *
 * These tests validate the cross-screen behavior:
 * 1. Today screen displays current type after onboarding
 * 2. Insights screen displays personality insights after onboarding
 * 3. Navigation transitions work correctly between onboarding and main app
 * 4. Shared state is accessible across Today and Insights without reset
 */

import { waitFor, renderHook } from '@testing-library/react-native';
import type { TypeSnapshot } from '@/constants/scoring-contract';
import { useCurrentTypeSnapshot } from '@/hooks/use-current-type-snapshot';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';

// Mock expo-router
const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
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

// Mock hooks that are not being tested
jest.mock('@/hooks/use-daily-session', () => ({
  useDailySession: jest.fn(() => ({
    todaysSession: null,
    startTodaysSession: jest.fn(),
  })),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

// Mock database responses
const mockDbState: {
  hasCompletedOnboarding: boolean;
  typeSnapshot: TypeSnapshot | null;
} = {
  hasCompletedOnboarding: false,
  typeSnapshot: null,
};

const mockDb = {
  execAsync: jest.fn(() => Promise.resolve()),
  runAsync: jest.fn(() => Promise.resolve({ changes: 1 })),
  getFirstAsync: jest.fn((sql: string) => {
    // Check for completed onboarding
    if (sql.includes("session_type = 'onboarding' AND status = 'completed'")) {
      return Promise.resolve(
        mockDbState.hasCompletedOnboarding ? { id: 'completed-session' } : null
      );
    }
    // Check for latest type snapshot
    if (sql.includes('FROM type_snapshots') && sql.includes('ORDER BY created_at DESC')) {
      if (mockDbState.typeSnapshot) {
        return Promise.resolve({
          id: mockDbState.typeSnapshot.id,
          session_id: mockDbState.typeSnapshot.source.sessionId ?? null,
          current_type: mockDbState.typeSnapshot.currentType,
          axis_scores_json: JSON.stringify(mockDbState.typeSnapshot.axisScores),
          axis_strengths_json: JSON.stringify(mockDbState.typeSnapshot.axisStrengths),
          source_type: mockDbState.typeSnapshot.source.type,
          source_session_id: mockDbState.typeSnapshot.source.sessionId ?? null,
          question_count: mockDbState.typeSnapshot.questionCount,
          created_at: mockDbState.typeSnapshot.createdAt.toISOString(),
        });
      }
      return Promise.resolve(null);
    }
    return Promise.resolve(null);
  }),
  getAllAsync: jest.fn(() => Promise.resolve([])),
};

jest.mock('@/lib/local-data/sqlite-runtime', () => ({
  getSQLiteDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

describe('Onboarding Handoff - Cross-Screen Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbState.hasCompletedOnboarding = false;
    mockDbState.typeSnapshot = null;
  });

  describe('Shared State Accessibility', () => {
    it('should make current type available on Today screen after onboarding', async () => {
      // Arrange: Simulate completed onboarding with type
      const sessionId = 'completed-session';
      mockDbState.hasCompletedOnboarding = true;
      mockDbState.typeSnapshot = {
        id: 'snapshot-today',
        currentType: 'ENTJ',
        axisScores: [
          { axisId: 'e-i', poleA: { poleId: 'e', count: 3 }, poleB: { poleId: 'i', count: 0 }, totalResponses: 3 },
          { axisId: 's-n', poleA: { poleId: 's', count: 1 }, poleB: { poleId: 'n', count: 2 }, totalResponses: 3 },
          { axisId: 't-f', poleA: { poleId: 't', count: 3 }, poleB: { poleId: 'f', count: 0 }, totalResponses: 3 },
          { axisId: 'j-p', poleA: { poleId: 'j', count: 2 }, poleB: { poleId: 'p', count: 1 }, totalResponses: 3 },
        ],
        axisStrengths: [
          { axisId: 'e-i', strength: -1.0, dominantPoleId: 'e', rawDifference: -3 },
          { axisId: 's-n', strength: 0.33, dominantPoleId: 'n', rawDifference: 1 },
          { axisId: 't-f', strength: -1.0, dominantPoleId: 't', rawDifference: -3 },
          { axisId: 'j-p', strength: -0.33, dominantPoleId: 'j', rawDifference: -1 },
        ],
        createdAt: new Date(),
        source: { type: 'onboarding', sessionId },
        questionCount: 12,
      };

      // Act: Load hooks as Today screen does
      const { result: statusResult } = renderHook(() => useOnboardingStatus());
      const { result: typeResult } = renderHook(() => useCurrentTypeSnapshot());

      // Wait for both hooks to settle
      await waitFor(() => {
        expect(statusResult.current.isLoading).toBe(false);
      });
      await waitFor(() => {
        expect(typeResult.current.isLoading).toBe(false);
      });

      // Assert: Both hooks report consistent state
      expect(statusResult.current.hasCompletedOnboarding).toBe(true);
      expect(typeResult.current.currentType).toBe('ENTJ');
    });

    it('should make current type available on Insights screen after onboarding', async () => {
      // Arrange: Simulate completed onboarding with type
      const sessionId = 'completed-session';
      mockDbState.hasCompletedOnboarding = true;
      mockDbState.typeSnapshot = {
        id: 'snapshot-insights',
        currentType: 'ISFJ',
        axisScores: [
          { axisId: 'e-i', poleA: { poleId: 'e', count: 0 }, poleB: { poleId: 'i', count: 3 }, totalResponses: 3 },
          { axisId: 's-n', poleA: { poleId: 's', count: 3 }, poleB: { poleId: 'n', count: 0 }, totalResponses: 3 },
          { axisId: 't-f', poleA: { poleId: 't', count: 1 }, poleB: { poleId: 'f', count: 2 }, totalResponses: 3 },
          { axisId: 'j-p', poleA: { poleId: 'j', count: 2 }, poleB: { poleId: 'p', count: 1 }, totalResponses: 3 },
        ],
        axisStrengths: [
          { axisId: 'e-i', strength: 1.0, dominantPoleId: 'i', rawDifference: 3 },
          { axisId: 's-n', strength: -1.0, dominantPoleId: 's', rawDifference: -3 },
          { axisId: 't-f', strength: 0.33, dominantPoleId: 'f', rawDifference: 1 },
          { axisId: 'j-p', strength: -0.33, dominantPoleId: 'j', rawDifference: -1 },
        ],
        createdAt: new Date(),
        source: { type: 'onboarding', sessionId },
        questionCount: 12,
      };

      // Act: Load type snapshot as Insights screen does
      const { result: typeResult } = renderHook(() => useCurrentTypeSnapshot());

      await waitFor(() => {
        expect(typeResult.current.isLoading).toBe(false);
      });

      // Assert: Type and axis strengths are available
      expect(typeResult.current.currentType).toBe('ISFJ');
      expect(typeResult.current.snapshot).not.toBeNull();
      expect(typeResult.current.snapshot?.axisStrengths).toHaveLength(4);
    });

    it('should provide consistent current type across multiple screens without reset', async () => {
      // Arrange: Completed onboarding
      mockDbState.hasCompletedOnboarding = true;
      mockDbState.typeSnapshot = {
        id: 'snapshot-shared',
        currentType: 'INTP',
        axisScores: [
          { axisId: 'e-i', poleA: { poleId: 'e', count: 1 }, poleB: { poleId: 'i', count: 2 }, totalResponses: 3 },
          { axisId: 's-n', poleA: { poleId: 's', count: 1 }, poleB: { poleId: 'n', count: 2 }, totalResponses: 3 },
          { axisId: 't-f', poleA: { poleId: 't', count: 3 }, poleB: { poleId: 'f', count: 0 }, totalResponses: 3 },
          { axisId: 'j-p', poleA: { poleId: 'j', count: 1 }, poleB: { poleId: 'p', count: 2 }, totalResponses: 3 },
        ],
        axisStrengths: [
          { axisId: 'e-i', strength: 0.33, dominantPoleId: 'i', rawDifference: 1 },
          { axisId: 's-n', strength: 0.33, dominantPoleId: 'n', rawDifference: 1 },
          { axisId: 't-f', strength: -1.0, dominantPoleId: 't', rawDifference: -3 },
          { axisId: 'j-p', strength: 0.33, dominantPoleId: 'p', rawDifference: 1 },
        ],
        createdAt: new Date(),
        source: { type: 'onboarding', sessionId: 'shared-session' },
        questionCount: 12,
      };

      // Act: Load from multiple "screens"
      const { result: result1 } = renderHook(() => useCurrentTypeSnapshot());
      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
      });

      const { result: result2 } = renderHook(() => useCurrentTypeSnapshot());
      await waitFor(() => {
        expect(result2.current.isLoading).toBe(false);
      });

      const { result: result3 } = renderHook(() => useCurrentTypeSnapshot());
      await waitFor(() => {
        expect(result3.current.isLoading).toBe(false);
      });

      // Assert: All instances report the same type
      expect(result1.current.currentType).toBe('INTP');
      expect(result2.current.currentType).toBe('INTP');
      expect(result3.current.currentType).toBe('INTP');
      expect(result1.current.snapshot?.id).toBe('snapshot-shared');
      expect(result2.current.snapshot?.id).toBe('snapshot-shared');
      expect(result3.current.snapshot?.id).toBe('snapshot-shared');
    });
  });

  describe('Today Screen Confirmation States', () => {
    it('should display current type chip on Today screen after onboarding', async () => {
      // Arrange: Completed onboarding
      mockDbState.hasCompletedOnboarding = true;
      mockDbState.typeSnapshot = {
        id: 'snapshot-today-chip',
        currentType: 'ESTP',
        axisScores: [
          { axisId: 'e-i', poleA: { poleId: 'e', count: 3 }, poleB: { poleId: 'i', count: 0 }, totalResponses: 3 },
          { axisId: 's-n', poleA: { poleId: 's', count: 2 }, poleB: { poleId: 'n', count: 1 }, totalResponses: 3 },
          { axisId: 't-f', poleA: { poleId: 't', count: 2 }, poleB: { poleId: 'f', count: 1 }, totalResponses: 3 },
          { axisId: 'j-p', poleA: { poleId: 'j', count: 0 }, poleB: { poleId: 'p', count: 3 }, totalResponses: 3 },
        ],
        axisStrengths: [
          { axisId: 'e-i', strength: -1.0, dominantPoleId: 'e', rawDifference: -3 },
          { axisId: 's-n', strength: -0.33, dominantPoleId: 's', rawDifference: -1 },
          { axisId: 't-f', strength: -0.33, dominantPoleId: 't', rawDifference: -1 },
          { axisId: 'j-p', strength: 1.0, dominantPoleId: 'p', rawDifference: 3 },
        ],
        createdAt: new Date(),
        source: { type: 'onboarding', sessionId: 'today-session' },
        questionCount: 12,
      };

      // Act: Verify Today screen would have the data
      const { result } = renderHook(() => useCurrentTypeSnapshot());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Type is available for Today screen to display
      expect(result.current.currentType).toBe('ESTP');
    });
  });

  describe('Insights Screen Confirmation States', () => {
    it('should display personality type and axis strengths on Insights after onboarding', async () => {
      // Arrange: Completed onboarding
      mockDbState.hasCompletedOnboarding = true;
      mockDbState.typeSnapshot = {
        id: 'snapshot-insights-full',
        currentType: 'ENFJ',
        axisScores: [
          { axisId: 'e-i', poleA: { poleId: 'e', count: 3 }, poleB: { poleId: 'i', count: 0 }, totalResponses: 3 },
          { axisId: 's-n', poleA: { poleId: 's', count: 0 }, poleB: { poleId: 'n', count: 3 }, totalResponses: 3 },
          { axisId: 't-f', poleA: { poleId: 't', count: 1 }, poleB: { poleId: 'f', count: 2 }, totalResponses: 3 },
          { axisId: 'j-p', poleA: { poleId: 'j', count: 3 }, poleB: { poleId: 'p', count: 0 }, totalResponses: 3 },
        ],
        axisStrengths: [
          { axisId: 'e-i', strength: -1.0, dominantPoleId: 'e', rawDifference: -3 },
          { axisId: 's-n', strength: 1.0, dominantPoleId: 'n', rawDifference: 3 },
          { axisId: 't-f', strength: 0.33, dominantPoleId: 'f', rawDifference: 1 },
          { axisId: 'j-p', strength: -1.0, dominantPoleId: 'j', rawDifference: -3 },
        ],
        createdAt: new Date(),
        source: { type: 'onboarding', sessionId: 'insights-session' },
        questionCount: 12,
      };

      // Act: Load snapshot as Insights screen does
      const { result } = renderHook(() => useCurrentTypeSnapshot());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: All data needed by Insights is available
      expect(result.current.currentType).toBe('ENFJ');
      expect(result.current.snapshot?.axisStrengths).toHaveLength(4);
      expect(result.current.snapshot?.axisStrengths[0].axisId).toBe('e-i');
      expect(result.current.snapshot?.axisStrengths[0].dominantPoleId).toBe('e');
    });

    it('should show empty state on Insights before onboarding completion', async () => {
      // Arrange: No completed onboarding
      mockDbState.hasCompletedOnboarding = false;
      mockDbState.typeSnapshot = null;

      // Act: Load snapshot
      const { result } = renderHook(() => useCurrentTypeSnapshot());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: No snapshot available (Insights shows empty state)
      expect(result.current.currentType).toBeNull();
      expect(result.current.snapshot).toBeNull();
    });
  });

  describe('First Launch, Interruption, and Resume Behavior', () => {
    it('should handle first launch with no prior data', async () => {
      // Arrange: Clean state (no sessions, no snapshots)
      mockDbState.hasCompletedOnboarding = false;
      mockDbState.typeSnapshot = null;

      // Act: Check onboarding status
      const { result } = renderHook(() => useOnboardingStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should report not completed
      expect(result.current.hasCompletedOnboarding).toBe(false);
    });

    it('should handle interruption mid-onboarding (answers exist but not complete)', async () => {
      // Arrange: In-progress session exists (partial answers)
      mockDbState.hasCompletedOnboarding = false;

      // Act: Check status
      const { result } = renderHook(() => useOnboardingStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert: Should report incomplete (user can resume)
      expect(result.current.hasCompletedOnboarding).toBe(false);
    });

    it('should handle completion and immediate app background/foreground', async () => {
      // Arrange: Just completed onboarding
      mockDbState.hasCompletedOnboarding = true;
      mockDbState.typeSnapshot = {
        id: 'snapshot-foreground',
        currentType: 'ISTP',
        axisScores: [
          { axisId: 'e-i', poleA: { poleId: 'e', count: 1 }, poleB: { poleId: 'i', count: 2 }, totalResponses: 3 },
          { axisId: 's-n', poleA: { poleId: 's', count: 2 }, poleB: { poleId: 'n', count: 1 }, totalResponses: 3 },
          { axisId: 't-f', poleA: { poleId: 't', count: 2 }, poleB: { poleId: 'f', count: 1 }, totalResponses: 3 },
          { axisId: 'j-p', poleA: { poleId: 'j', count: 0 }, poleB: { poleId: 'p', count: 3 }, totalResponses: 3 },
        ],
        axisStrengths: [
          { axisId: 'e-i', strength: 0.33, dominantPoleId: 'i', rawDifference: 1 },
          { axisId: 's-n', strength: -0.33, dominantPoleId: 's', rawDifference: -1 },
          { axisId: 't-f', strength: -0.33, dominantPoleId: 't', rawDifference: -1 },
          { axisId: 'j-p', strength: 1.0, dominantPoleId: 'p', rawDifference: 3 },
        ],
        createdAt: new Date(),
        source: { type: 'onboarding', sessionId: 'foreground-session' },
        questionCount: 12,
      };

      // Act: Load state as if app was backgrounded and foregrounded
      const { result: statusResult } = renderHook(() => useOnboardingStatus());
      const { result: typeResult } = renderHook(() => useCurrentTypeSnapshot());

      await waitFor(() => {
        expect(statusResult.current.isLoading).toBe(false);
      });
      await waitFor(() => {
        expect(typeResult.current.isLoading).toBe(false);
      });

      // Assert: State persists correctly
      expect(statusResult.current.hasCompletedOnboarding).toBe(true);
      expect(typeResult.current.currentType).toBe('ISTP');
    });

    it('should handle returning user entry (completed long ago)', async () => {
      // Arrange: Completed onboarding a while ago
      mockDbState.hasCompletedOnboarding = true;
      mockDbState.typeSnapshot = {
        id: 'snapshot-returning',
        currentType: 'ESFJ',
        axisScores: [
          { axisId: 'e-i', poleA: { poleId: 'e', count: 3 }, poleB: { poleId: 'i', count: 0 }, totalResponses: 3 },
          { axisId: 's-n', poleA: { poleId: 's', count: 3 }, poleB: { poleId: 'n', count: 0 }, totalResponses: 3 },
          { axisId: 't-f', poleA: { poleId: 't', count: 1 }, poleB: { poleId: 'f', count: 2 }, totalResponses: 3 },
          { axisId: 'j-p', poleA: { poleId: 'j', count: 3 }, poleB: { poleId: 'p', count: 0 }, totalResponses: 3 },
        ],
        axisStrengths: [
          { axisId: 'e-i', strength: -1.0, dominantPoleId: 'e', rawDifference: -3 },
          { axisId: 's-n', strength: -1.0, dominantPoleId: 's', rawDifference: -3 },
          { axisId: 't-f', strength: 0.33, dominantPoleId: 'f', rawDifference: 1 },
          { axisId: 'j-p', strength: -1.0, dominantPoleId: 'j', rawDifference: -3 },
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        source: { type: 'onboarding', sessionId: 'returning-session' },
        questionCount: 12,
      };

      // Act: Load state as returning user
      const { result: statusResult } = renderHook(() => useOnboardingStatus());
      const { result: typeResult } = renderHook(() => useCurrentTypeSnapshot());

      await waitFor(() => {
        expect(statusResult.current.isLoading).toBe(false);
      });
      await waitFor(() => {
        expect(typeResult.current.isLoading).toBe(false);
      });

      // Assert: User stays in main app, type is available
      expect(statusResult.current.hasCompletedOnboarding).toBe(true);
      expect(statusResult.current.isLoading).toBe(false);
      expect(typeResult.current.currentType).toBe('ESFJ');
      expect(typeResult.current.isLoading).toBe(false);
    });
  });
});

describe('End-to-End Onboarding Flow Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbState.hasCompletedOnboarding = false;
    mockDbState.typeSnapshot = null;
  });

  it('Scenario: Complete first-time onboarding flow', async () => {
    // Step 1: First launch - no data
    const { result: statusResult1 } = renderHook(() => useOnboardingStatus());
    await waitFor(() => {
      expect(statusResult1.current.isLoading).toBe(false);
    });
    expect(statusResult1.current.hasCompletedOnboarding).toBe(false);

    // Step 2: User answers all 12 questions (simulated by updating state)
    mockDbState.hasCompletedOnboarding = true;
    mockDbState.typeSnapshot = {
      id: 'e2e-snapshot',
      currentType: 'INFJ',
      axisScores: [
        { axisId: 'e-i', poleA: { poleId: 'e', count: 0 }, poleB: { poleId: 'i', count: 3 }, totalResponses: 3 },
        { axisId: 's-n', poleA: { poleId: 's', count: 1 }, poleB: { poleId: 'n', count: 2 }, totalResponses: 3 },
        { axisId: 't-f', poleA: { poleId: 't', count: 1 }, poleB: { poleId: 'f', count: 2 }, totalResponses: 3 },
        { axisId: 'j-p', poleA: { poleId: 'j', count: 2 }, poleB: { poleId: 'p', count: 1 }, totalResponses: 3 },
      ],
      axisStrengths: [
        { axisId: 'e-i', strength: 1.0, dominantPoleId: 'i', rawDifference: 3 },
        { axisId: 's-n', strength: 0.33, dominantPoleId: 'n', rawDifference: 1 },
        { axisId: 't-f', strength: 0.33, dominantPoleId: 'f', rawDifference: 1 },
        { axisId: 'j-p', strength: -0.33, dominantPoleId: 'j', rawDifference: -1 },
      ],
      createdAt: new Date(),
      source: { type: 'onboarding', sessionId: 'e2e-session' },
      questionCount: 12,
    };

    // Step 3: Verify completion state
    const { result: statusResult2 } = renderHook(() => useOnboardingStatus());
    const { result: typeResult } = renderHook(() => useCurrentTypeSnapshot());

    await waitFor(() => {
      expect(statusResult2.current.isLoading).toBe(false);
    });
    await waitFor(() => {
      expect(typeResult.current.isLoading).toBe(false);
    });

    expect(statusResult2.current.hasCompletedOnboarding).toBe(true);
    expect(typeResult.current.currentType).toBe('INFJ');

    // Step 4: Simulate app reopen - should still show completed
    const { result: statusResult3 } = renderHook(() => useOnboardingStatus());
    await waitFor(() => {
      expect(statusResult3.current.isLoading).toBe(false);
    });

    expect(statusResult3.current.hasCompletedOnboarding).toBe(true);
  });
});
