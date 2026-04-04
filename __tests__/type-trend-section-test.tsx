/**
 * TypeTrendSection Component Tests
 *
 * Validates the trend section renders correctly across empty, sparse, and populated history states.
 */

import { render, screen } from '@testing-library/react-native';
import { HeroUINativeProvider } from 'heroui-native';
import type { TypeSnapshot } from '@/constants/scoring-contract';

import { TypeTrendSection } from '@/components/insights/type-trend-section';

function renderWithHeroUI(ui: React.ReactElement) {
  return render(<HeroUINativeProvider>{ui}</HeroUINativeProvider>);
}

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
      renderWithHeroUI(<TypeTrendSection latestType="INTJ" history={[]} />);

      expect(screen.getByText(/No trend data yet/i)).toBeTruthy();
    });

    it('should render empty state when history is undefined', () => {
      renderWithHeroUI(<TypeTrendSection latestType="INTJ" history={undefined as unknown as []} />);

      expect(screen.getByText(/No trend data yet/i)).toBeTruthy();
    });
  });

  describe('Sparse History State (Single Snapshot)', () => {
    it('should render single snapshot state with first result indicator', () => {
      const snapshot = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 0 });
      renderWithHeroUI(<TypeTrendSection latestType="INTJ" history={[snapshot]} />);

      expect(screen.getByText('INTJ')).toBeTruthy();
      expect(screen.getByText(/First result/i)).toBeTruthy();
      expect(screen.getByText(/first recorded personality type/i)).toBeTruthy();
    });

    it('should render Today for snapshot created today', () => {
      const snapshot = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 0 });
      renderWithHeroUI(<TypeTrendSection latestType="INTJ" history={[snapshot]} />);

      expect(screen.getByText('Today')).toBeTruthy();
    });

    it('should render Yesterday for snapshot created yesterday', () => {
      const snapshot = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 1 });
      renderWithHeroUI(<TypeTrendSection latestType="INTJ" history={[snapshot]} />);

      expect(screen.getByText('Yesterday')).toBeTruthy();
    });

    it('should render days ago for recent snapshots', () => {
      const snapshot = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 5 });
      renderWithHeroUI(<TypeTrendSection latestType="INTJ" history={[snapshot]} />);

      expect(screen.getByText('5 days ago')).toBeTruthy();
    });
  });

  describe('Populated History State (Multiple Snapshots)', () => {
    it('should render trend history with type changes', () => {
      const snapshot1 = createMockSnapshot({ id: 'snap-2', currentType: 'ENTJ', daysAgo: 0 });
      const snapshot2 = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 7 });
      renderWithHeroUI(<TypeTrendSection latestType="ENTJ" history={[snapshot1, snapshot2]} />);

      expect(screen.getByText('Type History')).toBeTruthy();
      expect(screen.getByText(/2 snapshots recorded/i)).toBeTruthy();
    });

    it('should render type changed notice when type differs from previous', () => {
      const oldest = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 7 });
      const newest = createMockSnapshot({ id: 'snap-2', currentType: 'ENTJ', daysAgo: 0 });
      renderWithHeroUI(<TypeTrendSection latestType="ENTJ" history={[oldest, newest]} />);

      expect(screen.getByText(/Type changed/i)).toBeTruthy();
      expect(screen.getByText(/You went from INTJ to ENTJ/i)).toBeTruthy();
    });

    it('should not render type changed notice when type is same', () => {
      const oldest = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 7 });
      const newest = createMockSnapshot({ id: 'snap-2', currentType: 'INTJ', daysAgo: 0 });
      renderWithHeroUI(<TypeTrendSection latestType="INTJ" history={[oldest, newest]} />);

      expect(screen.queryByText(/Type changed/i)).toBeNull();
    });

    it('should render up to 5 snapshots', () => {
      const snapshots = Array.from({ length: 7 }, (_, i) =>
        createMockSnapshot({ id: `snap-${i}`, currentType: 'INTJ', daysAgo: i * 7 })
      );
      renderWithHeroUI(<TypeTrendSection latestType="INTJ" history={snapshots} />);

      expect(screen.getByText('+2 more earlier snapshots')).toBeTruthy();
    });

    it('should show source type labels', () => {
      const oldest = createMockSnapshot({
        id: 'snap-1',
        currentType: 'INTJ',
        daysAgo: 7,
        sourceType: 'onboarding',
      });
      const newest = createMockSnapshot({
        id: 'snap-2',
        currentType: 'INTJ',
        daysAgo: 0,
        sourceType: 'daily',
      });
      renderWithHeroUI(<TypeTrendSection latestType="INTJ" history={[oldest, newest]} />);

      expect(screen.getByText('Daily check-in')).toBeTruthy();
      expect(screen.getByText('Onboarding')).toBeTruthy();
    });

    it('should render Type shifted for latest row when type changed', () => {
      const oldest = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 7 });
      const newest = createMockSnapshot({ id: 'snap-2', currentType: 'ENTJ', daysAgo: 0 });
      renderWithHeroUI(<TypeTrendSection latestType="ENTJ" history={[oldest, newest]} />);

      expect(screen.getByText('Type shifted')).toBeTruthy();
    });

    it('should render Same as before for latest row when type stable', () => {
      const oldest = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ', daysAgo: 7 });
      const newest = createMockSnapshot({ id: 'snap-2', currentType: 'INTJ', daysAgo: 0 });
      renderWithHeroUI(<TypeTrendSection latestType="INTJ" history={[oldest, newest]} />);

      expect(screen.getByText('Same as before')).toBeTruthy();
    });

    it('should resolve equal timestamps by id tie-breaker and render correct status', () => {
      const now = new Date();
      const a = createMockSnapshot({ id: 'snap-first', currentType: 'INTJ', daysAgo: 0 });
      const b = createMockSnapshot({ id: 'snap-second', currentType: 'ENTJ', daysAgo: 0 });
      a.createdAt = now;
      b.createdAt = now;

      renderWithHeroUI(<TypeTrendSection latestType="ENTJ" history={[a, b]} />);

      expect(screen.getByText(/Type changed/i)).toBeTruthy();
      expect(screen.getByText(/You went from INTJ to ENTJ/i)).toBeTruthy();
      expect(screen.getByText('Type History')).toBeTruthy();
    });
  });
});
