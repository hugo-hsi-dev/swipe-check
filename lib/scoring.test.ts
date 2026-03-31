/**
 * Tests for scoring utilities.
 * @jest-environment node
 */

import {
  calculateAxisScores,
  calculateAxisStrength,
  calculateAllAxisStrengths,
  computePersonalityType,
  createTypeSnapshot,
  createScoreAccumulator,
  isValidSnapshot,
  haveSameType,
  calculateAxisShift,
  reconstructTypeSnapshot,
} from './scoring';
import type { AnsweredQuestion, Axis } from '@/constants/question-contract';
import type { TypeSnapshot } from '@/constants/scoring-contract';

// Test data
const TEST_AXES: Axis[] = [
  {
    id: 'e-i',
    name: 'Extraversion vs. Introversion',
    poleA: { id: 'e', label: 'Extraversion' },
    poleB: { id: 'i', label: 'Introversion' },
  },
  {
    id: 's-n',
    name: 'Sensing vs. Intuition',
    poleA: { id: 's', label: 'Sensing' },
    poleB: { id: 'n', label: 'Intuition' },
  },
  {
    id: 't-f',
    name: 'Thinking vs. Feeling',
    poleA: { id: 't', label: 'Thinking' },
    poleB: { id: 'f', label: 'Feeling' },
  },
  {
    id: 'j-p',
    name: 'Judging vs. Perceiving',
    poleA: { id: 'j', label: 'Judging' },
    poleB: { id: 'p', label: 'Perceiving' },
  },
];

describe('calculateAxisScores', () => {
  it('should calculate scores for a single axis', () => {
    const answers: AnsweredQuestion[] = [
      {
        question: {
          id: 'q1',
          prompt: 'Test',
          axisId: 'e-i',
          agreePoleId: 'e',
          pool: 'onboarding',
          isActive: true,
        },
        response: 'agree',
        supportedPoleId: 'e',
        answeredAt: new Date(),
      },
      {
        question: {
          id: 'q2',
          prompt: 'Test 2',
          axisId: 'e-i',
          agreePoleId: 'i',
          pool: 'onboarding',
          isActive: true,
        },
        response: 'agree',
        supportedPoleId: 'i',
        answeredAt: new Date(),
      },
    ];

    const scores = calculateAxisScores(answers, TEST_AXES);
    const eiScores = scores.find(s => s.axisId === 'e-i');

    expect(eiScores).toBeDefined();
    expect(eiScores?.poleA.count).toBe(1); // Extraversion
    expect(eiScores?.poleB.count).toBe(1); // Introversion
    expect(eiScores?.totalResponses).toBe(2);
  });

  it('should return empty scores for axes with no answers', () => {
    const answers: AnsweredQuestion[] = [];
    const scores = calculateAxisScores(answers, TEST_AXES);

    expect(scores).toHaveLength(4);
    for (const score of scores) {
      expect(score.poleA.count).toBe(0);
      expect(score.poleB.count).toBe(0);
      expect(score.totalResponses).toBe(0);
    }
  });
});

describe('calculateAxisStrength', () => {
  it('should calculate balanced strength as 0', () => {
    const axisScores = {
      axisId: 'e-i',
      poleA: { poleId: 'e', count: 2 },
      poleB: { poleId: 'i', count: 2 },
      totalResponses: 4,
    };

    const strength = calculateAxisStrength(axisScores);
    expect(strength.strength).toBe(0);
    expect(strength.dominantPoleId).toBeNull();
  });

  it('should calculate positive strength for pole B dominance', () => {
    const axisScores = {
      axisId: 'e-i',
      poleA: { poleId: 'e', count: 1 },
      poleB: { poleId: 'i', count: 3 },
      totalResponses: 4,
    };

    const strength = calculateAxisStrength(axisScores);
    expect(strength.strength).toBe(0.5); // (3-1)/4 = 0.5
    expect(strength.dominantPoleId).toBe('i');
  });

  it('should calculate negative strength for pole A dominance', () => {
    const axisScores = {
      axisId: 'e-i',
      poleA: { poleId: 'e', count: 3 },
      poleB: { poleId: 'i', count: 1 },
      totalResponses: 4,
    };

    const strength = calculateAxisStrength(axisScores);
    expect(strength.strength).toBe(-0.5); // (1-3)/4 = -0.5
    expect(strength.dominantPoleId).toBe('e');
  });
});

describe('computePersonalityType', () => {
  it('should compute INTJ for introverted, intuitive, thinking, judging', () => {
    const axisStrengths = [
      { axisId: 'e-i', strength: -1, dominantPoleId: 'i', rawDifference: -3 },
      { axisId: 's-n', strength: 1, dominantPoleId: 'n', rawDifference: 3 },
      { axisId: 't-f', strength: -1, dominantPoleId: 't', rawDifference: -3 },
      { axisId: 'j-p', strength: -1, dominantPoleId: 'j', rawDifference: -3 },
    ];

    const type = computePersonalityType(axisStrengths, TEST_AXES);
    expect(type).toBe('INTJ');
  });

  it('should compute ESFP for extraverted, sensing, feeling, perceiving', () => {
    const axisStrengths = [
      { axisId: 'e-i', strength: 1, dominantPoleId: 'e', rawDifference: 3 },
      { axisId: 's-n', strength: -1, dominantPoleId: 's', rawDifference: -3 },
      { axisId: 't-f', strength: 1, dominantPoleId: 'f', rawDifference: 3 },
      { axisId: 'j-p', strength: 1, dominantPoleId: 'p', rawDifference: 3 },
    ];

    const type = computePersonalityType(axisStrengths, TEST_AXES);
    expect(type).toBe('ESFP');
  });

  it('should default to poleA when balanced', () => {
    const axisStrengths = [
      { axisId: 'e-i', strength: 0, dominantPoleId: null, rawDifference: 0 },
      { axisId: 's-n', strength: 0, dominantPoleId: null, rawDifference: 0 },
      { axisId: 't-f', strength: 0, dominantPoleId: null, rawDifference: 0 },
      { axisId: 'j-p', strength: 0, dominantPoleId: null, rawDifference: 0 },
    ];

    const type = computePersonalityType(axisStrengths, TEST_AXES);
    expect(type).toBe('ESTJ'); // All poleA defaults
  });
});

describe('createTypeSnapshot', () => {
  it('should create a valid snapshot from answers', () => {
    const answers: AnsweredQuestion[] = [
      {
        question: {
          id: 'q1',
          prompt: 'Test',
          axisId: 'e-i',
          agreePoleId: 'e',
          pool: 'onboarding',
          isActive: true,
        },
        response: 'agree',
        supportedPoleId: 'e',
        answeredAt: new Date(),
      },
    ];

    const snapshot = createTypeSnapshot('snap-001', answers, TEST_AXES, {
      type: 'onboarding',
    });

    expect(snapshot.id).toBe('snap-001');
    expect(snapshot.axisScores).toHaveLength(4);
    expect(snapshot.axisStrengths).toHaveLength(4);
    expect(snapshot.questionCount).toBe(1);
    expect(snapshot.createdAt).toBeInstanceOf(Date);
    expect(snapshot.source.type).toBe('onboarding');
  });
});

describe('createScoreAccumulator', () => {
  it('should accumulate scores incrementally', () => {
    const accumulator = createScoreAccumulator(TEST_AXES);

    accumulator.addResponse('e-i', 'e', 'i');
    accumulator.addResponse('e-i', 'e', 'i');
    accumulator.addResponse('e-i', 'i', 'e');

    const strengths = accumulator.buildStrengths();
    const eiScores = accumulator.scores.get('e-i');
    const eiStrength = strengths.find(s => s.axisId === 'e-i');

    expect(eiScores?.poleA.count).toBe(2);
    expect(eiScores?.poleB.count).toBe(1);
    expect(eiStrength?.strength).toBeCloseTo(-1 / 3);
  });

  it('should create snapshot from accumulator', () => {
    const accumulator = createScoreAccumulator(TEST_AXES);
    accumulator.addResponse('e-i', 'e', 'i');
    accumulator.addResponse('s-n', 'n', 's');

    const snapshot = accumulator.createSnapshot('snap-002', { type: 'daily' });

    expect(snapshot.id).toBe('snap-002');
    expect(snapshot.questionCount).toBe(2);
    expect(snapshot.source.type).toBe('daily');
  });
});

describe('isValidSnapshot', () => {
  it('should return true for valid snapshot', () => {
    const snapshot = createTypeSnapshot('snap-001', [], TEST_AXES, {
      type: 'onboarding',
    });

    expect(isValidSnapshot(snapshot)).toBe(true);
  });

  it('should return false for incomplete axis scores', () => {
    const snapshot = createTypeSnapshot('snap-001', [], TEST_AXES.slice(0, 2), {
      type: 'onboarding',
    });

    expect(isValidSnapshot(snapshot)).toBe(false);
  });
});

describe('haveSameType', () => {
  it('should return true when types match', () => {
    const snapshot1 = createTypeSnapshot('snap-001', [], TEST_AXES, {
      type: 'onboarding',
    });
    const snapshot2 = createTypeSnapshot('snap-002', [], TEST_AXES, {
      type: 'onboarding',
    });

    expect(haveSameType(snapshot1, snapshot2)).toBe(true);
  });

  it('should return false when types differ', () => {
    const snapshot1: TypeSnapshot = {
      ...createTypeSnapshot('snap-001', [], TEST_AXES, { type: 'onboarding' }),
      currentType: 'INTJ',
    };
    const snapshot2: TypeSnapshot = {
      ...createTypeSnapshot('snap-002', [], TEST_AXES, { type: 'onboarding' }),
      currentType: 'ESFP',
    };

    expect(haveSameType(snapshot1, snapshot2)).toBe(false);
  });
});

describe('calculateAxisShift', () => {
  it('should calculate the difference in axis strength', () => {
    const before: TypeSnapshot = {
      ...createTypeSnapshot('snap-001', [], TEST_AXES, { type: 'onboarding' }),
      axisStrengths: [
        { axisId: 'e-i', strength: -0.5, dominantPoleId: 'e', rawDifference: -1 },
        { axisId: 's-n', strength: 0.5, dominantPoleId: 'n', rawDifference: 1 },
        { axisId: 't-f', strength: -0.5, dominantPoleId: 't', rawDifference: -1 },
        { axisId: 'j-p', strength: -0.5, dominantPoleId: 'j', rawDifference: -1 },
      ],
    };
    const after: TypeSnapshot = {
      ...createTypeSnapshot('snap-002', [], TEST_AXES, { type: 'daily' }),
      axisStrengths: [
        { axisId: 'e-i', strength: 0.5, dominantPoleId: 'i', rawDifference: 1 },
        { axisId: 's-n', strength: 0.5, dominantPoleId: 'n', rawDifference: 1 },
        { axisId: 't-f', strength: -0.5, dominantPoleId: 't', rawDifference: -1 },
        { axisId: 'j-p', strength: -0.5, dominantPoleId: 'j', rawDifference: -1 },
      ],
    };

    const shift = calculateAxisShift('e-i', before, after);
    expect(shift).toBe(1.0); // Moved from -0.5 to +0.5
  });

  it('should return null for non-existent axis', () => {
    const snapshot = createTypeSnapshot('snap-001', [], TEST_AXES, {
      type: 'onboarding',
    });

    const shift = calculateAxisShift('x-y', snapshot, snapshot);
    expect(shift).toBeNull();
  });
});

describe('reconstructTypeSnapshot', () => {
  it('should reconstruct snapshot from JSON data', () => {
    const original = createTypeSnapshot('snap-001', [], TEST_AXES, {
      type: 'onboarding',
    });

    const jsonData = {
      ...original,
      createdAt: original.createdAt.toISOString(),
    };

    const reconstructed = reconstructTypeSnapshot(jsonData);

    expect(reconstructed.id).toBe(original.id);
    expect(reconstructed.currentType).toBe(original.currentType);
    expect(reconstructed.createdAt).toBeInstanceOf(Date);
    expect(reconstructed.createdAt.getTime()).toBe(original.createdAt.getTime());
  });
});
