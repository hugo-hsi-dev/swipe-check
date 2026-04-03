import { waitFor, render, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { HeroUINativeProvider } from 'heroui-native';

import JournalScreen from '@/app/(tabs)/journal';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('@/hooks/use-journal-data', () => ({
  useJournalHistory: jest.fn(),
  useCurrentDayCompletedSession: jest.fn(),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

jest.mock('@/lib/local-data/sqlite-runtime', () => ({
  getSQLiteDatabase: jest.fn(() => Promise.resolve({})),
}));

const { useJournalHistory, useCurrentDayCompletedSession } = require('@/hooks/use-journal-data');

describe('Journal Screen UI States', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Fully Empty State', () => {
    it('should show empty state when no history exists', async () => {
      useJournalHistory.mockReturnValue({
        entries: [],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        error: null,
        loadMore: jest.fn(),
      });

      useCurrentDayCompletedSession.mockReturnValue({
        entry: null,
        isCurrentDay: false,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(
        <HeroUINativeProvider>
          <JournalScreen />
        </HeroUINativeProvider>
      );

      await waitFor(() => {
        expect(getByText('Your Journal is Empty')).toBeTruthy();
        expect(getByText('Complete daily check-ins to build your history.')).toBeTruthy();
      });
    });
  });

  describe('Onboarding-Only State', () => {
    it('should show baseline section with onboarding entry when only onboarding exists', async () => {
      const onboardingEntry = {
        session: {
          id: 'session-onboarding',
          type: 'onboarding' as const,
          status: 'completed' as const,
          localDayKey: '2024-04-01',
          startedAt: '2024-04-01T09:00:00.000Z',
          completedAt: '2024-04-01T09:15:00.000Z',
          createdAt: '2024-04-01T09:00:00.000Z',
          updatedAt: '2024-04-01T09:15:00.000Z',
        },
        snapshot: {
          id: 'snap-onboarding',
          currentType: 'INTJ',
          axisScores: [],
          axisStrengths: [],
          questionCount: 12,
          createdAt: new Date('2024-04-01T09:16:00.000Z'),
          source: { type: 'onboarding' as const, sessionId: 'session-onboarding' },
        },
      };

      useJournalHistory.mockReturnValue({
        entries: [onboardingEntry],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        error: null,
        loadMore: jest.fn(),
      });

      useCurrentDayCompletedSession.mockReturnValue({
        entry: null,
        isCurrentDay: false,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(
        <HeroUINativeProvider>
          <JournalScreen />
        </HeroUINativeProvider>
      );

      await waitFor(() => {
        expect(getByText('Baseline')).toBeTruthy();
        expect(getByText('Onboarding')).toBeTruthy();
        expect(getByText('INTJ')).toBeTruthy();
      });

      fireEvent.press(getByText('Onboarding'));
      expect(router.push).toHaveBeenCalledWith('/journal/session-onboarding');
    });
  });

  describe('Mixed History State', () => {
    it('should show both onboarding baseline and daily entries when both exist', async () => {
      const onboardingEntry = {
        session: {
          id: 'session-onboarding',
          type: 'onboarding' as const,
          status: 'completed' as const,
          localDayKey: '2024-04-01',
          startedAt: '2024-04-01T09:00:00.000Z',
          completedAt: '2024-04-01T09:15:00.000Z',
          createdAt: '2024-04-01T09:00:00.000Z',
          updatedAt: '2024-04-01T09:15:00.000Z',
        },
        snapshot: {
          id: 'snap-onboarding',
          currentType: 'INTJ',
          axisScores: [],
          axisStrengths: [],
          questionCount: 12,
          createdAt: new Date('2024-04-01T09:16:00.000Z'),
          source: { type: 'onboarding' as const, sessionId: 'session-onboarding' },
        },
      };

      const dailyEntry = {
        session: {
          id: 'session-daily',
          type: 'daily' as const,
          status: 'completed' as const,
          localDayKey: '2024-04-02',
          startedAt: '2024-04-02T08:00:00.000Z',
          completedAt: '2024-04-02T08:05:00.000Z',
          createdAt: '2024-04-02T08:00:00.000Z',
          updatedAt: '2024-04-02T08:05:00.000Z',
        },
        snapshot: {
          id: 'snap-daily',
          currentType: 'ENTJ',
          axisScores: [],
          axisStrengths: [],
          questionCount: 3,
          createdAt: new Date('2024-04-02T08:06:00.000Z'),
          source: { type: 'daily' as const, sessionId: 'session-daily' },
        },
      };

      useJournalHistory.mockReturnValue({
        entries: [dailyEntry, onboardingEntry],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        error: null,
        loadMore: jest.fn(),
      });

      useCurrentDayCompletedSession.mockReturnValue({
        entry: null,
        isCurrentDay: false,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(
        <HeroUINativeProvider>
          <JournalScreen />
        </HeroUINativeProvider>
      );

      await waitFor(() => {
        expect(getByText('Baseline')).toBeTruthy();
        expect(getByText('Past Daily Check-ins')).toBeTruthy();
        expect(getByText('Onboarding')).toBeTruthy();
        expect(getByText('Daily Check-in')).toBeTruthy();
      });
    });
  });

  describe('Today Completed State', () => {
    it('should show today card when daily check-in is completed', async () => {
      const todayEntry = {
        session: {
          id: 'session-today',
          type: 'daily' as const,
          status: 'completed' as const,
          localDayKey: '2024-04-03',
          startedAt: '2024-04-03T08:00:00.000Z',
          completedAt: '2024-04-03T08:05:00.000Z',
          createdAt: '2024-04-03T08:00:00.000Z',
          updatedAt: '2024-04-03T08:05:00.000Z',
        },
        snapshot: {
          id: 'snap-today',
          currentType: 'ENTP',
          axisScores: [],
          axisStrengths: [],
          questionCount: 3,
          createdAt: new Date('2024-04-03T08:06:00.000Z'),
          source: { type: 'daily' as const, sessionId: 'session-today' },
        },
      };

      useJournalHistory.mockReturnValue({
        entries: [todayEntry],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        error: null,
        loadMore: jest.fn(),
      });

      useCurrentDayCompletedSession.mockReturnValue({
        entry: todayEntry,
        isCurrentDay: true,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(
        <HeroUINativeProvider>
          <JournalScreen />
        </HeroUINativeProvider>
      );

      await waitFor(() => {
        expect(getByText('Today')).toBeTruthy();
      });
    });
  });

  describe('Navigates to Entry Detail', () => {
    it('should navigate to journal detail when entry is pressed', async () => {
      const dailyEntry = {
        session: {
          id: 'session-daily',
          type: 'daily' as const,
          status: 'completed' as const,
          localDayKey: '2024-04-02',
          startedAt: '2024-04-02T08:00:00.000Z',
          completedAt: '2024-04-02T08:05:00.000Z',
          createdAt: '2024-04-02T08:00:00.000Z',
          updatedAt: '2024-04-02T08:05:00.000Z',
        },
        snapshot: {
          id: 'snap-daily',
          currentType: 'ENTJ',
          axisScores: [],
          axisStrengths: [],
          questionCount: 3,
          createdAt: new Date('2024-04-02T08:06:00.000Z'),
          source: { type: 'daily' as const, sessionId: 'session-daily' },
        },
      };

      useJournalHistory.mockReturnValue({
        entries: [dailyEntry],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        error: null,
        loadMore: jest.fn(),
      });

      useCurrentDayCompletedSession.mockReturnValue({
        entry: null,
        isCurrentDay: false,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(
        <HeroUINativeProvider>
          <JournalScreen />
        </HeroUINativeProvider>
      );

      await waitFor(() => {
        expect(getByText('Tue, Apr 2')).toBeTruthy();
      });

      fireEvent.press(getByText('Tue, Apr 2'));
      expect(router.push).toHaveBeenCalledWith('/journal/session-daily');
    });
  });
});