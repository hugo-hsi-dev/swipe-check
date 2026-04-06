import { render, screen } from '@testing-library/react-native';
import type { TypeSnapshot } from '@/constants/scoring-contract';
import InsightsScreen from '@/app/(tabs)/insights';
import { useInsightsData } from '@/hooks/use-insights-data';

jest.mock('@/hooks/use-insights-data', () => ({
  useInsightsData: jest.fn(),
}));

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
    render(<InsightsScreen />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('should render error state', () => {
    const err = new Error('test error');
    jest
      .mocked(useInsightsData)
      .mockReturnValue({ status: 'error', error: err });
    render(<InsightsScreen />);
    expect(screen.getByText(/Failed to load/i)).toBeTruthy();
  });

  it('should render empty state', () => {
    jest.mocked(useInsightsData).mockReturnValue({ status: 'empty' });
    render(<InsightsScreen />);
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
    render(<InsightsScreen />);
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
    render(<InsightsScreen />);
    expect(screen.getAllByText('INTJ').length).toBeGreaterThan(0);
    expect(screen.getByText('Type History')).toBeTruthy();
    expect(screen.getByText('2 snapshots recorded')).toBeTruthy();
  });

  it('should render pole A dominant axis with bar aligned to left', () => {
    const poleADominantSnapshot: TypeSnapshot = {
      id: 'snap-pole-a',
      currentType: 'INTJ',
      axisScores: [
        { axisId: 't-f', poleA: { poleId: 't', count: 3 }, poleB: { poleId: 'f', count: 0 }, totalResponses: 3 },
        { axisId: 'e-i', poleA: { poleId: 'e', count: 2 }, poleB: { poleId: 'i', count: 1 }, totalResponses: 3 },
        { axisId: 's-n', poleA: { poleId: 's', count: 1 }, poleB: { poleId: 'n', count: 2 }, totalResponses: 3 },
        { axisId: 'j-p', poleA: { poleId: 'j', count: 1 }, poleB: { poleId: 'p', count: 1 }, totalResponses: 2 },
      ],
      axisStrengths: [
        { axisId: 't-f', strength: -1.0, dominantPoleId: 't', rawDifference: -3 },
        { axisId: 'e-i', strength: -0.33, dominantPoleId: 'e', rawDifference: -1 },
        { axisId: 's-n', strength: 0.33, dominantPoleId: 'n', rawDifference: 1 },
        { axisId: 'j-p', strength: 0, dominantPoleId: null, rawDifference: 0 },
      ],
      createdAt: new Date(),
      source: { type: 'onboarding', sessionId: 'onboarding-session' },
      questionCount: 12,
    };

    jest.mocked(useInsightsData).mockReturnValue({
      status: 'populated',
      latestType: 'INTJ',
      latestSnapshot: poleADominantSnapshot,
      history: [poleADominantSnapshot],
    });

    render(<InsightsScreen />);
    expect(screen.getByText(/Thinking.*\(100%\)/)).toBeTruthy();
    expect(screen.getByText(/Extraversion.*\(33%\)/)).toBeTruthy();
    expect(screen.getByTestId('axis-fill-t-f')).toBeTruthy();
    expect(screen.getByTestId('axis-fill-e-i')).toBeTruthy();
  });

  it('should render pole B dominant axis with bar aligned to right', () => {
    const poleBDominantSnapshot: TypeSnapshot = {
      id: 'snap-pole-b',
      currentType: 'ENFP',
      axisScores: [
        { axisId: 'e-i', poleA: { poleId: 'e', count: 0 }, poleB: { poleId: 'i', count: 3 }, totalResponses: 3 },
        { axisId: 's-n', poleA: { poleId: 's', count: 1 }, poleB: { poleId: 'n', count: 2 }, totalResponses: 3 },
        { axisId: 't-f', poleA: { poleId: 't', count: 0 }, poleB: { poleId: 'f', count: 3 }, totalResponses: 3 },
        { axisId: 'j-p', poleA: { poleId: 'j', count: 1 }, poleB: { poleId: 'p', count: 2 }, totalResponses: 3 },
      ],
      axisStrengths: [
        { axisId: 'e-i', strength: 1.0, dominantPoleId: 'i', rawDifference: 3 },
        { axisId: 's-n', strength: 0.33, dominantPoleId: 'n', rawDifference: 1 },
        { axisId: 't-f', strength: 1.0, dominantPoleId: 'f', rawDifference: 3 },
        { axisId: 'j-p', strength: 0.33, dominantPoleId: 'p', rawDifference: 1 },
      ],
      createdAt: new Date(),
      source: { type: 'onboarding', sessionId: 'onboarding-session' },
      questionCount: 12,
    };

    jest.mocked(useInsightsData).mockReturnValue({
      status: 'populated',
      latestType: 'ENFP',
      latestSnapshot: poleBDominantSnapshot,
      history: [poleBDominantSnapshot],
    });

    render(<InsightsScreen />);
    expect(screen.getByText(/Intuition.*\(33%\)/)).toBeTruthy();
    expect(screen.getByText(/Feeling.*\(100%\)/)).toBeTruthy();
    expect(screen.getByTestId('axis-fill-t-f')).toBeTruthy();
    expect(screen.getByTestId('axis-fill-e-i')).toBeTruthy();
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

    render(<InsightsScreen />);
    expect(screen.getByText('Balanced')).toBeTruthy();
    expect(screen.getByTestId('axis-fill-e-i')).toBeTruthy();
  });
});
