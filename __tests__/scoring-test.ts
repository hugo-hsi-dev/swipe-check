/**
 * Tests for tie-handling and low-data behavior in personality type scoring.
 *
 * These tests verify:
 * - A tied axis retains its previously established letter
 * - The tie rule is consistent across all type calculations
 * - Low-data cases honestly report their evidence level
 * - The model does not invent extra certainty beyond answer history
 */

import type { AnsweredQuestion } from '@/constants/question-contract';
import {
  calculateType,
  createDisplaySnapshot,
  getChangedAxes,
  typeCodesMatch,
  recalculateTypeHistory,
} from '@/lib/scoring';
import { getQuestionById, AXES } from '@/constants/questions';

/**
 * Helper to create an answered question for testing.
 */
function createAnswer(
  questionId: string,
  response: 'agree' | 'disagree',
  answeredAt: Date = new Date()
): AnsweredQuestion {
  const question = getQuestionById(questionId);
  if (!question) {
    throw new Error(`Question not found: ${questionId}`);
  }

  const supportedPoleId =
    response === 'agree' ? question.agreePoleId : getOppositePoleId(question);

  return {
    question,
    response,
    supportedPoleId,
    answeredAt,
  };
}

/**
 * Helper to get the opposite pole ID for a question.
 */
function getOppositePoleId(question: NonNullable<ReturnType<typeof getQuestionById>>): string {
  const axis = AXES.find((a) => a.id === question.axisId);
  if (!axis) {
    throw new Error(`Axis not found: ${question.axisId}`);
  }

  return question.agreePoleId === axis.poleA.id ? axis.poleB.id : axis.poleA.id;
}

describe('calculateType', () => {
  describe('Low-data behavior', () => {
    it('should return X for all axes with no answers', () => {
      const result = calculateType([]);

      expect(result.typeCode).toBe('XXXX');
      expect(result.totalAnswers).toBe(0);
      expect(result.axesWithMinimumData).toBe(0);
      expect(result.isComplete).toBe(false);

      result.axes.forEach((axis) => {
        expect(axis.displayLetter).toBe('X');
        expect(axis.winningPoleId).toBeNull();
        expect(axis.hasMinimumData).toBe(false);
      });
    });

    it('should report hasMinimumData=false for axes with fewer than 3 answers', () => {
      // Only answer E/I axis questions (2 answers)
      const answers = [
        createAnswer('q-001', 'agree'), // E
        createAnswer('q-002', 'disagree'), // E (reversed: disagree with I question = E)
      ];

      const result = calculateType(answers);

      const eiAxis = result.axes.find((a) => a.axisId === 'e-i');
      expect(eiAxis?.hasMinimumData).toBe(false);
      expect(eiAxis?.totalAnswers).toBe(2);
    });

    it('should report hasMinimumData=true when axis has exactly 3 answers', () => {
      const answers = [
        createAnswer('q-001', 'agree'), // E
        createAnswer('q-002', 'disagree'), // E
        createAnswer('q-003', 'agree'), // E
      ];

      const result = calculateType(answers);

      const eiAxis = result.axes.find((a) => a.axisId === 'e-i');
      expect(eiAxis?.hasMinimumData).toBe(true);
      expect(eiAxis?.totalAnswers).toBe(3);
    });

    it('should count total answers across all axes correctly', () => {
      const answers = [
        createAnswer('q-001', 'agree'), // E
        createAnswer('q-004', 'agree'), // S
        createAnswer('q-007', 'agree'), // T
        createAnswer('q-010', 'agree'), // J
      ];

      const result = calculateType(answers);
      expect(result.totalAnswers).toBe(4);
    });
  });

  describe('Basic type calculation', () => {
    it('should calculate correct type for complete onboarding answers', () => {
      const answers = [
        // E/I axis: 2E, 1I = E wins
        createAnswer('q-001', 'agree'), // E
        createAnswer('q-002', 'disagree'), // E
        createAnswer('q-003', 'disagree'), // I

        // S/N axis: 3S, 0N = S wins
        createAnswer('q-004', 'agree'), // S
        createAnswer('q-005', 'disagree'), // S
        createAnswer('q-006', 'agree'), // S

        // T/F axis: 1T, 2F = F wins
        createAnswer('q-007', 'agree'), // T
        createAnswer('q-008', 'agree'), // F
        createAnswer('q-009', 'disagree'), // F

        // J/P axis: 2J, 1P = J wins
        createAnswer('q-010', 'agree'), // J
        createAnswer('q-011', 'disagree'), // J
        createAnswer('q-012', 'disagree'), // P
      ];

      const result = calculateType(answers);

      expect(result.typeCode).toBe('ESFJ');
      expect(result.isComplete).toBe(true);
      expect(result.axesWithMinimumData).toBe(4);
    });

    it('should calculate correct pole counts for each axis', () => {
      const answers = [
        // E/I: 2E, 1I
        createAnswer('q-001', 'agree'), // E
        createAnswer('q-002', 'disagree'), // E
        createAnswer('q-003', 'disagree'), // I
      ];

      const result = calculateType(answers);
      const eiAxis = result.axes.find((a) => a.axisId === 'e-i');

      expect(eiAxis?.poleACount).toBe(2); // E
      expect(eiAxis?.poleBCount).toBe(1); // I
      expect(eiAxis?.strength).toBe(1);
    });
  });

  describe('Tie-handling behavior', () => {
    it('should retain previous letter when axis becomes tied', () => {
      // First, establish E as the winner
      const firstAnswers = [
        createAnswer('q-001', 'agree'), // E
        createAnswer('q-002', 'disagree'), // E
        createAnswer('q-003', 'agree'), // E
      ];
      const firstResult = calculateType(firstAnswers);
      expect(firstResult.typeCode.charAt(0)).toBe('E');

      // Now add answers that create a tie (2 more I answers)
      const secondAnswers = [
        ...firstAnswers,
        createAnswer('q-013', 'disagree'), // I (daily question)
        createAnswer('q-002', 'agree'), // I (answering q-002 with agree = I)
      ];

      // After tie: 3E, 2I - wait, that's not a tie. Let me fix this.
      // Actually need: 3E and 3I for a tie
      const tieAnswers = [
        createAnswer('q-001', 'agree'), // E
        createAnswer('q-002', 'disagree'), // E
        createAnswer('q-003', 'agree'), // E
        createAnswer('q-001', 'disagree'), // I (hypothetically re-answering)
        createAnswer('q-002', 'agree'), // I
        createAnswer('q-003', 'disagree'), // I
      ];

      const tieResult = calculateType(tieAnswers, { previousResult: firstResult });
      const eiAxis = tieResult.axes.find((a) => a.axisId === 'e-i');

      // Should retain E from previous result
      expect(eiAxis?.displayLetter).toBe('E');
      expect(eiAxis?.wasTieBroken).toBe(true);
      expect(eiAxis?.poleACount).toBe(3); // E
      expect(eiAxis?.poleBCount).toBe(3); // I - tied!
    });

    it('should use retention tiebreaker across multiple axes simultaneously', () => {
      // Establish initial baseline (3 answers per axis, all clear wins)
      const baselineAnswers = [
        // E/I: 3E, 0I = E wins
        createAnswer('q-001', 'agree'),     // E
        createAnswer('q-002', 'disagree'),  // E
        createAnswer('q-003', 'agree'),     // E

        // S/N: 3S, 0N = S wins
        createAnswer('q-004', 'agree'),     // S
        createAnswer('q-005', 'disagree'),  // S
        createAnswer('q-006', 'agree'),     // S

        // T/F: 3T, 0F = T wins
        createAnswer('q-007', 'agree'),     // T
        createAnswer('q-008', 'disagree'),  // T
        createAnswer('q-009', 'agree'),     // T

        // J/P: 3J, 0P = J wins
        createAnswer('q-010', 'agree'),     // J
        createAnswer('q-011', 'disagree'),  // J
        createAnswer('q-012', 'agree'),     // J
      ];
      const baselineResult = calculateType(baselineAnswers);
      expect(baselineResult.typeCode).toBe('ESTJ');

      // Create ties on all axes by adding 3 opposite answers to each
      const tieAnswers = [
        ...baselineAnswers,
        // E/I: Add 3 I answers (3E, 3I = tie)
        createAnswer('q-001', 'disagree'),  // I
        createAnswer('q-002', 'agree'),     // I
        createAnswer('q-003', 'disagree'),  // I

        // S/N: Add 3 N answers (3S, 3N = tie)
        createAnswer('q-004', 'disagree'),  // N
        createAnswer('q-005', 'agree'),     // N
        createAnswer('q-006', 'disagree'),  // N

        // T/F: Add 3 F answers (3T, 3F = tie)
        createAnswer('q-007', 'disagree'),  // F
        createAnswer('q-008', 'agree'),     // F
        createAnswer('q-009', 'disagree'),  // F

        // J/P: Add 3 P answers (3J, 3P = tie)
        createAnswer('q-010', 'disagree'),  // P
        createAnswer('q-011', 'agree'),     // P
        createAnswer('q-012', 'disagree'),  // P
      ];

      const tieResult = calculateType(tieAnswers, { previousResult: baselineResult });

      // All axes should retain their previous letters
      expect(tieResult.typeCode).toBe('ESTJ');
      expect(tieResult.axes.every((a) => a.wasTieBroken)).toBe(true);
      expect(tieResult.axes.every((a) => a.poleACount === a.poleBCount)).toBe(true);
    });

    it('should not use tiebreaker when there is no previous result', () => {
      // Create a tie without any previous result
      const answers = [
        createAnswer('q-001', 'agree'), // E
        createAnswer('q-002', 'agree'), // I
      ];

      const result = calculateType(answers);
      const eiAxis = result.axes.find((a) => a.axisId === 'e-i');

      // Without previous result, deterministic fallback chooses poleA (E)
      expect(eiAxis?.winningPoleId).toBe('e');
      expect(eiAxis?.displayLetter).toBe('E');
      expect(eiAxis?.wasTieBroken).toBe(true);
    });

    it('should update letter when tie is broken by new answers', () => {
      // Establish baseline with E winning
      const baselineAnswers = [
        createAnswer('q-001', 'agree'), // E
        createAnswer('q-002', 'disagree'), // E
        createAnswer('q-003', 'agree'), // E
      ];
      const baselineResult = calculateType(baselineAnswers);

      // Create tie
      const tieAnswers = [
        ...baselineAnswers,
        createAnswer('q-001', 'disagree'), // I
        createAnswer('q-002', 'agree'), // I
        createAnswer('q-003', 'disagree'), // I
      ];
      const tieResult = calculateType(tieAnswers, { previousResult: baselineResult });
      expect(tieResult.typeCode.charAt(0)).toBe('E'); // Retained

      // Break tie in favor of I
      const brokenAnswers = [
        ...tieAnswers,
        createAnswer('q-013', 'disagree'), // I (from daily pool)
      ];
      const brokenResult = calculateType(brokenAnswers, { previousResult: tieResult });

      expect(brokenResult.typeCode.charAt(0)).toBe('I');
      expect(brokenResult.axes[0]?.wasTieBroken).toBe(false);
      expect(brokenResult.axes[0]?.poleBCount).toBe(4); // I
      expect(brokenResult.axes[0]?.poleACount).toBe(3); // E
    });
  });

  describe('Consistency across screens', () => {
    it('should produce identical results for identical answer histories', () => {
      const answers = [
        createAnswer('q-001', 'agree'),
        createAnswer('q-004', 'agree'),
        createAnswer('q-007', 'agree'),
      ];

      const result1 = calculateType(answers);
      const result2 = calculateType(answers);

      expect(result1.typeCode).toBe(result2.typeCode);
      expect(result1.axes.map((a) => a.winningPoleId)).toEqual(
        result2.axes.map((a) => a.winningPoleId)
      );
    });

    it('should maintain consistency when recalculating history', () => {
      // Simulate multiple sessions
      const session1Answers = [
        createAnswer('q-001', 'agree'),
        createAnswer('q-004', 'agree'),
        createAnswer('q-007', 'agree'),
      ];

      const session2Answers = [
        ...session1Answers,
        createAnswer('q-002', 'disagree'),
        createAnswer('q-005', 'agree'),
        createAnswer('q-008', 'disagree'),
      ];

      // Calculate sequentially with retention
      const result1 = calculateType(session1Answers);
      const result2 = calculateType(session2Answers, { previousResult: result1 });

      // Recalculate from history
      const recalculated = recalculateTypeHistory([], [session1Answers, session2Answers]);

      expect(recalculated[1].typeCode).toBe(result2.typeCode);
      expect(recalculated[1].axes.map((a) => a.winningPoleId)).toEqual(
        result2.axes.map((a) => a.winningPoleId)
      );
    });

    it('should validate provided snapshot history when present', () => {
      const session1Answers = [
        createAnswer('q-001', 'agree'),
        createAnswer('q-004', 'agree'),
        createAnswer('q-007', 'agree'),
      ];

      const session2Answers = [
        ...session1Answers,
        createAnswer('q-002', 'disagree'),
        createAnswer('q-005', 'agree'),
        createAnswer('q-008', 'disagree'),
      ];

      const result1 = calculateType(session1Answers);
      const result2 = calculateType(session2Answers, { previousResult: result1 });
      const snapshot1 = createDisplaySnapshot(result1, 'session-1');
      const snapshot2 = createDisplaySnapshot(result2, 'session-2');

      expect(() =>
        recalculateTypeHistory(
          [snapshot1, { ...snapshot2, typeCode: 'XXXX' }],
          [session1Answers, session2Answers]
        )
      ).toThrow('Snapshot history does not match answer history at index 1.');
    });
  });

  describe('Model honesty', () => {
    it('should not invent winning poles when no data exists', () => {
      const result = calculateType([]);

      result.axes.forEach((axis) => {
        expect(axis.winningPoleId).toBeNull();
        expect(axis.displayLetter).toBe('X');
      });
    });

    it('should accurately report strength based on answer gap', () => {
      const strongAnswers = [
        createAnswer('q-001', 'agree'), // E
        createAnswer('q-002', 'disagree'), // E
        createAnswer('q-003', 'agree'), // E
        createAnswer('q-001', 'agree'), // E (answered again)
        createAnswer('q-002', 'disagree'), // E (answered again)
      ];

      const result = calculateType(strongAnswers);
      const eiAxis = result.axes.find((a) => a.axisId === 'e-i');

      expect(eiAxis?.poleACount).toBe(5); // All E
      expect(eiAxis?.poleBCount).toBe(0);
      expect(eiAxis?.strength).toBe(5);
    });

    it('should report wasTieBroken=false for clear wins', () => {
      const answers = [
        createAnswer('q-001', 'agree'), // E
        createAnswer('q-002', 'disagree'), // E
        createAnswer('q-003', 'agree'), // E
      ];

      const result = calculateType(answers);
      const eiAxis = result.axes.find((a) => a.axisId === 'e-i');

      expect(eiAxis?.wasTieBroken).toBe(false);
      expect(eiAxis?.displayLetter).toBe('E');
    });
  });
});

describe('createDisplaySnapshot', () => {
  it('should create snapshot with unique ID', () => {
    const typeResult = calculateType([
      createAnswer('q-001', 'agree'),
      createAnswer('q-004', 'agree'),
    ]);

    const snapshot = createDisplaySnapshot(typeResult, 'session-123');

    expect(snapshot.id).toMatch(/^snapshot-\d+-[a-z0-9]+$/);
    expect(snapshot.sessionId).toBe('session-123');
    expect(snapshot.typeCode).toBe(typeResult.typeCode);
  });
});

describe('typeCodesMatch', () => {
  it('should return true for matching type codes', () => {
    const answers = [createAnswer('q-001', 'agree')];
    const result1 = calculateType(answers);
    const result2 = calculateType(answers);

    expect(typeCodesMatch(result1, result2)).toBe(true);
  });

  it('should return false for different type codes', () => {
    const result1 = calculateType([createAnswer('q-001', 'agree')]);
    const result2 = calculateType([createAnswer('q-001', 'disagree')]);

    expect(typeCodesMatch(result1, result2)).toBe(false);
  });
});

describe('getChangedAxes', () => {
  it('should return all axes with winners when no previous result', () => {
    const current = calculateType([
      createAnswer('q-001', 'agree'), // E
      createAnswer('q-004', 'agree'), // S
    ]);

    const changed = getChangedAxes(undefined, current);

    expect(changed.length).toBe(2);
    expect(changed.map((a) => a.axisId)).toContain('e-i');
    expect(changed.map((a) => a.axisId)).toContain('s-n');
  });

  it('should return only axes that changed', () => {
    // Establish clear E win in previous result
    const previousAnswers = [
      createAnswer('q-001', 'agree'),     // E
      createAnswer('q-002', 'disagree'),  // E
      createAnswer('q-003', 'agree'),     // E
    ];
    const previous = calculateType(previousAnswers);
    expect(previous.typeCode.charAt(0)).toBe('E');

    // Create clear I win in current result (4 I vs 1 E)
    const currentAnswers = [
      createAnswer('q-001', 'agree'),     // E
      createAnswer('q-002', 'agree'),     // I
      createAnswer('q-003', 'disagree'),  // I
      createAnswer('q-013', 'disagree'),  // I (daily question)
      createAnswer('q-013', 'disagree'),  // I (daily question again for testing)
    ];
    const current = calculateType(currentAnswers);

    const changed = getChangedAxes(previous, current);

    expect(changed.length).toBe(1);
    expect(changed[0]?.axisId).toBe('e-i');
    expect(changed[0]?.winningPoleId).toBe('i'); // Changed to I
  });

  it('should return empty array when nothing changed', () => {
    const answers = [createAnswer('q-001', 'agree')];
    const previous = calculateType(answers);
    const current = calculateType(answers);

    const changed = getChangedAxes(previous, current);

    expect(changed.length).toBe(0);
  });
});
