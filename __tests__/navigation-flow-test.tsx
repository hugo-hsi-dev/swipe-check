import { waitFor, renderHook } from '@testing-library/react-native';

import { useInitialRoute } from '@/hooks/use-initial-route';

// Mock expo-router
jest.mock('expo-router', () => ({
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

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Gesture: {
    Pan: () => ({
      onUpdate: jest.fn(function (this: { callbacks: { onUpdate?: (event: { translationX: number }) => void } }) {
        return this;
      }),
      onEnd: jest.fn(function (this: { callbacks: { onEnd?: (event: { translationX: number; velocityX: number }) => void } }) {
        return this;
      }),
    }),
  },
  GestureDetector: jest.fn(({ children }: { children: React.ReactNode }) => children),
  GestureHandlerRootView: jest.fn(({ children }: { children: React.ReactNode }) => children),
}));

// Mock SQLite database
const mockDb = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
};

jest.mock('@/lib/local-data/sqlite-runtime', () => ({
  getSQLiteDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

describe('Navigation Flow Acceptance Criteria', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('New User Flow (First Launch)', () => {
    it('should route new users to onboarding when no completed onboarding exists', async () => {
      // Arrange: No completed onboarding session in database
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      // Act
      const { result } = renderHook(() => useInitialRoute('/'));

      // Assert: Should route to onboarding
      await waitFor(() => {
        expect(result.current.isDeterminingRoute).toBe(false);
      });
      expect(result.current.targetRoute).toBe('onboarding');
      expect(result.current.routeError).toBeNull();
    });

    it('should show loading state while determining route for new users', () => {
      // Arrange: Simulate slow database response
      mockDb.getFirstAsync.mockImplementation(() => new Promise(() => {})); // Never resolves

      // Act
      const { result } = renderHook(() => useInitialRoute('/'));

      // Assert: Should be in loading state initially
      expect(result.current.isDeterminingRoute).toBe(true);
      expect(result.current.targetRoute).toBeNull();
    });
  });

  describe('Returning User Flow (Completed Onboarding)', () => {
    it('should route onboarded users to tabs when completed onboarding exists', async () => {
      // Arrange: A completed onboarding session exists
      mockDb.getFirstAsync.mockResolvedValueOnce({ id: 'session-123' });

      // Act
      const { result } = renderHook(() => useInitialRoute('/'));

      // Assert: Should route to tabs
      await waitFor(() => {
        expect(result.current.isDeterminingRoute).toBe(false);
      });
      expect(result.current.targetRoute).toBe('tabs');
      expect(result.current.routeError).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange: Database error
      mockDb.getFirstAsync.mockRejectedValueOnce(new Error('Database connection failed'));

      // Act
      const { result } = renderHook(() => useInitialRoute('/'));

      // Assert: Should have error state
      await waitFor(() => {
        expect(result.current.isDeterminingRoute).toBe(false);
      });
      expect(result.current.routeError).toBeInstanceOf(Error);
      expect(result.current.routeError?.message).toBe('Database connection failed');
    });
  });

  describe('Route Determination with Pathname Changes', () => {
    it('should re-evaluate when pathname changes', async () => {
      // Arrange: First call returns no completed onboarding
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      // Act - first render
      const { result, rerender } = renderHook(
        (props: { pathname: string }) => useInitialRoute(props.pathname),
        { initialProps: { pathname: '/' } }
      );

      await waitFor(() => {
        expect(result.current.evaluatedPathname).toBe('/');
      });
      expect(result.current.targetRoute).toBe('onboarding');

      // Arrange: Second call returns completed onboarding (simulating completion)
      mockDb.getFirstAsync.mockResolvedValueOnce({ id: 'session-123' });

      // Act - rerender with new pathname
      rerender({ pathname: '/onboarding' });

      await waitFor(() => {
        expect(result.current.evaluatedPathname).toBe('/onboarding');
      });
      expect(result.current.targetRoute).toBe('tabs');
    });
  });

  describe('Post-Onboarding Entry Behavior', () => {
    it('should consistently route returning users to tabs on app reopen', async () => {
      // Arrange: Completed onboarding exists
      mockDb.getFirstAsync.mockResolvedValue({ id: 'session-123' });

      // Act - simulate multiple app opens
      const scenarios = ['/', '/today', '/insights', '/journal'];

      for (const pathname of scenarios) {
        const { result } = renderHook(() => useInitialRoute(pathname));
        await waitFor(() => {
          expect(result.current.isDeterminingRoute).toBe(false);
        });

        // Assert: Should always route to tabs for onboarded users
        expect(result.current.targetRoute).toBe('tabs');
      }
    });
  });
});

describe('Navigation Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not redirect while loading onboarding status', () => {
    // Arrange: Simulate slow database query
    mockDb.getFirstAsync.mockImplementation(() => new Promise(() => {}));

    // Act
    const { result } = renderHook(() => useInitialRoute('/'));

    // Assert: Should be loading with no target route yet
    expect(result.current.isDeterminingRoute).toBe(true);
    expect(result.current.targetRoute).toBeNull();
  });

  it('should redirect new users from root to onboarding', async () => {
    // Arrange: No completed onboarding
    mockDb.getFirstAsync.mockResolvedValueOnce(null);

    // Act
    const { result } = renderHook(() => useInitialRoute('/'));
    await waitFor(() => {
      expect(result.current.isDeterminingRoute).toBe(false);
    });

    // Assert: Should target onboarding
    expect(result.current.targetRoute).toBe('onboarding');
  });

  it('should redirect onboarded users from onboarding to tabs', async () => {
    // Arrange: Completed onboarding exists
    mockDb.getFirstAsync.mockResolvedValueOnce({ id: 'session-123' });

    // Act
    const { result } = renderHook(() => useInitialRoute('/onboarding'));
    await waitFor(() => {
      expect(result.current.isDeterminingRoute).toBe(false);
    });

    // Assert: Should target tabs
    expect(result.current.targetRoute).toBe('tabs');
  });
});

describe('Main Destinations Reachable', () => {
  it('Today screen exists at app/(tabs)/today.tsx', () => {
    // Screen file exists - verified by import
    expect(() => require('@/app/(tabs)/today')).not.toThrow();
  });

  it('Journal screen exists at app/(tabs)/journal.tsx', () => {
    // Screen file exists - verified by import
    expect(() => require('@/app/(tabs)/journal')).not.toThrow();
  });

  it('Insights screen exists at app/(tabs)/insights.tsx', () => {
    // Screen file exists - verified by import
    expect(() => require('@/app/(tabs)/insights')).not.toThrow();
  });

  it('Onboarding screen exists at app/onboarding.tsx', () => {
    // Screen file exists - verified by import
    expect(() => require('@/app/onboarding')).not.toThrow();
  });
});
