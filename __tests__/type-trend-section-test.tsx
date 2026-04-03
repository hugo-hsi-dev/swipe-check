/**
 * TypeTrendSection Component Tests
 *
 * Validates the trend section renders correctly across empty, sparse, and populated history states.
 */

import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import type { TypeSnapshot } from '@/constants/scoring-contract';

import { TypeTrendSection } from '@/components/insights/type-trend-section';

function createMockSnapshot({
  id,
  currentType,
  daysAgo = 0,
  sourceType = 'onboarding' as const,
}: {
  id: string;
  currentType: string;
  daysAgo?: number;
  sourceType?: 'onboarding' | 'daily' | 'manual';
}): TypeSnapshot {
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - daysAgo);

  return {
    id,
    currentType,
    axisScores: [],
    axisStrengths: [],
    createdAt,
    source: { type: sourceType },
    questionCount: 12,
  };
}

describe('TypeTrendSection', () => {
  describe('Empty History State', () => {
    it('should render empty state when history is not provided', () => {
      render(<TypeTrendSection latestType="INTJ" history={[]} />);

      expect(screen.getByText(/No trend data yet/i)).toBeTruthy();
    });

    it('should render empty state when history is undefined', () => {
      render(<TypeTrendSection latestType="INTJ" history={undefined as unknown as []} />);

      expect(screen.getByText(/No trend data yet/i)).toBeTruthy();
    });
  });

  describe('Sparse History State (Single Snapshot)', () => {
    it('should render single snapshot state with first result indicator', () => {
      const snapshot = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 0 });
      render(<TypeTrendSection latestType="INTJ" history={[snapshot]} />);

      expect(screen.getByText('INTJ')).toBeTruthy();
      expect(screen.getByText(/First result/i)).toBeTruthy();
      expect(screen.getByText(/first recorded personality type/i)).toBeTruthy();
    });

    it('should render Today for snapshot created today', () => {
      const snapshot = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 0 });
      render(<TypeTrendSection latestType="INTJ" history={[snapshot]} />);

      expect(screen.getByText('Today')).toBeTruthy();
    });

    it('should render Yesterday for snapshot created yesterday', () => {
      const snapshot = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 1 });
      render(<TypeTrendSection latestType="INTJ" history={[snapshot]} />);

      expect(screen.getByText('Yesterday')).toBeTruthy();
    });

    it('should render days ago for recent snapshots', () => {
      const snapshot = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 5 });
      render(<TypeTrendSection latestType="INTJ" history={[snapshot]} />);

      expect(screen.getByText('5 days ago')).toBeTruthy();
    });
  });

  describe('Populated History State (Multiple Snapshots)', () => {
    it('should render trend history with type changes', () => {
      const snapshot1 = createMockSnapshot({ id: 'snap-2', currentType: 'ENTJ', daysAgo: 0 });
      const snapshot2 = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 7 });
      render(<TypeTrendSection latestType="ENTJ" history={[snapshot1, snapshot2]} />);

      expect(screen.getByText('Type History')).toBeTruthy();
      expect(screen.getByText(/2 snapshots recorded/i)).toBeTruthy();
    });

    it('should render type changed notice when type differs from previous', () => {
      const snapshot1 = createMockSnapshot({ id: 'snap-2', currentType: 'ENTJ', daysAgo: 0 });
      const snapshot2 = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 7 });
      render(<TypeTrendSection latestType="ENTJ" history={[snapshot1, snapshot2]} />);

      expect(screen.getByText(/Type changed/i)).toBeTruthy();
      expect(screen.getByText(/You went from INTJ to ENTJ/i)).toBeTruthy();
    });

    it('should not render type changed notice when type is same', () => {
      const snapshot1 = createMockSnapshot({ id: 'snap-2', currentType: 'INTJ', daysAgo: 0 });
      const snapshot2 = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 7 });
      render(<TypeTrendSection latestType="INTJ" history={[snapshot1, snapshot2]} />);

      expect(screen.queryByText(/Type changed/i)).toBeNull();
    });

    it('should render up to 5 snapshots', () => {
      const snapshots = Array.from({ length: 7 }, (_, i) =>
        createMockSnapshot({ id: `snap-${i}`, currentType: 'INTJ', daysAgo: i * 7 })
      );
      render(<TypeTrendSection latestType="INTJ" history={snapshots} />);

      expect(screen.getByText('+2 more earlier snapshots')).toBeTruthy();
    });

    it('should show source type labels', () => {
      const snapshot1 = createMockSnapshot({
        id: 'snap-2',
        currentType: 'INTJ',
        daysAgo: 0,
        sourceType: 'daily',
      });
      const snapshot2 = createMockSnapshot({
        id: 'snap-1',
        currentType: 'INTJ',
        daysAgo: 7,
        sourceType: 'onboarding',
      });
      render(<TypeTrendSection latestType="INTJ" history={[snapshot1, snapshot2]} />);

      expect(screen.getByText('Daily check-in')).toBeTruthy();
      expect(screen.getByText('Onboarding')).toBeTruthy();
    });
  });
});
