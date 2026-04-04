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

  it('should render Balanced label for tied axis (strength 0, dominantPoleId null)', () => {
    const tiedSnapshot: TypeSnapshot = {
      id: 'snap-tie',
      currentType: 'INTJ',
      axisScores: [
        { axisId: 'e-i', poleA: { poleId: 'e', count: 3 }, poleB: { poleId: 'i', count: 3 }, totalResponses: 6 },
        { axisId: 's-n', poleA: { poleId: 's', count: 1 }, poleB: { poleId: 'n', count: 2 }, totalResponses: 3 },
        { axisId: 't-f', poleA: { poleId: 't', count: 3 }, poleB: { poleId: 'f', count: 0 }, totalResponses: 3 },
        { axisId: 'j-p', poleA: { poleId: 'j', count: 2 }, poleB: { poleId: 'p', count: 1 }, totalResponses: 3 },
      ],
      axisStrengths: [
        { axisId: 'e-i', strength: 0, dominantPoleId: null, rawDifference: 0 },
        { axisId: 's-n', strength: 0.33, dominantPoleId: 'n', rawDifference: 1 },
        { axisId: 't-f', strength: -1.0, dominantPoleId: 't', rawDifference: -3 },
        { axisId: 'j-p', strength: -0.33, dominantPoleId: 'j', rawDifference: -1 },
      ],
      createdAt: new Date(),
      source: { type: 'onboarding', sessionId: 'onboarding-session' },
      questionCount: 12,
    };

    jest.mocked(useInsightsData).mockReturnValue({
      status: 'populated',
      latestType: 'INTJ',
      latestSnapshot: tiedSnapshot,
      history: [tiedSnapshot],
    });

    renderWithHeroUI(<InsightsScreen />);
    expect(screen.getByText('Balanced')).toBeTruthy();
  });
});