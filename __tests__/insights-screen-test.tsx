import { render, screen } from '@testing-library/react-native';
import { HeroUINativeProvider } from 'heroui-native';
import type { TypeSnapshot } from '@/constants/scoring-contract';
import InsightsScreen from '@/app/(tabs)/insights';
import { useInsightsData } from '@/hooks/use-insights-data';

jest.mock('@/hooks/use-insights-data', () => ({
  useInsightsData: jest.fn(),
}));

function renderWithHeroUI(ui: React.ReactElement) {
  return render(<HeroUINativeProvider>{ui}</HeroUINativeProvider>);
}

afterEach(() => {
  jest.clearAllMocks();
});

function createMockSnapshot({
  id,
  currentType,
  daysAgo = 0,
}: {
  id: string;
  currentType: string;
  daysAgo?: number;
}): TypeSnapshot {
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - daysAgo);
  return {
    id,
    currentType,
    axisScores: [],
    axisStrengths: [
      {
        axisId: 'axis-1',
        strength: 0.3,
        dominantPoleId: 'pole-a',
        rawDifference: 0.3,
      },
    ],
    createdAt,
    source: { type: 'onboarding' },
    questionCount: 12,
  };
}

describe('Insights Screen', () => {
  it('should render loading state', () => {
    jest.mocked(useInsightsData).mockReturnValue({ status: 'loading' });
    renderWithHeroUI(<InsightsScreen />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('should render error state', () => {
    const err = new Error('test error');
    jest
      .mocked(useInsightsData)
      .mockReturnValue({ status: 'error', error: err });
    renderWithHeroUI(<InsightsScreen />);
    expect(screen.getByText(/Failed to load/i)).toBeTruthy();
  });

  it('should render empty state', () => {
    jest.mocked(useInsightsData).mockReturnValue({ status: 'empty' });
    renderWithHeroUI(<InsightsScreen />);
    expect(screen.getByText(/Complete onboarding to see/i)).toBeTruthy();
  });

  it('should render type and trend section for sparse (single snapshot) state', () => {
    const snapshot = createMockSnapshot({ id: 'snap-1', currentType: 'INTJ' });
    jest.mocked(useInsightsData).mockReturnValue({
      status: 'sparse',
      latestType: 'INTJ',
      latestSnapshot: snapshot,
      history: [snapshot],
    });
    renderWithHeroUI(<InsightsScreen />);
    expect(screen.getAllByText('INTJ').length).toBeGreaterThan(0);
    expect(screen.getByText('First result')).toBeTruthy();
    expect(
      screen.getByText('This is your first recorded personality type.')
    ).toBeTruthy();
  });

  it('should render type and trend section for populated (multiple snapshots) state', () => {
    const snapshot1 = createMockSnapshot({ id: 'snap-1', currentType: 'INTF' });
    const snapshot2 = createMockSnapshot({ id: 'snap-2', currentType: 'INTJ', daysAgo: 0 });
    jest.mocked(useInsightsData).mockReturnValue({
      status: 'populated',
      latestType: 'INTJ',
      latestSnapshot: snapshot2,
      history: [snapshot1, snapshot2],
    });
    renderWithHeroUI(<InsightsScreen />);
    expect(screen.getAllByText('INTJ').length).toBeGreaterThan(0);
    expect(screen.getByText('Type History')).toBeTruthy();
    expect(screen.getByText('2 snapshots recorded')).toBeTruthy();
  });
});